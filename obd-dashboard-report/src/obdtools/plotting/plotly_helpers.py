from __future__ import annotations
from typing import Optional
import plotly.graph_objects as go
from ..utils.downsample import thin_slice

__all__ = ["per_pid_figure"]

def per_pid_figure(ts, series, title: str, y_label: str, max_points: Optional[int], rolling_n: Optional[int]):
    idx = thin_slice(len(series), max_points or 0)
    use_gl = len(series) > 20000
    Scatter = go.Scattergl if use_gl else go.Scatter
    fig = go.Figure()
    fig.add_trace(Scatter(x=ts.iloc[idx], y=series.iloc[idx], mode="lines", name="raw"))
    if rolling_n and rolling_n >= 2:
        roll = series.rolling(rolling_n, min_periods=max(1, rolling_n//3)).mean()
        fig.add_trace(Scatter(x=ts.iloc[idx], y=roll.iloc[idx], mode="lines", name="mean (~window)", visible="legendonly"))
    fig.update_layout(title=title, xaxis_title="Time", yaxis_title=y_label or title, margin=dict(l=40,r=10,t=40,b=40), height=360, hovermode="x unified")
    return fig
