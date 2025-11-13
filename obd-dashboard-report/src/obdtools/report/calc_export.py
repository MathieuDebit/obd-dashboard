from __future__ import annotations
import csv
from typing import List
from ..csvio.readers import detect_units_row

def csv_to_ods(csv_path: str, out_path: str, sep: str = ";") -> None:
    """
    Convert the logger CSV (semicolon; optional units row as 2nd line) into a Calc-friendly .ods.
    Empty cells stay empty. Numeric cells become numeric, others are strings.
    """
    try:
        from odf.opendocument import OpenDocumentSpreadsheet
        from odf.table import Table, TableRow, TableCell
        from odf.text import P
    except Exception as e:
        raise RuntimeError("odfpy not available. Install it: pip install odfpy") from e

    headers, _units_map, has_units = detect_units_row(csv_path, sep=sep)

    # Read raw CSV rows
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter=sep)
        rows = list(reader)

    if not rows:
        raise RuntimeError("Empty CSV")

    doc = OpenDocumentSpreadsheet()
    table = Table(name="OBD")

    def add_row(cells: List[str], numeric_mask: List[bool] | None = None):
        tr = TableRow()
        for i, val in enumerate(cells):
            text = "" if val is None else str(val)
            if text == "":
                tr.addElement(TableCell())  # empty cell
                continue
            if numeric_mask and numeric_mask[i]:
                try:
                    float(text)
                    tr.addElement(TableCell(valuetype="float", value=text))
                    continue
                except Exception:
                    pass
            cell = TableCell(valuetype="string")
            cell.addElement(P(text=text))
            tr.addElement(cell)
        table.addElement(tr)

    # Header
    add_row(rows[0], numeric_mask=[False] * len(rows[0]))

    # Optional units row
    start = 1
    if has_units and len(rows) > 1:
        add_row(rows[1], numeric_mask=[False] * len(rows[1]))
        start = 2

    # Data rows
    for r in rows[start:]:
        mask: List[bool] = []
        for c in r:
            try:
                # Treat empty as non-numeric (keeps cell empty above)
                if c is None or c == "":
                    mask.append(False)
                else:
                    float(c)
                    mask.append(True)
            except Exception:
                mask.append(False)
        add_row(r, numeric_mask=mask)

    doc.spreadsheet.addElement(table)
    doc.save(out_path)
