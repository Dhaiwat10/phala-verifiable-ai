// Verification panel for displaying cryptographic proofs
'use client';

import { useState } from 'react';
import type { Message } from '@/lib/types';

interface VerificationPanelProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'verification' | 'attestation' | 'raw';

export function VerificationPanel({ message, isOpen, onClose }: VerificationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('verification');

  if (!isOpen || !message || !message.verification) {
    return null;
  }

  const { verification } = message;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Verification Proof
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'verification'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Verification
            </button>
            <button
              onClick={() => setActiveTab('attestation')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'attestation'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Attestation
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'raw'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Raw JSON
            </button>
          </div>

          {/* Content */}
          {activeTab === 'raw' ? (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs text-gray-900 dark:text-gray-100">
              {JSON.stringify(verification, null, 2)}
            </pre>
          ) : activeTab === 'attestation' ? (
            <div className="space-y-4">
              {verification.attestation ? (
                <>
                  {/* Explanation Section */}
                  <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      📚 What is TEE Attestation?
                    </h3>
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <p>
                        The attestation report is cryptographic proof from the hardware (Intel SGX/TDX, NVIDIA GPU TEE)
                        that proves this AI inference ran inside a genuine Trusted Execution Environment.
                      </p>

                      <p className="font-medium mt-3 mb-1">What's inside the Intel Quote:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          <strong>MRENCLAVE</strong>: SHA256 hash of the <em>exact</em> code/model binary running in the TEE.
                          Even changing one byte produces a different hash.
                        </li>
                        <li>
                          <strong>MRSIGNER</strong>: Hash of the public key that signed the enclave.
                          Identifies who built the code.
                        </li>
                        <li>
                          <strong>Security Version</strong>: CPU security patch level and other attributes.
                        </li>
                      </ul>

                      <p className="font-medium mt-3 mb-1">How to verify the code:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Parse the Intel quote to extract MRENCLAVE (requires SGX SDK)</li>
                        <li>Get reference measurements from Phala/RedPill (published expected hashes)</li>
                        <li>Compare: If MRENCLAVE matches the reference → You proved the exact code ran ✅</li>
                        <li>Verify quote signature chain against Intel root certificates</li>
                      </ol>

                      <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded">
                        <p className="text-xs">
                          <strong>Note:</strong> This demo fetches and displays the raw attestation data.
                          Full quote parsing and MRENCLAVE verification requires specialized libraries
                          (Intel SGX SDK or Phala's verifier) and is not yet implemented in this UI.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Signing Address */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Signing Address
                    </h3>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block break-all">
                      {verification.attestation.signing_address}
                    </code>
                  </div>

                  {/* Signing Algorithm */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Signing Algorithm
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {verification.attestation.signing_algo?.toUpperCase() || 'N/A'}
                    </p>
                  </div>

                  {/* Request Nonce */}
                  {verification.attestation.request_nonce && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Request Nonce
                      </h3>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block break-all">
                        {verification.attestation.request_nonce}
                      </code>
                    </div>
                  )}

                  {/* Intel Quote */}
                  {verification.attestation.intel_quote && (
                    <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-950">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        🔐 Intel SGX/TDX Quote
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Hardware attestation from Intel Trusted Execution Environment
                      </p>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline mb-2">
                          View Quote (hex)
                        </summary>
                        <pre className="bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
                          {verification.attestation.intel_quote}
                        </pre>
                      </details>
                    </div>
                  )}

                  {/* NVIDIA Payload */}
                  {verification.attestation.nvidia_payload && (
                    <div className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        🎮 NVIDIA GPU TEE Attestation
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        GPU Trusted Execution Environment proof
                      </p>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline mb-2">
                          View Payload
                        </summary>
                        <pre className="bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto whitespace-pre-wrap break-all max-h-96">
                          {verification.attestation.nvidia_payload}
                        </pre>
                      </details>
                    </div>
                  )}

                  {/* Full Attestation JSON */}
                  <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      View Full Attestation JSON
                    </summary>
                    <pre className="mt-2 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto text-xs">
                      {JSON.stringify(verification.attestation, null, 2)}
                    </pre>
                  </details>
                </>
              ) : (
                <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                  <p className="mb-2">No attestation data available</p>
                  <p className="text-xs">Attestation may still be loading...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall Verification Status */}
              {verification.verificationStatus && (
                <div className={`border rounded-lg p-4 ${
                  verification.verificationStatus.isVerified
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950'
                    : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {verification.verificationStatus.isVerified ? '✅' : '❌'}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {verification.verificationStatus.isVerified
                          ? 'Cryptographically Verified'
                          : 'Verification Failed'}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Verified at {new Date(verification.verificationStatus.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Verification Steps */}
                  {verification.verificationSteps && verification.verificationSteps.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Verification Steps:
                      </p>
                      {verification.verificationSteps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-xs"
                        >
                          <span className="mt-0.5">
                            {step.status === 'success' ? '✓' : step.status === 'failed' ? '✗' : '⏳'}
                          </span>
                          <div className="flex-1">
                            <p className={`font-medium ${
                              step.status === 'success'
                                ? 'text-green-800 dark:text-green-300'
                                : step.status === 'failed'
                                ? 'text-red-800 dark:text-red-300'
                                : 'text-yellow-800 dark:text-yellow-300'
                            }`}>
                              {step.name}
                            </p>
                            {step.details && (
                              <pre className="text-xs mt-1 text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all">
                                {step.details}
                              </pre>
                            )}
                            {step.error && (
                              <p className="text-xs mt-1 text-red-600 dark:text-red-400">
                                Error: {step.error}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Chat ID */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  📝 Chat ID
                </h3>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block break-all">
                  {verification.chatId}
                </code>
              </div>

              {/* Request & Response Hashes */}
              {verification.requestHash && verification.responseHash && (
                <div className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    ✅ Integrity Proof
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Request Hash (SHA256):</p>
                      <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded block break-all">
                        {verification.requestHash}
                      </code>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Response Hash (SHA256):</p>
                      <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded block break-all">
                        {verification.responseHash}
                      </code>
                    </div>

                    <div className="pt-2 border-t border-green-300 dark:border-green-800">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Combined: {verification.text}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cryptographic Signature */}
              {verification.signature && (
                <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    🔐 TEE Signature
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    ECDSA/Ed25519 signature from Trusted Execution Environment
                  </p>
                  <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded block break-all">
                    {verification.signature}
                  </code>
                </div>
              )}

              {/* Signing Address */}
              {verification.signingAddress && (
                <div className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-950">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    🏷️ Signing Address
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    TEE instance identifier
                  </p>
                  <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded block break-all">
                    {verification.signingAddress}
                  </code>
                </div>
              )}

              {/* Attestation */}
              {verification.attestation && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    🔍 Hardware Attestation
                  </h3>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    {JSON.stringify(verification.attestation, null, 2)}
                  </pre>
                </div>
              )}

              {/* Timestamp */}
              {verification.fetchedAt && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                  Verified at {new Date(verification.fetchedAt).toLocaleString()}
                </div>
              )}

              {/* No verification data */}
              {!verification.signature && !verification.requestHash && (
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center p-4">
                  <p className="mb-2">⏳ Verification data is being fetched...</p>
                  <p className="text-xs">This may take a moment after the response completes.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
