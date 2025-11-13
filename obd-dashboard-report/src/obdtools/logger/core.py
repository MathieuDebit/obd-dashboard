from __future__ import annotations
import os, math, datetime as dt
from typing import List, Tuple, Dict

PRECISION = 3
NULL_CELL = ""

try:
    import obd
    from obd import OBDCommand
    from obd import commands as OBD_CMDS
except Exception:
    obd = None
    OBDCommand = object
    OBD_CMDS = None

ODF_AVAILABLE = False
try:
    from odf.opendocument import OpenDocumentSpreadsheet
    from odf.table import Table, TableRow, TableCell
    from odf.text import P
    ODF_AVAILABLE = True
except Exception:
    pass

def safe_fsync(f):
    try:
        f.flush()
    except Exception:
        return
    try:
        os.fsync(f.fileno())
    except Exception:
        pass

def list_supported_commands(connection) -> List["OBDCommand"]:
    supported: List["OBDCommand"] = []
    try:
        for cmd in getattr(connection, "supported_commands", set()):
            try:
                if getattr(cmd, "mode", None) == 1:
                    supported.append(cmd)
            except Exception:
                continue
    except Exception:
        supported = []

    if not supported and OBD_CMDS is not None:
        candidates: List[Tuple[str, "OBDCommand"]] = []
        for name, obj in OBD_CMDS.__dict__.items():
            try:
                if isinstance(obj, OBDCommand) and getattr(obj, "mode", None) == 1:
                    candidates.append((name, obj))
            except Exception:
                continue
        candidates.sort(key=lambda x: x[0])
        for _name, cmd in candidates:
            try:
                if connection.supports(cmd):
                    supported.append(cmd); continue
            except Exception:
                pass
            try:
                r = connection.query(cmd, force=True)
                if r is not None and not r.is_null() and getattr(r, "value", None) is not None:
                    supported.append(cmd)
            except Exception:
                pass

    try:
        supported.sort(key=lambda c: getattr(c, "name", ""))
    except Exception:
        pass
    return supported

def detect_units_map(connection, cmds: List["OBDCommand"]) -> Dict[str, str]:
    units: Dict[str, str] = {}
    for cmd in cmds:
        name = getattr(cmd, "name", "UNKNOWN")
        unit = ""
        try:
            r = connection.query(cmd, force=True)
            if r is not None and not r.is_null() and getattr(r, "value", None) is not None:
                v = r.value
                u = getattr(v, "units", None) or getattr(v, "unit", None) or ""
                unit = str(u) if u else ""
        except Exception:
            pass
        units[name] = unit
    return units

def number_cell(mag):
    try:
        x = float(mag)
        if not math.isfinite(x):
            return str(mag)
        return round(x, PRECISION)
    except Exception:
        return str(mag)

def value_to_cell(resp_value):
    if resp_value is None:
        return NULL_CELL
    try:
        mag = getattr(resp_value, "magnitude", resp_value)
    except Exception:
        mag = resp_value
    try:
        return number_cell(mag)
    except Exception:
        s = str(resp_value)
        return s if s else NULL_CELL

def make_output_filename(base_name: str, ext: str) -> str:
    ts = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    bn = base_name[:-4] if base_name.lower().endswith(ext) else base_name
    return f"{bn}_{ts}{ext}"

def open_csv_with_header(path: str, header: list[str], units_row: list[str]):
    import csv
    f = open(path, "w", newline="", encoding="utf-8")
    w = csv.writer(f, delimiter=';')
    w.writerow(header); w.writerow(units_row)
    safe_fsync(f)
    return f, w

def ods_open_with_header(path: str, header: list[str], units_row: list[str]):
    if not ODF_AVAILABLE:
        raise RuntimeError("odfpy not available; install it")
    doc = OpenDocumentSpreadsheet()
    table = Table(name="OBD")
    tr = TableRow()
    for h in header:
        cell = TableCell(valuetype="string"); cell.addElement(P(text=str(h))); tr.addElement(cell)
    table.addElement(tr)
    tr2 = TableRow()
    for u in units_row:
        cell = TableCell(valuetype="string"); cell.addElement(P(text=str(u))); tr2.addElement(cell)
    table.addElement(tr2)
    doc.spreadsheet.addElement(table)
    doc.save(path)
    return doc, table

def ods_append_row(doc, table, row: list, save_path: str, save_now: bool):
    from odf.table import TableRow, TableCell
    from odf.text import P
    tr = TableRow()
    for val in row:
        if val is None or val == "":
            cell = TableCell(); tr.addElement(cell); continue
        if isinstance(val, (int, float)) and not isinstance(val, bool):
            cell = TableCell(valuetype="float", value=str(val)); tr.addElement(cell)
        else:
            cell = TableCell(valuetype="string"); cell.addElement(P(text=str(val))); tr.addElement(cell)
    table.addElement(tr)
    if save_now:
        doc.save(save_path)
