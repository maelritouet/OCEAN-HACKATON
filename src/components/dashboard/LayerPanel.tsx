"use client";

import { copernicusSst } from "@/lib/data/copernicus";

type LayerPanelProps = {
  showCopernicus: boolean;
  setShowCopernicus: (show: boolean) => void;
  mapStatus: "loading" | "ready" | "error";
  overlayStatus: "idle" | "loading" | "ready" | "error";
  selectedTime: string;
  resetMap: () => void;
};

export default function LayerPanel({ showCopernicus, setShowCopernicus, mapStatus, overlayStatus, selectedTime, resetMap }: LayerPanelProps) {
  return (
    <aside className="dashboard-panel" aria-label="Inspecteur des données">
      <div className="panel-heading"><span className="section-index">01</span><div><p className="panel-kicker">INSPECTEUR</p><h2>Couche active</h2></div></div>
      <div className="layer-card"><div className="layer-card-title"><span className="layer-swatch base" /><div><strong>Fond géographique</strong><small>OpenStreetMap · raster</small></div><span className="status-dot ready" /></div><p>Repère cartographique indépendant des données océanographiques.</p></div>
      <div className="layer-card active"><div className="layer-card-title"><span className="layer-swatch heat" /><div><strong>Température de mer</strong><small>Copernicus Marine · WMTS</small></div><label className="toggle"><input type="checkbox" checked={showCopernicus} onChange={(event) => setShowCopernicus(event.target.checked)} /><span /></label></div><p>{showCopernicus ? "Couche de température affichée au-dessus du fond." : "Couche masquée, fond conservé."}</p><p className="science-note">La température seule ne suffit pas à identifier une vague de chaleur marine : il faut la comparer à une référence climatologique locale.</p></div>
      <div className="panel-divider" />
      <dl className="metadata-list"><div><dt>Produit</dt><dd>{copernicusSst.dataset}</dd></div><div><dt>Variable</dt><dd>{copernicusSst.variable} · {copernicusSst.unit}</dd></div><div><dt>Profondeur</dt><dd>{copernicusSst.depthLabel}</dd></div><div><dt>Résolution</dt><dd>{copernicusSst.resolution}</dd></div><div><dt>Couverture temporelle</dt><dd>{copernicusSst.timeCoverage}</dd></div><div><dt>Temps affiché</dt><dd>{selectedTime.replace("T00:00:00Z", "")}</dd></div></dl>
      <div className="connection-status"><span className={`status-dot ${mapStatus === "ready" ? "ready" : mapStatus === "error" ? "error" : "loading"}`} /><span>Fond de carte: {mapStatus === "ready" ? "connecté" : mapStatus === "error" ? "indisponible" : "chargement"}</span></div>
      <div className="connection-status"><span className={`status-dot ${overlayStatus === "ready" ? "ready" : overlayStatus === "error" ? "error" : "loading"}`} /><span>Copernicus: {overlayStatus === "ready" ? "tuiles chargées" : overlayStatus === "error" ? "erreur de tuile" : overlayStatus === "loading" ? "chargement des tuiles" : "masquée"}</span></div>
      {overlayStatus === "error" && <p className="panel-error">Le fond reste disponible. Le service WMTS n’a pas pu fournir cette couche à ce moment.</p>}
      <button className="reset-map" onClick={resetMap}>Recentrer la Méditerranée <span>↗</span></button>
      <a className="source-link" href={copernicusSst.capabilitiesUrl} target="_blank" rel="noreferrer">Vérifier les capacités WMTS ↗</a><a className="source-link" href={copernicusSst.sourceUrl} target="_blank" rel="noreferrer">Voir la fiche Copernicus ↗</a>
    </aside>
  );
}
