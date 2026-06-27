"use client";

import { useState } from "react";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null; // <-- Añadimos esto
}

export default function AddHabitModal({ isOpen, onClose, userId }: AddHabitModalProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!userId) {
      setError("Usuario no identificado");
      return;
    }

    if (!title.trim()) {
      setError("El nombre del hábito no puede estar vacío");
      return;
    }

    setLoading(true);

    try {
      const habitData = {
        userId: userId,
        title: title.trim(),
        frequency: "DAILY",
        color: "#10B981"
      };

      console.log("Enviando datos:", habitData);

      const response = await fetch("http://localhost:4000/api/habits", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(habitData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get("content-type"));

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        console.log("¡Hábito guardado!");
        setTitle("");
        setError("");
        onClose();
      } else {
        setError(data.error || "Error al guardar el hábito");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setError("No se puede conectar al servidor. ¿Está corriendo en localhost:4000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-900">Crear Nuevo Hábito</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Hábito</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Leer 20 páginas, Ir al gimnasio..." 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Guardar Hábito"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

