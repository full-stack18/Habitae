"use client";

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Datos estáticos de prueba (luego vendrán de tu base de datos)
const data = [
  { day: 'Lun', score: 0 },
  { day: 'Mar', score: 10 },
  { day: 'Mie', score: 5 },
  { day: 'Jue', score: 4 },
  { day: 'Vie', score: 12 },
  { day: 'Sab', score: 18 },
  { day: 'Dom', score: 25 },
];

export default function ProgressChart() {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full h-72 flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Progreso Semanal</h3>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              dy={10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#10B981" /* Verde Esmeralda de Tailwind */
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