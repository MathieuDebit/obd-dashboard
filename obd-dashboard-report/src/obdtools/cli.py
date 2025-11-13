from __future__ import annotations
import argparse, os
from .report.html_report import build_html_from_csv
from .report.calc_export import csv_to_ods
from .logger.cli_adapter import main as logger_main

def main(argv=None):
    ap = argparse.ArgumentParser(prog="obdtools", description="OBD CSV tools")
    sub = ap.add_subparsers(dest="cmd", required=True)

    ap_html = sub.add_parser("html", help="Generate an offline HTML report from CSV")
    ap_html.add_argument("--in", dest="inp", required=True, help="Input CSV file (semicolon separator)")
    ap_html.add_argument("--out", dest="out", default=None, help="Output HTML file (default: outputs/html/<input>_report.html)")
    ap_html.add_argument("--pids", default="", help="Comma-separated PIDs to include")
    ap_html.add_argument("--exclude", default="", help="Comma-separated PIDs to exclude")
    ap_html.add_argument("--max-points", type=int, default=5000, help="Max points per chart")
    ap_html.add_argument("--rolling-sec", type=float, default=5.0, help="Rolling window in seconds (0 to disable)")
    ap_html.add_argument("--corr-top", type=int, default=12, help="PIDs in heatmap (by availability)")
    ap_html.add_argument("--title", default="OBD Report", help="Page title")
    ap_html.add_argument("--template", default=None, help="Custom HTML template path (optional)")

    ap_calc = sub.add_parser("calc", help="Convert CSV to ODS (Calc)")
    ap_calc.add_argument("--in", dest="inp", required=True, help="Input CSV")
    ap_calc.add_argument("--out", dest="out", default=None, help="Output ODS file (default: outputs/calc/<input>.ods)")

    ap_log = sub.add_parser("log", help="Run the OBD logger (CSV; optional ODS + HTML)")
    ap_log.add_argument("logger_args", nargs=argparse.REMAINDER, help="Pass-through to logger args (use after --)")

    args = ap.parse_args(argv)

    if args.cmd == "html":
        pids = [x.strip() for x in args.pids.split(',') if x.strip()] or None
        exclude = [x.strip() for x in args.exclude.split(',') if x.strip()] or None
        out = args.out or (os.path.join("outputs", "html", os.path.basename(args.inp).rsplit('.',1)[0] + "_report.html"))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        build_html_from_csv(args.inp, out_path=out, title=args.title, pids=pids, exclude=exclude,
                            rolling_sec=args.rolling_sec, max_points=args.max_points, corr_top=args.corr_top,
                            template_path=args.template)
        print(f"[ok] HTML written: {out}")
        return 0

    if args.cmd == "calc":
        out = args.out or (os.path.join("outputs", "calc", os.path.basename(args.inp).rsplit('.',1)[0] + ".ods"))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        csv_to_ods(args.inp, out)
        print(f"[ok] ODS written: {out}")
        return 0

    if args.cmd == "log":
        rest = args.logger_args or []
        return logger_main(rest)

if __name__ == "__main__":
    raise SystemExit(main())
