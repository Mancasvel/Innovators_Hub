'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Events listing page
 * Displays all upcoming published events
 */

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  membershipFree: boolean;
  images?: string[];
  category?: string;
  ticketsSold: number;
  capacity?: number;
  status: 'draft' | 'published' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?upcoming=true');
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    // Price is already in euros (not cents)
    return price.toFixed(2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="bg-gradient-orange text-white py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Upcoming Events
              </h1>
              <p className="text-xl text-white/90">
                Discover workshops, talks, and networking opportunities
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-seville-orange"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No upcoming events at the moment. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/events/${event._id}`}>
                    <div className="card hover:scale-105 transition-transform duration-300 h-full flex flex-col">
                      {/* Event Images */}
                      {event.images && event.images.length > 0 && (
                        <div className="mb-4">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={event.images[0]}
                              alt={event.title}
                              width={400}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex-grow">
                        {event.category && (
                          <span className="inline-block px-3 py-1 bg-seville-orange/10 text-seville-orange text-xs font-semibold rounded-full mb-3">
                            {event.category}
                          </span>
                        )}
                        <h3 className="text-xl font-bold mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p className="flex items-center">
                            <span className="mr-2">📅</span>
                            {formatDate(event.date)}
                          </p>
                          <p className="flex items-center">
                            <span className="mr-2">📍</span>
                            {event.location}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <div>
                          {event.price === 0 ? (
                            <span className="text-green-600 font-bold">
                              Free
                            </span>
                          ) : (
                            <span className="text-gray-900 font-bold">
                              €{formatPrice(event.price)}
                            </span>
                          )}
                          {event.membershipFree && event.price > 0 && (
                            <p className="text-xs text-seville-orange">
                              Free for members
                            </p>
                          )}
                        </div>
                        {event.capacity && (
                          <span className="text-xs text-gray-500">
                            {event.ticketsSold}/{event.capacity} sold
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}



