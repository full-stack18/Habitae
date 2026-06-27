import Image from "next/image";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Habitae Logo"
              width={33}      
              height={33}     
              className="rounded-md" 
            />              
            <h1 className="font-bold text-xl tracking-tight text-slate-800">HABITAE</h1>
          </div>

          {/* Navegación */}
          <nav className="mt-6 px-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-gray-100 text-emerald-700 rounded-lg font-medium">
              Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
              Mis Hábitos
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
              Estadísticas
            </a>
          </nav>
        </div>

        {/* Botón Upgrade */}
        <div className="p-4">
            <button
              onClick={() => window.location.href = '/?upgrade=true'}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Actualizar a Pro
            </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}