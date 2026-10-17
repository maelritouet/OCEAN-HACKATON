from importlib import import_module
import json
from datetime import datetime, timedelta

try:
    nc = import_module("netCDF4")
except ModuleNotFoundError as exc:
    if exc.name != "netCDF4":
        raise
    raise SystemExit("Install the missing dependency with: python -m pip install netCDF4") from exc

ds = nc.Dataset("your_file.nc")
days = ds.variables["time"][:].tolist()
anom = ds.variables["sst_anomaly"][:].tolist()
trend = ds.variables["sst_anomaly_filtered"][:].tolist()

base_date = datetime(1950, 1, 1)
records = []
for d, a, t in zip(days, anom, trend):
    dt = base_date + timedelta(days=float(d))
    records.append({
        "date": dt.strftime("%Y-%m"),
        "year": dt.year,
        "sst_anomaly": round(float(a), 3),
        "sst_anomaly_filtered": round(float(t), 3)
    })

with open("copernicus_nc_data.json", "w") as f:
    json.dump(records, f, indent=2)
print("Saved", len(records), "months of Copernicus NetCDF data!")