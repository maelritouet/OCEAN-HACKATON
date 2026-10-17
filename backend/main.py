from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import xarray as xr
import pandas as pd
import numpy as np
import os
import traceback

app = FastAPI(title="ThermoMaris Copernicus API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data/C3S-GLO-SST-L4-REP-OBS-SST_1792227794678.nc")

try:
    # chunk() permet de ne pas saturer la RAM, xarray chargera à la volée
    ds = xr.open_dataset(DATA_PATH)
    print("✅ Fichier NetCDF chargé avec succès !")
    print("Variables disponibles :", list(ds.data_vars.keys()))
except Exception as e:
    ds = None
    print(f"❌ Erreur de chargement du fichier : {e}")

def get_valid_marine_pixel(lat: float, lon: float):
    """
    Extrait le pixel en s'assurant qu'il contient bien de l'eau et non un masque terrestre (0.0).
    Cherche dans un rayon d'environ 15km si le point cliqué tombe sur la côte.
    """
    lat_col = 'latitude' if 'latitude' in ds.dims else 'lat'
    lon_col = 'longitude' if 'longitude' in ds.dims else 'lon'
    
    # Trouver la vraie variable SST (ignorer les masques)
    valid_vars = [v for v in ds.data_vars if 'sst' in v.lower() and 'error' not in v.lower()]
    if not valid_vars:
        valid_vars = [list(ds.data_vars.keys())[0]]
    var_name = valid_vars[0]

    # Extraction exacte
    pixel = ds.sel({lat_col: lat, lon_col: lon}, method="nearest")
    sst_raw = pixel[var_name].values
    
    # Test : Si la moyenne est à 0 ou NaN, c'est la terre ferme
    if np.nanmean(sst_raw) == 0.0 or np.isnan(sst_raw).all():
        print(f"⚠️ Point terrestre détecté ({lat}, {lon}). Recherche du pixel marin le plus proche...")
        
        # Tolérance de recherche (environ 15-20km)
        lat_tolerance = 0.2
        lon_tolerance = 0.2
        
        # Découpe d'une petite région autour du clic
        region = ds.sel(
            {lat_col: slice(lat - lat_tolerance, lat + lat_tolerance),
             lon_col: slice(lon - lon_tolerance, lon + lon_tolerance)}
        )
        
        # On calcule la moyenne de chaque pixel dans le temps
        mean_sst = region[var_name].mean(dim='time')
        
        # On masque les pixels qui valent exactement 0 ou NaN
        valid_marine_pixels = mean_sst.where((mean_sst != 0) & (~np.isnan(mean_sst)), drop=True)
        
        if valid_marine_pixels.size == 0:
            raise ValueError("Aucune eau trouvée à moins de 20km de ce point. Cliquez plus au large.")
            
        # On prend le premier pixel marin valide trouvé
        valid_lat = float(valid_marine_pixels[lat_col].values[0])
        valid_lon = float(valid_marine_pixels[lon_col].values[0])
        
        # On re-sélectionne le vrai pixel marin
        pixel = ds.sel({lat_col: valid_lat, lon_col: valid_lon}, method="nearest")
        sst_raw = pixel[var_name].values
        
    return pixel, sst_raw, lat_col, lon_col


@app.get("/api/sst")
def get_sst_dynamic(lat: float, lon: float):
    if ds is None:
        raise HTTPException(status_code=500, detail="Base de données hors ligne")

    try:
        pixel, sst_raw, lat_col, lon_col = get_valid_marine_pixel(lat, lon)

        if np.nanmax(sst_raw) > 200:
            sst_celsius = sst_raw - 273.15
        else:
            sst_celsius = sst_raw

        dates = pd.to_datetime(pixel.time.values).strftime('%Y-%m-%d').tolist()
        
        valid_data = [
            {"date": d, "temp": round(float(t), 2)} 
            for d, t in zip(dates, sst_celsius) if not pd.isna(t) and t != 0
        ]

        if not valid_data:
            raise ValueError("Erreur : Les données extraites sont invalides ou vides.")

        baseline_temp = sum(item["temp"] for item in valid_data) / len(valid_data)
        
        for item in valid_data:
            anomaly = round(item["temp"] - baseline_temp, 2)
            item["anomaly"] = anomaly
            item["is_heatwave"] = anomaly > 1.5

        return {
            "coordinates": {"lat": lat, "lon": lon},
            "actual_pixel": {
                "lat": round(float(pixel[lat_col].values), 4),
                "lon": round(float(pixel[lon_col].values), 4)
            },
            "baseline_temp": round(baseline_temp, 2),
            "data": valid_data
        }
    except Exception as e:
        print("--- ERREUR DANS L'API ---")
        traceback.print_exc() 
        raise HTTPException(status_code=400, detail=f"Erreur de lecture : {str(e)}")


