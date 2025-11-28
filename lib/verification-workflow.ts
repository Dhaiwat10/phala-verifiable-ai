// Verification workflow orchestration
import type { Message, VerificationProof, VerificationStatus, VerificationStep } from './types';
import { verifyHashes, verifySignature } from './crypto-verify';

/**
 * Run complete verification workflow for a message
 */
export async function runVerification(message: Message): Promise<VerificationProof | undefined> {
  const { verification, rawRequest, rawResponse } = message;

  // Cannot verify without required data
  if (!verification || !rawRequest || !rawResponse) {
    console.warn('Cannot verify: missing verification data or raw request/response');
    return verification;
  }

  if (!verification.requestHash || !verification.responseHash) {
    console.warn('Cannot verify: missing request/response hashes');
    return verification;
  }

  if (!verification.signature || !verification.signingAddress || !verification.text) {
    console.warn('Cannot verify: missing signature or signing address');
    return verification;
  }

  const steps: VerificationStep[] = [];
  let hashVerified = false;
  let signatureVerified = false;

  try {
    console.log('🔐 Starting verification...');

    // Step 1 & 2: Verify request and response hashes
    console.log('📝 Verifying hashes...');
    const hashResult = await verifyHashes(
      rawRequest,
      rawResponse,
      verification.requestHash,
      verification.responseHash
    );

    steps.push({
      name: 'Request Hash Verification',
      status: hashResult.requestMatch ? 'success' : 'failed',
      details: `Expected: ${verification.requestHash}\nComputed: ${hashResult.computedRequestHash}`,
      error: hashResult.requestMatch ? undefined : 'Hash mismatch',
    });

    steps.push({
      name: 'Response Hash Verification',
      status: hashResult.responseMatch ? 'success' : 'failed',
      details: `Expected: ${verification.responseHash}\nComputed: ${hashResult.computedResponseHash}`,
      error: hashResult.responseMatch ? undefined : 'Hash mismatch',
    });

    hashVerified = hashResult.requestMatch && hashResult.responseMatch;

    if (!hashVerified) {
      console.error('❌ Hash verification failed');
    } else {
      console.log('✅ Hashes verified successfully');
    }

    // Step 3: Verify signature
    console.log('🔏 Verifying signature...');
    const signatureResult = await verifySignature(
      verification.text,
      verification.signature,
      verification.signingAddress
    );

    steps.push({
      name: 'Signature Verification',
      status: signatureResult.isValid ? 'success' : 'failed',
      details: `Expected Address: ${verification.signingAddress}\nRecovered Address: ${signatureResult.recoveredAddress}`,
      error: signatureResult.error || (signatureResult.isValid ? undefined : 'Address mismatch'),
    });

    signatureVerified = signatureResult.isValid;

    if (!signatureVerified) {
      console.error('❌ Signature verification failed');
    } else {
      console.log('✅ Signature verified successfully');
    }

    // Overall verification status
    const isVerified = hashVerified && signatureVerified;

    const verificationStatus: VerificationStatus = {
      isVerified,
      hashVerified,
      signatureVerified,
      timestamp: Date.now(),
    };

    console.log(
      isVerified
        ? '✅ VERIFICATION SUCCESSFUL - Response is cryptographically verified'
        : '❌ VERIFICATION FAILED - Response could not be verified'
    );

    // Return updated verification proof
    return {
      ...verification,
      verificationStatus,
      verificationSteps: steps,
    };
  } catch (error) {
    console.error('Error during verification:', error);

    // Add error step
    steps.push({
      name: 'Verification Process',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      ...verification,
      verificationStatus: {
        isVerified: false,
        hashVerified,
        signatureVerified,
        timestamp: Date.now(),
      },
      verificationSteps: steps,
    };
  }
}
