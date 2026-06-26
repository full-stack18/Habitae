interface HabitItemProps {
  id: string;
  title: string;
  isCompleted?: boolean;
  onDelete: (id: string) => void; // Nueva función que pasaremos desde page.tsx
}

export default function HabitItem({ id, title, isCompleted = false, onDelete }: HabitItemProps) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50 group">
      <div className="flex items-center gap-3">
        <input 
          type="checkbox" 
          className="w-5 h-5 accent-emerald-500 cursor-pointer" 
          defaultChecked={isCompleted} 
        />
        <span className={`font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
          {title}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Botón de Iniciar/Completado */}
        <button 
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            isCompleted 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-emerald-500 hover:text-white'
          }`}
        >
          {isCompleted ? 'Completado' : 'Iniciar'}
        </button>
        
        {/* Nuevo botón de Eliminar (Aparece al pasar el mouse) */}
        <button 
          onClick={() => onDelete(id)}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-2"
          title="Eliminar hábito"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}