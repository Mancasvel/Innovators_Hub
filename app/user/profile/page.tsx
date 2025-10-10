'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * User profile page
 * Display and edit user information
 */

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-light-gray">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-8">My Profile</h1>

            <div className="card">
              <div className="space-y-6">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="input bg-gray-50"
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="input bg-gray-50"
                  />
                </div>

                <div>
                  <label className="label">Account Type</label>
                  <input
                    type="text"
                    value={user?.role || 'user'}
                    readOnly
                    className="input bg-gray-50 capitalize"
                  />
                </div>

                <div>
                  <label className="label">Membership Status</label>
                  <span
                    className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                      user?.hasMembership
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user?.hasMembership ? '⭐ Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <p className="mt-6 text-sm text-gray-600">
                Need to update your information? Contact support at hello@innovatorshub.com
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



