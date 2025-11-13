from __future__ import annotations
import os, sys, time, signal, datetime as dt
from .core import (safe_fsync, list_supported_commands, detect_units_map, value_to_cell,
                   NULL_CELL, open_csv_with_header, ods_open_with_header, ods_append_row,
                   make_output_filename)
from .dtc import DTCLogger

def run_logger(*, port: str = "/dev/ttyUSB0", baud: int | None = None, interval: float = 1.0,
               out_base: str = "outputs/csv/obd_all", add_epoch: bool = False, rotate_min: int = 0,
               only: str = "", skip: str = "", ods: bool = False, ods_save_every: int = 5) -> str:
    """Run the logger until Ctrl+C. Returns last CSV path written."""
    try:
        import obd
    except Exception as e:
        print("python-OBD not installed. Install with: pip install python-OBD", file=sys.stderr)
        raise

    if port and not os.path.exists(port):
        print(f"[!] Serial port not found: {port}", file=sys.stderr)

    try:
        print("[*] Connecting to ELM327 on serial port...", flush=True)
        conn = obd.OBD(portstr=port, baudrate=baud)
    except Exception as e:
        raise SystemExit(f"[-] Failed to open OBD connection on {port}: {e}")

    try:
        print(f"[*] Status: {conn.status()} | Port: {conn.port_name()} | Protocol: {conn.protocol_name()}")
    except Exception:
        pass

    if not conn.is_connected():
        try: conn.close()
        except Exception: pass
        raise SystemExit("[-] Could not connect to vehicle (check ignition ON and cabling)")

    # Inline DTC helper (no thread, no args; defaults live inside DTCLogger)
    dtc = DTCLogger(conn, obd_module=obd)

    # Main sampling cadence (keep your existing default/arg here)
    interval_s = max(0.05, float(interval))  # or whatever your logger already uses

    # Pacing with monotonic time (robust to system clock jumps)
    next_t = time.monotonic()

    # Tick DTC roughly once per second (same cadence as before)
    last_dtc_tick = 0.0


    print("[*] Discovering supported PIDs (Mode 01)...", flush=True)
    supported_cmds = list_supported_commands(conn)
    if not supported_cmds:
        try: conn.close()
        except Exception: pass
        raise SystemExit("[-] No live (Mode 01) commands reported as supported.")

    print("[*] Supported PIDs:")
    for cmd in supported_cmds:
        try: print(f"   - {getattr(cmd, 'name', str(cmd))}")
        except Exception: pass
    print("")

    def norm(s: str) -> str:
        return s.strip().lower().replace(' ', '_')

    only_set = {norm(x) for x in only.split(',') if x.strip()} if only else set()
    skip_set = {norm(x) for x in skip.split(',') if x.strip()} if skip else set()

    filtered_cmds = []
    for c in supported_cmds:
        name = getattr(c, 'name', 'UNKNOWN')
        n = norm(name)
        if only_set and n not in only_set: continue
        if skip_set and n in skip_set: continue
        filtered_cmds.append(c)

    if not filtered_cmds:
        try: conn.close()
        except Exception: pass
        raise SystemExit("[-] After applying --only/--skip, no PIDs remain.")

    try:
        units_map = detect_units_map(conn, filtered_cmds)
    except Exception:
        units_map = {}

    base_header = ["timestamp_iso", "date", "time"]
    if add_epoch:
        base_header.append("timestamp_epoch_ms")
    pid_names = [getattr(c, "name", "UNKNOWN") for c in filtered_cmds]
    header = base_header + pid_names

    units_row = ["", "", ""] + ([""] if add_epoch else [])
    for name in pid_names:
        units_row.append(units_map.get(name, ""))

    os.makedirs(os.path.dirname(out_base), exist_ok=True)
    csv_path = make_output_filename(out_base, ".csv")
    f_csv, w_csv = open_csv_with_header(csv_path, header, units_row)

    ods_doc = ods_table = None
    ods_path = None
    rows_since_ods_save = 0
    if ods:
        try:
            os.makedirs("outputs/calc", exist_ok=True)
            ods_path = make_output_filename("outputs/calc/" + os.path.basename(out_base), ".ods")
            from .core import ODF_AVAILABLE
            if not ODF_AVAILABLE:
                print("[!] --ods requested but odfpy is missing.", file=sys.stderr)
            else:
                ods_doc, ods_table = ods_open_with_header(ods_path, header, units_row)
        except Exception as e:
            print(f"[!] Failed to create ODS: {e}", file=sys.stderr)
            ods_doc = ods_table = None

    file_start = dt.datetime.now()
    running = True
    def stop(_s, _f):
        nonlocal running
        running = False
    try:
        signal.signal(signal.SIGINT, stop); signal.signal(signal.SIGTERM, stop)
    except Exception:
        pass

    print(f"[*] Logging started. Writing to: {csv_path}" + (f" and {ods_path}" if ods_path else ""))
    print("[*] Press Ctrl+C to stop.")

    last_csv = csv_path
    try:
        while running:
            now = dt.datetime.now()

            # Build CSV row
            row = [now.isoformat(sep=' '), now.date().isoformat(), now.strftime("%H:%M:%S")]
            if add_epoch:
                row.append(int(now.timestamp() * 1000))

            # Query PIDs
            for cmd in filtered_cmds:
                try:
                    r = conn.query(cmd)
                    if r is None or r.is_null():
                        row.append(NULL_CELL)
                    else:
                        row.append(value_to_cell(r.value))
                except Exception:
                    row.append(NULL_CELL)

            # Write CSV
            try:
                w_csv.writerow(row)
                safe_fsync(f_csv)
            except Exception as e:
                print(f"[!] CSV write error: {e}", file=sys.stderr)

            # ODS append
            if ods_doc and ods_table:
                try:
                    ods_append_row(ods_doc, ods_table, row, ods_path, False)
                    rows_since_ods_save += 1
                    if rows_since_ods_save >= max(1, ods_save_every):
                        ods_doc.save(ods_path)
                        rows_since_ods_save = 0
                except Exception as e:
                    print(f"[!] ODS write error: {e}", file=sys.stderr)

            # inline DTC tick every ~1.0s, no threading
            try:
                now_mono = time.monotonic()
                if now_mono - last_dtc_tick >= 1.0:
                    dtc.poll_once()           # safe, internal try/except in dtc.py keeps it quiet
                    last_dtc_tick = now_mono
            except Exception as e:
                # keep logger resilient if DTC has a hiccup
                print(f"[!] DTC poll error: {e}", file=sys.stderr)

            # Rotation
            if rotate_min and rotate_min > 0:
                elapsed = (now - file_start).total_seconds() / 60.0
                if elapsed >= rotate_min:
                    # Close current CSV
                    try:
                        safe_fsync(f_csv)
                        f_csv.close()
                    except Exception:
                        pass

                    # Open new CSV
                    csv_path = make_output_filename(out_base, ".csv")
                    try:
                        f_csv, w_csv = open_csv_with_header(csv_path, header, units_row)
                        file_start = now
                        last_csv = csv_path
                        print(f"[*] Rotated file. Now writing to: {csv_path}")
                    except Exception as e:
                        print(f"[-] Cannot open new CSV '{csv_path}': {e}", file=sys.stderr)
                        break

                    # Rotate ODS too (if enabled)
                    if ods_doc and ods_table:
                        try:
                            ods_doc.save(ods_path)
                        except Exception:
                            pass
                        ods_path = make_output_filename("outputs/calc/" + os.path.basename(out_base), ".ods")
                        try:
                            from .core import ods_open_with_header
                            ods_doc, ods_table = ods_open_with_header(ods_path, header, units_row)
                            rows_since_ods_save = 0
                            print(f"[*] Rotated ODS. Now writing to: {ods_path}")
                        except Exception as e:
                            print(f"[!] Cannot open new ODS '{ods_path}': {e}", file=sys.stderr)
                            ods_doc = ods_table = None

            # Pace the loop
            try:
                time.sleep(max(0.0, interval))
            except Exception:
                pass

    finally:
        try: safe_fsync(f_csv); f_csv.close()
        except Exception: pass
        if ods_doc:
            try: ods_doc.save(ods_path)
            except Exception: pass
        try: conn.close()
        except Exception: pass

        try: dtc.close()
        except Exception: pass
    print("[*] Done.")
    return last_csv
