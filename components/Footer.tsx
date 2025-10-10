'use client';

import Link from 'next/link';

/**
 * Footer component with brand information
 */

export default function Footer() {
  return (
    <footer className="bg-dark-gray text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-seville-orange mb-4">
              Innovators Hub
            </h3>
            <p className="text-gray-400">
              Your community for digital nomads and innovators in Seville, Spain.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/events"
                  className="text-gray-400 hover:text-seville-orange transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/user"
                  className="text-gray-400 hover:text-seville-orange transition-colors"
                >
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-gray-400 hover:text-seville-orange transition-colors"
                >
                  Join Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Location</h4>
            <p className="text-gray-400">
              Seville, Spain
              <br />
              📧 hello@innovatorshub.com
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Innovators Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}



