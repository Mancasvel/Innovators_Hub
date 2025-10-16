"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageUpload from "@/components/ImageUpload";

/**
 * Create event page for organizers
 */

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    membershipFree: false,
    capacity: "50",
    category: "other",
    images: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate and prepare data
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        throw new Error("Please enter a valid price");
      }

      const capacity = parseInt(formData.capacity);
      if (isNaN(capacity) || capacity < 1) {
        throw new Error("Please enter a valid capacity (minimum 1)");
      }

      // Convert datetime-local to ISO 8601 format
      const dateISO = new Date(formData.date).toISOString();

      // Prepare payload
      const payload = {
        title: formData.title,
        description: formData.description,
        date: dateISO,
        location: formData.location,
        price: price, // Send as decimal number (euros), not cents
        membershipFree: formData.membershipFree,
        category: formData.category,
        images: formData.images, // Send all images as array
        capacity: capacity, // Capacity is now required
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed validation errors if available
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details
            .map((d: any) => `${d.field}: ${d.message}`)
            .join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(data.error || "Failed to create event");
      }

      router.push("/organizer/events");
    } catch (err: any) {
      console.error("Event creation error:", err);
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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-l-4 border-red-600 text-red-700 p-4 rounded-lg mb-6"
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">⚠️</span>
                    <div>
                      <p className="font-semibold mb-1">Validation Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </motion.div>
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
                      Capacity *
                    </label>
                    <input
                      id="capacity"
                      type="number"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="input"
                      placeholder="50"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Número máximo de entradas disponibles para este evento
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="images" className="label">
                    Event Images (optional)
                  </label>
                  <ImageUpload
                    value={formData.images}
                    onChange={(urls: string | string[]) =>
                      setFormData({ ...formData, images: urls as string[] })
                    }
                    disabled={loading}
                    multiple
                    maxImages={10}
                  />
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
                      parseFloat(formData.price) === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  <label
                    htmlFor="membershipFree"
                    className={`ml-2 text-sm ${
                      parseFloat(formData.price) === 0
                        ? "text-gray-500"
                        : "text-gray-700"
                    }`}
                  >
                    {parseFloat(formData.price) === 0
                      ? "Free for everyone (automatically enabled when price is €0)"
                      : "Free for premium members"}
                  </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn btn-primary"
                  >
                    {loading ? "Creating..." : "Create Event"}
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
