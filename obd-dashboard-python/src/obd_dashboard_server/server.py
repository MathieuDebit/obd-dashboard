#!/usr/bin/env python3
"""
OBD-II telemetry bridge that polls an ECU and streams JSON payloads via WebSocket.

This module provides a small CLI (`obd-dashboard-server` or `python -m obd_dashboard_server`) that:

  * Opens a serial (or socket) connection to an ELM327-compatible interface.
  * Periodically queries Mode 01 PIDs using python-OBD.
  * Caches the latest sample and serves it to any WebSocket client (the dashboard UI).

Typical usage::

    obd-dashboard-server --emulator
"""

from __future__ import annotations

import argparse
import asyncio
import asyncio.subprocess
from asyncio.subprocess import Process
import contextlib
import json
from datetime import datetime
import re
import sys
from typing import TYPE_CHECKING, Any, Dict, List, Optional
import obd
import websockets

if TYPE_CHECKING:
    from obd import OBD, OBDCommand
    from websockets.legacy.server import WebSocketServerProtocol


_COLOR_RESET = "\033[0m"
_COLOR_MAP = {
    "info": "\033[36m",      # cyan
    "success": "\033[32m",   # green
    "warning": "\033[33m",   # yellow
    "error": "\033[31m",     # red
}

DEFAULT_PORT = "/dev/ttyUSB0"
DEFAULT_WS_PORT = 8765
DEFAULT_EMULATOR_TIMEOUT = 5.0
_EMULATOR_PORT_PATTERN = re.compile(r"(/dev/pts/\d+)")


def _mode1_commands() -> List["OBDCommand"]:
    """
    Collect Mode 01 PIDs exposed by python-OBD.

    Returns:
        List of `OBDCommand` objects that represent Mode 01 requests with a PID.
    """

    commands_obj = getattr(obd, "commands", None)
    if commands_obj is None:
        return []
    discovered: List["OBDCommand"] = []
    for attr in dir(commands_obj):
        if attr.startswith("_"):
            continue
        cmd = getattr(commands_obj, attr, None)
        if cmd is None:
            continue
        mode = getattr(cmd, "mode", None)
        pid = getattr(cmd, "pid", None)
        if mode == 1 and pid is not None:
            discovered.append(cmd)
    return discovered


def _mode1_supported_commands(connection: "OBD") -> List["OBDCommand"]:
    """
    Filter the ECU-reported supported commands to only Mode 01 PIDs.
    """

    try:
        supported = list(connection.supported_commands)
    except Exception:
        return []
    return [
        cmd
        for cmd in supported
        if getattr(cmd, "mode", None) == 1 and getattr(cmd, "pid", None) is not None
    ]


def log(message: str, level: str = "info") -> None:
    """
    Emit a tagged, colorized log line to stderr.

    Args:
        message: Human-readable text to display.
        level: Optional severity keyword (`info`, `success`, `warning`, `error`).

    Returns:
        None. Writes the formatted string directly to stderr.
    """

    color = _COLOR_MAP.get(level, "")
    reset = _COLOR_RESET if color else ""
    print(f"{color}[obd-ws] {message}{reset}", file=sys.stderr)


def build_command_list(connection: "OBD", only_supported: bool) -> List["OBDCommand"]:
    """
    Resolve the list of Mode 01 commands to poll from the ECU.

    Args:
        connection: Active python-OBD connection.
        only_supported: Restrict to ECU-supported commands when True.

    Returns:
        A list of `OBDCommand` objects ready to be queried.
    """

    commands: List["OBDCommand"]
    if only_supported:
        commands = list(connection.supported_commands)
    else:
        commands = _mode1_commands()
    log(f"Prepared {len(commands)} commands (only_supported={only_supported}).")
    return commands


async def _push_latest(queue: asyncio.Queue[Dict[str, Any]], payload: Dict[str, Any]) -> None:
    """
    Keep only the most recent payload in the single-slot queue.

    Args:
        queue: The asyncio queue shared with websocket consumers.
        payload: The newest telemetry snapshot.

    Returns:
        None. Discards the previous payload if the queue is full.

    The websocket consumers only care about the newest sample, so a bounded queue
    avoids unnecessary backlog and backpressure handling in the rest of the code.
    """

    if queue.full():
        with contextlib.suppress(asyncio.QueueEmpty):
            queue.get_nowait()
    await queue.put(payload)


def _extract_emulator_port(line: str) -> Optional[str]:
    """
    Extract a /dev/pts/N path from a line emitted by the emulator.
    """

    match = _EMULATOR_PORT_PATTERN.search(line)
    return match.group(1) if match else None


