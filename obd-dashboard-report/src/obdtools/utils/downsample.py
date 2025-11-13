import math

__all__ = ["thin_slice"]

def thin_slice(n: int, max_points: int) -> slice:
    if not max_points or n <= max_points:
        return slice(None)
    step = max(1, math.floor(n / max_points))
    return slice(0, n, step)
