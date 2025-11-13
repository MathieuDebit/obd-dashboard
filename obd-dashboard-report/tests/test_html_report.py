# tests/test_html_report.py
from obdtools.report.html_report import build_html_from_csv, build_html_report
from obdtools.csvio.readers import load_csv_with_units

def test_build_html_from_csv(sample_csv, tmp_outputs):
    out = tmp_outputs["html"] / "report.html"
    html = build_html_from_csv(str(sample_csv), out_path=str(out), title="Test Report")
    # file is written and contains expected parts
    assert out.exists() and out.stat().st_size > 1000
    assert "Correlation heatmap" in html or "Correlation heatmap" in out.read_text()

def test_build_html_from_df(sample_csv):
    df, units = load_csv_with_units(str(sample_csv))
    html = build_html_report(df=df, units_map=units, title="Inline")
    # should have no unreplaced placeholders
    assert "__BODY__" not in html and "<html" in html