async def _wait_for_emulator_port(stream: asyncio.StreamReader, detection_timeout: float) -> str:
    """
    Read emulator stdout until the pseudo-terminal path is advertised.
    """

    while True:
        try:
            line = await asyncio.wait_for(stream.readline(), timeout=detection_timeout)
        except asyncio.TimeoutError as exc:
            raise RuntimeError("Timed out waiting for the emulator pseudo-terminal.") from exc
        if not line:
            raise RuntimeError("Emulator exited before advertising a pseudo-terminal.")
        text = line.decode().rstrip()
        log(f"[emulator] {text}")
        port = _extract_emulator_port(text)
        if port:
            return port


async def _relay_emulator_output(stream: asyncio.StreamReader) -> None:
    """
    Continue relaying emulator stdout to our logger.
    """

    while True:
        line = await stream.readline()
        if not line:
            break
        log(f"[emulator] {line.decode().rstrip()}")


async def _spawn_emulator(scenario: str, detection_timeout: float) -> tuple[Process, asyncio.Task, str]:
    """
    Launch the elm emulator and wait until it prints the pseudo-terminal path.
    """

    log(f"Starting ELM emulator scenario '{scenario}'...", level="info")
    proc = await asyncio.create_subprocess_exec(
        sys.executable,
        "-m",
        "elm",
        "-s",
        scenario,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )
    if proc.stdout is None:
        raise RuntimeError("Emulator failed to expose stdout for synchronization.")
    port = await _wait_for_emulator_port(proc.stdout, detection_timeout)
    relay_task = asyncio.create_task(_relay_emulator_output(proc.stdout))
    log(f"ELM emulator ready on {port}", level="success")
    return proc, relay_task, port


async def _shutdown_emulator(proc: Optional[Process], relay_task: Optional[asyncio.Task]) -> None:
    """
    Terminate the emulator process and silence the relay task.
    """

    if relay_task:
        relay_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await relay_task
    if proc is None:
        return
    if proc.returncode is None:
        proc.terminate()
        try:
            await asyncio.wait_for(proc.wait(), timeout=5)
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()


async def poll_obd(connection: "OBD", cmds: List["OBDCommand"], interval: float, queue: asyncio.Queue[Dict[str, Any]]) -> None:
    """
    Continuously query the ECU and enqueue JSON-ready payloads.

    Args:
        connection: Active python-OBD session.
        cmds: Commands to execute during each polling cycle.
        interval: Seconds between sampling rounds (>= 0.2).
        queue: Sink for latest samples to share with websocket handlers.

    Returns:
        None. Runs until the surrounding task is cancelled.
    """

    reported_response_pids = False
    responded_names: set[str] = set()
    reported_failures: set[str] = set()

    while True:
        pids: Dict[str, Any] = {}
        for cmd in cmds:
            cmd_name = getattr(cmd, "name", str(cmd))
            if cmd_name in reported_failures:
                continue
            try:
                rsp = connection.query(cmd)
            except Exception as exc:
                if cmd_name not in reported_failures:
                    log(f"{cmd_name} not supported or query failed: {exc}", level="warning")
                    reported_failures.add(cmd_name)
                continue
            if rsp is None or rsp.is_null():
                if cmd_name not in reported_failures:
                    log(f"{cmd_name} not supported by ECU (null response)", level="warning")
                    reported_failures.add(cmd_name)
                continue
            value = rsp.value
            if value is None:
                if cmd_name not in reported_failures:
                    log(f"{cmd_name} responded with empty value", level="warning")
                    reported_failures.add(cmd_name)
                continue
            pids[cmd_name] = getattr(value, "magnitude", value)
            responded_names.add(cmd_name)
        if not reported_response_pids and responded_names:
            log(f"Responding Mode 01 PIDs: {', '.join(sorted(responded_names))}")
            reported_response_pids = True
        payload = {
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "pids": pids,
        }
        await _push_latest(queue, payload)
        await asyncio.sleep(interval)


async def consumer_handler(websocket: "WebSocketServerProtocol", queue: asyncio.Queue[Dict[str, Any]]) -> None:
    """
    Relay queue entries to a connected WebSocket client until they disconnect.

    Args:
        websocket: Client connection created by `websockets.serve`.
        queue: Source of the latest payload produced by `poll_obd`.

    Returns:
        None. Completes when the websocket is closed.
    """

    peer = getattr(websocket, "remote_address", "unknown")
    log(f"Client connected: {peer}.")
    try:
        while True:
            data = await queue.get()
            await websocket.send(json.dumps(data, default=str))
    except websockets.exceptions.ConnectionClosed:
        log(f"Client disconnected: {peer}.")


