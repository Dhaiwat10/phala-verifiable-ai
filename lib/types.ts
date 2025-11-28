// Type definitions for Phala Cloud Chat Interface

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  verification?: VerificationProof;
  streaming?: boolean;
  // Store original data for cryptographic verification
  rawRequest?: string; // JSON string of request body
  rawResponse?: string; // JSON string of response body
}

export interface VerificationProof {
  chatId: string; // Used to fetch signature
  text?: string; // "request_hash:response_hash" format
  signature?: string; // Cryptographic signature from TEE
  signingAddress?: string; // TEE instance identifier
  requestHash?: string; // Parsed from text
  responseHash?: string; // Parsed from text
  attestation?: AttestationData;
  fetchedAt?: number; // Timestamp when verification was fetched
  // Verification results
  verificationStatus?: VerificationStatus;
  verificationSteps?: VerificationStep[];
}

export interface SignatureResponse {
  text: string; // "request_hash:response_hash"
  signature: string;
  signing_address: string;
}

export interface VerificationStatus {
  isVerified: boolean;
  hashVerified: boolean;
  signatureVerified: boolean;
  timestamp: number;
}

export interface VerificationStep {
  name: string; // "Request Hash", "Response Hash", "Signature Recovery"
  status: 'pending' | 'success' | 'failed';
  details?: string;
  error?: string;
}

export interface AttestationData {
  // Will be populated when we implement attestation fetching
  report?: any;
  tdxQuote?: any;
  gpuAttestation?: any;
  [key: string]: any;
}

export interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PhalaAPIRequest {
  model: string;
  messages: ChatMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface PhalaAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

export type ExportFormat = 'json' | 'txt';
