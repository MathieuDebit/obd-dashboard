
# obdtools

Clean, modular tools to **log OBD-II live data** and to **generate an offline interactive HTML report**.

## Install
### Python setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .[logger]
pip install -e .[test]

# exit venv
deactivate

# delete it (from project root)
rm -rf .venv
```

## Usage
### CLI
```bash
obdtools --help

obdtools log --port /dev/ttyUSB0 --interval 1.0 --out outputs/csv/obd_all --ods --html-export

# Convert CSV → ODS (Calc) later
obdtools calc --in outputs/csv/trip.csv --out outputs/calc/trip.ods

# Build offline HTML (uses packaged template + assets)
obdtools html --in outputs/csv/trip.csv --out outputs/html/trip_report.html
```

### Tests
```bash
pytest -q
# or
pytest --cov=obdtools --cov-report=term-missing
```

## Outputs
- CSV → `outputs/csv/`
- HTML → `outputs/html/` (assets auto-copied to `outputs/html/assets/`)
- Calc (.ods) → `outputs/calc/`
