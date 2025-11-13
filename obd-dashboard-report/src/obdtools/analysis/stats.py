from __future__ import annotations
from typing import List, Dict
import pandas as pd

__all__ = ["coerce_numeric", "summary_table_rows"]

def coerce_numeric(df: pd.DataFrame, columns: list[str]) -> list[str]:
    numeric_cols: List[str] = []
    for col in columns:
        s = pd.to_numeric(df[col], errors="coerce")
        if s.notna().any():
            df[col] = s
            numeric_cols.append(col)
    return numeric_cols

def summary_table_rows(df: pd.DataFrame, numeric_cols: list[str], units_map: dict[str, str]) -> list[dict]:
    rows: List[Dict] = []
    for col in numeric_cols:
        s = df[col]
        rows.append({
            "pid": col,
            "count": int(s.notna().sum()),
            "min": float(s.min(skipna=True)) if s.notna().any() else None,
            "mean": float(s.mean(skipna=True)) if s.notna().any() else None,
            "max": float(s.max(skipna=True)) if s.notna().any() else None,
            "unit": units_map.get(col, ""),
        })
    return rows
