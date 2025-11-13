# obdtools — OBD-II Logger & Offline Visualizer

**obdtools** is a small, modular toolkit to:

* **Log** live OBD-II data to CSV (Mode 01), optionally writing a Calc-friendly **.ods** at the same time.
* **Generate** a fully offline, interactive **HTML report** from your CSV (Plotly charts, linked zoom, correlation heatmap).
* **Convert** CSV → **.ods** (Calc) later.

It’s designed to be:

* **Robust:** crash-safe CSV writes, units row, empty cells for missing values, rotation support.
* **Portable:** one self-contained HTML file with your data, plus a tiny `assets/` folder for CSS/JS.
* **Modular:** clear separation between logger, CSV parsing, plotting, and report generation.
* **Testable:** full pytest suite with **no hardware** required (OBD is mocked).

---

## Quick start

```bash
# 1) Create & activate a virtualenv (recommended)
python -m venv .venv
source .venv/bin/activate

# 2) Install (editable) for development
pip install -e .[logger]           # includes 'obd' (python-OBD) and 'odfpy' for ODS support
# if 'obd' wheel isn't available for your Python, fallback:
#   pip install -e .
#   pip install git+https://github.com/brendan-w/python-OBD

# 3) Run the logger (CSV by default)
obdtools log -- --port /dev/ttyUSB0 --interval 1.0 --out outputs/csv/obd_all

# 4) Build an offline HTML report from a CSV
obdtools html --in outputs/csv/trip.csv --out outputs/html/trip_report.html --title "Trip Report"

# 5) Convert to Calc (.ods)
obdtools calc --in outputs/csv/trip.csv --out outputs/calc/trip.ods
```

> **Note**
> The `obdtools` command comes from `[project.scripts]` in `pyproject.toml`.
> If you prefer, you can also run `python -m obdtools ...`.

---

## Project layout

```
obdtools_project/
├── pyproject.toml                # packaging (src/ layout), deps, console script
├── README.md                     # (you’re reading a generated version)
├── outputs/
│   ├── csv/                      # CSV produced by logger
│   ├── html/                     # HTML reports (assets auto-copied here)
│   └── calc/                     # ODS files
├── src/obdtools/
│   ├── cli.py                    # top-level CLI (subcommands: html, calc, log)
│   ├── logger/
│   │   ├── core.py               # low-level helpers for logging and ODS writing
│   │   ├── runner.py             # the logging loop (connect, discover PIDs, write rows)
│   │   └── cli_adapter.py        # logger-only CLI invoked by top-level CLI
│   ├── csvio/
│   │   └── readers.py            # CSV loading, units-row detection, timestamp parsing
│   ├── analysis/
│   │   ├── stats.py              # numeric coercion, summary stats (min/mean/max)
│   │   └── corr.py               # Pearson correlation heatmap
│   ├── plotting/
│   │   └── plotly_helpers.py     # per-PID figure creation (with optional rolling mean)
│   ├── report/
│   │   ├── html_report.py        # build HTML from DataFrame or CSV
│   │   ├── calc_export.py        # CSV → ODS converter (odfpy)
│   │   └── template_loader.py    # load embedded template, copy CSS/JS assets
│   ├── templates/
│   │   └── obd_quick_charts_template.html
│   ├── assets/
│   │   ├── css/report.css
│   │   └── js/report.js          # sidebar filter + linked zoom behavior
│   └── utils/
│       ├── names.py              # normalize header suffixes, safe HTML ids
│       └── downsample.py         # simple thinning for large series
└── tests/                        # pytest suite (no hardware)
    ├── conftest.py               # synthetic CSV fixtures & temp output folders
    ├── test_utils.py             # names & downsample utilities
    ├── test_csvio.py             # CSV parsing & units-row detection
    ├── test_report_template.py   # template load & asset copy
    ├── test_html_report.py       # HTML generation (from CSV & df)
    ├── test_calc_export.py       # CSV → ODS (skips if odfpy missing)
    ├── test_logger_mocked.py     # mocked OBD; loop stops cleanly; CSV written
    └── test_cli.py               # CLI smoke tests (html, calc)
```

---

## What each module does

### `obdtools.logger.core`

* **Precision & units**: fixed numeric precision (3 decimals).
* **Crash safety**: `safe_fsync()` flush + fsync per row.
* **CSV writing**: semicolon delimiter; two header rows:

  * Row 1: `timestamp_iso;date;time;[timestamp_epoch_ms?];PID...`
  * Row 2 (units): empty for the first time columns (and the optional epoch column), then unit strings per PID.
* **ODS support**: open/append/save ODS sheets using `odfpy`.

### `obdtools.logger.runner`

