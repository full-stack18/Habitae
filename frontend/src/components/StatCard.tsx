"use client";


interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
  }
  
  export default function StatCard({ title, value, subtitle }: StatCardProps) {
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
        <span className="text-sm text-gray-500 mb-1">{title}</span>
        <span className="text-2xl font-bold text-gray-900">
          {value} 
          {subtitle && <span className="text-sm font-normal text-gray-400 ml-1">{subtitle}</span>}
        </span>
      </div>
    );
  }