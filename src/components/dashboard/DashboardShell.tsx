"use client";

import { useCallback, useState } from "react";
import MarineMap from "@/components/map/MarineMap";
import LayerPanel from "@/components/dashboard/LayerPanel";
import CopernicusLegend from "@/components/map/CopernicusLegend";
import { copernicusSst } from "@/lib/data/copernicus";

type Mode = "Découvrir" | "Explorer" | "Expert";
type MapStatus = "loading" | "ready" | "error";
type OverlayStatus = "idle" | "loading" | "ready" | "error";

const dateOptions = [
  { value: "2026-08-16T00:00:00Z", label: "16 août 2026" },
  { value: "2026-09-16T00:00:00Z", label: "16 sept. 2026" },
  { value: "2026-10-16T00:00:00Z", label: "16 oct. 2026" },
];

export default function DashboardShell() {
  const [mode, setMode] = useState<Mode>("Explorer");
  const [showCopernicus, setShowCopernicus] = useState(false);
  const [selectedTime, setSelectedTime] = useState(copernicusSst.defaultTime);
  const [mapStatus, setMapStatus] = useState<MapStatus>("loading");
  const [overlayStatus, setOverlayStatus] = useState<OverlayStatus>("idle");
  const [resetMap, setResetMap] = useState<() => void>(() => () => undefined);
  const saveResetMap = useCallback((reset: () => void) => setResetMap(() => reset), []);

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="/" aria-label="Marine Heatwaves Observatory"><span className="dashboard-brand-mark">◒</span><span><strong>MARINE HEATWAVES</strong><small>OBSERVATORY</small></span></a>
        <div className="dashboard-location"><span className="header-pulse" />MÉDITERRANÉE · {mapStatus === "ready" ? "CARTE PRÊTE" : "INITIALISATION"}</div>
        <div className="dashboard-header-actions"><span className="source-status"><i className={overlayStatus === "error" ? "error" : ""} />{showCopernicus ? "COPERNICUS WMTS" : "FOND DE BASE"}</span><div className="depth-selector" aria-label="Profondeur de lecture">{(["Découvrir", "Explorer", "Expert"] as Mode[]).map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item}</button>)}</div></div>
      </header>
      <div className="dashboard-body">
        <nav className="dashboard-rail" aria-label="Navigation du dashboard"><button className="rail-button active" aria-label="Carte" title="Carte">⌖</button><button className="rail-button" aria-label="Séries" title="Séries">∿</button><button className="rail-button" aria-label="Méthodes" title="Méthodes">≡</button><span className="rail-spacer" /><button className="rail-button" aria-label="Aide" title="Aide">?</button></nav>
        <section className="map-workspace" aria-label="Espace cartographique principal">
          <div className="workspace-toolbar"><div><span className="workspace-kicker">EXPLORER / SST</span><h1>Température de l’eau · proche surface</h1></div><div className="workspace-actions"><button onClick={() => setShowCopernicus((visible) => !visible)} className={showCopernicus ? "map-action active" : "map-action"}><span className="action-swatch" />{showCopernicus ? "Masquer la couche" : "Afficher Copernicus"}</button><button className="map-action" onClick={resetMap}>Recentrer</button></div></div>
          <div className="map-stage"><MarineMap showCopernicus={showCopernicus} selectedTime={selectedTime} onMapStatusChange={setMapStatus} onOverlayStatusChange={setOverlayStatus} onResetReady={saveResetMap} /><div className="map-status-badge"><span className={`status-dot ${mapStatus === "ready" ? "ready" : mapStatus === "error" ? "error" : "loading"}`} />{mapStatus === "ready" ? "Carte interactive" : mapStatus === "error" ? "Erreur de fond" : "Chargement de la carte"}</div>{showCopernicus && <CopernicusLegend />}</div>
          <div className="map-timeline"><div><span className="timeline-label">DATE DE LA COUCHE</span><strong>{dateOptions.find((option) => option.value === selectedTime)?.label ?? selectedTime}</strong></div><input aria-label="Date de la couche Copernicus" type="range" min="0" max={dateOptions.length - 1} value={dateOptions.findIndex((option) => option.value === selectedTime)} onChange={(event) => setSelectedTime(dateOptions[Number(event.target.value)].value)} /><div className="timeline-endpoints"><span>16 août 2026</span><span>16 oct. 2026</span></div><small className="timeline-note">Disponible selon la couverture annoncée du produit · pas une observation temps réel garantie</small></div>
        </section>
        <LayerPanel showCopernicus={showCopernicus} setShowCopernicus={setShowCopernicus} mapStatus={mapStatus} overlayStatus={overlayStatus} selectedTime={selectedTime} resetMap={resetMap} />
      </div>
    </main>
  );
}
