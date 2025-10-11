'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import CalendarIntegration from '@/components/CalendarIntegration';

/**
 * Event detail page
 * Shows full event information and allows ticket purchase
 */

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  membershipFree: boolean;
  category?: string;
  ticketsSold: number;
  capacity?: number;
  images?: string[];
  createdBy: { name: string };
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();
      setEvent(data.event);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/events/${id}`);
      return;
    }

    setPurchasing(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, type: 'ticket' }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setPurchasing(false);
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
    return (price / 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-seville-orange"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event not found</h1>
            <Link href="/events" className="btn btn-primary">
              Back to Events
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isSoldOut = Boolean(event.capacity && event.ticketsSold >= event.capacity);
  const userIsMember = (session?.user as any)?.hasMembership;
  const effectivePrice =
    event.membershipFree && userIsMember ? 0 : event.price;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-6">
              <Link
                href="/events"
                className="text-seville-orange hover:text-orange-600"
              >
                ← Back to Events
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-orange text-white p-8">
                {event.category && (
                  <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-3">
                    {event.category}
                  </span>
                )}
                <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
                <p className="text-white/90">
                  Organized by {event.createdBy.name}
                </p>
              </div>

              {/* Event Images Gallery */}
              {event.images && event.images.length > 0 && (
                <div className="p-8 border-b border-gray-200">
                  <div className={`grid gap-4 ${event.images.length === 1 ? 'grid-cols-1' : event.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                    {event.images.map((imageUrl, index) => (
                      <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`${event.title} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      📅 Date & Time
                    </h3>
                    <p className="text-gray-600">{formatDate(event.date)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      📍 Location
                    </h3>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3 text-xl">
                    About this event
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      {effectivePrice === 0 ? (
                        <div>
                          <p className="text-3xl font-bold text-green-600">
                            Free
                          </p>
                          {userIsMember && event.price > 0 && (
                            <p className="text-sm text-gray-600">
                              Free with your membership
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-3xl font-bold text-gray-900">
                            €{formatPrice(effectivePrice)}
                          </p>
                          {event.membershipFree && (
                            <p className="text-sm text-seville-orange">
                              Free for members
                            </p>
                          )}
                        </div>
                      )}
                      {event.capacity && (
                        <p className="text-sm text-gray-600 mt-2">
                          {event.ticketsSold} / {event.capacity} tickets sold
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handlePurchase}
                      disabled={purchasing || isSoldOut}
                      className="btn btn-primary w-full md:w-auto"
                    >
                      {purchasing
                        ? 'Processing...'
                        : isSoldOut
                        ? 'Sold Out'
                        : effectivePrice === 0
                        ? 'Get Free Ticket'
                        : 'Buy Ticket'}
                    </button>

                    {/* Calendar Integration */}
                    <CalendarIntegration event={event} className="mt-4 md:mt-0" />
                  </div>

                  {!session && (
                    <p className="mt-4 text-sm text-gray-600 text-center">
                      <Link
                        href={`/auth/login?callbackUrl=/events/${id}`}
                        className="text-seville-orange hover:underline"
                      >
                        Sign in
                      </Link>{' '}
                      to purchase tickets
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



