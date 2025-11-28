// Cryptographic verification functions for Phala Cloud responses
import { hashMessage, recoverAddress } from 'viem';

/**
 * Compute SHA256 hash of a string using Web Crypto API
 */
export async function computeSHA256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify that computed hashes match expected hashes
 */
export async function verifyHashes(
  requestJSON: string,
  responseJSON: string,
  expectedRequestHash: string,
  expectedResponseHash: string
): Promise<{
  requestMatch: boolean;
  responseMatch: boolean;
  computedRequestHash: string;
  computedResponseHash: string;
}> {
  console.log('🔍 Request JSON being hashed:', requestJSON);
  console.log('🔍 Response JSON being hashed:', responseJSON);

  const computedRequestHash = await computeSHA256(requestJSON);
  const computedResponseHash = await computeSHA256(responseJSON);

  console.log('📊 Hash Comparison:');
  console.log('  Request - Expected:', expectedRequestHash);
  console.log('  Request - Computed:', computedRequestHash);
  console.log('  Request Match:', computedRequestHash === expectedRequestHash);
  console.log('  Response - Expected:', expectedResponseHash);
  console.log('  Response - Computed:', computedResponseHash);
  console.log('  Response Match:', computedResponseHash === expectedResponseHash);

  return {
    requestMatch: computedRequestHash === expectedRequestHash,
    responseMatch: computedResponseHash === expectedResponseHash,
    computedRequestHash,
    computedResponseHash,
  };
}

/**
 * Recover the signing address from an ECDSA signature
 */
export async function recoverSigningAddress(
  message: string,
  signature: string
): Promise<string> {
  try {
    // Ensure signature has 0x prefix
    const sig = signature.startsWith('0x') ? signature : `0x${signature}`;

    // Hash the message using Ethereum's message signing format
    const messageHash = hashMessage(message);

    // Recover the address from the signature
    const recoveredAddress = await recoverAddress({
      hash: messageHash,
      signature: sig as `0x${string}`,
    });

    return recoveredAddress.toLowerCase();
  } catch (error) {
    console.error('Error recovering signing address:', error);
    throw new Error(`Signature recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Verify that the recovered address matches the expected signing address
 */
export async function verifySignature(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<{
  isValid: boolean;
  recoveredAddress: string;
  error?: string;
}> {
  try {
    const recoveredAddress = await recoverSigningAddress(message, signature);
    const expected = expectedAddress.toLowerCase();

    return {
      isValid: recoveredAddress === expected,
      recoveredAddress,
    };
  } catch (error) {
    return {
      isValid: false,
      recoveredAddress: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
