# tests/test_logger_mocked.py
from __future__ import annotations

import sys
import types
from pathlib import Path
import pytest

from obdtools.logger.runner import run_logger


# -----------------------
# Test doubles for python-OBD
# -----------------------

class FakeCmd:
    mode = 1
    def __init__(self, name: str):
        self.name = name
    def __hash__(self):
        return hash(self.name)
    def __eq__(self, other):
        return isinstance(other, FakeCmd) and self.name == other.name

class FakeResp:
    def __init__(self, val):
        self._val = val
    def is_null(self):
        return False
    @property
    def value(self):
        return self._val

class FakeConn:
    """Mimics obd.OBD connection object enough for our runner."""
    def __init__(self):
        self._supported = {FakeCmd("Engine RPM"), FakeCmd("Vehicle Speed")}
    def status(self): return "OK"
    def port_name(self): return "/dev/fake"
    def protocol_name(self): return "FAKE"
    def is_connected(self): return True
    @property
    def supported_commands(self):
        # runner iterates this set and filters by mode == 1
        return self._supported
    def query(self, cmd, force: bool = False):
        if cmd.name == "Engine RPM":
            return FakeResp(900.0)
        if cmd.name == "Vehicle Speed":
            return FakeResp(0.0)
        return FakeResp(None)
    def close(self): pass


def _inject_fake_obd(monkeypatch):
    """Ensure that 'import obd' inside the runner returns our fake."""
    fake_obd = types.ModuleType("obd")
    # runner does: conn = obd.OBD(...)
    fake_obd.OBD = lambda *a, **k: FakeConn()
    # stub minimal pour les DTCLogger
    cmds = types.SimpleNamespace()
    fake_obd.commands = cmds
    sys.modules["obd"] = fake_obd
    # No monkeypatch.setitem needed since we put it in sys.modules.


# -----------------------
# Tests
# -----------------------

def test_run_logger_writes_csv_and_stops_cleanly_with_systemexit(tmp_path, monkeypatch):
    """
    Stop the logger after the first loop by raising SystemExit from time.sleep.
    We EXPECT SystemExit, so pytest stays green and output is quiet.
    """
    _inject_fake_obd(monkeypatch)

    calls = {"n": 0}
    def fake_sleep(_):
        calls["n"] += 1
        # First call happens after one row is written => raise SystemExit to stop the loop.
        raise SystemExit()

    # Patch sleep used inside the module under test (not global time.sleep)
    monkeypatch.setattr("obdtools.logger.runner.time.sleep", fake_sleep)

    out_base = tmp_path / "csv" / "obd_all"

    with pytest.raises(SystemExit):
        run_logger(
            port="/dev/fake0",
            baud=None,
            interval=0.01,
            out_base=str(out_base),
            add_epoch=False,
            rotate_min=0,
            only="",
            skip="",
            ods=False,
            ods_save_every=5,
        )

    # Assert a CSV file was created and has at least header + units + one data row
    csv_files = sorted((tmp_path / "csv").glob("obd_all_*.csv"))
    assert csv_files, "No CSV files were written."
    p = csv_files[-1]
    lines = p.read_text(encoding="utf-8").splitlines()
    assert len(lines) >= 3
    # Header should include the two fake PIDs
    assert "Engine RPM" in lines[0] and "Vehicle Speed" in lines[0]


def test_run_logger_handles_keyboard_interrupt(tmp_path, monkeypatch):
    """
    Verify KeyboardInterrupt is propagated (we EXPECT it), so cleanup runs and test stays green.
    """
    _inject_fake_obd(monkeypatch)

    def boom(_):
        # Trigger KeyboardInterrupt at the first sleep call
        raise KeyboardInterrupt()

    monkeypatch.setattr("obdtools.logger.runner.time.sleep", boom)

    out_base = tmp_path / "csv" / "obd_all"

    with pytest.raises(KeyboardInterrupt):
        run_logger(
            port="/dev/fake0",
            baud=None,
            interval=0.01,
            out_base=str(out_base),
            add_epoch=False,
            rotate_min=0,
            only="",
            skip="",
            ods=False,
            ods_save_every=5,
        )

    # Still confirm a CSV was created before the interrupt
    csv_files = sorted((tmp_path / "csv").glob("obd_all_*.csv"))
    assert csv_files, "No CSV files were written on KeyboardInterrupt."
    p = csv_files[-1]
    lines = p.read_text(encoding="utf-8").splitlines()
    assert len(lines) >= 3
    assert "Engine RPM" in lines[0] and "Vehicle Speed" in lines[0]
