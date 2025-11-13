from __future__ import annotations
import argparse, os
from .runner import run_logger
from ..report.html_report import build_html_from_csv

def main(argv=None):
    ap = argparse.ArgumentParser(description="OBD all-in-one logger (CSV + optional ODS + optional HTML)")
    ap.add_argument("--port", default="/dev/ttyUSB0", help="Serial port (default: /dev/ttyUSB0)")
    ap.add_argument("--baud", type=int, default=None, help="Baud rate (default: auto)")
    ap.add_argument("--interval", type=float, default=1.0, help="Sampling interval in seconds (default: 1.0)")
    ap.add_argument("--out", default="outputs/csv/obd_all", help="Base name for CSV files; timestamp appended")
    ap.add_argument("--add-epoch", action="store_true", help="Add numeric timestamp_epoch_ms column")
    ap.add_argument("--rotate-min", type=int, default=0, help="Start a new file every N minutes (0=disabled)")
    ap.add_argument("--only", default="", help="Comma-separated PID names to include (case-insensitive)")
    ap.add_argument("--skip", default="", help="Comma-separated PID names to exclude (case-insensitive)")
    ap.add_argument("--ods", action="store_true", help="Also write an .ods spreadsheet (requires odfpy)")
    ap.add_argument("--ods-save-every", type=int, default=5, help="Save .ods every N rows")
    ap.add_argument("--html-export", action="store_true", help="On stop, build an HTML report for the last CSV")
    ap.add_argument("--title", default="OBD Report", help="Report title (when --html-export)")
    args = ap.parse_args(argv)

    last_csv = run_logger(port=args.port, baud=args.baud, interval=args.interval, out_base=args.out,
                          add_epoch=args.add_epoch, rotate_min=args.rotate_min, only=args.only, skip=args.skip,
                          ods=args.ods, ods_save_every=args.ods_save_every)
    if args.html_export:
        base = os.path.splitext(os.path.basename(last_csv))[0]
        out_html = os.path.join("outputs", "html", base + "_report.html")
        os.makedirs(os.path.dirname(out_html), exist_ok=True)
        build_html_from_csv(last_csv, out_path=out_html, title=args.title)
        print(f"[ok] HTML report written: {out_html}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
