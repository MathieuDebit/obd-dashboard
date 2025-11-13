#!/usr/bin/env python3
# dtc_to_text.py — convert the 3 DTC CSVs to a simple text report (semicolon CSVs)
import argparse, csv, glob, os, sys
from collections import defaultdict
from datetime import datetime

DELIM = ";"


def pick_latest(pattern: str) -> str | None:
    files = glob.glob(pattern)
    if not files:
        return None
    return max(files, key=os.path.getmtime)


def load_rows(path: str) -> list[list[str]]:
    with open(path, "r", encoding="utf-8") as f:
        r = csv.reader(f, delimiter=DELIM)
        rows = list(r)
    return rows


def parse_args():
    ap = argparse.ArgumentParser(description="Build a text report from DTC CSVs")
    ap.add_argument("--dir", default="outputs/csv", help="Folder to search (when files not given)")
    ap.add_argument("--snapshot", help="Path to *_dtc_snapshot_*.csv")
    ap.add_argument("--events", help="Path to *_dtc_events_*.csv")
    ap.add_argument("--freeze", help="Path to *_dtc_freeze_*.csv")
    ap.add_argument("--out", default="dtc_report.txt", help="Output text file")
    return ap.parse_args()


def main():
    args = parse_args()
    base = args.dir

    snap = args.snapshot or pick_latest(os.path.join(base, "*_dtc_snapshot_*.csv"))
    ev   = args.events   or pick_latest(os.path.join(base, "*_dtc_events_*.csv"))
    frz  = args.freeze   or pick_latest(os.path.join(base, "*_dtc_freeze_*.csv"))

    if not snap or not ev or not frz:
        print("[!] Missing DTC files. Provide --snapshot/--events/--freeze or check --dir.", file=sys.stderr)
        print("    snapshot:", snap, "\n    events:", ev, "\n    freeze:", frz, file=sys.stderr)
        sys.exit(2)

    # --- Snapshot: take the last row (most recent status)
    snap_rows = load_rows(snap)
    snap_head, snap_body = (snap_rows[0], snap_rows[1:]) if snap_rows else ([], [])
    last_snap = snap_body[-1] if snap_body else []
    snap_map = dict(zip(snap_head, last_snap)) if snap_head and last_snap else {}

    # --- Events: list them all (chronological as in file)
    ev_rows = load_rows(ev)
    ev_head, ev_body = (ev_rows[0], ev_rows[1:]) if ev_rows else ([], [])

    # --- Freeze: group by (timestamp_iso, freeze_dtc_code)
    frz_rows = load_rows(frz)
    frz_head, frz_body = (frz_rows[0], frz_rows[1:]) if frz_rows else ([], [])
    # Expected columns: timestamp_iso, freeze_dtc_code, freeze_dtc_desc, pid_name, value
    idx = {name: i for i, name in enumerate(frz_head)} if frz_head else {}
    groups = defaultdict(list)
    for row in frz_body:
        try:
            ts = row[idx.get("timestamp_iso", 0)]
            code = row[idx.get("freeze_dtc_code", 1)]
            desc = row[idx.get("freeze_dtc_desc", 2)]
            pid  = row[idx.get("pid_name", 3)]
            val  = row[idx.get("value", 4)]
        except Exception:
            # Fallback naive split if header unexpected
            ts, code, desc, pid, val = (row + ["", "", "", "", ""])[:5]
        groups[(ts, code, desc)].append((pid, val))

    # Build text
    lines: list[str] = []
    lines.append("DTC REPORT")
    lines.append("=" * 60)
    lines.append(f"Generated: {datetime.now().isoformat(sep=' ', timespec='seconds')}")
    lines.append("")
    lines.append("Files:")
    lines.append(f"  Snapshot: {snap}")
    lines.append(f"  Events  : {ev}")
    lines.append(f"  Freeze  : {frz}")
    lines.append("")

    # Snapshot summary
    lines.append("SNAPSHOT (latest)")
    lines.append("-" * 60)
    if snap_map:
        mil = snap_map.get("mil_on", "")
        cnt = snap_map.get("dtc_count", "")
        pend = snap_map.get("codes_pending", "")
        conf = snap_map.get("codes_confirmed", "")
        perm = snap_map.get("codes_permanent", "")
        lines.append(f"  Time                : {snap_map.get('timestamp_iso','')}")
        lines.append(f"  MIL ON              : {mil}")
        lines.append(f"  DTC count           : {cnt}")
        lines.append(f"  Pending codes       : {pend or '-'}")
        lines.append(f"  Confirmed codes     : {conf or '-'}")
        lines.append(f"  Permanent codes     : {perm or '-'}")
        lines.append(f"  Warmups since clear : {snap_map.get('warmups_since_clear','')}")
        lines.append(f"  Time since clear    : {snap_map.get('time_since_clear_min','')} min")
        lines.append(f"  Time with MIL ON    : {snap_map.get('time_with_mil_on_min','')} min")
        lines.append(f"  Dist w/ MIL ON      : {snap_map.get('distance_with_mil_on_km','')} km")
        lines.append(f"  Dist since clear    : {snap_map.get('distance_since_clear_km','')} km")
        if snap_map.get("status_repr"):
            lines.append(f"  Status repr         : {snap_map['status_repr']}")
    else:
        lines.append("  (no snapshot rows)")
    lines.append("")

    # Events list
    lines.append("EVENTS")
    lines.append("-" * 60)
    if ev_body:
        head_idx = {name: i for i, name in enumerate(ev_head)}
        for row in ev_body:
            ts = row[head_idx.get("timestamp_iso", 0)] if head_idx else (row[0] if row else "")
            evn = row[head_idx.get("event", 1)] if head_idx else ""
            mode = row[head_idx.get("mode", 2)] if head_idx else ""
            code = row[head_idx.get("code", 3)] if head_idx else ""
            desc = row[head_idx.get("description", 4)] if head_idx else ""
            mil = row[head_idx.get("mil_on", 5)] if head_idx else ""
            lines.append(f"  [{ts}] {evn:9s} | {mode:9s} | {code:8s} | {desc} | MIL:{mil}")
    else:
        lines.append("  (no events)")
    lines.append("")

    # Freeze frames
    lines.append("FREEZE FRAMES")
    lines.append("-" * 60)
    if groups:
        for (ts, code, desc), kv in sorted(groups.items()):
            lines.append(f"  [{ts}] DTC {code} — {desc or '-'}")
            for pid, val in kv:
                lines.append(f"     - {pid}: {val}")
            lines.append("")
    else:
        lines.append("  (no freeze-frame rows)")
        lines.append("")

    # Write report
    out = args.out
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Done. Wrote {out}")


if __name__ == "__main__":
    main()
