#!/usr/bin/env python3
"""
OBD-II WebSocket server for streaming OBD-II PIDs over WebSocket JSON.

Exemple usage:
python obd_web_stream.py --port /dev/ttyUSB0 --only_supported --interval 1 --ws_port 8765
"""

import argparse
import asyncio
import json
from datetime import datetime
import sys
import obd
import websockets


def build_command_list(connection, only_supported):
    if only_supported:
        return connection.supported_commands
    return [c for c in obd.commands if getattr(c, "mode", None) == 1 and getattr(c, "pid", None) is not None]

async def poll_obd(connection, cmds, interval, queue):
    while True:
        pids = {}
        for cmd in cmds:
            rsp = connection.query(cmd)
            if not rsp.is_null():
                pids[cmd.name] = rsp.value.magnitude if hasattr(rsp.value, 'magnitude') else rsp.value
        payload = {
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "pids": pids,
        }
        if queue.full():
            try:
                queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
        await queue.put(payload)
        await asyncio.sleep(interval)

async def consumer_handler(websocket, queue):
    try:
        while True:
            data = await queue.get()
            await websocket.send(json.dumps(data, default=str))
    except websockets.exceptions.ConnectionClosed:
        pass

async def main_async(args):
    print("Connecting to ECU…", file=sys.stderr)
    connection = obd.OBD(portstr=args.port, baudrate=args.baudrate, fast=False, timeout=2)
    if not connection.is_connected():
        print("Unable to connect. Check interface, port or baudrate.", file=sys.stderr)
        sys.exit(1)

    cmds = build_command_list(connection, args.only_supported)
    print(f"Streaming {len(cmds)} PIDs every {args.interval}s on ws://0.0.0.0:{args.ws_port}", file=sys.stderr)

    queue = asyncio.Queue(maxsize=1)
    asyncio.create_task(poll_obd(connection, cmds, args.interval, queue))

    async def handler(*ws_args):
        websocket = ws_args[0]
        await consumer_handler(websocket, queue)

    serve_kwargs = {"host": "0.0.0.0", "port": args.ws_port}

    if serve_kwargs:
        async with websockets.serve(handler, **serve_kwargs):
            await asyncio.Future()

def main():
    parser = argparse.ArgumentParser(description="Stream all OBD-II PIDs over WebSocket JSON for JS frontend")
    parser.add_argument("--port", default=8765, help="Serial port or socket, e.g. /dev/ttyUSB0 or socket://localhost:35000")
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
