"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import StatCard from "@/components/StatCard";
import HabitItem from "@/components/HabitItem";
import ProgressChart from "@/components/ProgressChart";
import AddHabitModal from "@/components/AddHabitModal";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habits, setHabits] = useState<any[]>([]); // Estado para guardar los hábitos de la BD

  // ⚠️ REEMPLAZA ESTO CON EL MISMO ID QUE USASTE EN EL MODAL
  const TEST_USER_ID = "c2431628-b9a9-424e-a51d-adc1081362ba"; 

  // Función para obtener los hábitos desde el Backend
  const fetchHabits = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/habits/user/${TEST_USER_ID}`);
      if (response.ok) {
        const data = await response.json();
        setHabits(data);
      }
    } catch (error) {
      console.error("Error al obtener hábitos:", error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar este hábito?")) return;

    try {
      const response = await fetch(`http://localhost:4000/api/habits/${habitId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Actualizamos el estado para quitarlo de la pantalla inmediatamente
        setHabits(habits.filter(habit => habit.id !== habitId));
      }
    } catch (error) {
      console.error("Error al eliminar el hábito:", error);
    }
  };

  // Se ejecuta automáticamente cuando la página carga
  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* 1. Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Buenos días, Juan</h2>
          <p className="text-gray-500">Hoy es un gran día para crecer</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
            J
          </div>
        </div>
      </header>

      {/* 2. Tarjetas de Estadísticas */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Racha Actual 🔥" value="15 días" />
        <StatCard title="Tasa de Éxito" value="87%" />
        <StatCard title="Hábitos Completados" value="0/0" subtitle="hoy" />
        <StatCard title="Total de Horas" value="12h" subtitle="de focus" />
      </section>

      {/* 3. Contenido Principal */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Lista de Hábitos y Gráfico */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjeta de Lista de Hábitos */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Lista de Hábitos del Día</h3>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-medium hover:bg-emerald-200 transition-colors"
              >
                + Nuevo
              </button>
            </div>
            
            <div className="space-y-4">
               {/* Renderizado dinámico desde la Base de Datos */}
               {habits.length === 0 ? (
                 <p className="text-sm text-gray-500 italic text-center py-4">No hay hábitos registrados aún. ¡Crea el primero!</p>
               ) : (
                 habits.map((habit) => (
                   <HabitItem 
                      key={habit.id} 
                      id={habit.id}
                      title={habit.title} 
                      isCompleted={false} 
                      onDelete={handleDeleteHabit} 
                   />
                 ))
               )}
            </div>
          </div>

          <ProgressChart />
          
        </div>

        {/* Columna Derecha: Banner Pro */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-purple-100 shadow-sm p-6 flex flex-col items-center justify-center text-center">
            <h3 className="font-bold text-gray-900 mb-2">Informe Mensual Detallado</h3>
            <p className="text-sm text-gray-600 mb-4">Desbloquea analíticas avanzadas de tu progreso.</p>
            <button className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
              🔒 Disponible en Pro
            </button>
          </div>
        </div>

      </section>

      {/* MODAL PARA CREAR HÁBITO */}
      <AddHabitModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchHabits(); // Recarga la lista automáticamente al cerrar el modal
        }} 
      />
    </div>
  );
}