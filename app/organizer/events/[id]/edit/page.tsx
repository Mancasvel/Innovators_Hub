'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageUpload from '@/components/ImageUpload';

/**
 * Edit event page for organizers
 * Allows updating existing event details
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

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: '',
    membershipFree: false,
    capacity: '',
    category: 'other',
    images: [] as string[],
    status: 'published',
  });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch event');
      }

      const evt = data.event;
      setEvent(evt);

      // Convert date to datetime-local format
      const dateObj = new Date(evt.date);
      const localDateTime = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      // Populate form
      setFormData({
        title: evt.title || '',
        description: evt.description || '',
        date: localDateTime,
        location: evt.location || '',
        price: evt.price.toString(), // Price is already in euros
        membershipFree: evt.membershipFree || false,
        capacity: evt.capacity?.toString() || '',
        category: evt.category || 'other',
        images: evt.images || [],
        status: evt.status || 'published',
      });
    } catch (err: any) {
      console.error('Error fetching event:', err);
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Parse price (already in euros, not cents)
      const price = parseFloat(formData.price);

      // Build update payload (only changed fields)
      const updates: any = {};
      
      if (formData.title !== event?.title) updates.title = formData.title;
      if (formData.description !== event?.description) updates.description = formData.description;
      if (formData.date) {
        const newDate = new Date(formData.date).toISOString();
        const oldDate = new Date(event?.date || '').toISOString();
        if (newDate !== oldDate) updates.date = newDate;
      }
      if (formData.location !== event?.location) updates.location = formData.location;
      if (price !== event?.price) updates.price = price;
      if (formData.membershipFree !== event?.membershipFree) updates.membershipFree = formData.membershipFree;
      if (formData.capacity && parseInt(formData.capacity) !== event?.capacity) {
        updates.capacity = parseInt(formData.capacity);
      }
      if (formData.category !== event?.category) updates.category = formData.category;
      if (JSON.stringify(formData.images) !== JSON.stringify(event?.images)) updates.images = formData.images;
      if (formData.status !== event?.status) updates.status = formData.status;

      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update event');
      }

      router.push('/organizer/events');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-seville-orange"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Go Back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-light-gray">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold">Edit Event</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                formData.status === 'published' 
                  ? 'bg-green-100 text-green-800'
                  : formData.status === 'draft'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {formData.status}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="card">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="label">
                    Event Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="label">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input min-h-32"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="label">
                      Date & Time *
                    </label>
                    <input
                      id="date"
                      type="datetime-local"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="label">
                      Category
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="input"
                    >
                      <option value="networking">Networking</option>
                      <option value="workshop">Workshop</option>
                      <option value="talk">Talk</option>
                      <option value="social">Social</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="label">
                    Location *
                  </label>
                  <input
                    id="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="input"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="label">
                      Price (€) *
                    </label>
                    <input
                      id="price"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="capacity" className="label">
                      Capacity (optional)
                    </label>
                    <input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="input"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="images" className="label">
                    Event Images
                  </label>
                  <ImageUpload
                    value={formData.images}
                    onChange={(urls: string | string[]) => setFormData({ ...formData, images: urls as string[] })}
                    disabled={loading}
                    multiple={true}
                    maxImages={10}
                  />
                </div>

                <div>
                  <label htmlFor="status" className="label">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="membershipFree"
                    type="checkbox"
                    checked={formData.membershipFree}
                    disabled={parseFloat(formData.price) === 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membershipFree: e.target.checked,
                      })
                    }
                    className={`w-4 h-4 text-seville-orange border-gray-300 rounded focus:ring-seville-orange ${
                      parseFloat(formData.price) === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  <label
                    htmlFor="membershipFree"
                    className={`ml-2 text-sm ${
                      parseFloat(formData.price) === 0 ? 'text-gray-500' : 'text-gray-700'
                    }`}
                  >
                    {parseFloat(formData.price) === 0
                      ? 'Free for everyone (automatically enabled when price is €0)'
                      : 'Free for premium members'
                    }
                  </label>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn btn-primary"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

