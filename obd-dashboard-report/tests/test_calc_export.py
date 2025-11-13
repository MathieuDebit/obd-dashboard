# tests/test_calc_export.py
import pytest

odfpy = pytest.importorskip("odf")  # skip if not installed

from obdtools.report.calc_export import csv_to_ods

def test_csv_to_ods(sample_csv, tmp_outputs):
    out = tmp_outputs["calc"] / "trip.ods"
    csv_to_ods(str(sample_csv), str(out))
    assert out.exists() and out.stat().st_size > 0
