'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

/**
 * Main navigation bar
 * Displays different options based on user role
 */

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-seville-orange">
              Innovators Hub
            </span>
            <span className="hidden sm:inline text-gray-600 text-sm">
              | Seville
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/events"
              className="text-gray-700 hover:text-seville-orange transition-colors"
            >
              Events
            </Link>

            {status === 'authenticated' ? (
              <>
                {/* User Dashboard */}
                <Link
                  href="/user"
                  className="text-gray-700 hover:text-seville-orange transition-colors"
                >
                  My Dashboard
                </Link>

                {/* Organizer Dashboard */}
                {(user?.role === 'organizer' || user?.role === 'admin') && (
                  <Link
                    href="/organizer"
                    className="text-gray-700 hover:text-seville-orange transition-colors"
                  >
                    Organizer
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {user?.name || user?.email}
                  </span>
                  {user?.hasMembership && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      ⭐ Member
                    </span>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm text-gray-700 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-seville-orange transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="btn btn-primary text-sm py-2 px-4"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}



