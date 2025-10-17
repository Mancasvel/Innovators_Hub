"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced Registration page
 * Creates new user account with role selection and membership options
 * Fully responsive for mobile and desktop
 */

type AccountType = "user" | "organizer" | "member";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"account-type" | "details">("account-type");
  const [accountType, setAccountType] = useState<AccountType>("user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      // For member type, redirect to Stripe checkout after registration
      if (accountType === "member") {
        // First create the account
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: "user", // Will be upgraded after payment
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        // Auto sign in
        const result = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          setError("Account created but auto-login failed. Please log in.");
          setTimeout(() => router.push("/auth/login"), 2000);
        } else {
          // Redirect to membership purchase
          router.push("/user/membership");
        }
        return;
      }

      // For organizer, send request for approval
      const requestedRole = accountType === "organizer" ? "organizer" : "user";

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "user", // Default to user, organizer needs admin approval
          requestedRole: requestedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(
          "Registration successful, but auto-login failed. Please log in manually.",
        );
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        if (accountType === "organizer") {
          // Show message about organizer approval
          router.push("/user?message=organizer-pending");
        } else {
          router.push("/user");
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const accountTypes = [
    {
      type: "user" as AccountType,
      title: "Regular User",
      description: "Browse and attend events",
      icon: "👤",
      features: [
        "Browse all events",
        "Purchase tickets",
        "Manage your profile",
      ],
      price: "Free",
    },
    {
      type: "organizer" as AccountType,
      title: "Event Organizer",
      description: "Create and manage events",
      icon: "🎯",
      features: [
        "Create unlimited events",
        "Manage ticket sales",
        "Scan QR codes",
        "Access analytics",
      ],
      price: "Free (requires approval)",
    },
    {
      type: "member" as AccountType,
      title: "Annual Member",
      description: "Premium benefits all year",
      icon: "⭐",
      features: [
        "Free tickets to all events",
        "Priority registration",
        "Member-only events",
        "Community perks",
      ],
      price: "€99/year",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-gray to-white py-8 sm:py-12 px-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <Link
            href="/"
            className="text-2xl sm:text-3xl font-bold text-seville-orange hover:text-orange-600 transition-colors"
          >
            Innovators Hub
          </Link>
          <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            {step === "account-type"
              ? "Choose Your Account Type"
              : "Complete Your Registration"}
          </h1>
          <p className="mt-2 sm:mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            {step === "account-type"
              ? "Select the account type that best fits your needs"
              : `Creating your ${accountTypes.find((a) => a.type === accountType)?.title} account`}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "account-type" ? (
            <motion.div
              key="account-type"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Account Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {accountTypes.map((account, index) => (
                  <motion.div
                    key={account.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setAccountType(account.type)}
                    className={`
                      relative cursor-pointer rounded-2xl p-6 sm:p-8 
                      transition-all duration-300 transform hover:scale-105
                      ${
                        accountType === account.type
                          ? "bg-seville-orange text-white shadow-2xl ring-4 ring-orange-300"
                          : "bg-white text-gray-900 shadow-lg hover:shadow-xl"
                      }
                    `}
                  >
                    {/* Selected indicator */}
                    {accountType === account.type && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-8 h-8 bg-white text-seville-orange rounded-full flex items-center justify-center font-bold"
                      >
                        ✓
                      </motion.div>
                    )}

                    {/* Icon */}
                    <div className="text-5xl sm:text-6xl mb-4 sm:mb-6">
                      {account.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                      {account.title}
                    </h3>

                    {/* Description */}
                    <p
                      className={`text-sm sm:text-base mb-4 sm:mb-6 ${
                        accountType === account.type
                          ? "text-white/90"
                          : "text-gray-600"
                      }`}
                    >
                      {account.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                      {account.features.map((feature, i) => (
                        <li
                          key={i}
                          className={`flex items-start text-sm sm:text-base ${
                            accountType === account.type
                              ? "text-white/90"
                              : "text-gray-700"
                          }`}
                        >
                          <span className="mr-2 mt-0.5 flex-shrink-0">
                            {accountType === account.type ? "✓" : "•"}
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Price */}
                    <div
                      className={`text-lg sm:text-xl font-bold pt-4 sm:pt-6 border-t ${
                        accountType === account.type
                          ? "border-white/20"
                          : "border-gray-200"
                      }`}
                    >
                      {account.price}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 sm:mt-12 text-center"
              >
                <button
                  onClick={() => setStep("details")}
                  className="btn btn-primary text-base sm:text-lg px-8 sm:px-12 py-4 shadow-xl hover:shadow-2xl"
                >
                  Continue with{" "}
                  {accountTypes.find((a) => a.type === accountType)?.title}
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto"
            >
              {/* Registration Form */}
              <div className="bg-white py-6 sm:py-8 px-6 sm:px-8 shadow-2xl rounded-2xl">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-6"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-lg text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div>
                    <label
                      htmlFor="name"
                      className="label text-sm sm:text-base"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="input text-sm sm:text-base"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="label text-sm sm:text-base"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input text-sm sm:text-base"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="label text-sm sm:text-base"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="input text-sm sm:text-base"
                      placeholder="••••••••"
                    />
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      Minimum 8 characters
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="label text-sm sm:text-base"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="input text-sm sm:text-base"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Account type reminder */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Account type:</span>{" "}
                      {accountTypes.find((a) => a.type === accountType)?.title}
                    </p>
                    {accountType === "member" && (
                      <p className="text-xs text-gray-600 mt-1">
                        You'll be redirected to checkout after registration
                      </p>
                    )}
                    {accountType === "organizer" && (
                      <p className="text-xs text-gray-600 mt-1">
                        Your organizer request will be reviewed by an admin
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("account-type")}
                      className="w-full sm:w-auto btn btn-secondary text-sm sm:text-base order-2 sm:order-1"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:flex-1 btn btn-primary text-sm sm:text-base order-1 sm:order-2"
                    >
                      {loading
                        ? "Creating account..."
                        : accountType === "member"
                          ? "Continue to Payment"
                          : "Create account"}
                    </button>
                  </div>
                </form>

                <p className="mt-6 text-center text-xs sm:text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-seville-orange hover:text-orange-600"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
