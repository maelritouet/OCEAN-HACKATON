import { useState, useEffect } from 'react';

export function useCopernicus(lat: number, lon: number) {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSST = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/sst?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error("Point non maritime ou hors zone");
        const json = await res.json();
        setTelemetry(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSST();
  }, [lat, lon]);

  return { telemetry, loading, error };
}