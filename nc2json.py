"""Export the supported contents of a Copernicus NetCDF file as JSON.

The supplied dataset is a global area-averaged monthly time series. This
script deliberately records that limitation so consumers cannot mistake it
for a spatial grid or a local coastal observation.
"""

import argparse
import json
import math
from importlib import import_module
from pathlib import Path
from typing import Any

try:
    netCDF4 = import_module("netCDF4")
except ModuleNotFoundError as exc:
    raise SystemExit(
        "Missing dependency: netCDF4. Install it with `python -m pip install -r requirements.txt`."
    ) from exc


REQUIRED_VARIABLES = ("time", "sst_anomaly", "sst_anomaly_filtered")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export a Copernicus NetCDF time series to a traceable JSON file."
    )
    parser.add_argument("input", type=Path, help="Path to the input NetCDF file")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("public/data/copernicus_nc_data.json"),
        help="Output JSON path (default: public/data/copernicus_nc_data.json)",
    )
    return parser.parse_args()


def json_value(value: Any) -> Any:
    if value is None or isinstance(value, (str, bool, int)):
        return value
    if isinstance(value, float):
        return round(value, 6) if math.isfinite(value) else None
    if hasattr(value, "item"):
        return json_value(value.item())
    return str(value)


def attribute_map(dataset: Any) -> dict[str, Any]:
    return {name: json_value(dataset.getncattr(name)) for name in dataset.ncattrs()}


def read_values(variable: Any) -> list[Any]:
    values = variable[:]
    if hasattr(values, "filled"):
        values = values.filled(None)
    raw_values = values.tolist()
    missing_values = {
        json_value(variable.getncattr(name))
        for name in ("_FillValue", "missing_value")
        if name in variable.ncattrs()
    }
    result = []
    for value in raw_values:
        normalized = json_value(value)
        result.append(None if normalized in missing_values else normalized)
    return result


def export_dataset(input_path: Path, output_path: Path) -> int:
    if not input_path.is_file():
        raise SystemExit(f"Input NetCDF file does not exist: {input_path}")

    with netCDF4.Dataset(input_path) as dataset:
        missing = [name for name in REQUIRED_VARIABLES if name not in dataset.variables]
        if missing:
            raise SystemExit(f"Missing required NetCDF variables: {', '.join(missing)}")

        time_variable = dataset.variables["time"]
        anomaly_variable = dataset.variables["sst_anomaly"]
        trend_variable = dataset.variables["sst_anomaly_filtered"]
        time_values = read_values(time_variable)
        anomaly_values = read_values(anomaly_variable)
        trend_values = read_values(trend_variable)

        if not (len(time_values) == len(anomaly_values) == len(trend_values)):
            raise SystemExit("The time and anomaly variables do not have matching lengths")

        dates = netCDF4.num2date(
            time_values,
            units=getattr(time_variable, "units"),
            calendar=getattr(time_variable, "calendar", "standard"),
            only_use_cftime_datetimes=False,
            only_use_python_datetimes=False,
        )
        records = [
            {
                "date": date.isoformat(),
                "year": date.year,
                "month": date.month,
                "sst_anomaly": anomaly,
                "sst_anomaly_filtered": trend,
            }
            for date, anomaly, trend in zip(dates, anomaly_values, trend_values)
        ]

        variable_metadata = {
            name: {
                "dimensions": list(dataset.variables[name].dimensions),
                "shape": list(dataset.variables[name].shape),
                "attributes": attribute_map(dataset.variables[name]),
            }
            for name in REQUIRED_VARIABLES
        }
        dimensions = {name: len(dimension) for name, dimension in dataset.dimensions.items()}
        global_metadata = attribute_map(dataset)
        data_dimensions = list(anomaly_variable.dimensions)
        spatial_dimensions = [dimension for dimension in data_dimensions if dimension != "time"]
        is_spatial = bool(spatial_dimensions)

    payload = {
        "schemaVersion": 1,
        "source": {
            "inputFile": input_path.name,
            "globalAttributes": global_metadata,
            "dimensions": dimensions,
            "variables": variable_metadata,
        },
        "coverage": {
            "start": records[0]["date"] if records else None,
            "end": records[-1]["date"] if records else None,
            "area": global_metadata.get("area"),
            "spatialDimensions": spatial_dimensions,
            "isSpatialGrid": is_spatial,
        },
        "capabilities": {
            "areaAveragedTimeSeries": not is_spatial,
            "spatialMap": is_spatial,
            "localCoastInference": False,
            "marineHeatwaveEventDetection": False,
        },
        "records": records,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return len(records)


def main() -> None:
    args = parse_args()
    record_count = export_dataset(args.input, args.output)
    print(f"Exported {record_count} records to {args.output}")


if __name__ == "__main__":
    main()