"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Authentication error page
 * Displays user-friendly error messages
 */

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link is invalid or has expired.",
  Default: "An error occurred during authentication.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-gray">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center card"
      >
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-8">
          {errorMessages[error] || errorMessages.Default}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/login" className="btn btn-primary">
            Try Again
          </Link>
          <Link href="/" className="btn btn-secondary">
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-light-gray">
          <div className="max-w-md w-full text-center card">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Loading...
            </h1>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
