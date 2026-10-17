import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Settings, Download, Activity, Calendar } from 'lucide-react';

export default function ExpertMode() {
  const [lat, setLat] = useState(43.05); // Méditerranée par défaut
  const [lon, setLon] = useState(5.95);
  const [baselineStart, setBaselineStart] = useState("2016-01-01"); // À adapter selon votre fichier .nc
  const [baselineEnd, setBaselineEnd] = useState("2020-12-31");
  const [percentile, setPercentile] = useState(0.90);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchExpertData = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:8000/api/expert/mhw?lat=${lat}&lon=${lon}&base_start=${baselineStart}&base_end=${baselineEnd}&percentile=${percentile}`;
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpertData();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,SST,Climatologie,Seuil_MHW\n"
      + data.timeseries.map((e: any) => `${e.date},${e.sst},${e.clim},${e.thresh}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mhw_expert_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="absolute inset-0 bg-slate-50 z-20 overflow-y-auto pt-20 px-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête Expert */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              Laboratoire de Définition (Expert)
            </h2>
            <p className="text-slate-600 mt-1">Application stricte de la méthode de Hobday et al. (2016) sur données Copernicus.</p>
          </div>
          <button onClick={handleExportCSV} className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold">
            <Download className="w-4 h-4" /> Exporter Série (CSV)
          </button>
        </div>

        {/* Panneau de Contrôle */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Période de Référence (Baseline)</label>
            <div className="flex gap-2">
              <input type="date" value={baselineStart} onChange={e => setBaselineStart(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
              <input type="date" value={baselineEnd} onChange={e => setBaselineEnd(e.target.value)} className="w-full p-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Seuil Extrême (Percentile)</label>
            <select value={percentile} onChange={e => setPercentile(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-sm">
              <option value={0.90}>90ème Percentile (Classique)</option>
              <option value={0.95}>95ème Percentile (Sévère)</option>
              <option value={0.99}>99ème Percentile (Extrême)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Coordonnées (Lat, Lon)</label>
            <div className="flex gap-2">
              <input type="number" step="0.01" value={lat} onChange={e => setLat(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-sm" />
              <input type="number" step="0.01" value={lon} onChange={e => setLon(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg text-sm" />
            </div>
          </div>
          <button onClick={fetchExpertData} disabled={loading} className="w-full bg-slate-900 text-white p-2.5 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50">
            {loading ? "Calcul tensoriel..." : "Recalculer MHW"}
          </button>
        </div>

        {/* Le Graphique Hobday */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Série Temporelle et Seuil Caniculaire</h3>
          <div className="h-96">
            {!loading && data ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeseries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" minTickGap={50} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} unit="°C" tick={{fontSize: 12, fill: '#64748b'}} />
                  <RechartsTooltip />
                  
                  {/* Ligne Climatologique (Moyenne lissée) */}
                  <Line type="monotone" dataKey="clim" name="Climatologie (Moyenne)" stroke="#10b981" strokeWidth={2} dot={false} />
                  
                  {/* Ligne Seuil (Percentile lissé) */}
                  <Line type="monotone" dataKey="thresh" name={`Seuil (${percentile * 100}e P.)`} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  
                  {/* Ligne SST Réelle */}
                  <Line type="monotone" dataKey="sst" name="SST Obs" stroke="#e11d48" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">Génération du graphe en cours...</div>
            )}
          </div>
        </div>

        {/* Registre des Événements */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Registre des Canicules Marines (Top 10)</h3>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">
              {data?.metrics.total_events} événements détectés (&gt; 5 jours)
            </span>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 border-b">Événement ID</th>
                <th className="p-4 border-b">Début</th>
                <th className="p-4 border-b">Fin</th>
                <th className="p-4 border-b">Durée</th>
                <th className="p-4 border-b">Intensité Max</th>
                <th className="p-4 border-b">Chaleur Cumulée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.metrics.top_events.map((evt: any) => (
                <tr key={evt.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-600">#{evt.id}</td>
                  <td className="p-4 text-slate-800"><Calendar className="inline w-3 h-3 mr-1 text-slate-400"/>{evt.start}</td>
                  <td className="p-4 text-slate-800"><Calendar className="inline w-3 h-3 mr-1 text-slate-400"/>{evt.end}</td>
                  <td className="p-4 font-bold text-indigo-600">{evt.duration_days} jours</td>
                  <td className="p-4 font-bold text-rose-600">+{evt.max_intensity}°C</td>
                  <td className="p-4 text-slate-600">{evt.cumulative_intensity}°C-jours</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}