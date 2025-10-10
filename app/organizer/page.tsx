'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Organizer dashboard home
 * Overview of events and statistics
 */

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalTickets: 0,
    usedTickets: 0,
    validTickets: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/organizer/stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRevenue = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-light-gray">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">Organizer Dashboard</h1>
                <p className="text-gray-600">
                  Manage your events and validate tickets
                </p>
              </div>
              <div className="px-4 py-2 bg-orange-100 text-seville-orange rounded-full font-semibold">
                Organizer
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="card bg-gradient-orange text-white">
                <h3 className="text-lg font-semibold mb-2">Total Events</h3>
                <p className="text-4xl font-bold">
                  {loading ? '...' : stats.totalEvents}
                </p>
                <p className="text-white/80 text-sm mt-2">
                  {stats.upcomingEvents} upcoming
                </p>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Total Tickets</h3>
                <p className="text-4xl font-bold text-seville-orange">
                  {loading ? '...' : stats.totalTickets}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  {stats.validTickets} valid, {stats.usedTickets} used
                </p>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                <p className="text-4xl font-bold text-green-600">
                  {loading ? '...' : `€${formatRevenue(stats.totalRevenue)}`}
                </p>
                <p className="text-gray-600 text-sm mt-2">From ticket sales</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/organizer/scan">
                <div className="card hover:shadow-xl transition-shadow cursor-pointer bg-seville-orange text-white">
                  <div className="text-center">
                    <div className="text-5xl mb-4">📷</div>
                    <h3 className="text-2xl font-bold mb-2">Scan Tickets</h3>
                    <p className="text-white/90">
                      Validate tickets with QR scanner
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/organizer/events">
                <div className="card hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="text-center">
                    <div className="text-5xl mb-4">📅</div>
                    <h3 className="text-2xl font-bold mb-2">My Events</h3>
                    <p className="text-gray-600">
                      Create and manage your events
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/organizer/events/create">
                <div className="card hover:shadow-xl transition-shadow cursor-pointer border-2 border-seville-orange">
                  <div className="text-center">
                    <div className="text-5xl mb-4">➕</div>
                    <h3 className="text-2xl font-bold mb-2">Create Event</h3>
                    <p className="text-gray-600">
                      Host a new event or workshop
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



