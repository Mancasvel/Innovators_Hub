'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Organizer events management page
 * List and manage organizer's events
 */

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  membershipFree: boolean;
  ticketsSold: number;
  capacity?: number;
  status: string;
}

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      // Filter to show only current user's events (done by API)
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEvents(events.filter((e) => e._id !== eventId));
        alert('Event cancelled successfully');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to cancel event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
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
              <h1 className="text-4xl font-bold">My Events</h1>
              <Link href="/organizer/events/create" className="btn btn-primary">
                + Create Event
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-seville-orange"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 text-lg mb-4">
                  You haven't created any events yet
                </p>
                <Link href="/organizer/events/create" className="btn btn-primary">
                  Create Your First Event
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{event.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              event.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : event.status === 'draft'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>📅 {formatDate(event.date)}</span>
                          <span>📍 {event.location}</span>
                          <span>
                            💰 €{formatPrice(event.price)}
                            {event.membershipFree && ' (Free for members)'}
                          </span>
                          <span>
                            🎟️ {event.ticketsSold}
                            {event.capacity && `/${event.capacity}`} sold
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Link
                          href={`/organizer/events/${event._id}/edit`}
                          className="btn btn-secondary text-center text-sm py-2"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/events/${event._id}`}
                          className="btn btn-outline text-center text-sm py-2"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="btn bg-red-100 text-red-600 hover:bg-red-200 text-sm py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



