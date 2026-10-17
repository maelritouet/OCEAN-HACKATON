"use client";

import { useState } from "react";
import { copernicusSst } from "@/lib/data/copernicus";

export default function CopernicusLegend() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="scientific-legend legend-fallback"><strong>Température (°C)</strong><small>Légende distante indisponible · voir les métadonnées Copernicus</small></div>;
  }

  return (
    <div className="scientific-legend source-legend" aria-label="Légende officielle Copernicus de la température de mer">
      <span>Copernicus · °C</span>
      {/* Served by the same WMTS service and style as the displayed tiles. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={copernicusSst.legendUrl} alt="Échelle de couleurs officielle de la température de mer" onError={() => setFailed(true)} />
    </div>
  );
}