* **Connects** to ELM327 with `obd.OBD(portstr=..., baudrate=...)`.
* **Discovers PIDs** (Mode 01) using reported support + probing fallback.
* **Filters** PIDs using `--only` and/or `--skip` (case-insensitive).
* **Builds CSV header & units row** and starts sampling at a fixed `--interval`.
* **Writes** one row per tick; empty cells for missing values (Calc-friendly).
* **Rotation** with `--rotate-min` to start new files every N minutes.
* **ODS**: optional; `--ods` writes a parallel `.ods`, saved every `--ods-save-every` rows.

### `obdtools.csvio.readers`

* **detect_units_row**: peeks first two lines to decide if row 2 is units.
* **parse_time_column**: chooses timestamp from `timestamp_iso` → `date+time` → `timestamp_epoch_ms`.
* **load_csv_with_units**: loads CSV, skips units row if present, normalizes legacy headers (`PID [unit]` → `PID`), returns a sorted DataFrame with `_ts` (datetime) and a `units_map`.

### `obdtools.analysis.stats`

* **coerce_numeric**: for candidate PID columns, cast to numeric; keep columns that have any valid numbers.
* **summary_table_rows**: per-PID count, min, mean, max, unit.

### `obdtools.analysis.corr`

* **pearson_heatmap_fig**: top-N columns by non-null availability → Pearson correlation heatmap (Plotly).

### `obdtools.plotting.plotly_helpers`

* **per_pid_figure**: one time-series chart per PID; optional rolling mean; automatic `Scattergl` for very large series; shared hover (“x unified”).

### `obdtools.report.template_loader`

* **load_template**: returns embedded HTML template (or a custom path).
* **copy_assets**: copies packaged `assets/css/*.css` and `assets/js/*.js` into the output folder (next to the HTML file).

### `obdtools.report.html_report`

* **build_html_report**: from (DataFrame, units) → single HTML string:

  * sidebar of PIDs + quick filter,
  * **summary table** with min/mean/max,
  * **correlation heatmap** (Plotly, embedded),
  * **per-PID charts** (Plotly) with linked zoom (via `report.js`),
  * JSON payload of data injected into `window.OBD_DATA` for simple client-side interactions.
* **build_html_from_csv**: convenience wrapper; writes file & copies assets.

### `obdtools.report.calc_export`

* **csv_to_ods**: converts CSV to ODS preserving empty cells; numeric detection per cell; header and units rows carried over.

### `obdtools.utils.names`

* **normalize_header**: strips trailing “ `[unit]` ” from legacy CSV headers.
* **safe_id**: makes PID labels safe for HTML ids/anchors by collapsing non-alphanumerics to `_`.

### `obdtools.utils.downsample`

* **thin_slice**: simple downsampling (`slice`) to cap points per chart.

### `obdtools.cli`

* `obdtools html`: CSV → offline HTML report.
* `obdtools calc`: CSV → ODS.
* `obdtools log`: runs the logger; pass logger args **after `--`**.

---

## CSV format (generated by the logger)

* **Separator**: `;` (semicolon). This avoids decimal conflicts in many locales.
* **Decimal**: dot (`.`).
* **Rows**:

  1. **Header**: `timestamp_iso;date;time;[timestamp_epoch_ms?];PID...`
  2. **Units row**: empty for the time columns (and epoch), then the unit string per PID.
  3. **Data rows**: one per interval. Missing values are **empty cells**.
* **PID order**: alphabetic, stable per run after filtering.

Example:

```
timestamp_iso;date;time;timestamp_epoch_ms;Engine RPM;Vehicle Speed
;;;
2025-10-05 10:00:00;2025-10-05;10:00:00;1696500000000;844;0
2025-10-05 10:00:01;2025-10-05;10:00:01;1696500001000;850;0
...
```

---

## HTML report (features)

* **Standalone**, works offline (Plotly runtime embedded once for the heatmap; per-PID charts reuse it).
* **Sidebar**: quick PID filter and anchor links.
* **Summary**: per-PID count / min / mean / max with units.
* **Correlation heatmap**: quick way to spot relationships.
* **Per-PID charts**:

  * Linked zoom toggle (zoom/pan one chart → others follow).
  * Optional rolling mean (`--rolling-sec`).
  * Downsampling (`--max-points`) for very large logs.
  * `Scattergl` auto-switch for huge series.

---

## CLI reference

### Logger

```bash
# show options
obdtools log -- --help

# common usage
obdtools log -- \
  --port /dev/ttyUSB0 \
  --baud 115200 \
  --interval 1.0 \
  --out outputs/csv/obd_all \
  --add-epoch \
  --rotate-min 15 \
  --only rpm,speed,throttle \
  --ods --ods-save-every 5 \
  --html-export --title "My Drive"
```

