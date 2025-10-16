"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * User profile page
 * Display and edit user information
 */

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user as any;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "✅ Perfil actualizado correctamente",
        });
        // Update session with new data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
            email: formData.email,
          },
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "❌ Error al actualizar el perfil",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "❌ Error al actualizar el perfil. Por favor, inténtalo de nuevo.",
      });
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
            <h1 className="text-4xl font-bold mb-8">Mi Perfil</h1>

            {/* Message Alert */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 border-2 border-green-500 text-green-800"
                    : "bg-red-50 border-2 border-red-500 text-red-800"
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="card">
                <div className="space-y-6">
                  {/* Name - Editable */}
                  <div>
                    <label className="label">Nombre *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="input"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  {/* Email - Editable */}
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="input"
                      placeholder="tu@email.com"
                    />
                    <p className="mt-1 text-xs text-gray-600">
                      ⚠️ Cambiar el email actualizará tu forma de iniciar sesión
                    </p>
                  </div>

                  {/* Account Type - Read Only */}
                  <div>
                    <label className="label">Tipo de Cuenta</label>
                    <input
                      type="text"
                      value={user?.role || "user"}
                      readOnly
                      className="input bg-gray-100 cursor-not-allowed capitalize"
                      title="El tipo de cuenta no se puede modificar"
                    />
                    <p className="mt-1 text-xs text-gray-600">
                      🔒 El tipo de cuenta no se puede modificar
                    </p>
                  </div>

                  {/* Membership Status - Read Only */}
                  <div>
                    <label className="label">Estado de Membresía</label>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                          user?.hasMembership
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user?.hasMembership ? "⭐ Activa" : "❌ Inactiva"}
                      </span>
                      {user?.membershipExpires && (
                        <p className="mt-2 text-sm text-gray-600">
                          Expira:{" "}
                          {new Date(user.membershipExpires).toLocaleDateString(
                            "es-ES",
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                  >
                    {loading ? "💾 Guardando..." : "💾 Guardar Cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                      });
                      setMessage(null);
                    }}
                    disabled={loading}
                    className="btn btn-secondary flex-1"
                  >
                    🔄 Restablecer
                  </button>
                </div>

                <p className="mt-6 text-sm text-gray-600 text-center">
                  ¿Necesitas ayuda? Contacta con soporte en{" "}
                  <a
                    href="mailto:hello@innovatorshub.com"
                    className="text-seville-orange hover:underline"
                  >
                    hello@innovatorshub.com
                  </a>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
