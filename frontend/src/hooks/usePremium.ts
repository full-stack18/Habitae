// frontend/src/hooks/usePremium.ts
import { useState, useEffect } from "react";

export function usePremium(postgresUserId: string | null) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);

  useEffect(() => {
    if (!postgresUserId) return;

    const fetchStatus = async () => {
      setIsLoadingPremium(true);
      try {
        const response = await fetch(
          `http://localhost:4000/api/habits/user/${postgresUserId}/status`
        );
        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.isPremium);
        }
      } catch (error) {
        console.error("Error obteniendo estado premium:", error);
      } finally {
        setIsLoadingPremium(false);
      }
    };

    fetchStatus();
  }, [postgresUserId]);

  return { isPremium, isLoadingPremium };
}