### HTML

```bash
obdtools html \
  --in outputs/csv/trip.csv \
  --out outputs/html/trip_report.html \
  --pids rpm,speed,coolant_temp \
  --exclude fuel_level \
  --rolling-sec 5 \
  --max-points 5000 \
  --corr-top 12 \
  --title "Trip Report"
```

### Calc

```bash
obdtools calc \
  --in outputs/csv/trip.csv \
  --out outputs/calc/trip.ods
```

---

## Testing

We use **pytest**. Tests are **hardware-free** (no car, no ELM327).
Install test deps:

```bash
pip install -e .[dev]
```

Run tests:

```bash
pytest -q
```

Coverage (terminal only, **no file**) — create `.coveragerc`:

```ini
[run]
data_file = /dev/null
```

Then:

```bash
pytest --cov=obdtools --cov-report=term-missing
```

### What tests cover

* **CSV fixtures**: `tests/conftest.py` generates realistic CSVs with units row.
* **Utils**: header normalization, safe ids, downsampling.
* **CSV IO**: units detection, timestamp parsing, DataFrame shape.
* **Report template**: loads default template, copies assets.
* **HTML report**: from CSV and from DataFrame; files land in pytest temp dirs.
* **Calc export**: CSV → ODS (skips if `odfpy` isn’t installed).
* **Logger (mocked)**: injects a fake `obd` module; overrides `time.sleep` to stop after one loop.
  Two tests:

  * Stop via `SystemExit` (expected) → confirms a CSV row was written; no red output.
  * Stop via `KeyboardInterrupt` (expected) → cleanup path is exercised; still green.

> Generated files during tests live under pytest’s temp dirs (e.g., `/tmp/pytest-...`).
> In normal use, files go under `outputs/{csv,html,calc}` unless you specify `--out`.

---

## Design decisions (why it’s like this)

* **Semicolon CSV** & **dot decimals**: robust across EU locales and Calc.
* **Units row** (line 2): keeps headers clean; Calc reads better when numbers are numeric and units are separate.
* **Empty cells for missing values**: friendly for spreadsheets and numeric coercion.
* **Crash-safe** writing: flush + fsync per row minimizes loss on unplug/crash.
* **Linked zoom** & **correlation heatmap**: quick comparative analysis for relationships.
* **Modular code**: each concern (logging, CSV parsing, analysis, plotting, reporting) in its own module → easier to test and extend.

---

## Troubleshooting

* **`No module named 'obd'`**
  Install from PyPI: `pip install obd`
  If no wheel for your Python version: `pip install git+https://github.com/brendan-w/python-OBD`.

* **`/dev/ttyUSB0` not found**
  Check your ELM327 device path (Linux can be `/dev/ttyUSB1`, macOS `/dev/tty.usbserial...`). Ensure you have permission (e.g., add your user to `dialout` on Linux).

* **HTML command can’t find the CSV**
  Pass an absolute path, or `cd` to the repo root. Ensure the file really exists (check `ls outputs/csv`).

* **Where are test outputs?**
  In pytest temp dirs. Run with `-s` to print paths, or set a temp base: `pytest --basetemp ./.pytest_tmp`.

* **Exit & delete venv**
  `deactivate` then `rm -rf .venv`.

---

## Extending the project

* **Custom HTML look**: edit `src/obdtools/templates/obd_quick_charts_template.html` and `assets/css/report.css`.
  You can also pass `--template` to `obdtools html` to load an external file.

* **Add new calculated traces**: implement in `plotly_helpers.py` (e.g., overlaying derived signals), then include them in `html_report.py`.

* **Alternate outputs**: add exporters under `report/` (e.g., PDF or parquet) and a new subcommand in `cli.py`.

* **Unit mappings**: `load_csv_with_units` returns a `units_map`; extend logic if your PIDs need custom unit inference.

---

## Contributing

* Keep modules **small and focused**.
* Add **unit tests** for new features (no hardware assumptions).
* Run `pytest -q` locally before pushing.
* Consider adding a CI workflow (Python 3.11/3.12/3.13) with `pytest --cov`.

---

## License

MIT — see `pyproject.toml` for metadata.

---

## Glossary

* **OBD-II**: On-Board Diagnostics standard.
* **Mode 01**: “Show current data” — real-time PIDs (e.g., RPM, speed).
* **PID**: Parameter ID (e.g., RPM, throttle position).
* **ELM327**: Common OBD-II adapter chipset/protocol.
* **Calc**: LibreOffice Calc (.ods format supported via odfpy).
* **Plotly**: JS plotting library used for charts and heatmaps.

---