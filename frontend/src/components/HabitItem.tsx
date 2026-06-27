"use client";

import { useState } from "react";

interface HabitItemProps {
  id: string;
  title: string;
  isCompleted?: boolean;
  onDelete: (id: string) => void;
  onToggle: (id: string) => Promise<void>;  
}

export default function HabitItem({ id, title, isCompleted = false, onDelete, onToggle }: HabitItemProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async () => {
    if (isProcessing) return; // Bloquea clics múltiples
    setIsProcessing(true);
    try {
      await onToggle(id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50 group">
      <div className="flex items-center gap-3">
        {/* Spinner o Checkbox según el estado */}
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <input
            type="checkbox"
            className="w-5 h-5 accent-emerald-500 cursor-pointer"
            checked={isCompleted}
            onChange={handleToggle}
            disabled={isProcessing}
          />
        )}
        <span className={`font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={isProcessing}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600 hover:bg-emerald-500 hover:text-white'
          }`}
        >
          {isProcessing ? 'Guardando...' : isCompleted ? 'Completado' : 'Iniciar'}
        </button>

        <button
          onClick={() => onDelete(id)}
          disabled={isProcessing}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2 disabled:cursor-not-allowed"
          title="Eliminar hábito"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}