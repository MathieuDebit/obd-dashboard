from __future__ import annotations
import pandas as pd
import plotly.graph_objects as go

__all__ = ["pearson_heatmap_fig"]

def pearson_heatmap_fig(df: pd.DataFrame, cols: list[str], top: int = 12) -> go.Figure:
    nonnull_counts = pd.Series({c: int(df[c].notna().sum()) for c in cols}).sort_values(ascending=False)
    top_cols = list(nonnull_counts.head(max(2, top)).index)
    corr_df = df[top_cols].corr(method="pearson", min_periods=5)
    fig = go.Figure(data=go.Heatmap(z=corr_df.values, x=top_cols, y=top_cols, zmin=-1, zmax=1, colorscale="RdBu", colorbar=dict(title="r")))
    fig.update_layout(title="Pearson Correlation (top-N by availability)", height=520, margin=dict(l=60,r=20,t=40,b=40))
    return fig
