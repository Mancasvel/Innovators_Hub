'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Membership management page
 * Subscribe or manage existing membership
 */

export default function MembershipPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const user = session?.user as any;
  const isMember = user?.hasMembership;

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'membership' }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Failed to open customer portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-light-gray">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-8">Premium Membership</h1>

            {isMember ? (
              /* Active Membership */
              <div className="card bg-gradient-orange text-white mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      ⭐ Active Membership
                    </h2>
                    <p className="text-white/90">
                      You're enjoying free access to selected events!
                    </p>
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={loading}
                    className="btn bg-white text-seville-orange hover:bg-gray-100"
                  >
                    {loading ? 'Loading...' : 'Manage Subscription'}
                  </button>
                </div>
              </div>
            ) : (
              /* Subscribe CTA */
              <div className="card bg-gradient-orange text-white mb-8">
                <h2 className="text-3xl font-bold mb-4">
                  Unlock Premium Benefits
                </h2>
                <p className="text-xl text-white/90 mb-6">
                  Get free access to selected events all year long
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-4xl font-bold">€99</span>
                  <span className="text-white/80">/ year</span>
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="mt-6 btn bg-white text-seville-orange hover:bg-gray-100"
                >
                  {loading ? 'Processing...' : 'Subscribe Now'}
                </button>
              </div>
            )}

            {/* Benefits */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <div className="text-4xl mb-4">🎟️</div>
                <h3 className="text-xl font-bold mb-2">Free Event Access</h3>
                <p className="text-gray-600">
                  Attend selected workshops, talks, and networking events at no extra cost
                </p>
              </div>

              <div className="card">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-2">Priority Booking</h3>
                <p className="text-gray-600">
                  Get early access to event registrations before general public
                </p>
              </div>

              <div className="card">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-bold mb-2">Exclusive Content</h3>
                <p className="text-gray-600">
                  Access members-only resources and community features
                </p>
              </div>

              <div className="card">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-2">Save Money</h3>
                <p className="text-gray-600">
                  Pay once, save hundreds on event tickets throughout the year
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



