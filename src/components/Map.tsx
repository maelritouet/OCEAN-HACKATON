import React, { useEffect, useRef, useState } from 'react';
import { SpeciesItem, YearData } from '../types';

declare global {
  interface Window {
    L: any;
  }
}

interface MapProps {
  species: SpeciesItem[];
  selectedSpecies: SpeciesItem | null;
  onSelectSpecies: (sp: SpeciesItem) => void;
  onClearSelection: () => void;
  focusedBasin: string | null;
  currentYearData: YearData;
  tileStyle: 'voyager' | 'osm';
}

export default function RealWorldMap({
  species,
  selectedSpecies,
  onSelectSpecies,
  onClearSelection,
  focusedBasin,
  currentYearData,
  tileStyle
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const satelliteRasterRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  // 1. Charger Leaflet
  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    const cssId = 'leaflet-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const scriptId = 'leaflet-cdn-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setLeafletReady(true);
      document.body.appendChild(script);
    }
  }, []);

  // 2. Initialiser la carte
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = window.L;

    const map = L.map(mapContainerRef.current, {
      center: [46.1, 2.5],
      zoom: 6,
      minZoom: 4,
      maxZoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Fond de carte terrestre (Niveau de base)
    const tileUrl = tileStyle === 'osm'
      ? 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 13,
      attribution: '&copy; OpenStreetMap &copy; Esri &copy; NASA GIBS'
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', onClearSelection);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletReady, tileStyle]);

  // 3. LA MAGIE : Le calque continu Satellite lié au Curseur Temporel !
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L || !currentYearData) return;
    const L = window.L;

    // On retire l'ancien calque de l'année précédente
    if (satelliteRasterRef.current) {
      map.removeLayer(satelliteRasterRef.current);
    }

    // On crée la date dynamique basée sur le curseur (On prend le 15 Août comme pique estival)
    // Dans une version plus poussée, currentYearData pourrait être un jour précis "2022-08-15"
    const targetDate = `${currentYearData.year}-08-15`;

    // Le calque NASA GIBS "Sea Surface Temperature" qui colore la mer avec une échelle thermique
    satelliteRasterRef.current = L.tileLayer(
      `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GHRSST_L4_MUR_Sea_Surface_Temperature/default/${targetDate}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`,
      { 
        opacity: 0.75, // Laisse transparaître légèrement la bathymétrie en dessous
        maxNativeZoom: 7, 
        maxZoom: 13,
        bounds: L.latLngBounds([41.0, -6.5], [51.5, 10.5]) // Restreint à la France
      }
    ).addTo(map);

  }, [leafletReady, currentYearData]);

  // 4. Zoom sur les façades
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (focusedBasin === 'Méditerranée') map.flyTo([42.95, 5.85], 7.4, { duration: 1.25 });
    else if (focusedBasin === 'Atlantique') map.flyTo([47.2, -3.2], 7.2, { duration: 1.25 });
    else if (focusedBasin === 'Manche') map.flyTo([49.05, -2.15], 8.0, { duration: 1.25 });
    else map.flyTo([46.1, 2.5], 6.0, { duration: 1.2 });
  }, [focusedBasin]);

  // 5. MARQUEURS DES ESPÈCES (Gardés pour l'aspect éducatif)
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer || !window.L) return;
    const L = window.L;

    markersLayer.clearLayers();

    species.forEach((sp) => {
      const isSelected = selectedSpecies?.id === sp.id;
      const isDecline = sp.trend === 'decline';
      const badgeColor = isDecline ? '#be123c' : '#059669'; 
      const sign = isDecline ? '−' : '+';

      const html = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
          <div style="width: ${isSelected ? '38px' : '30px'}; height: ${isSelected ? '38px' : '30px'}; border-radius: 9999px; background: ${badgeColor}; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            ${sign}
          </div>
        </div>
      `;

      const icon = L.divIcon({ className: '', html, iconSize: [0, 0] });
      const marker = L.marker(sp.coords, { icon }).addTo(markersLayer);
      
      marker.on('click', (e: any) => {
        L.DomEvent.stopPropagation(e);
        onSelectSpecies(sp);
      });
    });
  }, [leafletReady, species, selectedSpecies]);

  return (
    <div className="relative w-full h-full bg-[#1e293b]">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      {!leafletReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-sky-400 font-semibold">
          Chargement de la carte satellitaire...
        </div>
      )}
    </div>
  );
}