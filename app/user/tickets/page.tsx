'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * User tickets page
 * Displays all user's tickets with QR codes
 */

interface Ticket {
  _id: string;
  qrCode: string;
  status: string;
  createdAt: string;
  usedAt?: string;
  eventId: {
    title: string;
    date: string;
    location: string;
    images?: string[];
  };
  purchasePrice: number;
  purchasedWithMembership: boolean;
}

function TicketsContent() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchTickets();
    
    // Check for success/error messages
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'true') {
      setMessage({ type: 'success', text: '🎉 Ticket claimed successfully! Your QR code is ready.' });
      setTimeout(() => setMessage(null), 5000);
    } else if (error === 'already-claimed') {
      setMessage({ type: 'error', text: '⚠️ You already have a ticket for this event.' });
      setTimeout(() => setMessage(null), 5000);
    } else if (error === 'claim-failed') {
      setMessage({ type: 'error', text: '❌ Failed to claim ticket. Please try again.' });
      setTimeout(() => setMessage(null), 5000);
    }
  }, [searchParams]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/user/tickets');
      const data = await response.json();
      setTickets(data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
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

  const upcomingTickets = tickets.filter(
    (t) => new Date(t.eventId.date) > new Date()
  );
  const pastTickets = tickets.filter(
    (t) => new Date(t.eventId.date) <= new Date()
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-light-gray">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-8">My Tickets</h1>

            {/* Success/Error Messages */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 border-2 border-green-500 text-green-800'
                      : 'bg-red-50 border-2 border-red-500 text-red-800'
                  }`}
                >
                  <p className="font-semibold">{message.text}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-seville-orange"></div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 text-lg mb-4">
                  You don't have any tickets yet
                </p>
                <Link href="/events" className="btn btn-primary">
                  Browse Events
                </Link>
              </div>
            ) : (
              <>
                {/* Upcoming Tickets */}
                {upcomingTickets.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">
                      Upcoming Events ({upcomingTickets.length})
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingTickets.map((ticket, index) => (
                        <TicketCard key={ticket._id} ticket={ticket} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Tickets */}
                {pastTickets.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">
                      Past Events ({pastTickets.length})
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pastTickets.map((ticket, index) => (
                        <TicketCard key={ticket._id} ticket={ticket} index={index} isPast />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function UserTicketsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-light-gray flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-seville-orange"></div>
        </main>
        <Footer />
      </div>
    }>
      <TicketsContent />
    </Suspense>
  );
}

function TicketCard({
  ticket,
  index,
  isPast = false,
}: {
  ticket: Ticket;
  index: number;
  isPast?: boolean;
}) {
  const [showQR, setShowQR] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return '✅ VALID';
      case 'used':
        return '✓ USED';
      case 'cancelled':
        return '❌ CANCELLED';
      default:
        return status.toUpperCase();
    }
  };

  const downloadQR = async () => {
    try {
      const response = await fetch(`/api/qr?code=${ticket.qrCode}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticket.eventId.title.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading QR:', error);
      alert('Failed to download QR code');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`card ${isPast ? 'opacity-60' : ''}`}
    >
      {/* Event Image */}
      {ticket.eventId.images && ticket.eventId.images.length > 0 && (
        <div className="relative w-full h-48 mb-4 -mt-6 -mx-6 rounded-t-lg overflow-hidden">
          <Image
            src={ticket.eventId.images[0]}
            alt={ticket.eventId.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            ticket.status
          )}`}
        >
          {getStatusText(ticket.status)}
        </span>
        {ticket.purchasedWithMembership && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            🎟️ FREE (Member)
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold mb-3">{ticket.eventId.title}</h3>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p className="flex items-center">
          <span className="mr-2">📅</span>
          {formatDate(ticket.eventId.date)}
        </p>
        <p className="flex items-center">
          <span className="mr-2">📍</span>
          {ticket.eventId.location}
        </p>
        {ticket.usedAt && (
          <p className="flex items-center text-gray-500">
            <span className="mr-2">✓</span>
            Used on {formatDate(ticket.usedAt)}
          </p>
        )}
      </div>

      {/* QR Code Section */}
      {ticket.status === 'valid' && !isPast && (
        <div className="border-t pt-4">
          {!showQR ? (
            <button
              onClick={() => setShowQR(true)}
              className="w-full btn btn-primary"
            >
              Show QR Code
            </button>
          ) : (
            <div className="bg-white p-4 rounded-lg border-2 border-seville-orange">
              <div className="bg-white p-2 rounded">
                <img
                  src={`/api/qr?code=${ticket.qrCode}`}
                  alt="Ticket QR Code"
                  className="w-full h-auto mx-auto"
                />
              </div>
              <p className="text-xs text-center text-gray-600 mt-2 mb-3">
                Show this QR code at the entrance
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQR(false)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  Hide
                </button>
                <button
                  onClick={downloadQR}
                  className="flex-1 btn btn-primary text-sm"
                >
                  📥 Download
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Used or Past Ticket - Show greyed out QR */}
      {(ticket.status === 'used' || isPast) && (
        <div className="border-t pt-4 opacity-50">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <img
              src={`/api/qr?code=${ticket.qrCode}`}
              alt="Ticket QR Code"
              className="w-32 h-32 mx-auto opacity-50"
            />
            <p className="text-xs text-gray-500 mt-2">
              {ticket.status === 'used' ? 'This ticket has been used' : 'Event has passed'}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}



