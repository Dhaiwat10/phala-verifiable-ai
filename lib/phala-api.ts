// Phala Cloud API Client
import type { ChatMessage, StreamChunk, VerificationProof, SignatureResponse, AttestationData } from './types';

const API_BASE_URL = 'https://api.redpill.ai/v1';
const DEFAULT_MODEL = 'phala/deepseek-chat-v3-0324';

export class PhalaAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'PhalaAPIError';
  }
}

/**
 * Stringify JSON with sorted keys (matches Python's json.dumps(sort_keys=True))
 * This is critical for hash verification to match Phala's server-side hashes
 */
function stringifyWithSortedKeys(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const items = obj.map(item => stringifyWithSortedKeys(item));
    return `[${items.join(',')}]`;
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => {
    const value = stringifyWithSortedKeys(obj[key]);
    return `"${key}":${value}`;
  });

  return `{${pairs.join(',')}}`;
}

function getAPIKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_PHALA_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new PhalaAPIError(
      'Phala API key not configured. Please set NEXT_PUBLIC_PHALA_API_KEY in .env.local'
    );
  }
  return apiKey;
}

export interface StreamCallbacks {
  onChunk: (content: string) => void;
  onComplete: (verification?: VerificationProof, rawRequest?: string, rawResponse?: string) => void;
  onError: (error: Error) => void;
}

/**
 * Construct a raw response object from streaming chunks for hash verification
 * This must match Phala's exact JSON format
 */
function constructRawResponse(
  chatId: string | null,
  content: string,
  created: number | null,
  model: string | null,
  usage: any
): string {
  // Match Phala's exact non-streaming response format
  // IMPORTANT: Field order matters! Phala uses standard JSON.stringify (not sorted keys)
  const responseObj: any = {
    id: chatId || '',
    object: 'chat.completion',
    created: created || Math.floor(Date.now() / 1000),
    model: model || DEFAULT_MODEL,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: content,
          refusal: null,
          annotations: null,
          audio: null,
          function_call: null,
          tool_calls: [],
          reasoning: null,
          reasoning_content: null,
        },
        logprobs: null,
        finish_reason: 'stop',
        stop_reason: null,
        token_ids: null,
      },
    ],
    service_tier: null,
    system_fingerprint: null,
    usage: usage || {
      prompt_tokens: 0,
      total_tokens: 0,
      completion_tokens: 0,
      prompt_tokens_details: null,
    },
    prompt_logprobs: null,
    prompt_token_ids: null,
    kv_transfer_params: null,
  };

  // Use standard JSON.stringify (preserves insertion order, NOT sorted)
  const jsonString = JSON.stringify(responseObj);
  console.log('📝 Reconstructed response JSON:', jsonString);
  return jsonString;
}

export async function sendMessageStream(
  messages: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  const apiKey = getAPIKey();

  // Store raw request JSON for verification (with sorted keys)
  const requestBody = {
    model: DEFAULT_MODEL,
    messages,
    stream: false, // Non-streaming for reliable hash verification
  };
  const rawRequest = stringifyWithSortedKeys(requestBody);

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: rawRequest,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new PhalaAPIError(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
        response.status
      );
    }

    // Get the complete response JSON
    const data = await response.json();
    const rawResponse = JSON.stringify(data);

    console.log('✅ Received response:', rawResponse);

    // Extract content and send it as a "chunk" for UI display
    const content = data.choices[0]?.message?.content || '';
    callbacks.onChunk(content);

    // Fetch signature if we have chat_id
    if (data.id) {
      const verification = await fetchSignature(data.id);
      callbacks.onComplete(verification, rawRequest, rawResponse);
    } else {
      console.warn('No chat_id found in response');
      callbacks.onComplete(undefined, rawRequest, rawResponse);
    }
  } catch (error) {
    if (error instanceof PhalaAPIError) {
      callbacks.onError(error);
    } else if (error instanceof Error) {
      callbacks.onError(new PhalaAPIError(error.message));
    } else {
      callbacks.onError(new PhalaAPIError('Unknown error occurred'));
    }
  }
}

async function fetchSignature(chatId: string): Promise<VerificationProof | undefined> {
  const apiKey = getAPIKey();

  try {
    console.log(`🔐 Fetching signature for chat_id: ${chatId}`);

    const response = await fetch(
      `${API_BASE_URL}/signature/${chatId}?model=${DEFAULT_MODEL}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch signature: ${response.status} ${response.statusText}`);
      return {
        chatId,
        fetchedAt: Date.now(),
      };
    }

    const data: SignatureResponse = await response.json();
    console.log('✅ Signature fetched:', data);

    // Parse the text field "request_hash:response_hash"
    const [requestHash, responseHash] = data.text.split(':');

    // Fetch attestation report for this signing address
    const attestation = await fetchAttestation(data.signing_address);

    return {
      chatId,
      text: data.text,
      signature: data.signature,
      signingAddress: data.signing_address,
      requestHash,
      responseHash,
      attestation,
      fetchedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error fetching signature:', error);
    return {
      chatId,
      fetchedAt: Date.now(),
    };
  }
}

export async function fetchAttestation(
  signingAddress: string,
  nonce?: string
): Promise<AttestationData | undefined> {
  const apiKey = getAPIKey();

  try {
    const url = new URL(`${API_BASE_URL}/attestation/report`);
    url.searchParams.set('model', DEFAULT_MODEL);
    url.searchParams.set('signing_address', signingAddress);
    if (nonce) {
      url.searchParams.set('nonce', nonce);
    }

    console.log(`🔍 Fetching attestation for signing_address: ${signingAddress}`);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch attestation: ${response.status} ${response.statusText}`);
      return undefined;
    }

    const data = await response.json();
    console.log('✅ Attestation fetched:', data);
    return data;
  } catch (error) {
    console.error('Error fetching attestation:', error);
    return undefined;
  }
}

// Non-streaming version (for fallback or testing)
export async function sendMessage(
  messages: ChatMessage[]
): Promise<{ content: string; verification?: VerificationProof }> {
  const apiKey = getAPIKey();

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: stringifyWithSortedKeys({
        model: DEFAULT_MODEL,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new PhalaAPIError(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
        response.status
      );
    }

    const data = await response.json();

    // Fetch signature using chat_id from response
    let verification: VerificationProof | undefined;
    if (data.id) {
      verification = await fetchSignature(data.id);
    }

    return {
      content: data.choices[0]?.message?.content || '',
      verification,
    };
  } catch (error) {
    if (error instanceof PhalaAPIError) {
      throw error;
    }
    throw new PhalaAPIError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}
