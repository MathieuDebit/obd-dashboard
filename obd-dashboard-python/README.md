# obd-dashboard-server

WebSocket bridge that polls OBD-II PIDs through a USB/SPI ELM327 interface (or the built-in emulator) and streams the latest snapshot to the dashboard frontend.

## Installation

```bash
python -m venv .venv
. .venv/bin/activate
pip install -e .[dev]

# exit the venv when you're done hacking
deactivate
```

The editable install exposes a console command named `obd-dashboard-server`.

## Quick start

Launch the server against the integrated ELM emulator:

```bash
obd-dashboard-server --emulator
```

Run `obd-dashboard-server --help` (or `python -m obd_dashboard_server --help`) to see the complete list of switches.

The CLI automatically spawns `python -m elm -s car`, captures the announced pseudo-terminal (e.g. `/dev/pts/5`), and begins streaming Mode 01 PID snapshots over `ws://0.0.0.0:8765`.

To connect to real hardware, plug your interface and run:

```bash
obd-dashboard-server --port /dev/ttyUSB0 --only_supported
```

Key options:

| Flag | Description |
| --- | --- |
| `--host / --ws-port` | Bind address for the WebSocket server (default `0.0.0.0:8765`). |
| `--interval` | Seconds between polling rounds (minimum 0.2s). |
| `--emulator` | Spawn the bundled emulator and auto-connect to its pseudo-TTY. |
| `--emulator-scenario` | Scenario passed to `python -m elm -s ...` (default `car`). |
| `--emulator-timeout` | Seconds to wait for the emulator to advertise its pseudo-terminal. |

## Running tests

```bash
pytest
```

The suite covers the queue helper, command selection logic, WebSocket consumer, and emulator output parsing.

## Troubleshooting

- `OSError: [Errno 98] ... address already in use` – another server is bound to the port. Stop the existing process or choose a different `--ws-port`.
- Emulator fails to announce a pseudo-terminal – rerun with `--emulator` and a higher `--emulator-timeout`, or run `python -m elm -s car` manually to inspect its output.
<!-- TODO: for the serial interface issue, add in the installation section the necessary instructions to configure the elm interface, including commands to configure linux system and user group. Remove instructions for windows and macos. Keep troubleshooting part to give info for possible issues. -->
- `/dev/ttyUSB0 not found` – list available serial interfaces (`ls /dev/ttyUSB*` on Linux, `ls /dev/tty.*` on macOS) and point `--port` to the correct one. On Linux you may need to add your user to the `dialout` group to access USB serial devices.
