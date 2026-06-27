// frontend/src/components/ProgressChart.tsx
"use client";

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressChartProps {
  data: { day: string; score: number }[];
  isLoading?: boolean;
}

export default function ProgressChart({ data, isLoading = false }: ProgressChartProps) {
  // Datos de fallback mientras carga
  const chartData = data.length > 0 ? data : [
    { day: '...', score: 0 },
    { day: '...', score: 0 },
    { day: '...', score: 0 },
    { day: '...', score: 0 },
    { day: '...', score: 0 },
    { day: '...', score: 0 },
    { day: '...', score: 0 },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full h-72 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Progreso Semanal</h3>
        {isLoading && (
          <span className="text-xs text-gray-400 animate-pulse">Cargando...</span>
        )}
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              dy={10}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={isLoading ? '#D1FAE5' : '#10B981'}
              strokeWidth={3}
              dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}