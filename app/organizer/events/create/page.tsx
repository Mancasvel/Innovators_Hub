'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageUpload from '@/components/ImageUpload';

/**
 * Create event page for organizers
 */

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert price to cents
      const priceInCents = Math.round(parseFloat(formData.price) * 100);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: priceInCents,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      router.push('/organizer/events');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
            className="max-w-2xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-8">Create New Event</h1>

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
                    placeholder="e.g., Web3 Workshop for Beginners"
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
                    placeholder="Describe your event..."
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
                    placeholder="e.g., Innovators Hub, Calle Sierpes 45, Seville"
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
                      placeholder="0.00"
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
                Event Images (optional)
              </label>
              <ImageUpload
                value={formData.images}
                    onChange={(urls: string | string[]) => setFormData({ ...formData, images: urls as string[] })}
                disabled={loading}
                multiple={true}
                maxImages={10}
              />
            </div>

            <div className="flex items-center">
                  <input
                    id="membershipFree"
                    type="checkbox"
                    checked={formData.membershipFree}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        membershipFree: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-seville-orange border-gray-300 rounded focus:ring-seville-orange"
                  />
                  <label
                    htmlFor="membershipFree"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Free for premium members
                  </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn btn-primary"
                  >
                    {loading ? 'Creating...' : 'Create Event'}
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



