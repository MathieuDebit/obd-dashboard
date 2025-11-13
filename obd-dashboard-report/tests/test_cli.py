# tests/test_cli.py
from obdtools.cli import main as cli_main

def test_cli_html_and_calc(sample_csv, tmp_outputs):
    # HTML
    out_html = tmp_outputs["html"] / "r.html"
    rc = cli_main(["html", "--in", str(sample_csv), "--out", str(out_html), "--title", "T"])
    assert rc == 0 and out_html.exists()

    # CALC (skip if odfpy not installed)
    try:
        import odf  # noqa
    except Exception:
        return
    out_ods = tmp_outputs["calc"] / "r.ods"
    rc = cli_main(["calc", "--in", str(sample_csv), "--out", str(out_ods)])
    assert rc == 0 and out_ods.exists()
