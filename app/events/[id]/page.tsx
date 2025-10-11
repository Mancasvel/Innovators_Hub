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
  images?: string[];
  category?: string;
  ticketsSold: number;
  capacity: number; // Now required
  status: 'draft' | 'published' | 'cancelled';
  createdBy: {
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [modal, setModal] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

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
      // If it's free (for members), use the free-claim endpoint
      if (effectivePrice === 0) {
        const response = await fetch(`/api/tickets/free-claim?eventId=${id}`);
        const data = await response.json();

        if (response.ok) {
          // Success - show modal and redirect to tickets
          setModal({
            show: true,
            type: 'success',
            title: '🎉 ¡Entrada Reclamada!',
            message: data.message || '¡Entrada reclamada con éxito! Revisa tu email para el código QR.',
          });
          
          // Redirect after 2 seconds
          setTimeout(() => {
            router.push('/user/tickets');
          }, 2000);
        } else {
          // Error - show modal with error message
          setModal({
            show: true,
            type: 'error',
            title: '❌ Error',
            message: data.error || 'No se pudo reclamar la entrada. Por favor, inténtalo de nuevo.',
          });
          setPurchasing(false);
        }
        return;
      }

      // Otherwise, use Stripe checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, type: 'ticket' }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      setModal({
        show: true,
        type: 'error',
        title: '❌ Error',
        message: 'Error al procesar el pago. Por favor, inténtalo de nuevo.',
      });
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
    // Price is already in euros (not cents)
    return price.toFixed(2);
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

  const isSoldOut = event.ticketsSold >= event.capacity;
  const userIsMember = (session?.user as any)?.hasMembership;
  
  // Determine effective price: free if price is 0 OR if membership-free event and user is member
  const isFreeEvent = event.price === 0;
  const isFreeForMember = event.membershipFree && userIsMember;
  const effectivePrice = isFreeEvent || isFreeForMember ? 0 : event.price;

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
                          {isFreeEvent ? (
                            <p className="text-sm text-gray-600">
                              🎉 Free for everyone
                            </p>
                          ) : isFreeForMember ? (
                            <p className="text-sm text-gray-600">
                              Free with your membership
                            </p>
                          ) : null}
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
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {event.ticketsSold} / {event.capacity} entradas vendidas
                        </p>
                        {event.ticketsSold >= event.capacity ? (
                          <p className="text-sm text-red-600 font-semibold">
                            ⚠️ Agotado
                          </p>
                        ) : (
                          <p className="text-sm text-green-600">
                            ✓ {event.capacity - event.ticketsSold} entradas disponibles
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handlePurchase}
                      disabled={purchasing || isSoldOut}
                      className={`btn w-full md:w-auto ${isSoldOut ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
                    >
                      {purchasing
                        ? 'Procesando...'
                        : isSoldOut
                        ? '❌ Agotado'
                        : effectivePrice === 0
                        ? '🎟️ Reclamar Entrada Gratis'
                        : `💳 Comprar Entrada - €${formatPrice(effectivePrice)}`}
                    </button>

                    {/* Calendar Integration */}
                    <CalendarIntegration event={event} className="mt-4 md:mt-0" />
                  </div>

                  {!session && !isSoldOut && (
                    <p className="mt-4 text-sm text-gray-600 text-center">
                      <Link
                        href={`/auth/login?callbackUrl=/events/${id}`}
                        className="text-seville-orange hover:underline"
                      >
                        Inicia sesión
                      </Link>{' '}
                      para comprar entradas
                    </p>
                  )}
                  {isSoldOut && (
                    <p className="mt-4 text-sm text-red-600 text-center font-semibold">
                      😔 Lo sentimos, este evento ha alcanzado su capacidad máxima
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Modal de resultado */}
      {modal && modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-xl shadow-2xl p-8 max-w-md w-full ${
              modal.type === 'success' ? 'border-4 border-green-500' : 'border-4 border-red-500'
            }`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{modal.type === 'success' ? '🎉' : '😔'}</div>
              <h2 className={`text-2xl font-bold mb-4 ${
                modal.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {modal.title}
              </h2>
              <p className="text-gray-700 mb-6 text-lg">
                {modal.message}
              </p>
              {modal.type === 'success' ? (
                <div className="text-sm text-gray-600">
                  Redirigiendo a tus entradas...
                </div>
              ) : (
                <button
                  onClick={() => {
                    setModal(null);
                    setPurchasing(false);
                  }}
                  className="btn btn-primary"
                >
                  Cerrar
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}



