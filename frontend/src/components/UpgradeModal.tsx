// frontend/src/components/UpgradeModal.tsx
"use client";

import { useState } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userEmail: string | null;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  userId,
  userEmail,
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!userId || !userEmail) return;
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, userEmail }),
        }
      );

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url; // Redirigir a Stripe Checkout
      }
    } catch (error) {
      console.error("Error al iniciar el pago:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl border border-gray-100">
        <div className="text-center mb-6">
          <span className="text-5xl">⚡</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">
            Desbloquea Habitae Pro
          </h2>
          <p className="text-gray-500 mt-2">
            Lleva tus hábitos al siguiente nivel
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {[
            { icon: "📊", text: "Estadísticas avanzadas y reportes mensuales" },
            { icon: "🔔", text: "Recordatorios inteligentes personalizados" },
            { icon: "♾️", text: "Hábitos ilimitados (gratis: máximo 5)" },
            { icon: "🎨", text: "Temas personalizados y modo oscuro" },
            { icon: "📤", text: "Exportar datos en CSV o PDF" },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{feature.icon}</span>
              <span className="text-gray-700 text-sm">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Precio */}
        <div className="bg-emerald-50 rounded-xl p-4 text-center mb-6">
          <span className="text-3xl font-bold text-emerald-700">$4.99</span>
          <span className="text-gray-500">/mes</span>
          <p className="text-xs text-gray-400 mt-1">
            Cancela cuando quieras · Sin compromisos
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Redirigiendo a Stripe..." : "🚀 Comenzar prueba gratis 7 días"}
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors"
          >
            Continuar con el plan gratuito
          </button>
        </div>
      </div>
    </div>
  );
}