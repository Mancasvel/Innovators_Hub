"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  capacity: number; // Now required
  status: "draft" | "published" | "cancelled";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    membershipFree: false,
    category: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({ upcoming: "true" });

      if (filters.membershipFree) {
        params.append("membershipFree", "true");
      }
      if (filters.category) {
        params.append("category", filters.category);
      }
      if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom);
      }
      if (filters.dateTo) {
        params.append("dateTo", filters.dateTo);
      }

      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter events by search query (client-side)
  const filteredEvents = events.filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      membershipFree: false,
      category: "",
      dateFrom: "",
      dateTo: "",
    });
    setSearchQuery("");
  };

  const activeFiltersCount =
    (filters.membershipFree ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

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
          {/* Search and Filters */}
          <div className="mb-8">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search events by title, description or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full input pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${showFilters ? "btn-primary" : "btn-outline"} whitespace-nowrap relative`}
              >
                🎛️ Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-seville-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 mb-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Filter Events</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-seville-orange hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Membership Free Filter */}
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.membershipFree}
                        onChange={(e) =>
                          handleFilterChange("membershipFree", e.target.checked)
                        }
                        className="w-5 h-5 text-seville-orange rounded focus:ring-seville-orange"
                      />
                      <span className="text-sm font-medium">
                        ⭐ Free for members
                      </span>
                    </label>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="label text-sm mb-1">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        handleFilterChange("category", e.target.value)
                      }
                      className="input text-sm"
                    >
                      <option value="">All</option>
                      <option value="networking">Networking</option>
                      <option value="workshop">Workshop</option>
                      <option value="talk">Talk</option>
                      <option value="social">Social</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Date Filters */}
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="label text-sm mb-1">From</label>
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) =>
                            handleFilterChange("dateFrom", e.target.value)
                          }
                          className="input text-sm"
                        />
                      </div>
                      <div>
                        <label className="label text-sm mb-1">To</label>
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) =>
                            handleFilterChange("dateTo", e.target.value)
                          }
                          className="input text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600">
              <p>
                {loading ? (
                  "Loading events..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-seville-orange">
                      {filteredEvents.length}
                    </span>{" "}
                    of <span className="font-semibold">{events.length}</span>{" "}
                    events
                  </>
                )}
              </p>
              {(searchQuery || activeFiltersCount > 0) && (
                <button
                  onClick={clearFilters}
                  className="text-seville-orange hover:underline text-sm"
                >
                  Limpiar búsqueda y filtros
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-seville-orange"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg mb-2">
                {searchQuery || activeFiltersCount > 0
                  ? "No events found with the selected criteria"
                  : "No upcoming events at the moment"}
              </p>
              {(searchQuery || activeFiltersCount > 0) && (
                <button onClick={clearFilters} className="btn btn-primary mt-4">
                  View all events
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full"
                >
                  <Link href={`/events/${event._id}`} className="block h-full">
                    <div className="card hover:scale-105 transition-transform duration-300 h-full flex flex-col p-4 md:p-6">
                      {/* Event Images */}
                      {event.images && event.images.length > 0 && (
                        <div className="mb-3 md:mb-4 -mx-4 md:-mx-6 -mt-4 md:-mt-6">
                          <div className="aspect-video overflow-hidden bg-gray-100">
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
                          <span className="inline-block px-2 md:px-3 py-1 bg-seville-orange/10 text-seville-orange text-xs font-semibold rounded-full mb-2 md:mb-3">
                            {event.category}
                          </span>
                        )}
                        <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2 line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base mb-3 md:mb-4 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-600">
                          <p className="flex items-start md:items-center">
                            <span className="mr-2 flex-shrink-0">📅</span>
                            <span className="line-clamp-2">
                              {formatDate(event.date)}
                            </span>
                          </p>
                          <p className="flex items-start md:items-center">
                            <span className="mr-2 flex-shrink-0">📍</span>
                            <span className="line-clamp-1">
                              {event.location}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex-shrink-0">
                          {event.price === 0 ? (
                            <div>
                              <span className="text-green-600 font-bold text-sm md:text-base">
                                Free
                              </span>
                              <p className="text-xs text-gray-600 mt-0.5">
                                🎉 Free for everyone
                              </p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-gray-900 font-bold text-sm md:text-base">
                                €{formatPrice(event.price)}
                              </span>
                              {event.membershipFree && (
                                <p className="text-xs text-seville-orange mt-0.5">
                                  Free for members
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {event.ticketsSold}/{event.capacity} sold
                        </span>
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
