"use client";

import { useState } from "react";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
  const [title, setTitle] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reemplaza esto con el ID largo que copiaste de Prisma Studio
    const TEST_USER_ID = "c2431628-b9a9-424e-a51d-adc1081362ba"; 

    try {
      const response = await fetch("http://localhost:4000/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          userId: TEST_USER_ID,
          frequency: "DAILY",
          color: "#10B981" // Verde por defecto
        }),
      });

      if (response.ok) {
        console.log("¡Hábito guardado en la base de datos!");
        setTitle(""); // Limpiar el input
        onClose();    // Cerrar el modal
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
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
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Guardar Hábito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}