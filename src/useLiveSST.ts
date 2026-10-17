// src/hooks/useLiveSST.ts
import { useState, useEffect } from 'react';

interface LiveSSTData {
  temperature: number;
  time: string;
  loading: boolean;
  error: string | null;
}

export function useLiveSST(lat: number | undefined, lon: number | undefined) {
  const [data, setData] = useState<LiveSSTData>({
    temperature: 0,
    time: '',
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchLiveOceanTemp = async () => {
      setData(prev => ({ ...prev, loading: true, error: null }));
      try {
        // API gratuite, sans clé, basée sur les modèles marins Copernicus
        const response = await fetch(
          `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=ocean_temperature`
        );
        
        if (!response.ok) throw new Error("Erreur réseau");
        
        const result = await response.json();
        
        // On récupère la dernière température de l'eau disponible dans le tableau horaire
        const currentIndex = result.hourly.ocean_temperature.length - 1;
        const currentTemp = result.hourly.ocean_temperature[currentIndex];
        
        setData({
          temperature: currentTemp,
          time: result.hourly.time[currentIndex],
          loading: false,
          error: null
        });
      } catch (err: any) {
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };

    fetchLiveOceanTemp();
  }, [lat, lon]);

  return data;
}