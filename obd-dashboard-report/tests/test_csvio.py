# tests/test_csvio.py
from obdtools.csvio.readers import detect_units_row, load_csv_with_units

def test_detect_units_row(sample_csv):
    headers, units_map, has = detect_units_row(str(sample_csv), sep=";")
    assert has is True
    assert "Engine RPM" in headers
    assert units_map["Engine RPM"] == "revolutions_per_minute"

def test_load_csv_with_units(sample_csv):
    df, units = load_csv_with_units(str(sample_csv), sep=";")
    assert "_ts" in df.columns
    assert "Engine RPM" in df.columns
    # Ensure time is monotonic after sort
    assert df["_ts"].is_monotonic_increasing
    assert units.get("Engine RPM") == "revolutions_per_minute"
