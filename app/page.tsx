"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Homepage - Landing page for Innovators Hub
 */

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-orange text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to Innovators Hub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Your community for digital nomads and innovators in beautiful
              Seville, Spain
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="btn bg-white text-seville-orange hover:bg-gray-100"
              >
                Explore Events
              </Link>
              <Link
                href="/auth/register"
                className="btn btn-outline border-white text-white hover:bg-white hover:text-seville-orange"
              >
                Join Community
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-12"
          >
            Why Join Us?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌍",
                title: "Global Community",
                description:
                  "Connect with digital nomads and innovators from around the world",
              },
              {
                icon: "🎟️",
                title: "Exclusive Events",
                description:
                  "Access workshops, networking events, and talks by industry leaders",
              },
              {
                icon: "⭐",
                title: "Premium Membership",
                description:
                  "Get free access to selected events with our annual membership",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-light-gray py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of innovators and be part of Seville's thriving
            digital community
          </p>
          <Link href="/auth/register" className="btn btn-primary text-lg">
            Create Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
