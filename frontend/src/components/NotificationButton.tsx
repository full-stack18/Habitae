// frontend/src/components/NotificationButton.tsx
"use client";

interface NotificationButtonProps {
  permission: NotificationPermission;
  onRequest: () => Promise<NotificationPermission>;
}

export default function NotificationButton({
  permission,
  onRequest,
}: NotificationButtonProps) {
  if (permission === "granted") {
    return (
      <span className="text-xs text-emerald-600 flex items-center gap-1">
        🔔 Notificaciones activas
      </span>
    );
  }

  if (permission === "denied") {
    return (
      <span className="text-xs text-gray-400 flex items-center gap-1" title="Actívalas desde la configuración del navegador">
        🔕 Notificaciones bloqueadas
      </span>
    );
  }

  return (
    <button
      onClick={onRequest}
      className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg font-medium hover:bg-amber-100 transition-colors flex items-center gap-1"
    >
      🔔 Activar recordatorios
    </button>
  );
}