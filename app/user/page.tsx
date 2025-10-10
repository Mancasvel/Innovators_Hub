'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * User dashboard home
 * Overview of tickets and membership status
 */

export default function UserDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalTickets: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/tickets');
      const data = await response.json();
      const tickets = data.tickets;

      const upcoming = tickets.filter(
        (t: any) => new Date(t.eventId.date) > new Date()
      );

      setStats({
        totalTickets: tickets.length,
        upcomingEvents: upcoming.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const user = session?.user as any;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-light-gray">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 mb-8">
              Manage your tickets and membership
            </p>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="card bg-gradient-orange text-white">
                <h3 className="text-lg font-semibold mb-2">
                  Upcoming Events
                </h3>
                <p className="text-4xl font-bold">
                  {loading ? '...' : stats.upcomingEvents}
                </p>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Total Tickets</h3>
                <p className="text-4xl font-bold text-seville-orange">
                  {loading ? '...' : stats.totalTickets}
                </p>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-2">
                  Membership Status
                </h3>
                <p className="text-2xl font-bold">
                  {user?.hasMembership ? (
                    <span className="text-green-600">Active ⭐</span>
                  ) : (
                    <span className="text-gray-500">Inactive</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/user/tickets">
                <div className="card hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">🎟️ My Tickets</h3>
                      <p className="text-gray-600">
                        View and manage your event tickets
                      </p>
                    </div>
                    <span className="text-3xl">→</span>
                  </div>
                </div>
              </Link>

              <Link href="/user/membership">
                <div className="card hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        ⭐ Membership
                      </h3>
                      <p className="text-gray-600">
                        Manage your premium membership
                      </p>
                    </div>
                    <span className="text-3xl">→</span>
                  </div>
                </div>
              </Link>

              <Link href="/events">
                <div className="card hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">📅 Browse Events</h3>
                      <p className="text-gray-600">
                        Discover upcoming events and workshops
                      </p>
                    </div>
                    <span className="text-3xl">→</span>
                  </div>
                </div>
              </Link>

              <Link href="/user/profile">
                <div className="card hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">👤 Profile</h3>
                      <p className="text-gray-600">
                        Update your account information
                      </p>
                    </div>
                    <span className="text-3xl">→</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Membership CTA */}
            {!user?.hasMembership && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-12 card bg-gradient-orange text-white"
              >
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Upgrade to Premium Membership
                    </h3>
                    <p className="text-white/90">
                      Get free access to selected events all year long
                    </p>
                  </div>
                  <Link
                    href="/user/membership"
                    className="mt-4 md:mt-0 btn bg-white text-seville-orange hover:bg-gray-100"
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



