"use client";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  isLoading?: boolean;
}

export default function StreakCard({
  currentStreak,
  longestStreak,
  isLoading = false,
}: StreakCardProps) {
  // Mensaje motivacional según la racha
  const getMessage = () => {
    if (currentStreak === 0) return "¡Completa un hábito hoy para empezar!";
    if (currentStreak < 3) return "¡Buen comienzo, sigue así!";
    if (currentStreak < 7) return "¡Vas por buen camino!";
    if (currentStreak < 30) return "¡Increíble consistencia!";
    return "¡Eres una máquina de hábitos! 🏆";
  };

  // Animación de fuego según la racha
  const getFlameSize = () => {
    if (currentStreak === 0) return "text-2xl opacity-30";
    if (currentStreak < 7) return "text-2xl";
    if (currentStreak < 30) return "text-3xl";
    return "text-4xl animate-bounce";
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
      {/* Racha Actual */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-500">Racha Actual</span>
          <div className="flex items-center gap-2 mt-1">
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-900">
                  {currentStreak} días
                </span>
                <span className={getFlameSize()}>🔥</span>
              </>
            )}
          </div>
        </div>

        {/* Racha Histórica */}
        <div className="text-right">
          <span className="text-sm text-gray-500">Récord personal</span>
          <div className="mt-1">
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse ml-auto" />
            ) : (
              <span className="text-2xl font-bold text-emerald-600">
                {longestStreak} días 🏅
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Barra de progreso hacia la próxima meta */}
      {!isLoading && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{getMessage()}</span>
            <span>
              Meta:{" "}
              {currentStreak < 7
                ? "7 días"
                : currentStreak < 21
                ? "21 días"
                : currentStreak < 66
                ? "66 días"
                : "100 días"}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(
                  (currentStreak /
                    (currentStreak < 7
                      ? 7
                      : currentStreak < 21
                      ? 21
                      : currentStreak < 66
                      ? 66
                      : 100)) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}