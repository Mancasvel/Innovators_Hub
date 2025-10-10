'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * Unauthorized access page
 */

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-gray">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        <Link href="/" className="btn btn-primary">
          Go Home
        </Link>
      </motion.div>
    </div>
  );
}



