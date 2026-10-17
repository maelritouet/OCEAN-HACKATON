# ThermoMaris

ThermoMaris is a French-first prototype for exploring a Copernicus global,
area-averaged monthly sea-surface-temperature anomaly series.

## Scope of the current data

The supplied NetCDF file covers January 1982 to December 2024 and uses the
1991-2020 climatology. It is a global area average, not a spatial grid, so it
is retained as a traceable historical fallback. Near-real-time regional data
and marine heatwave events are produced separately by `copernicus_pipeline.py`.
Neither product supports claims about a beach, farm, lagoon, or individual
coastal site at satellite-grid resolution.

## Setup

Install the Python dependency for the data export:

```sh
python -m pip install -r requirements.txt
```

Export the committed static data asset from the supplied file:

```sh
python nc2json.py global_omi_tempsal_sst_area_averaged_anomalies_19820101-20241231_R19912020_P20250516.nc --output public/data/copernicus_nc_data.json
```

Install the JavaScript dependencies and run the app:

```sh
npm install
npm run dev
```

Run the backend in a second terminal so the front uses live Copernicus data:

```sh
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --app-dir . --reload --port 8000
```

The Vite development server proxies `/api` to this backend. The frontend
requests `/api/mhw?lat=43&lon=6&radius=0.05`; it only falls back to the static
pipeline JSON when the backend is unavailable.

If the toolbox asks for credentials, authenticate once with
`copernicusmarine login` before starting the backend. Never put credentials in
the frontend or commit them to the repository.

Useful checks:

```sh
npm run typecheck
npm run build
```

The three interface depths are `Découvrir`, `Explorer`, and `Expert`. The
methods panel exposes the source metadata, processing, coverage, and limits.
Educational lesson kits, quizzes, classroom sessions, and kiosk deployment
remain deferred roadmap work.

## Copernicus Marine pipeline

The pipeline uses the official Copernicus Marine `read_dataframe` API and
combines two products: `C3S-GLO-SST-L4-REP-OBS-SST` (1982-2024) for the
1991-2020 baseline, and `METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2` (2025-present)
for the current continuation. It then spatially averages a small box around
the selected location and detects events with the Hobday definition: 90th
percentile, 1991-2020 baseline, and a five-day minimum. Configure Copernicus
credentials with its toolbox login or environment variables, then run:

```sh
python copernicus_pipeline.py --lat 43.0 --lon 6.0
```

This writes `public/data/copernicus_pipeline.json` with both source products,
method settings, daily records, and detected events. Use `--input path/to/file.nc`
to process an existing NetCDF without API calls. The default location is
Toulon; use `--lat`, `--lon`, and `--radius` to select another extraction box.