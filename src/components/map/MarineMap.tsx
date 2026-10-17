"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { copernicusSst } from "@/lib/data/copernicus";
import { mediterraneanStyle } from "@/lib/map/mapStyle";

type MapStatus = "loading" | "ready" | "error";
type OverlayStatus = "idle" | "loading" | "ready" | "error";

type MarineMapProps = {
  showCopernicus: boolean;
  selectedTime: string;
  onMapStatusChange: (status: MapStatus) => void;
  onOverlayStatusChange: (status: OverlayStatus) => void;
  onResetReady: (reset: () => void) => void;
};

const mediterraneanBounds: [[number, number], [number, number]] = [[-7, 30], [30, 48]];
const sourceId = "copernicus-sst";

export default function MarineMap({ showCopernicus, selectedTime, onMapStatusChange, onOverlayStatusChange, onResetReady }: MarineMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const latestTime = useRef(selectedTime);
  const latestShowCopernicus = useRef(showCopernicus);
  const callbacks = useRef({ onMapStatusChange, onOverlayStatusChange });
  const overlayHadError = useRef(false);

  useEffect(() => { latestTime.current = selectedTime; }, [selectedTime]);
  useEffect(() => { latestShowCopernicus.current = showCopernicus; }, [showCopernicus]);
  useEffect(() => { callbacks.current = { onMapStatusChange, onOverlayStatusChange }; }, [onMapStatusChange, onOverlayStatusChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mediterraneanStyle as StyleSpecification,
      center: [10, 38],
      zoom: 4.5,
      minZoom: 2,
      maxZoom: 12,
      attributionControl: true,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    const reset = () => map.fitBounds(mediterraneanBounds, { padding: 36, duration: 700 });
    onResetReady(reset);
    callbacks.current.onMapStatusChange("loading");

    map.on("load", () => {
      map.addSource(sourceId, {
        type: "raster",
        tiles: [copernicusSst.tileUrl(latestTime.current)],
        tileSize: 256,
        attribution: copernicusSst.attribution,
      });
      map.addLayer({
        id: sourceId,
        type: "raster",
        source: sourceId,
        layout: { visibility: latestShowCopernicus.current ? "visible" : "none" },
        paint: { "raster-opacity": 0.78 },
      });
      callbacks.current.onMapStatusChange("ready");
      callbacks.current.onOverlayStatusChange(latestShowCopernicus.current ? "loading" : "idle");
    });

    // MapLibre's map-level load event only proves the map style is ready. Track
    // the WMTS source independently so a successful basemap isn't mistaken for data.
    map.on("sourcedataloading", (event) => {
      if (event.sourceId === sourceId && latestShowCopernicus.current) {
        callbacks.current.onOverlayStatusChange("loading");
      }
    });
    map.on("sourcedata", (event) => {
      if (event.sourceId === sourceId && event.isSourceLoaded && latestShowCopernicus.current) {
        callbacks.current.onOverlayStatusChange(overlayHadError.current ? "error" : "ready");
      }
    });
    map.on("idle", () => {
      if (!latestShowCopernicus.current || !map.getSource(sourceId) || !map.isSourceLoaded(sourceId)) return;
      callbacks.current.onOverlayStatusChange(overlayHadError.current ? "error" : "ready");
    });
    map.on("error", (event) => {
      if ("sourceId" in event && event.sourceId === sourceId) {
        overlayHadError.current = true;
        callbacks.current.onOverlayStatusChange("error");
      } else {
        callbacks.current.onMapStatusChange("error");
      }
    });

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [onResetReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getLayer(sourceId)) return;
    if (showCopernicus) {
      overlayHadError.current = false;
      callbacks.current.onOverlayStatusChange("loading");
    } else {
      callbacks.current.onOverlayStatusChange("idle");
    }
    map.setLayoutProperty(sourceId, "visibility", showCopernicus ? "visible" : "none");
  }, [showCopernicus]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource(sourceId);
    if (!source || !("setTiles" in source)) return;
    overlayHadError.current = false;
    if (showCopernicus) callbacks.current.onOverlayStatusChange("loading");
    (source as { setTiles: (tiles: string[]) => void }).setTiles([copernicusSst.tileUrl(selectedTime)]);
  }, [selectedTime, showCopernicus]);

  return <div ref={containerRef} className="marine-map" aria-label="Carte interactive MapLibre de la Méditerranée" />;
}
