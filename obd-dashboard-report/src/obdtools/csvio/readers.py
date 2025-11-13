from __future__ import annotations
import re
from typing import Dict, List, Tuple
import pandas as pd

from ..utils.names import normalize_header

__all__ = [
    "detect_units_row",
    "load_csv_with_units",
    "parse_time_column",
]

def detect_units_row(csv_path: str, sep: str = ";") -> Tuple[list[str], dict[str, str], bool]:
    """Return (headers, units_map, has_units_row) by inspecting the first two lines."""
    headers: List[str] = []
    units_map: Dict[str, str] = {}
    has_units = False

    with open(csv_path, "r", encoding="utf-8") as f:
        first = f.readline()
        if not first:
            return headers, units_map, False
        headers = [h.strip() for h in first.rstrip("\n\r").split(sep)]
        second = f.readline()
        if not second:
            return headers, units_map, False
        raw = [c.strip() for c in second.rstrip("\n\r").split(sep)]
        if len(raw) == len(headers):
            non_empty = sum(1 for x in raw if x)
            digits_like = sum(1 for x in raw if re.search(r"[0-9]", x or ""))
            if non_empty > 0 and digits_like <= non_empty // 2:
                for h, u in zip(headers, raw):
                    if u:
                        units_map[h] = u
                has_units = True
    return headers, units_map, has_units

def parse_time_column(df: pd.DataFrame) -> pd.Series:
    """Choose timestamp: timestamp_iso or date+time or timestamp_epoch_ms (ms)."""
    if "timestamp_iso" in df.columns:
        ts = pd.to_datetime(df["timestamp_iso"], errors="coerce")
    elif {"date", "time"}.issubset(df.columns):
        ts = pd.to_datetime(df["date"].astype(str) + " " + df["time"].astype(str), errors="coerce")
    elif "timestamp_epoch_ms" in df.columns:
        ts = pd.to_datetime(pd.to_numeric(df["timestamp_epoch_ms"], errors="coerce"), unit="ms", errors="coerce")
    else:
        raise ValueError("No time columns found (need 'timestamp_iso' or 'date'+'time' or 'timestamp_epoch_ms').")
    if ts.isna().all():
        raise ValueError("All timestamps failed to parse.")
    return ts

def load_csv_with_units(csv_path: str, sep: str = ";") -> tuple[pd.DataFrame, dict[str, str]]:
    """Load CSV, skip the units row (if present), normalize headers with ' [unit]' suffix."""
    headers, units_map, has_units = detect_units_row(csv_path, sep=sep)
    df = pd.read_csv(csv_path, sep=sep, header=0, skiprows=[1] if has_units else None, na_values=[""], low_memory=False)
    ts = parse_time_column(df)
    df = df.assign(_ts=ts).dropna(subset=["_ts"]).sort_values("_ts")
    known_time = {"timestamp_iso", "date", "time", "timestamp_epoch_ms", "_ts"}
    candidates = [c for c in df.columns if c not in known_time]
    if candidates:
        ren = {c: normalize_header(c) for c in candidates}
        df.rename(columns=ren, inplace=True)
        units_map = {normalize_header(k): v for k, v in units_map.items()}
    return df, units_map