@app.get("/api/expert/mhw")
def calculate_hobday_mhw(lat: float, lon: float, base_start: str = "1991-01-01", base_end: str = "2020-12-31", percentile: float = 0.90):
    if ds is None: raise HTTPException(status_code=500, detail="Fichier NC introuvable")

    try:
        pixel, sst_raw, lat_col, lon_col = get_valid_marine_pixel(lat, lon)

        if np.nanmax(sst_raw) > 200:
            sst_celsius = sst_raw - 273.15
        else:
            sst_celsius = sst_raw

        dates = pd.to_datetime(pixel.time.values)
        
        # Le masque filtre strictement les zéros terrestres de Copernicus
        df = pd.DataFrame({"date": dates, "sst": sst_celsius}).dropna()
        df = df[df['sst'] != 0.0].set_index("date")
        
        if df.empty: raise HTTPException(status_code=400, detail="Pixel terrestre (que des zéros)")

        try:
            baseline_df = df.loc[base_start:base_end].copy()
        except KeyError:
            baseline_df = df.copy()

        baseline_df['doy'] = baseline_df.index.dayofyear
        
        climatology = baseline_df.groupby('doy')['sst'].mean().rolling(window=11, min_periods=1, center=True).mean()
        threshold = baseline_df.groupby('doy')['sst'].quantile(percentile).rolling(window=11, min_periods=1, center=True).mean()

        df['doy'] = df.index.dayofyear
        df['clim'] = df['doy'].map(climatology).bfill().ffill()
        df['thresh'] = df['doy'].map(threshold).bfill().ffill()
        df['anomaly'] = df['sst'] - df['clim']

        df['is_mhw_day'] = df['sst'] > df['thresh']
        
        mhw_events = []
        current_event = []
        
        for date, row in df.iterrows():
            if row['is_mhw_day']:
                current_event.append({"date": date, "sst": row['sst'], "anomaly": row['anomaly']})
            else:
                if len(current_event) >= 5: 
                    mhw_events.append(current_event)
                current_event = []
                
        if len(current_event) >= 5: mhw_events.append(current_event)

        events_stats = []
        for i, event in enumerate(mhw_events):
            anomalies = [e['anomaly'] for e in event]
            events_stats.append({
                "id": i + 1,
                "start": event[0]['date'].strftime("%Y-%m-%d"),
                "end": event[-1]['date'].strftime("%Y-%m-%d"),
                "duration_days": len(event),
                "max_intensity": round(max(anomalies), 2),
                "cumulative_intensity": round(sum(anomalies), 2)
            })

        events_stats = sorted(events_stats, key=lambda x: x['max_intensity'], reverse=True)

        timeseries = df.reset_index()
        for col in ['sst', 'clim', 'thresh']:
            timeseries[col] = timeseries[col].round(2)
        timeseries['date'] = timeseries['date'].dt.strftime("%Y-%m-%d")

        timeseries = timeseries.replace([np.nan, np.inf, -np.inf], None)

        print(f"\n--- DIAGNOSTIC EXPERT ({lat}, {lon}) ---")
        print(f"Pixel analysé : Lat {float(pixel[lat_col].values):.2f}, Lon {float(pixel[lon_col].values):.2f}")
        print(f"Moyenne SST lue : {df['sst'].mean():.2f}°C")

        return {
            "params": {"lat": lat, "lon": lon, "base_start": base_start, "base_end": base_end, "percentile": percentile},
            "metrics": {
                "total_events": len(events_stats),
                "top_events": events_stats[:10]
            },
            "timeseries": timeseries[['date', 'sst', 'clim', 'thresh']].to_dict(orient="records")
        }

    except Exception as e:
        print("--- ERREUR DANS L'API EXPERT ---")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Erreur de calcul : {str(e)}")