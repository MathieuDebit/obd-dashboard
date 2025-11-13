# tests/conftest.py
from __future__ import annotations
import csv
from datetime import datetime, timedelta
import pytest

PIDS = [
    "Calculated Engine Load",
    "Engine Coolant Temperature",
    "Short Term Fuel Trim - Bank 1",
    "Long Term Fuel Trim - Bank 1",
    "O2: Bank 1 - Sensor 1 Voltage",
    "O2: Bank 1 - Sensor 2 Voltage",
    "Intake Manifold Pressure",
    "Engine RPM",
    "Vehicle Speed",
    "Timing Advance",
    "Intake Air Temp",
    "Throttle Position",
]
UNITS = [
    "percent","degree_Celsius","percent","percent","volt","volt",
    "kilopascal","revolutions_per_minute","kilometer_per_hour","degree",
    "degree_Celsius","percent",
]

@pytest.fixture()
def sample_csv(tmp_path):
    """Create a realistic CSV with units row and ~60 seconds of data."""
    path = tmp_path / "trip.csv"
    t0 = datetime(2025, 10, 5, 10, 0, 0)
    rows = []
    for i in range(61):
        ts = t0 + timedelta(seconds=i)
        # simple synthetic signals
        rpm = 800 + (i//5 % 2)*150 + (i % 7)
        speed = max(0, min(90, i))  # ramp
        coolant = 55 + min(40, i//3)
        stft = 4.0 + ((i % 10) - 5) * 0.2
        ltft = -10.0 + ((i % 30) - 15) * 0.05
        row = [
            ts.strftime("%Y-%m-%d %H:%M:%S"),
            ts.date().isoformat(),
            ts.strftime("%H:%M:%S"),
            2.0,                     # load
            round(coolant, 3),
            round(stft, 3),
            round(ltft, 3),
            0.6, 0.2,               # O2 voltages
            28.0,                   # MAP kPa
            float(rpm),
            float(speed),
            6.0,                    # timing
            24.0,                   # IAT
            18.0,                   # throttle
        ]
        rows.append(row)

    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, delimiter=";")
        header = ["timestamp_iso", "date", "time"] + PIDS
        w.writerow(header)
        w.writerow(["", "", ""] + UNITS)  # units row
        w.writerows(rows)
    return path

@pytest.fixture()
def tmp_outputs(tmp_path):
    out_csv = tmp_path / "csv"
    out_html = tmp_path / "html"
    out_calc = tmp_path / "calc"
    out_csv.mkdir(); out_html.mkdir(); out_calc.mkdir()
    return {"csv": out_csv, "html": out_html, "calc": out_calc}
