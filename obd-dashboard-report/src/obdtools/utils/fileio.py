from __future__ import annotations
import csv
import os
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable, Sequence

SEMICOLON = ";"

def safe_fsync(fobj) -> None:
    try:
        fobj.flush()
    except Exception:
        return
    try:
        os.fsync(fobj.fileno())
    except Exception:
        pass

def ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)

def timestamp_suffix() -> str:
    # Match main logger (local time, yyyymmdd_hhmmss)
    return datetime.now().strftime("%Y%m%d_%H%M%S")

def make_timestamped_file(out_dir: Path, base: str, ext: str) -> Path:
    ensure_dir(out_dir)
    suf = timestamp_suffix()
    stem = base[:-len(ext)] if base.lower().endswith(ext) else base
    return out_dir / f"{stem}_{suf}{ext}"

@dataclass
class AtomicCSVWriter:
    path: Path
    header: Sequence[str]
    delimiter: str = SEMICOLON

    def __post_init__(self) -> None:
        ensure_dir(self.path.parent)
        new_file = not self.path.exists()
        self._f = self.path.open("a", newline="", encoding="utf-8")
        self._w = csv.writer(self._f, delimiter=self.delimiter)
        if new_file and self.header:
            self._w.writerow(self.header)
            safe_fsync(self._f)

    def writerow(self, row: Sequence[object]) -> None:
        self._w.writerow(row)
        safe_fsync(self._f)

    def close(self) -> None:
        try:
            self._f.close()
        except Exception:
            pass
