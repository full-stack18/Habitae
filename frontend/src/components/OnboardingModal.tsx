"use client";

import { useState } from "react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onHabitsCreated: () => void;
}

const SUGGESTED_HABITS = [
  { title: "Meditar 10 minutos", color: "#8B5CF6", emoji: "🧘" },
  { title: "Leer 20 páginas", color: "#3B82F6", emoji: "📚" },
  { title: "Ejercicio 30 minutos", color: "#10B981", emoji: "💪" },
  { title: "Beber 8 vasos de agua", color: "#06B6D4", emoji: "💧" },
  { title: "Dormir 8 horas", color: "#6366F1", emoji: "😴" },
  { title: "Sin redes sociales 1 hora", color: "#F59E0B", emoji: "📵" },
];

export default function OnboardingModal({
  isOpen,
  onClose,
  userId,
  onHabitsCreated,
}: OnboardingModalProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"select" | "done">("select");

  if (!isOpen) return null;

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!userId || selected.size === 0) return;
    setIsLoading(true);

    try {
      // Crea todos los hábitos seleccionados en paralelo
      await Promise.all(
        Array.from(selected).map((i) =>
          fetch("http://localhost:4000/api/habits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              title: SUGGESTED_HABITS[i].title,
              frequency: "DAILY",
              color: SUGGESTED_HABITS[i].color,
            }),
          })
        )
      );
      setStep("done");
    } catch (error) {
      console.error("Error creando hábitos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    // Marcar como onboarded para no mostrar el modal de nuevo
    localStorage.setItem("habitae_onboarded", "true");
    onHabitsCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {step === "select" ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 px-8 pt-8 pb-6 text-center">
              <span className="text-5xl mb-3 block">🌱</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Bienvenido a Habitae!
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Elige con qué hábitos quieres empezar.
                <br />
                Puedes añadir más después.
              </p>
            </div>

            {/* Hábitos sugeridos */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Hábitos populares
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {SUGGESTED_HABITS.map((habit, i) => {
                  const isSelected = selected.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggle(i)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <span className="text-xl">{habit.emoji}</span>
                      <span
                        className={`text-sm font-medium leading-snug ${
                          isSelected ? "text-emerald-800" : "text-gray-700"
                        }`}
                      >
                        {habit.title}
                      </span>
                      {isSelected && (
                        <span className="ml-auto text-emerald-500 shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex flex-col gap-2.5">
              <button
                onClick={handleCreate}
                disabled={selected.size === 0 || isLoading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Creando hábitos..."
                  : selected.size === 0
                  ? "Selecciona al menos uno"
                  : `Añadir ${selected.size} hábito${selected.size > 1 ? "s" : ""} →`}
              </button>
              <button
                onClick={handleFinish}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                Prefiero empezar desde cero
              </button>
            </div>
          </>
        ) : (
          /* Paso 2: Confirmación */
          <div className="px-8 py-10 text-center">
            <span className="text-6xl block mb-5">🎉</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Todo listo!
            </h2>
            <p className="text-gray-500 text-sm mb-3 leading-relaxed">
              Añadiste{" "}
              <strong className="text-gray-800">{selected.size} hábito{selected.size > 1 ? "s" : ""}</strong>{" "}
              a tu dashboard.
            </p>
            <p className="text-gray-400 text-xs mb-8">
              Completa al menos uno hoy para empezar tu racha. 🔥
            </p>
            <button
              onClick={handleFinish}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}