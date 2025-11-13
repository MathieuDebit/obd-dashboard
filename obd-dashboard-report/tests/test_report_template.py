# tests/test_report_template.py
from pathlib import Path
from obdtools.report.template_loader import load_template, copy_assets

def test_load_template_default():
    html = load_template(None)
    assert "__TITLE__" in html and "__BODY__" in html  # placeholders present

def test_copy_assets(tmp_path):
    out_dir = tmp_path / "report"
    out_dir.mkdir()
    copy_assets(str(out_dir))
    assert (out_dir / "assets" / "css" / "report.css").exists()
    assert (out_dir / "assets" / "js" / "report.js").exists()
