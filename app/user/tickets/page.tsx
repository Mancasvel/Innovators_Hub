"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createEvent as createICSEvent } from "ics";

/**
 * User tickets page
 * Displays all user's tickets with QR codes and mobile-optimized design
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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchTickets();

    // Check for success/error messages
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      setMessage({
        type: "success",
        text: "🎉 ¡Entrada reclamada con éxito! Tu código QR está listo.",
      });
      setTimeout(() => setMessage(null), 5000);
    } else if (error === "already-claimed") {
      setMessage({
        type: "error",
        text: "⚠️ Ya tienes una entrada para este evento.",
      });
      setTimeout(() => setMessage(null), 5000);
    } else if (error === "sold-out") {
      setMessage({
        type: "error",
        text: "😔 Este evento ha alcanzado su capacidad máxima. No hay más entradas disponibles.",
      });
      setTimeout(() => setMessage(null), 5000);
    } else if (error === "not-free") {
      setMessage({
        type: "error",
        text: "⚠️ Este evento no es gratuito para miembros.",
      });
      setTimeout(() => setMessage(null), 5000);
    } else if (error === "claim-failed") {
      setMessage({
        type: "error",
        text: "❌ Error al reclamar la entrada. Por favor, inténtalo de nuevo.",
      });
      setTimeout(() => setMessage(null), 5000);
    }
  }, [searchParams]);

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/user/tickets");
      const data = await response.json();
      setTickets(data.tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const upcomingTickets = tickets.filter(
    (t) => new Date(t.eventId.date) > new Date(),
  );

  const pastTickets = tickets.filter(
    (t) => new Date(t.eventId.date) <= new Date(),
  );

  const addToCalendar = (ticket: Ticket) => {
    try {
      const eventDate = new Date(ticket.eventId.date);

      // Create ICS event
      const icsEvent = {
        title: ticket.eventId.title,
        description: `Event at ${ticket.eventId.location}. You have a ticket for this event.`,
        start: [
          eventDate.getFullYear(),
          eventDate.getMonth() + 1,
          eventDate.getDate(),
          eventDate.getHours(),
          eventDate.getMinutes(),
        ] as [number, number, number, number, number],
        duration: { hours: 2 }, // Default 2 hours duration
        location: ticket.eventId.location,
        organizer: { name: "Innovators Hub", email: "hello@innovatorshub.com" },
      };

      createICSEvent(icsEvent, (error, value) => {
        if (error) {
          console.error("Error creating calendar event:", error);
          alert("Failed to create calendar event");
          return;
        }

        // Create download link for .ics file
        const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `event-${ticket.eventId.title.replace(/\s+/g, "-")}.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
    } catch (error) {
      console.error("Error adding to calendar:", error);
      alert("Failed to add event to calendar");
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
            className="max-w-6xl mx-auto"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Tickets
              </h1>
              <p className="text-gray-600">
                Manage your event tickets and add events to your calendar
              </p>
            </div>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-6 p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 border-2 border-green-500 text-green-800"
                      : "bg-red-50 border-2 border-red-500 text-red-800"
                  }`}
                >
                  <p className="font-semibold">{message.text}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-seville-orange"></div>
                <p className="mt-4 text-gray-600">Loading your tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎫</div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {upcomingTickets.map((ticket, index) => (
                        <TicketCard
                          key={ticket._id}
                          ticket={ticket}
                          index={index}
                        />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {pastTickets.map((ticket, index) => (
                        <TicketCard
                          key={ticket._id}
                          ticket={ticket}
                          index={index}
                          isPast
                        />
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
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow bg-light-gray flex items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-seville-orange"></div>
          </main>
          <Footer />
        </div>
      }
    >
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
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "used":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "valid":
        return "✅ VALID";
      case "used":
        return "✓ USED";
      case "cancelled":
        return "❌ CANCELLED";
      default:
        return status.toUpperCase();
    }
  };

  const downloadQR = async () => {
    try {
      const response = await fetch(`/api/qr?code=${ticket.qrCode}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${ticket.eventId.title.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading QR:", error);
      alert("Failed to download QR code");
    }
  };

  const addToCalendar = () => {
    try {
      const eventDate = new Date(ticket.eventId.date);

      // Create ICS event
      const icsEvent = {
        title: ticket.eventId.title,
        description: `Event at ${ticket.eventId.location}. You have a ticket for this event.`,
        start: [
          eventDate.getFullYear(),
          eventDate.getMonth() + 1,
          eventDate.getDate(),
          eventDate.getHours(),
          eventDate.getMinutes(),
        ] as [number, number, number, number, number],
        duration: { hours: 2 }, // Default 2 hours duration
        location: ticket.eventId.location,
        organizer: { name: "Innovators Hub", email: "hello@innovatorshub.com" },
      };

      createICSEvent(icsEvent, (error, value) => {
        if (error) {
          console.error("Error creating calendar event:", error);
          alert("Failed to create calendar event");
          return;
        }

        // Create download link for .ics file
        const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `event-${ticket.eventId.title.replace(/\s+/g, "-")}.ics`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
    } catch (error) {
      console.error("Error adding to calendar:", error);
      alert("Failed to add event to calendar");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`card hover:scale-105 transition-transform duration-300 h-full flex flex-col ${isPast ? "opacity-60" : ""}`}
    >
      {/* Event Images */}
      {ticket.eventId.images && ticket.eventId.images.length > 0 && (
        <div className="mb-3 md:mb-4 -mx-4 md:-mx-6 -mt-4 md:-mt-6">
          <div className="aspect-video overflow-hidden bg-gray-100">
            <Image
              src={ticket.eventId.images[0]}
              alt={ticket.eventId.title}
              width={400}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="flex-grow">
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              ticket.status,
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

        <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 line-clamp-2">
          {ticket.eventId.title}
        </h3>

        <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
          <p className="flex items-start md:items-center">
            <span className="mr-2 flex-shrink-0">📅</span>
            <span className="line-clamp-2">
              {formatDate(ticket.eventId.date)}
            </span>
          </p>
          <p className="flex items-start md:items-center">
            <span className="mr-2 flex-shrink-0">📍</span>
            <span className="line-clamp-1">{ticket.eventId.location}</span>
          </p>
          {ticket.usedAt && (
            <p className="flex items-start md:items-center text-gray-500">
              <span className="mr-2 flex-shrink-0">✓</span>
              <span className="line-clamp-2">
                Used on {ticket.usedAt ? formatDate(ticket.usedAt) : ""}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        {ticket.status === "valid" && !isPast ? (
          !showQR ? (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <button
                onClick={() => setShowQR(true)}
                className="flex-1 btn btn-primary text-sm"
              >
                Show QR Code
              </button>
              <button
                onClick={addToCalendar}
                className="flex-1 btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                📅 Add to Calendar
              </button>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border-2 border-seville-orange w-full">
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
          )
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg text-center opacity-75 w-full">
            <img
              src={`/api/qr?code=${ticket.qrCode}`}
              alt="Ticket QR Code"
              className="w-24 h-24 mx-auto opacity-50 mb-2"
            />
            <p className="text-xs text-gray-500 mb-3">
              {ticket.status === "used"
                ? "This ticket has been used"
                : "Event has passed"}
            </p>
            <button
              onClick={addToCalendar}
              className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              📅 Add to Calendar
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
