import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useCopernicus } from '../hooks/useCopernicus';

export default function DataPortal() {
  // Coordonnées par défaut : Le large de Toulon / Méditerranée
  const [coords, setCoords] = useState({ lat: 43.05, lon: 5.95 });
  
  // Appel dynamique à notre Backend Python !
  const { telemetry, loading, error } = useCopernicus(coords.lat, coords.lon);

  return (
    <main className="flex-1 overflow-y-auto w-full px-4 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
           <h2 className="text-xl font-bold text-slate-900">Analyse Dynamique du fichier .NC (2016-2024)</h2>
           <p className="text-sm text-slate-500">Calcul en temps réel depuis Python xarray</p>
           
           <div className="mt-4 flex gap-4">
             <button onClick={() => setCoords({lat: 43.05, lon: 5.95})} className="btn-primary">Point Méditerranée (Toulon)</button>
             <button onClick={() => setCoords({lat: 48.28, lon: -4.78})} className="btn-primary">Point Atlantique (Bretagne)</button>
           </div>
        </div>

        {/* Le Graphique Dynamique */}
        <div className="bg-white border border-sky-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-md font-bold mb-4">
             Température et Canicules (Lat: {coords.lat}, Lon: {coords.lon})
             {loading && <span className="ml-2 text-rose-500 animate-pulse">Calcul en cours...</span>}
          </h3>

          {error && <div className="text-rose-500 font-bold">{error}</div>}

          {!loading && telemetry && (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetry.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" minTickGap={50} />
                  <YAxis domain={['auto', 'auto']} unit="°C" />
                  <RechartsTooltip />
                  
                  {/* Ligne de moyenne (Baseline calculée par le backend) */}
                  <ReferenceLine y={telemetry.baseline_temp} label="Moyenne (Baseline)" stroke="#64748b" strokeDasharray="3 3" />
                  
                  {/* Ligne de canicule (+1.5°C) */}
                  <ReferenceLine y={telemetry.baseline_temp + 1.5} label="Seuil Canicule Extreme" stroke="#e11d48" strokeDasharray="4 4" />

                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#0284c7" 
                    fill="#bae6fd" 
                    name="Température SST (°C)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}