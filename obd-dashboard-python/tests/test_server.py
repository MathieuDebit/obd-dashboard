from __future__ import annotations

import asyncio
import contextlib
import importlib
import sys
import types
from pathlib import Path
from typing import TYPE_CHECKING, Any, cast

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_PATH = PROJECT_ROOT / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

import pytest  # noqa: E402


def _install_test_stubs() -> None:
    if "obd" not in sys.modules:
        fake_obd = types.ModuleType("obd")

        class _DummyOBD:
            def __init__(self, *args, **kwargs):
                pass

            def is_connected(self) -> bool:
                return True

            def close(self) -> None:
                pass

            def query(self, _cmd):
                raise NotImplementedError

        setattr(fake_obd, "OBD", _DummyOBD)
        setattr(fake_obd, "commands", types.SimpleNamespace())
        sys.modules["obd"] = fake_obd

    if "websockets" not in sys.modules:
        fake_ws = types.ModuleType("websockets")

        class _ConnectionClosed(Exception):
            pass

        setattr(fake_ws, "exceptions", types.SimpleNamespace(ConnectionClosed=_ConnectionClosed))

        async def _unreachable(*_args, **_kwargs):
            raise RuntimeError("websockets.serve should not run in unit tests")

        setattr(fake_ws, "serve", _unreachable)
        sys.modules["websockets"] = fake_ws


class _FakeAsyncStream:
    def __init__(self, lines: list[str]):
        self._lines: list[bytes] = [line.encode() for line in lines]

    async def readline(self) -> bytes:
        if not self._lines:
            return b""
        return self._lines.pop(0)


_install_test_stubs()

if TYPE_CHECKING:
    server = cast(Any, None)
else:
    server = cast(Any, importlib.import_module("obd_dashboard_server.server"))


class DummyCommand:
    def __init__(self, name: str, mode: int = 1, pid: int | None = 0):
        self.name = name
        self.mode = mode
        self.pid = pid


class DummyConnection:
    def __init__(self, supported_commands: list[DummyCommand]):
        self.supported_commands = supported_commands


def test_build_command_list_only_supported():
    commands = [DummyCommand("A"), DummyCommand("B")]
    conn = DummyConnection(commands)

    result = server.build_command_list(conn, only_supported=True)

    assert result == commands


def test_build_command_list_filters_obd_commands(monkeypatch):
    class FakeCommands:
        A = DummyCommand("A", mode=1, pid=0x00)
        B = DummyCommand("B", mode=9, pid=0x01)
        C = DummyCommand("C", mode=1, pid=None)
        D = DummyCommand("D", mode=1, pid=0x02)

    monkeypatch.setattr(server.obd, "commands", FakeCommands, raising=False)
    conn = DummyConnection([])

    result = server.build_command_list(conn, only_supported=False)

    assert [cmd.name for cmd in result] == ["A", "D"]


@pytest.mark.asyncio
async def test_push_latest_keeps_newest_entry():
    queue: asyncio.Queue[dict[str, int]] = asyncio.Queue(maxsize=1)
    await queue.put({"value": 1})

    await server._push_latest(queue, {"value": 2})

    assert queue.qsize() == 1
    payload = await queue.get()
    assert payload["value"] == 2


@pytest.mark.asyncio
async def test_consumer_handler_sends_queue_payload(monkeypatch):
    queue: asyncio.Queue[dict[str, str]] = asyncio.Queue()

    class FakeWebSocket:
        def __init__(self):
            self.remote_address = "test-client"
            self.messages: list[str] = []

        async def send(self, data: str) -> None:
            self.messages.append(data)

    ws = FakeWebSocket()
    task = asyncio.create_task(server.consumer_handler(ws, queue))

    await queue.put({"hello": "world"})
    await asyncio.sleep(0)  # let handler run

    assert len(ws.messages) == 1

    task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await task


def test_extract_emulator_port():
    line = "Ready! Connect via /dev/pts/7 now."

    port = server._extract_emulator_port(line)

    assert port == "/dev/pts/7"


@pytest.mark.asyncio
async def test_wait_for_emulator_port_parses_stream():
    reader = _FakeAsyncStream(["Booting emulator...\n", "Connected to /dev/pts/8\n"])

    port = await server._wait_for_emulator_port(reader, detection_timeout=1)

    assert port == "/dev/pts/8"