async def main_async(args: argparse.Namespace) -> None:
    """
    Wire together the ECU connection, polling task, and WebSocket server.

    Args:
        args: Parsed CLI arguments produced by `argparse`.

    Returns:
        None. Blocks until the websocket server finishes or the process exits.
    """

    emulator_proc: Optional[Process] = None
    emulator_log_task: Optional[asyncio.Task] = None
    selected_port = args.port or DEFAULT_PORT
    connection: Optional["OBD"] = None

    try:
        if args.emulator:
            emulator_proc, emulator_log_task, selected_port = await _spawn_emulator(
                args.emulator_scenario, args.emulator_timeout
            )

        log(f"Connecting to ECU on {selected_port}...")
        connection = obd.OBD(portstr=selected_port, baudrate=args.baudrate, fast=False, timeout=2)
        if not connection.is_connected():
            log("Unable to connect. Check interface, port or baudrate.", level="error")
            sys.exit(1)

        poll_task = None
        try:
            supported_cmds = _mode1_supported_commands(connection)
            supported_names = ", ".join(sorted(cmd.name for cmd in supported_cmds)) if supported_cmds else "none"
            log(f"Supported Mode 01 PIDs: {supported_names}")
            cmds = build_command_list(connection, args.only_supported)
            log(f"Streaming {len(cmds)} PIDs every {args.interval}s on ws://{args.host}:{args.ws_port}")

            queue = asyncio.Queue(maxsize=1)
            poll_task = asyncio.create_task(poll_obd(connection, cmds, args.interval, queue))

            async def handler(websocket, *_unused):
                # `websockets.serve` provides `(websocket, path)` but the path is unused here.
                await consumer_handler(websocket, queue)

            serve_kwargs = {"host": args.host, "port": args.ws_port}

            try:
                log(
                    f"WebSocket server listening on ws://{serve_kwargs['host']}:{serve_kwargs['port']}",
                    level="success",
                )
                async with websockets.serve(handler, **serve_kwargs):
                    try:
                        await asyncio.Future()
                    except asyncio.CancelledError:
                        log("Shutdown signal received; closing WebSocket server...", level="warning")
                        raise
            except OSError as exc:
                log(
                    f"Failed to bind ws://{serve_kwargs['host']}:{serve_kwargs['port']}: {exc}",
                    level="error",
                )
                sys.exit(1)
            except asyncio.CancelledError:
                pass
            finally:
                if poll_task:
                    poll_task.cancel()
                    with contextlib.suppress(asyncio.CancelledError):
                        await poll_task
        finally:
            if connection:
                with contextlib.suppress(Exception):
                    connection.close()
            log("OBD connection closed and websocket server stopped.")
    except asyncio.CancelledError:
        log("Shutdown requested. Bye!", level="warning")
    finally:
        await _shutdown_emulator(emulator_proc, emulator_log_task)

def main():
    """
    Parse CLI arguments, clamp defaults, and run the asyncio event loop.

    Returns:
        None. Hands control to the asyncio runner.
    """

    parser = argparse.ArgumentParser(
        prog="obd-dashboard-server",
        description="Stream Mode 01 OBD-II PIDs over WebSocket JSON",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
        add_help=False,
    )
    parser.add_argument("-h", "--help", action="help", help="Show this help message and exit.")
    parser.add_argument(
        "--port",
        default=None,
        help="Serial port or socket, e.g. /dev/ttyUSB0 or socket://localhost:35000 (default: auto)",
    )
    parser.add_argument("--baudrate", type=int, default=38400, help="Serial baud rate (default 38400)")
    parser.add_argument("--interval", type=float, default=1.0, help="Polling interval seconds (min 0.2, default 1.0)")
    parser.add_argument("--only_supported", action="store_true", help="Query only PIDs reported supported by ECU")
    parser.add_argument("--host", default="0.0.0.0", help="WebSocket bind host (default 0.0.0.0)")
    parser.add_argument("--ws_port", type=int, default=DEFAULT_WS_PORT, help="WebSocket port (default 8765)")
    parser.add_argument(
        "--emulator",
        action="store_true",
        help="Launch the built-in ELM emulator and auto-connect the server to it.",
    )
    parser.add_argument(
        "--emulator-scenario",
        default="car",
        help="Scenario to pass to python -m elm -s <scenario> when --emulator is used (default car).",
    )
    parser.add_argument(
        "--emulator-timeout",
        type=float,
        default=DEFAULT_EMULATOR_TIMEOUT,
        help="Seconds to wait for the emulator to expose its pseudo-terminal (default 5s).",
    )
    args = parser.parse_args()
    args.interval = max(0.2, args.interval)
    asyncio.run(main_async(args))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log("Shutting down...", level="warning")
        sys.exit(0)
