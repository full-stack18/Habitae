"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // Si ya está autenticado, redirige al dashboard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight text-slate-900">
            Habitae
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => router.push("/login")}
              className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Comenzar gratis
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-24 px-6 max-w-5xl mx-auto text-center">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-6">
          Tu mejor versión, un día a la vez
        </span>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight text-slate-900 mb-6">
          Construye hábitos que
          <br />
          <span className="text-emerald-500">realmente duran</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          Registra tus rutinas diarias, visualiza tu racha y recibe recordatorios
          inteligentes. Sin excusas, sin complicaciones.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors text-sm"
          >
            Empieza gratis 
          </button>
          <button
            onClick={() => {
              document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto text-gray-600 px-8 py-3.5 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
          >
            Ver planes →
          </button>
        </div>

        {/* Social proof mínimo */}
        <p className="mt-8 text-xs text-gray-400">
          Únete a los primeros usuarios en construir mejores hábitos
        </p>
      </section>

      {/* ── DEMO VISUAL (mockup estático del dashboard) ── */}
      <section className="px-6 max-w-4xl mx-auto mb-24">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
          {/* Header del mockup */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="h-5 w-36 bg-gray-200 rounded-md animate-pulse mb-1" />
              <div className="h-3 w-24 bg-gray-100 rounded-md animate-pulse" />
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-100" />
          </div>

          {/* Stats mockup */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Racha actual", value: "12 días 🔥" },
              { label: "Tasa de éxito", value: "87%" },
              { label: "Completados hoy", value: "3/4" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="font-bold text-gray-900 text-base">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Hábitos mockup */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <p className="text-sm font-bold text-gray-900 mb-3">Hábitos del día</p>
            {[
              { name: "Meditar 10 minutos", done: true },
              { name: "Leer 20 páginas", done: true },
              { name: "Ejercicio 30 min", done: false },
              { name: "Beber 8 vasos de agua", done: false },
            ].map((h) => (
              <div key={h.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      h.done
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-300"
                    }`}
                  >
                    {h.done && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${h.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {h.name}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  h.done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {h.done ? "Listo" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-6 max-w-5xl mx-auto mb-24">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-3">
          Todo lo que necesitas
        </h2>
        <p className="text-center text-gray-500 mb-12 text-sm">
          Sin funciones de relleno. Solo lo que importa para construir hábitos reales.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🔥",
              title: "Rachas y motivación",
              desc: "Visualiza tu racha diaria, tu récord personal y recibe mensajes motivacionales según tu progreso.",
            },
            {
              icon: "📊",
              title: "Progreso semanal",
              desc: "Un gráfico claro de los últimos 7 días. Identifica en segundos cuáles son tus mejores días.",
            },
            {
              icon: "🔔",
              title: "Recordatorios inteligentes",
              desc: "Notificaciones push para que nunca olvides tus hábitos, incluso cuando el navegador está cerrado.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-6 max-w-4xl mx-auto mb-24">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-3">
          Precios simples
        </h2>
        <p className="text-center text-gray-500 mb-12 text-sm">
          Empieza gratis. Actualiza cuando quieras.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-gray-200 p-7 bg-white">
            <p className="font-bold text-gray-900 text-lg mb-1">Gratis</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              $0
              <span className="text-sm font-normal text-gray-400">/mes</span>
            </p>
            <p className="text-xs text-gray-400 mb-6">Para siempre</p>
            <ul className="space-y-3 mb-7">
              {[
                "Hasta 5 hábitos activos",
                "Racha y progreso semanal",
                "Notificaciones push",
                "Acceso desde cualquier dispositivo",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-emerald-500 mt-0.5">✓</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/login")}
              className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Comenzar gratis
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-emerald-500 p-7 bg-emerald-50 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Recomendado
            </span>
            <p className="font-bold text-gray-900 text-lg mb-1">Pro</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              $4.99
              <span className="text-sm font-normal text-gray-400">/mes</span>
            </p>
            <p className="text-xs text-gray-400 mb-6">Cancela cuando quieras</p>
            <ul className="space-y-3 mb-7">
              {[
                "Hábitos ilimitados",
                "Estadísticas avanzadas",
                "Exportar datos en CSV",
                "Reportes mensuales",
                "Modo oscuro (próximamente)",
                "Soporte prioritario",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-emerald-600 mt-0.5">✓</span> {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Comenzar prueba 7 días gratis
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span className="font-bold text-gray-600">Habitae</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Términos</a>
            <a href="mailto:hola@habitae.app" className="hover:text-gray-600 transition-colors">Contacto</a>
          </div>
          <span>© {new Date().getFullYear()} Habitae. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}