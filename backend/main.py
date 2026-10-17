"""HTTP API exposing the Copernicus REP/NRT + Hobday pipeline to the web app."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import copernicusmarine

import os
import json

from copernicus_pipeline import (
    NRT_DATASET_ID,
    REP_DATASET_ID,
    build_payload,
    fetch_rep_nrt_series,    # <--- Il manquait probablement cette ligne !
    read_dataframe_subset,
)

app = FastAPI(title="ThermoMaris Copernicus API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

_cache: dict[tuple[Any, ...], dict[str, Any]] = {}


@app.get("/api/health")
@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


CACHE_DIR = "cache_data"
os.makedirs(CACHE_DIR, exist_ok=True)

@app.get("/api/mhw")
def marine_heatwaves(
    lat: float = Query(43.0, ge=-90, le=90),
    lon: float = Query(6.0, ge=-180, le=180),
    radius: float = Query(0.05, gt=0, le=2),
    start: str = "1982-01-01",
    end: str | None = None,
) -> dict[str, Any]:
    end = end or date.today().isoformat()
    
    # Vérification du cache sur le disque
    cache_file = os.path.join(CACHE_DIR, f"mhw_{lat}_{lon}_{radius}_{start}_{end}.json")
    if os.path.exists(cache_file):
        with open(cache_file, "r") as f:
            return json.load(f)

    try:
        frame, source = fetch_rep_nrt_series(
                    "1982-01-01", end, bbox=(lon - radius, lon + radius, lat - radius, lat + radius)
                )
        payload = build_payload(
            frame, "1991-01-01", "2020-12-31", 
            {
                "provider": "Copernicus Marine Service",
                "location": {"lat": lat, "lon": lon, "radiusDegrees": radius},
                **source,
            },
            filter_start=start,  # <--- Filtre d'affichage dynamique (ex: 2025-01-01)
            filter_end=end       # <--- Filtre d'affichage dynamique (ex: aujourd'hui)
        )
        
        # Sauvegarde sur le disque
        with open(cache_file, "w") as f:
            json.dump(payload, f)
            
        return payload
    except Exception as exc:
        import traceback
        print("\n❌ ERREUR CRITIQUE DANS /api/mhw :")
        traceback.print_exc()  # <--- C'est ceci qui nous donnera l'erreur Python exacte
        print("\n")
        raise HTTPException(status_code=502, detail=f"Copernicus pipeline unavailable: {exc}") from exc


@app.get("/api/map")
def current_map(
    min_lon: float = Query(-6.5, ge=-180, le=180),
    max_lon: float = Query(10.5, ge=-180, le=180),
    min_lat: float = Query(41.0, ge=-90, le=90),
    max_lat: float = Query(51.5, ge=-90, le=90),
    day: str | None = None,
) -> dict[str, Any]:
    requested_day_str = day or (date.today() - timedelta(days=1)).isoformat()
    target_date = date.fromisoformat(requested_day_str)
    
    # 1. Vérification du cache pour la date demandée
    cache_file = os.path.join(CACHE_DIR, f"map_{min_lon}_{max_lon}_{min_lat}_{max_lat}_{requested_day_str}.json")
    if os.path.exists(cache_file):
        with open(cache_file, "r") as f:
            return json.load(f)

    # 2. Algorithme d'Auto-Fallback
    for offset in range(4):
        current_attempt_date = (target_date - timedelta(days=offset)).isoformat()
        dataset_id = REP_DATASET_ID if current_attempt_date <= "2024-12-31" else NRT_DATASET_ID
        dataset_version = "202506" if dataset_id == REP_DATASET_ID else None
        
        try:
            # === CONTOURNEMENT DU BUG COPERNICUS ===
            # Au lieu d'utiliser read_dataframe_subset qui crashe sur les noms de colonnes,
            # on utilise open_dataset et on convertit nous-mêmes.
            options = {
                "dataset_id": dataset_id,
                "variables": ["analysed_sst"],
                "minimum_longitude": min_lon,
                "maximum_longitude": max_lon,
                "minimum_latitude": min_lat,
                "maximum_latitude": max_lat,
                "start_datetime": current_attempt_date,
                "end_datetime": current_attempt_date,
            }
            if dataset_version:
                options["dataset_version"] = dataset_version
                
            # Téléchargement via xarray brut
            ds = copernicusmarine.open_dataset(**options)
            raw = ds.to_dataframe().reset_index()
            ds.close() # Libération de la mémoire
            
            if raw is None or raw.empty or "analysed_sst" not in raw.columns:
                raise ValueError("Données satellites incomplètes")

            # 3. EXTRACTION SÉCURISÉE DES COLONNES (lat/lon ou latitude/longitude)
            latitude_column = next((name for name in ("latitude", "lat") if name in raw.columns), None)
            longitude_column = next((name for name in ("longitude", "lon") if name in raw.columns), None)
            
            if not latitude_column or not longitude_column:
                raise ValueError("Coordonnées spatiales manquantes")

            raw["sst"] = raw["analysed_sst"]
            raw["sst"] = raw["sst"].where(raw["sst"] < 200, raw["sst"] - 273.15)
            
            cells = [
                {"lat": round(float(row[latitude_column]), 5), "lon": round(float(row[longitude_column]), 5), "sst": round(float(row["sst"]), 3)}
                for _, row in raw.dropna(subset=[latitude_column, longitude_column, "sst"]).iterrows()
                if row["sst"] != 0
            ]
            
            if not cells:
                raise ValueError("Aucune cellule océanique valide")
            
            # 4. SUCCÈS ! Création du payload
            payload = {
                "source": {
                    "provider": "Copernicus Marine Service", 
                    "datasetId": dataset_id, 
                    "date": requested_day_str, 
                    "actual_map_data_used": current_attempt_date
                }, 
                "cells": cells
            }
            
            with open(cache_file, "w") as f:
                json.dump(payload, f)
                
            print(f"✅ Carte envoyée. (Demandée: {requested_day_str} | Donnée réelle: {current_attempt_date})")
            return payload

        except Exception as e:
            print(f"⚠️ Image du {current_attempt_date} ignorée ({e}). On recule...")
            continue
            
    # Si Copernicus est totalement hors-ligne
    return {
        "source": {"provider": "Copernicus", "datasetId": "N/A", "date": requested_day_str, "note": "API Delayed"}, 
        "cells": []
    }