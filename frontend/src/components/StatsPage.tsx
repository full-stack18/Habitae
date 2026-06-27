"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

interface Habit {
  id: string;
  title: string;
  color?: string;
}

interface StatsPageProps {
  habits: Habit[];
  weeklyProgress: { day: string; score: number }[];
  isPremium: boolean;
  onUpgradeClick: () => void;
  postgresUserId: string | null;
}

// Tooltip personalizado para los gráficos
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-2.5">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-900">
          {payload[0].value} completado{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

export default function StatsPage({
  habits,
  weeklyProgress,
  isPremium,
  onUpgradeClick,
  postgresUserId,
}: StatsPageProps) {
  // ── Mejor día de la semana ──
  const bestDay = weeklyProgress.reduce(
    (best, current) => (current.score > best.score ? current : best),
    { day: "-", score: 0 }
  );

  // ── Total completados esta semana ──
  const totalThisWeek = weeklyProgress.reduce((sum, d) => sum + d.score, 0);

  // ── Promedio diario ──
  const avgPerDay =
    weeklyProgress.length > 0
      ? (totalThisWeek / weeklyProgress.length).toFixed(1)
      : "0";

  // ── Colores para las barras ──
  const BAR_COLORS = [
    "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899",
  ];

  // ── Datos por hábito (aproximación con datos de la semana) ──
  // En una implementación real tendrías un endpoint con breakdown por hábito
  const habitBreakdown = habits.slice(0, 7).map((habit, i) => ({
    name:
      habit.title.length > 14
        ? habit.title.substring(0, 14) + "…"
        : habit.title,
    completados: Math.floor(Math.random() * 7), // placeholder hasta tener endpoint real
    color: habit.color || BAR_COLORS[i % BAR_COLORS.length],
  }));

  // ── Export CSV ──
  const handleExportCSV = () => {
    if (!isPremium) {
      onUpgradeClick();
      return;
    }
    // Genera un CSV con el progreso semanal
    const headers = ["Día", "Hábitos completados"];
    const rows = weeklyProgress.map((d) => [d.day, d.score]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `habitae_progreso_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Paywall si no es premium ──
  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Estadísticas</h2>
            <p className="text-sm text-gray-500">Análisis detallado de tus hábitos</p>
          </div>
        </div>

        {/* Preview borrosa + CTA */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Contenido borroso de preview */}
          <div className="filter blur-sm pointer-events-none select-none">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total esta semana", value: "21" },
                { label: "Mejor día", value: "Lunes" },
                { label: "Promedio diario", value: "3.0" },
              ].map((s) => (
                <div key={s.label} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-48" />
          </div>

          {/* Overlay de upgrade */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl">
            <span className="text-4xl mb-3">⚡</span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Estadísticas avanzadas
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-xs mb-5">
              Desbloquea análisis detallados, comparativas mensuales y exportación de datos.
            </p>
            <button
              onClick={onUpgradeClick}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
            >
              🚀 Desbloquear con Pro — $4.99/mes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista completa premium ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Estadísticas</h2>
          <p className="text-sm text-gray-500">Análisis detallado de tus hábitos</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          📤 Exportar CSV
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total esta semana</p>
          <p className="text-3xl font-bold text-gray-900">{totalThisWeek}</p>
          <p className="text-xs text-gray-400 mt-1">hábitos completados</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Mejor día</p>
          <p className="text-3xl font-bold text-emerald-600">
            {bestDay.score > 0 ? bestDay.day : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {bestDay.score > 0
              ? `${bestDay.score} hábito${bestDay.score !== 1 ? "s" : ""} completado${bestDay.score !== 1 ? "s" : ""}`
              : "sin datos aún"}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Promedio diario</p>
          <p className="text-3xl font-bold text-gray-900">{avgPerDay}</p>
          <p className="text-xs text-gray-400 mt-1">hábitos por día</p>
        </div>
      </div>

      {/* Gráfico semanal detallado */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Progreso de la semana
        </h3>
        <p className="text-xs text-gray-400 mb-5">
          Hábitos completados por día en los últimos 7 días
        </p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyProgress}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {weeklyProgress.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.day === bestDay.day ? "#10B981" : "#D1FAE5"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          El día en verde es tu mejor día de la semana
        </p>
      </div>

      {/* Gráfico de tendencia (línea) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-1">
          Tendencia semanal
        </h3>
        <p className="text-xs text-gray-400 mb-5">
          Evolución de tus hábitos a lo largo de la semana
        </p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weeklyProgress}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Badge premium */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-4 flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        <div>
          <p className="text-sm font-semibold text-emerald-800">
            Habitae Pro activo
          </p>
          <p className="text-xs text-emerald-600">
            Tienes acceso a todas las estadísticas avanzadas y exportación de datos.
          </p>
        </div>
      </div>
    </div>
  );
}