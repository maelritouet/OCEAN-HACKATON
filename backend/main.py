"""HTTP API exposing the Copernicus REP/NRT + Hobday pipeline to the web app."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from copernicus_pipeline import (
    NRT_DATASET_ID,
    REP_DATASET_ID,
    build_payload,
    fetch_rep_nrt_series,
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


@app.get("/api/mhw")
def marine_heatwaves(
    lat: float = Query(43.0, ge=-90, le=90),
    lon: float = Query(6.0, ge=-180, le=180),
    radius: float = Query(0.05, gt=0, le=2),
    start: str = "1982-01-01",
    end: str | None = None,
) -> dict[str, Any]:
    end = end or date.today().isoformat()
    cache_key = (lat, lon, radius, start, end)
    if cache_key in _cache:
        return _cache[cache_key]
    try:
        frame, source = fetch_rep_nrt_series(
            start,
            end,
            bbox=(lon - radius, lon + radius, lat - radius, lat + radius),
        )
        payload = build_payload(frame, "1991-01-01", "2020-12-31", {
            "provider": "Copernicus Marine Service",
            "location": {"lat": lat, "lon": lon, "radiusDegrees": radius},
            **source,
        })
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Copernicus pipeline unavailable: {exc}") from exc
    _cache[cache_key] = payload
    return payload


@app.get("/api/map")
def current_map(
    min_lon: float = Query(-6.5, ge=-180, le=180),
    max_lon: float = Query(10.5, ge=-180, le=180),
    min_lat: float = Query(41.0, ge=-90, le=90),
    max_lat: float = Query(51.5, ge=-90, le=90),
    day: str | None = None,
) -> dict[str, Any]:
    """Return the latest real NRT SST cells covering the displayed map."""
    requested_day = day or (date.today() - timedelta(days=1)).isoformat()
    cache_key = ("map", min_lon, max_lon, min_lat, max_lat, requested_day)
    if cache_key in _cache:
        return _cache[cache_key]
    try:
        dataset_id = REP_DATASET_ID if requested_day <= "2024-12-31" else NRT_DATASET_ID
        dataset_version = "202506" if dataset_id == REP_DATASET_ID else None
        raw = read_dataframe_subset(
            requested_day,
            requested_day,
            dataset_id=dataset_id,
            dataset_version=dataset_version,
            variable="analysed_sst",
            bbox=(min_lon, max_lon, min_lat, max_lat),
        )
        frame = raw.reset_index()
        latitude_column = next((name for name in ("latitude", "lat") if name in frame.columns), None)
        longitude_column = next((name for name in ("longitude", "lon") if name in frame.columns), None)
        time_column = next((name for name in ("time", "date", "datetime") if name in frame.columns), None)
        if not latitude_column or not longitude_column or not time_column or "analysed_sst" not in frame.columns:
            raise ValueError(f"NRT response has no map coordinates: {list(frame.columns)}")
        raw = frame
        raw["sst"] = raw["analysed_sst"]
        raw["sst"] = raw["sst"].where(raw["sst"] < 200, raw["sst"] - 273.15)
        cells = [
            {"lat": round(float(row[latitude_column]), 5), "lon": round(float(row[longitude_column]), 5), "sst": round(float(row["sst"]), 3)}
            for _, row in raw.dropna(subset=[latitude_column, longitude_column, "sst"]).iterrows()
            if row["sst"] != 0
        ]
        payload = {"source": {"provider": "Copernicus Marine Service", "datasetId": dataset_id, "date": requested_day}, "cells": cells}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Copernicus map unavailable: {exc}") from exc
    _cache[cache_key] = payload
    return payload