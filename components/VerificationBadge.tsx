// Verification status badge component
import type { VerificationProof } from '@/lib/types';

interface VerificationBadgeProps {
  verification?: VerificationProof;
}

export function VerificationBadge({ verification }: VerificationBadgeProps) {
  if (!verification) {
    return null;
  }

  const status = verification.verificationStatus;

  // No verification status yet (still fetching/verifying)
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700">
        <span className="animate-spin">⏳</span>
        Verifying...
      </span>
    );
  }

  // Fully verified
  if (status.isVerified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-300 dark:border-green-700">
        <span>✓</span>
        Verified
      </span>
    );
  }

  // Verification failed
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-300 dark:border-red-700">
      <span>✗</span>
      Failed
    </span>
  );
}
