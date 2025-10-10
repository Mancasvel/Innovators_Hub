'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  eventId: {
    title: string;
    date: string;
    location: string;
  };
}

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

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

function TicketCard({
  ticket,
  index,
  isPast = false,
}: {
  ticket: Ticket;
  index: number;
  isPast?: boolean;
}) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`card ${isPast ? 'opacity-60' : ''}`}
    >
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            ticket.status
          )}`}
        >
          {ticket.status.toUpperCase()}
        </span>
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
      </div>

      {/* QR Code */}
      {ticket.status === 'valid' && !isPast && (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <img
            src={`/api/qr?code=${ticket.qrCode}`}
            alt="Ticket QR Code"
            className="w-48 h-48 mx-auto mb-2"
          />
          <p className="text-xs text-gray-600">
            Show this QR code at the entrance
          </p>
        </div>
      )}
    </motion.div>
  );
}



