from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, Iterable, List, Optional, Tuple

# Reuse existing utils; no changes elsewhere
from ..utils.fileio import AtomicCSVWriter, make_timestamped_file, ensure_dir

# ---------- Defaults (kept here; no CLI flags) ----------
DEFAULT_OUT_DIR = Path("outputs/csv")
DEFAULT_PREFIX = "obd"              # filenames start with this prefix
DEFAULT_ENABLE_FREEZE = True        # capture freeze frame when new confirmed DTC appears
DEFAULT_TIMESTAMPED = True          # fresh files per run, like the main logger


def _now_iso_local() -> str:
    # Match main logger formatting: local ISO, space separator
    return datetime.now().isoformat(sep=" ")


def _conn_supports(conn: Any, cmd: Any) -> bool:
    try:
        return conn.supports(cmd)
    except Exception:
        return False


def _query(conn: Any, cmd: Any):
    """Safe single query; returns python-OBD value or None."""
    if cmd is None:
        return None
    try:
        if not _conn_supports(conn, cmd):
            return None
        r = conn.query(cmd)
        if r is None or r.is_null():
            return None
        return r.value
    except Exception:
        return None


def _normalize_dtc_list(val: Any) -> List[Tuple[str, str]]:
    """[(code, desc)] from various python-OBD shapes."""
    if val is None:
        return []
    try:
        return [(str(code), str(desc)) for code, desc in list(val)]
    except Exception:
        s = str(val)
        return [(s, "")] if s else []


def _set_of_codes(dtc_list: Iterable[Tuple[str, str]]) -> set[str]:
    return {code for code, _ in dtc_list}


def _status_to_dict(status_val: Any) -> dict:
    if status_val is None:
        return {}
    d = {}
    for attr in [
        "mil", "dtc_count", "misfire", "fuel_system", "components",
        "catalyst", "heated_catalyst", "evaporative_system",
        "secondary_air_system", "oxygen_sensor", "oxygen_sensor_heater",
        "egr_system",
    ]:
        if hasattr(status_val, attr):
            try:
                d[attr] = getattr(status_val, attr)
            except Exception:
                pass
    try:
        d["_repr"] = str(status_val)
    except Exception:
        pass
    return d


