import re

__all__ = ["normalize_header", "safe_id"]

def normalize_header(h: str) -> str:
    """Drop trailing ' [unit]' if present (compat with legacy logs)."""
    m = re.match(r"^(.*?)(\s*\[[^\]]+\])$", str(h))
    return m.group(1).strip() if m else str(h)

def safe_id(label: str) -> str:
    return re.sub(r"[^A-Za-z0-9_]+", "_", str(label))
