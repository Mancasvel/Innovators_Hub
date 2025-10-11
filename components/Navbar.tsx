'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Main navigation bar
 * Displays different options based on user role
 * Responsive design with mobile hamburger menu
 */

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
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
                  <Link
                    href="/user/profile"
                    className="text-sm text-gray-700 hover:text-seville-orange transition-colors"
                  >
                    Profile
                  </Link>
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

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-seville-orange hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-seville-orange"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/events"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-seville-orange hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Events
                </Link>

                {status === 'authenticated' ? (
                  <>
                    <Link
                      href="/user"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-seville-orange hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Dashboard
                    </Link>

                    {(user?.role === 'organizer' || user?.role === 'admin') && (
                      <Link
                        href="/organizer"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-seville-orange hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Organizer
                      </Link>
                    )}

                    <div className="px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user?.name || user?.email}
                          </p>
                          {user?.hasMembership && (
                            <span className="text-xs text-yellow-600">⭐ Member</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 px-3 py-2">
                    <Link
                      href="/auth/login"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-seville-orange hover:bg-gray-50 rounded-md transition-colors text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-3 py-2 text-base font-medium text-white bg-seville-orange hover:bg-seville-orange/90 rounded-md transition-colors text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}



