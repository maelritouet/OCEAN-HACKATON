import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import netCDF4


ROOT = Path(__file__).parents[1]
SCRIPT = ROOT / "nc2json.py"


class NetCDFExportTest(unittest.TestCase):
    def create_fixture(self, directory: Path) -> Path:
        path = directory / "fixture.nc"
        with netCDF4.Dataset(path, "w") as dataset:
            dataset.createDimension("time", 2)
            dataset.area = "GLOBAL"
            dataset.comment = "Period : 2000-2000. Used climatology : 1991-2020."
            time = dataset.createVariable("time", "f8", ("time",))
            time.units = "days since 1950-01-01 00:00:00"
            time.calendar = "gregorian"
            anomaly = dataset.createVariable("sst_anomaly", "f8", ("time",), fill_value=-99999)
            trend = dataset.createVariable("sst_anomaly_filtered", "f8", ("time",), fill_value=-99999)
            time[:] = [18262, 18293]
            anomaly[:] = [0.2, 0.4]
            trend[:] = [-99999, 0.3]
        return path

    def test_exports_metadata_dates_and_missing_values(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            input_path = self.create_fixture(directory)
            output_path = directory / "data.json"
            subprocess.run(
                [sys.executable, str(SCRIPT), str(input_path), "--output", str(output_path)],
                check=True,
            )
            payload = json.loads(output_path.read_text())
            self.assertEqual(payload["coverage"]["area"], "GLOBAL")
            self.assertFalse(payload["coverage"]["isSpatialGrid"])
            self.assertEqual(payload["records"][0]["year"], 2000)
            self.assertIsNone(payload["records"][0]["sst_anomaly_filtered"])
            self.assertEqual(payload["records"][1]["sst_anomaly_filtered"], 0.3)

    def test_missing_input_fails(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            result = subprocess.run(
                [sys.executable, str(SCRIPT), str(Path(temporary) / "missing.nc")],
                capture_output=True,
                text=True,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("does not exist", result.stderr)


if __name__ == "__main__":
    unittest.main()