class DTCLogger:
    """
    Inline (non-threaded) DTC logger.
    - Do NOT import python-OBD here. Inject the 'obd' module via ctor.
    - Call .poll_once() from your main loop (e.g., every ~1s).
    - Call .close() on shutdown.

    Files (semicolon CSV, fresh per run):
      <prefix>_dtc_snapshot_YYYYMMDD_HHMMSS.csv
      <prefix>_dtc_events_YYYYMMDD_HHMMSS.csv
      <prefix>_dtc_freeze_YYYYMMDD_HHMMSS.csv
    """

    def __init__(
        self,
        conn: Any,
        obd_module: Any,
        *,
        out_dir: Path = DEFAULT_OUT_DIR,
        prefix: str = DEFAULT_PREFIX,
        timestamped: bool = DEFAULT_TIMESTAMPED,
        enable_freeze: bool = DEFAULT_ENABLE_FREEZE,
        lock: Optional[Any] = None,  # optional shared lock (if your main loop already has one)
    ) -> None:
        self.conn = conn
        self._obd = obd_module
        self._lock = lock
        self._enable_freeze = bool(enable_freeze)

        ensure_dir(out_dir)
        pre = f"{prefix}_" if prefix else ""

        if timestamped:
            snap_path = make_timestamped_file(out_dir, f"{pre}dtc_snapshot.csv", ".csv")
            ev_path   = make_timestamped_file(out_dir, f"{pre}dtc_events.csv", ".csv")
            frz_path  = make_timestamped_file(out_dir, f"{pre}dtc_freeze.csv", ".csv")
        else:
            snap_path = out_dir / f"{pre}dtc_snapshot.csv"
            ev_path   = out_dir / f"{pre}dtc_events.csv"
            frz_path  = out_dir / f"{pre}dtc_freeze.csv"

        self._snap = AtomicCSVWriter(
            snap_path,
            [
                "timestamp_iso",
                "mil_on",
                "dtc_count",
                "codes_pending",
                "codes_confirmed",
                "codes_permanent",
                "warmups_since_clear",
                "time_since_clear_min",
                "time_with_mil_on_min",
                "distance_with_mil_on_km",
                "distance_since_clear_km",
                "status_repr",
            ],
        )
        self._ev = AtomicCSVWriter(
            ev_path,
            [
                "timestamp_iso",
                "event",
                "mode",
                "code",
                "description",
                "mil_on",
                "pending_count",
                "confirmed_count",
                "permanent_count",
            ],
        )
        self._frz = AtomicCSVWriter(
            frz_path,
            ["timestamp_iso", "freeze_dtc_code", "freeze_dtc_desc", "pid_name", "value"],
        )

        # resolve commands from injected module
        cmds = getattr(self._obd, "commands")
        self.CMD_GET_DTC = getattr(cmds, "GET_DTC", None)
        self.CMD_GET_CURRENT_DTC = getattr(cmds, "GET_CURRENT_DTC", None)
        self.CMD_GET_PERMANENT_DTC = getattr(cmds, "GET_PERMANENT_DTC", None)
        self.CMD_STATUS = getattr(cmds, "STATUS", None)
        self.CMD_FREEZE_DTC = getattr(cmds, "FREEZE_DTC", None)
        self.CMD_WARMUPS_SINCE_CLEAR = getattr(cmds, "WARMUPS_SINCE_DTC_CLEAR", None)
        self.CMD_TIME_SINCE_CLEAR = getattr(cmds, "TIME_SINCE_DTC_CLEARED", None)
        self.CMD_TIME_WITH_MIL_ON = getattr(cmds, "TIME_WITH_MIL_ON", None)
        self.CMD_DISTANCE_WITH_MIL_ON = getattr(cmds, "DISTANCE_WITH_MIL_ON", None)
        self.CMD_DISTANCE_SINCE_CLEAR = getattr(cmds, "DISTANCE_SINCE_DTC_CLEARED", None)

        # all FREEZE FRAME PIDs start with "DTC_"
        self.DTC_PID_CMDS = []
        for name in dir(cmds):
            if name.startswith("DTC_"):
                try:
                    self.DTC_PID_CMDS.append(getattr(cmds, name))
                except Exception:
                    pass

        # edge-tracking state
        self._prev_pending: set[str] = set()
        self._prev_confirmed: set[str] = set()
        self._prev_permanent: set[str] = set()
        self._prev_mil: Optional[bool] = None
        self._last_freeze_code: Optional[str] = None

        self._supports = {
            "warmups": _conn_supports(self.conn, self.CMD_WARMUPS_SINCE_CLEAR),
            "time_since_clear": _conn_supports(self.conn, self.CMD_TIME_SINCE_CLEAR),
            "time_with_mil": _conn_supports(self.conn, self.CMD_TIME_WITH_MIL_ON),
            "dist_with_mil": _conn_supports(self.conn, self.CMD_DISTANCE_WITH_MIL_ON),
            "dist_since_clear": _conn_supports(self.conn, self.CMD_DISTANCE_SINCE_CLEAR),
            "freeze": _conn_supports(self.conn, self.CMD_FREEZE_DTC),
        }
        print("[DTC] support:", ", ".join(k for k,v in self._supports.items() if v))


    # ------------ public API ------------
    def poll_once(self) -> None:
        """Poll DTC-related PIDs once and write snapshot/event rows."""
        q = self._q

        pending   = _normalize_dtc_list(q(self.CMD_GET_CURRENT_DTC))
        confirmed = _normalize_dtc_list(q(self.CMD_GET_DTC))
        permanent = _normalize_dtc_list(q(self.CMD_GET_PERMANENT_DTC))
        status_val = q(self.CMD_STATUS)
        warmups = q(self.CMD_WARMUPS_SINCE_CLEAR)
        time_since_clear = q(self.CMD_TIME_SINCE_CLEAR)
        time_with_mil_on = q(self.CMD_TIME_WITH_MIL_ON)
        dist_mil_on = q(self.CMD_DISTANCE_WITH_MIL_ON)
        dist_since_clear = q(self.CMD_DISTANCE_SINCE_CLEAR)

        status = _status_to_dict(status_val)
        mil_on = bool(status.get("mil", False))
        dtc_count = int(status.get("dtc_count", 0))

        ts = _now_iso_local()
        set_p = _set_of_codes(pending)
        set_c = _set_of_codes(confirmed)
        set_perm = _set_of_codes(permanent)

        # snapshot row
        status_str = f"MIL={'ON' if mil_on else 'OFF'}; DTC={dtc_count}"
        self._snap.writerow([
            ts, int(mil_on), dtc_count,
            "|".join(sorted(set_p)), "|".join(sorted(set_c)), "|".join(sorted(set_perm)),
            str(warmups if warmups is not None else ""),
            str(time_since_clear if time_since_clear is not None else ""),
            str(time_with_mil_on if time_with_mil_on is not None else ""),
            str(dist_mil_on if dist_mil_on is not None else ""),
            str(dist_since_clear if dist_since_clear is not None else ""),
            status_str,  # <- use this instead of raw object repr
        ])

        # events (diffs)
        def log_event(event: str, mode: str, code: str, desc: str):
            self._ev.writerow([ts, event, mode, code, desc, int(mil_on), len(set_p), len(set_c), len(set_perm)])

        new_p = set_p - self._prev_pending
        cleared_p = self._prev_pending - set_p
        for code in sorted(new_p):
            desc = next((d for c, d in pending if c == code), "")
            log_event("appeared", "pending", code, desc)
        for code in sorted(cleared_p):
            log_event("cleared", "pending", code, "")

        new_c = set_c - self._prev_confirmed
        cleared_c = self._prev_confirmed - set_c
        for code in sorted(new_c):
            desc = next((d for c, d in confirmed if c == code), "")
            log_event("appeared", "confirmed", code, desc)
        for code in sorted(cleared_c):
            log_event("cleared", "confirmed", code, "")

        new_perm = set_perm - self._prev_permanent
        cleared_perm = self._prev_permanent - set_perm
        for code in sorted(new_perm):
            desc = next((d for c, d in permanent if c == code), "")
            log_event("appeared", "permanent", code, desc)
        for code in sorted(cleared_perm):
            log_event("cleared", "permanent", code, "")

        if self._prev_mil is not None and mil_on != self._prev_mil:
            log_event("mil_on" if mil_on else "mil_off", "-", "-", "-")

        if self._enable_freeze and (new_c or new_p):
            self._log_freeze_frame(confirmed)


        # update edges
        self._prev_pending, self._prev_confirmed, self._prev_permanent = set_p, set_c, set_perm
        self._prev_mil = mil_on

    def close(self) -> None:
        """Close files (call in your runner's finally)."""
        for w in (self._snap, self._ev, self._frz):
            try:
                w.close()
            except Exception:
                pass

    # ------------ internals ------------
    def _q(self, cmd: Any):
        if self._lock is None:
            return _query(self.conn, cmd)
        # Optional: serialize with your main lock if you already use one
        try:
            with self._lock:
                return _query(self.conn, cmd)
        except Exception:
            return _query(self.conn, cmd)

    def _log_freeze_frame(self, confirmed_list: List[Tuple[str, str]]) -> None:
        frz = self._q(self.CMD_FREEZE_DTC)
        frz_dtc = None
        frz_desc = ""
        if frz:
            try:
                frz_dtc, frz_desc = frz[0], frz[1] if len(frz) > 1 else ""
            except Exception:
                frz_dtc = str(frz)
        elif confirmed_list:
            frz_dtc, frz_desc = confirmed_list[0]

        if not frz_dtc or frz_dtc == self._last_freeze_code:
            return

        ts = _now_iso_local()
        cmds = self.DTC_PID_CMDS
        for cmd in cmds:
            name = getattr(cmd, "name", str(cmd))
            if name == "FREEZE_DTC":
                continue
            val = self._q(cmd)
            if val is None:
                continue
            self._frz.writerow([ts, frz_dtc, frz_desc, name, str(val)])

        self._last_freeze_code = frz_dtc
