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

### Configure the Linux serial interface

ELM327 USB adapters are exposed as `/dev/ttyUSB*` and belong to the `dialout` group on most distributions. Add yourself to that group and refresh the rules so the server can open the port without `sudo`:

```bash
sudo usermod -aG dialout "$USER"
sudo udevadm control --reload-rules
sudo udevadm trigger
# start a new shell (e.g. log out/back in) so the group change is applied
```

After re-login, plug the adapter and confirm the device is accessible:

```bash
ls -l /dev/ttyUSB*
```

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
- `/dev/ttyUSB0 not found` – list available serial interfaces (`ls /dev/ttyUSB*`) and point `--port` to the correct one. Ensure your user is in the `dialout` group so you have permission to access the adapter.
