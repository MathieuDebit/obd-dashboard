# obd-dashboard-serial

## TL;DR
```bash
pip install -r requirements.txt
python3 -m elm -s car
python3 server.py --only_supported --port /dev/pts/5
```

If
```bash
OSError: [Errno 98] error while attempting to bind on address ('0.0.0.0', 8765): [errno 98] address already in use
```

Then
```bash
ps -fA | grep python
kill -9 <process number>
```