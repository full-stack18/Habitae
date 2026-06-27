"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import StatCard from "@/components/StatCard";
import HabitItem from "@/components/HabitItem";
import ProgressChart from "@/components/ProgressChart";
import AddHabitModal from "@/components/AddHabitModal";

export default function Dashboard() {
  const router = useRouter();
  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [postgresUserId, setPostgresUserId] = useState<string | null>(null); // <-- ID real de la BD
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habits, setHabits] = useState<any[]>([]);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // No necesitamos hacer router.push("/login") aquí, 
      // porque tu useEffect (onAuthStateChanged) lo detectará y lo hará automáticamente.
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Escucha el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);
        
        // Sincronizamos con nuestra base de datos PostgreSQL
        try {
          const syncResponse = await fetch("http://localhost:4000/api/habits/users/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: currentUser.email,
              firebaseUid: currentUser.uid
            })
          });

          if (syncResponse.ok) {
            const dbUser = await syncResponse.json();
            setPostgresUserId(dbUser.id); // Guardamos el ID real de la base de datos (UUID)
          }
        } catch (error) {
          console.error("Error al sincronizar con Postgres:", error);
        } finally {
          setIsAuthLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Función para obtener los hábitos usando el ID real
  const fetchHabits = async () => {
    if (!postgresUserId) return;
    try {
      const response = await fetch(`http://localhost:4000/api/habits/user/${postgresUserId}`);
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
      const response = await fetch(`http://localhost:4000/api/habits/${habitId}`, { method: "DELETE" });
      if (response.ok) setHabits(habits.filter(habit => habit.id !== habitId));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/habits/${habitId}/toggle`, { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setHabits(habits.map(habit => habit.id === habitId ? { ...habit, isCompleted: data.isCompleted } : habit));
      }
    } catch (error) {
      console.error("Error al marcar:", error);
    }
  };

  // Se dispara automáticamente cuando el postgresUserId esté listo
  useEffect(() => {
    if (postgresUserId) {
      fetchHabits();
    }
  }, [postgresUserId]);

  if (isAuthLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 font-medium animate-pulse">Cargando tu espacio...</p>
      </div>
    );
  }

  // --- CÁLCULO DE ESTADÍSTICAS ---
  const totalHabits = habits.length;
  const completedHabits = habits.filter(habit => habit.isCompleted).length;
  const successRate = totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Buenos días, {userEmail ? userEmail.split('@')[0] : 'Usuario'}
          </h2>
          <p className="text-gray-500">Hoy es un gran día para crecer</p>
        </div>
        <div className="flex items-center gap-4">
          
          {/* NUEVO BOTÓN DE SALIR */}
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-2"
          >
            Cerrar sesión
          </button>

          <input 
            type="text" 
            placeholder="Buscar..." 
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold uppercase">
            {userEmail ? userEmail[0] : 'U'}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* La racha es un cálculo complejo de fechas, lo dejaremos en 0 por ahora */}
        <StatCard title="Racha Actual 🔥" value="0 días" /> 
        
        {/* Usamos las variables que acabamos de crear */}
        <StatCard title="Tasa de Éxito" value={`${successRate}%`} />
        <StatCard title="Hábitos Completados" value={`${completedHabits}/${totalHabits}`} subtitle="hoy" />
        
        {/* Total de horas lo podemos dejar fijo hasta que implementes un cronómetro */}
        <StatCard title="Total de Horas" value="0h" subtitle="de focus" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
               {habits.length === 0 ? (
                 <p className="text-sm text-gray-500 italic text-center py-4">No hay hábitos registrados aún. ¡Crea el primero!</p>
               ) : (
                 habits.map((habit) => (
                   <HabitItem 
                      key={habit.id} 
                      id={habit.id}
                      title={habit.title} 
                      isCompleted={habit.isCompleted || false} 
                      onDelete={handleDeleteHabit} 
                      onToggle={handleToggleHabit} 
                   />
                 ))
               )}
            </div>
          </div>

          <ProgressChart />
        </div>

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

      <AddHabitModal 
        isOpen={isModalOpen} 
        userId={postgresUserId}
        onClose={() => {
          setIsModalOpen(false);
          fetchHabits();
        }} 
      />
    </div>
  );
}