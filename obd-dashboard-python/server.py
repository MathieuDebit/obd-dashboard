#!/usr/bin/env python3
"""
OBD-II telemetry bridge that polls an ECU and streams JSON payloads via WebSocket.

This module provides a small CLI (`python server.py ...`) that:

  * Opens a serial (or socket) connection to an ELM327-compatible interface.
  * Periodically queries Mode 01 PIDs using python-OBD.
  * Caches the latest sample and serves it to any WebSocket client (the dashboard UI).

Typical usage::

    python server.py --port /dev/ttyUSB0 --only_supported --interval 1 --ws_port 8765
"""

from __future__ import annotations

import argparse
import asyncio
import contextlib
import json
from datetime import datetime
import sys
from typing import TYPE_CHECKING, Any, Dict, Iterable, List, cast
import obd
import websockets

if TYPE_CHECKING:
    from obd import OBD, OBDCommand
    from websockets.server import WebSocketServerProtocol


def build_command_list(connection: "OBD", only_supported: bool) -> List["OBDCommand"]:
    """
    Resolve the list of Mode 01 commands to poll from the ECU.

    Args:
        connection: Active python-OBD connection.
        only_supported: Restrict to ECU-supported commands when True.

    Returns:
        A list of `OBDCommand` objects ready to be queried.
    """

    if only_supported:
        return list(connection.supported_commands)
    available: Iterable["OBDCommand"] = cast(Iterable["OBDCommand"], getattr(obd, "commands", []))
    return [c for c in available if getattr(c, "mode", None) == 1 and getattr(c, "pid", None) is not None]


async def _push_latest(queue: asyncio.Queue, payload: Dict[str, Any]) -> None:
    """
    Keep only the most recent payload in the single-slot queue.

    Args:
        queue: The asyncio queue shared with websocket consumers.
        payload: The newest telemetry snapshot.

    Returns:
        None. Discards the previous payload if the queue is full.
    """

    if queue.full():
        with contextlib.suppress(asyncio.QueueEmpty):
            queue.get_nowait()
    await queue.put(payload)


async def poll_obd(connection: "OBD", cmds: List["OBDCommand"], interval: float, queue: asyncio.Queue) -> None:
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

    while True:
        pids: Dict[str, Any] = {}
        for cmd in cmds:
            try:
                rsp = connection.query(cmd)
            except Exception as exc:
                print(f"[poll] Failed to query {getattr(cmd, 'name', cmd)}: {exc}", file=sys.stderr)
                continue
            if rsp is None or rsp.is_null():
                continue
            value = rsp.value
            if value is None:
                continue
            pids[cmd.name] = getattr(value, "magnitude", value)
        payload = {
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "pids": pids,
        }
        await _push_latest(queue, payload)
        await asyncio.sleep(interval)


async def consumer_handler(websocket: "WebSocketServerProtocol", queue: asyncio.Queue) -> None:
    """
    Relay queue entries to a connected WebSocket client until they disconnect.

    Args:
        websocket: Client connection created by `websockets.serve`.
        queue: Source of the latest payload produced by `poll_obd`.

    Returns:
        None. Completes when the websocket is closed.
    """

    try:
        while True:
            data = await queue.get()
            await websocket.send(json.dumps(data, default=str))
    except websockets.exceptions.ConnectionClosed:
        pass

async def main_async(args: argparse.Namespace) -> None:
    """
    Wire together the ECU connection, polling task, and WebSocket server.

    Args:
        args: Parsed CLI arguments produced by `argparse`.

    Returns:
        None. Blocks until the websocket server finishes or the process exits.
    """

    print("Connecting to ECU...", file=sys.stderr)
    connection = obd.OBD(portstr=args.port, baudrate=args.baudrate, fast=False, timeout=2)
    if not connection.is_connected():
        print("Unable to connect. Check interface, port or baudrate.", file=sys.stderr)
        sys.exit(1)

    poll_task = None
    try:
        cmds = build_command_list(connection, args.only_supported)
        print(f"Streaming {len(cmds)} PIDs every {args.interval}s on ws://0.0.0.0:{args.ws_port}", file=sys.stderr)

        queue = asyncio.Queue(maxsize=1)
        poll_task = asyncio.create_task(poll_obd(connection, cmds, args.interval, queue))

        async def handler(websocket, *_unused):
            # `websockets.serve` provides `(websocket, path)` but the path is unused here.
            await consumer_handler(websocket, queue)

        serve_kwargs = {"host": "0.0.0.0", "port": args.ws_port}

        try:
            async with websockets.serve(handler, **serve_kwargs):
                await asyncio.Future()
        finally:
            if poll_task:
                poll_task.cancel()
                with contextlib.suppress(asyncio.CancelledError):
                    await poll_task
    finally:
        with contextlib.suppress(Exception):
            connection.close()

def main():
    """
    Parse CLI arguments, clamp defaults, and run the asyncio event loop.

    Returns:
        None. Hands control to the asyncio runner.
    """

    parser = argparse.ArgumentParser(description="Stream Mode 01 OBD-II PIDs over WebSocket JSON")
    parser.add_argument("--port", default="/dev/ttyUSB0", help="Serial port or socket, e.g. /dev/ttyUSB0 or socket://localhost:35000")
    parser.add_argument("--baudrate", type=int, default=38400, help="Serial baud rate (default 38400)")
    parser.add_argument("--interval", type=float, default=1.0, help="Polling interval seconds (min 0.2, default 1.0)")
    parser.add_argument("--only_supported", action="store_true", help="Query only PIDs reported supported by ECU")
    parser.add_argument("--ws_port", type=int, default=8765, help="WebSocket port (default 8765)")
    args = parser.parse_args()
    args.interval = max(0.2, args.interval)
    asyncio.run(main_async(args))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"Shutting down...")
        sys.exit(0)
