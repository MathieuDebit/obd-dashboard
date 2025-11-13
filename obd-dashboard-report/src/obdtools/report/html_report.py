from __future__ import annotations

import os
import re
import json
from typing import Dict, List, Optional, Sequence

import numpy as np
import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio
from plotly.subplots import make_subplots

from ..csvio.readers import load_csv_with_units
from ..analysis.corr import pearson_heatmap_fig
from ..plotting.plotly_helpers import per_pid_figure
from ..utils.downsample import thin_slice
from ..utils.names import normalize_header, safe_id
from .template_loader import load_template, copy_assets


# ---------------------------
# Helpers
# ---------------------------

def parse_time_column(df: pd.DataFrame) -> pd.Series:
    """Return datetime series from timestamp_iso, or date+time, or timestamp_epoch_ms."""
    if "timestamp_iso" in df.columns:
        ts = pd.to_datetime(df["timestamp_iso"], errors="coerce")
    elif {"date", "time"}.issubset(df.columns):
        ts = pd.to_datetime(df["date"].astype(str) + " " + df["time"].astype(str), errors="coerce")
    elif "timestamp_epoch_ms" in df.columns:
        ts = pd.to_datetime(df["timestamp_epoch_ms"], unit="ms", errors="coerce")
    else:
        raise RuntimeError("No time columns found (need 'timestamp_iso' or 'date'+'time' or 'timestamp_epoch_ms').")
    if ts.isna().all():
        raise RuntimeError("All timestamps failed to parse.")
    return ts


def sampling_window_points(ts: pd.Series, seconds: float) -> int:
    """Estimate how many samples ≈ `seconds` using the median delta."""
    if ts.size < 2:
        return 1
    deltas = ts.diff().dt.total_seconds().dropna()
    if deltas.empty:
        return 1
    med = max(1e-9, float(deltas.median()))
    n = int(round(seconds / med))
    return max(1, n)


def to_numeric_cols(df: pd.DataFrame, candidates: Sequence[str]) -> List[str]:
    """Coerce candidate columns to numeric; return those that have any valid numbers."""
    numeric_cols: List[str] = []
    for col in candidates:
        s = pd.to_numeric(df[col], errors="coerce")
        if s.notna().any():
            df[col] = s
            numeric_cols.append(col)
    return numeric_cols


def first_present(df: pd.DataFrame, names: Sequence[str]) -> Optional[str]:
    for n in names:
        if n in df.columns:
            return n
    return None


def section_one_per_line(title: str, desc_html: str, fig_divs: Sequence[str]) -> str:
    # One chart per line, using the same wrapper as individual charts
    items = "\n".join(
        f"<section class='chart' style='border:1px solid #e0e0e0;border-radius:10px;padding:8px;margin:10px 0;'>{d}</section>"
        for d in fig_divs
    )
    return f"""
<section class='report-section'>
  <h3>{title}</h3>
  <p class='muted'>{desc_html}</p>
  {items}
</section>
"""


def heatmap_has_data(fig: go.Figure) -> bool:
    """Return True if the figure contains a heatmap with any finite values."""
    try:
        data = fig.to_plotly_json().get("data", [])
    except Exception:
        return False
    for tr in data:
        if tr.get("type") in ("heatmap", "heatmapgl"):
            z = tr.get("z", [])
            for row in z or []:
                for v in row or []:
                    if isinstance(v, (int, float)) and np.isfinite(v):
                        return True
    return False


def inline_plotly_runtime() -> str:
    """
    Embed Plotly's JS runtime inline so every chart can render offline and
    independent of figure order. Falls back to `include_plotlyjs=True` later
    if we can't access the runtime string (Plotly version differences).
    """
    try:
        # Plotly <=6 keeps this helper
        from plotly.offline import get_plotlyjs  # type: ignore
        js = get_plotlyjs()
        if js and isinstance(js, str) and "Plotly=" in js:
            return f"<script type='text/javascript'>\n{js}\n</script>"
    except Exception:
        pass
    return ""


# ---------------------------
# Overlay figure builders (return Plotly Figures)
# ---------------------------

def fig_fuel_trims_b1(ts: pd.Series, df: pd.DataFrame) -> Optional[go.Figure]:
    stft = first_present(df, ["SHORT_FUEL_TRIM_1", "SHORT_TERM_FUEL_TRIM_1", "STFT_B1"])
    ltft = first_present(df, ["LONG_FUEL_TRIM_1", "LONG_TERM_FUEL_TRIM_1", "LTFT_B1"])
    o2s1 = first_present(df, ["O2_B1S1", "O2: Bank 1 - Sensor 1 Voltage", "O2_S1_V"])
    if not stft or not ltft:
        return None

    fig = make_subplots(specs=[[{"secondary_y": True}]])
    idx = thin_slice(len(ts), 5000)

    fig.add_trace(go.Scatter(x=ts.iloc[idx], y=df[stft].iloc[idx],
                             mode="lines", name="STFT B1 [%]"), secondary_y=False)
    fig.add_trace(go.Scatter(x=ts.iloc[idx], y=df[ltft].iloc[idx],
                             mode="lines", name="LTFT B1 [%]"), secondary_y=False)

    fig.add_hline(y=0, line=dict(width=1, dash="dot"), secondary_y=False)

    if o2s1 and pd.to_numeric(df[o2s1], errors="coerce").notna().any():
        fig.add_trace(go.Scatter(x=ts.iloc[idx], y=pd.to_numeric(df[o2s1], errors="coerce").iloc[idx],
                                 mode="lines", name="O2 B1S1 [V]", opacity=0.6),
                      secondary_y=True)
        fig.update_yaxes(title_text="Trims [%]", secondary_y=False)
        fig.update_yaxes(title_text="O2 S1 [V]", secondary_y=True)
    else:
        fig.update_yaxes(title_text="Trims [%]", secondary_y=False)

    fig.update_layout(title="Fuel trims — Bank 1", height=380,
                      margin=dict(l=40, r=10, t=50, b=40), hovermode="x unified")
    return fig


def fig_o2_b1(ts: pd.Series, df: pd.DataFrame) -> Optional[go.Figure]:
    s1 = first_present(df, ["O2_B1S1", "O2: Bank 1 - Sensor 1 Voltage"])
    s2 = first_present(df, ["O2_B1S2", "O2: Bank 1 - Sensor 2 Voltage"])
    if not s1 and not s2:
        return None

    fig = make_subplots(specs=[[{"secondary_y": True}]])
    idx = thin_slice(len(ts), 6000)

    if s1:
        fig.add_trace(go.Scatter(x=ts.iloc[idx], y=pd.to_numeric(df[s1], errors="coerce").iloc[idx],
                                 mode="lines", name="O2 B1S1 [V]"))
    if s2:
        s2_series = pd.to_numeric(df[s2], errors="coerce")
        fig.add_trace(go.Scatter(x=ts.iloc[idx], y=s2_series.iloc[idx],
                                 mode="lines", name="O2 B1S2 [V]", opacity=0.7))
        # Smoothness index for S2 (rolling std, ~5s window)
        win = max(3, sampling_window_points(ts, 5))
        s2_std = s2_series.rolling(win, min_periods=max(1, win // 3)).std()
        fig.add_trace(go.Scatter(x=ts.iloc[idx], y=s2_std.iloc[idx],
                                 mode="lines", name="B1S2 smoothness (std)", line=dict(dash="dot")),
                      secondary_y=True)
        fig.update_yaxes(title_text="Voltage [V]", secondary_y=False)
        fig.update_yaxes(title_text="Rolling std (5s)", secondary_y=True)

    fig.update_layout(title="O₂ sensors — Bank 1", height=380,
                      margin=dict(l=40, r=10, t=50, b=40), hovermode="x unified")
    return fig


def fig_breathing(ts: pd.Series, df: pd.DataFrame) -> List[go.Figure]:
    out: List[go.Figure] = []
    throttle = first_present(df, ["THROTTLE_POS", "THROTTLE_POSITION", "Throttle Position"])
    mapkpa = first_present(df, ["INTAKE_PRESSURE", "INTAKE_MANIFOLD_PRESSURE", "MAP", "Intake Manifold Pressure"])
    if throttle or mapkpa:
        fig = make_subplots(specs=[[{"secondary_y": True}]])
        idx = thin_slice(len(ts), 6000)
        if throttle:
            fig.add_trace(go.Scatter(x=ts.iloc[idx], y=pd.to_numeric(df[throttle], errors="coerce").iloc[idx],
                                     mode="lines", name="Throttle [%]"), secondary_y=False)
            fig.update_yaxes(title_text="Throttle [%]", secondary_y=False)
        if mapkpa:
            fig.add_trace(go.Scatter(x=ts.iloc[idx], y=pd.to_numeric(df[mapkpa], errors="coerce").iloc[idx],
                                     mode="lines", name="MAP [kPa]", opacity=0.8),
                          secondary_y=True if throttle else False)
            if throttle:
                fig.update_yaxes(title_text="MAP [kPa]", secondary_y=True)
            else:
                fig.update_yaxes(title_text="MAP [kPa]", secondary_y=False)
        fig.update_layout(title="Breathing — Throttle & MAP", height=360,
                          margin=dict(l=40, r=10, t=50, b=40), hovermode="x unified")
        out.append(fig)

    # Scatter: Throttle vs MAP (if both exist)
    if throttle and mapkpa:
        s_th = pd.to_numeric(df[throttle], errors="coerce")
        s_map = pd.to_numeric(df[mapkpa], errors="coerce")
        mask = s_th.notna() & s_map.notna()
        sc = go.Figure()
        sc.add_trace(go.Scattergl(x=s_th[mask], y=s_map[mask], mode="markers",
                                  name="Throttle vs MAP", marker=dict(size=4, opacity=0.6)))
        sc.update_layout(title="Scatter — Throttle vs MAP", xaxis_title="Throttle [%]", yaxis_title="MAP [kPa]",
                         height=320, margin=dict(l=40, r=10, t=50, b=40))
        out.append(sc)
    return out


def fig_drivetrain(ts: pd.Series, df: pd.DataFrame) -> Optional[go.Figure]:
    rpm = first_present(df, ["RPM", "Engine RPM"])
    speed = first_present(df, ["SPEED", "Vehicle Speed"])
    if not rpm and not speed:
        return None
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    idx = thin_slice(len(ts), 6000)
    if rpm:
        fig.add_trace(go.Scatter(x=ts.iloc[idx], y=pd.to_numeric(df[rpm], errors="coerce").iloc[idx],
                                 mode="lines", name="RPM"), secondary_y=False)
        fig.update_yaxes(title_text="RPM", secondary_y=False)
    if speed:
        fig.add_trace(go.Scatter(x=ts.iloc[idx], y=pd.to_numeric(df[speed], errors="coerce").iloc[idx],
                                 mode="lines", name="Speed [km/h]", opacity=0.8),
                      secondary_y=True if rpm else False)
        if rpm:
            fig.update_yaxes(title_text="Speed [km/h]", secondary_y=True)
        else:
            fig.update_yaxes(title_text="Speed [km/h]", secondary_y=False)
    fig.update_layout(title="Chaîne cinématique — RPM & Vitesse", height=360,
                      margin=dict(l=40, r=10, t=50, b=40), hovermode="x unified")
    return fig


def fig_timing_vs_load(ts: pd.Series, df: pd.DataFrame) -> List[go.Figure]:
    out: List[go.Figure] = []
    timing = first_present(df, ["TIMING_ADVANCE", "Timing Advance"])
    load = first_present(df, ["ENGINE_LOAD", "Calculated Engine Load"])
    if timing or load:
        fig = make_subplots(specs=[[{"secondary_y": True}]])
        idx = thin_slice(len(ts), 6000)
        if timing:
            fig.add_trace(go.Scatter(x=ts.iloc[idx], y=pd.to_numeric(df[timing], errors="coerce").iloc[idx],
                                     mode="lines", name="Timing [°]"), secondary_y=False)
            fig.update_yaxes(title_text="Timing [°]", secondary_y=False)
        if load:
            fig.add_trace(go.Scatter(x=ts.iloc[idx], y=pd.to_numeric(df[load], errors="coerce").iloc[idx],
                                     mode="lines", name="Load [%]", opacity=0.8),
                          secondary_y=True if timing else False)
            if timing:
                fig.update_yaxes(title_text="Load [%]", secondary_y=True)
            else:
                fig.update_yaxes(title_text="Load [%]", secondary_y=False)
        fig.update_layout(title="Allumage vs Charge — superposition temporelle", height=360,
                          margin=dict(l=40, r=10, t=50, b=40), hovermode="x unified")
        out.append(fig)

    if timing and load:
        s_t = pd.to_numeric(df[timing], errors="coerce")
        s_l = pd.to_numeric(df[load], errors="coerce")
        mask = s_t.notna() & s_l.notna()
        sc = go.Figure()
        sc.add_trace(go.Scattergl(x=s_l[mask], y=s_t[mask], mode="markers",
                                  name="Timing vs Load", marker=dict(size=4, opacity=0.6)))
        sc.update_layout(title="Scatter — Timing vs Load", xaxis_title="Load [%]", yaxis_title="Timing [°]",
                         height=320, margin=dict(l=40, r=10, t=50, b=40))
        out.append(sc)
    return out


def fig_warmup(ts: pd.Series, df: pd.DataFrame) -> Optional[go.Figure]:
    ect = first_present(df, ["COOLANT_TEMP", "Engine Coolant Temperature"])
    iat = first_present(df, ["INTAKE_TEMP", "Intake Air Temp"])
    if not ect and not iat:
        return None
    fig = make_subplots(specs=[[{"secondary_y": False}]])
    idx = thin_slice(len(ts), 6000)
    if ect:
        fig.add_trace(go.Scatter(x=ts.iloc[idx], y=pd.to_numeric(df[ect], errors="coerce").iloc[idx],
                                 mode="lines", name="Coolant [°C]"))
    if iat:
        fig.add_trace(go.Scatter(x=ts.iloc[idx], y=pd.to_numeric(df[iat], errors="coerce").iloc[idx],
                                 mode="lines", name="IAT [°C]", opacity=0.8))
    fig.update_yaxes(title_text="Temperature [°C]")
    fig.update_layout(title="Montée en température — ECT & IAT", height=360,
                      margin=dict(l=40, r=10, t=50, b=40), hovermode="x unified")
    return fig


# ---------------------------
# Main builders
# ---------------------------

def build_html_report(
    df: pd.DataFrame,
    units_map: Dict[str, str],
    title: str = "OBD Report",
    pids: str = "",
    exclude: str = "",
    rolling_sec: float = 5.0,
    max_points: int = 5000,
    corr_top: int = 12,
    template_path: Optional[str] = None,
    source_name: Optional[str] = None,
) -> str:
    """
    Build a single HTML string with:
      - a single general correlation heatmap at the top (in __HEAT__) — inject Plotly runtime inline there
      - overlay sections (each chart on its own line)
      - per-PID charts (each chart on its own line)
    """
    # Time parsing & sort
    ts = parse_time_column(df)
    df = df.assign(_ts=ts).dropna(subset=["_ts"]).sort_values("_ts")
    ts = df["_ts"]

    # PID candidates
    known_time = {"timestamp_iso", "date", "time", "timestamp_epoch_ms", "_ts"}
    candidates = [c for c in df.columns if c not in known_time]

    # Optional allow/deny lists
    if pids:
        only_norm = [normalize_header(x.strip()) for x in pids.split(",") if x.strip()]
        selected = []
        for c in candidates:
            if c in only_norm or normalize_header(c) in only_norm:
                selected.append(c)
        # Keep the order provided in --pids
        ordered_final: List[str] = []
        for want in only_norm:
            for c in selected:
                if c == want or normalize_header(c) == want:
                    if c not in ordered_final:
                        ordered_final.append(c)
        candidates = ordered_final if ordered_final else selected

    if exclude:
        deny = {normalize_header(x.strip()) for x in exclude.split(",") if x.strip()}
        candidates = [c for c in candidates if normalize_header(c) not in deny]

    # Numeric-only for correlation & many overlays
    numeric_cols = to_numeric_cols(df, candidates)
    if not numeric_cols:
        raise RuntimeError("No numeric PID columns to plot after coercion.")

    # Downsample index for large files (per-chart)
    idx = thin_slice(df.shape[0], max_points)

    # Correlation heatmap: pick top columns by availability, drop constant/tiny series
    def _is_good(col: str) -> bool:
        s = pd.to_numeric(df[col], errors="coerce")
        return s.notna().sum() >= 3 and s.nunique(dropna=True) >= 2

    avail_sorted = sorted(
        [c for c in numeric_cols if _is_good(c)],
        key=lambda c: int(pd.to_numeric(df[c], errors="coerce").notna().sum()),
        reverse=True,
    )
    corr_cols = avail_sorted[:max(4, min(corr_top, len(avail_sorted)))]
    heatmap_fig = pearson_heatmap_fig(df, corr_cols) if len(corr_cols) >= 2 else None

    # ---- Build the top heatmap and ALWAYS ensure Plotly runtime exists inline above it
    plotly_rt = inline_plotly_runtime()  # may be "", then we'll fallback to include=True on this first chart
    heat_block = ""
    if heatmap_fig is not None and heatmap_has_data(heatmap_fig):
        heatmap_fig.update_layout(
            title="Heatmap des corrélations (Pearson)",
            height=520,
            margin=dict(l=40, r=10, t=50, b=40),
        )
        if plotly_rt:
            heat_div = pio.to_html(heatmap_fig, include_plotlyjs=False, full_html=False)
            heat_html = plotly_rt + heat_div  # runtime first, then figure
        else:
            # Fallback (older/newer Plotly without offline.get_plotlyjs)
            heat_html = pio.to_html(heatmap_fig, include_plotlyjs=True, full_html=False)
        heat_block = section_one_per_line(
            "Carte des corrélations",
            "Rouge = ensemble, bleu = opposé. Servez-vous-en pour choisir des paires à comparer, puis zoomez les courbes liées.",
            [heat_html],
        )

    # Helper for subsequent figures: Plotly runtime already present (inline above heatmap)
    def to_div(fig: go.Figure) -> str:
        # If no heatmap was created (rare), the first call here will still include Plotly inline
        # by setting include_plotlyjs=True just once.
        nonlocal plotly_rt
        if plotly_rt:
            return pio.to_html(fig, include_plotlyjs=False, full_html=False)
        # No inline runtime earlier -> include it here for the first chart
        html = pio.to_html(fig, include_plotlyjs=True, full_html=False)
        # After this, we won't need to include JS again
        plotly_rt = "injected"
        return html

    # ----- Overlay sections (each chart one per line)
    sections_html: List[str] = []

    # A) Fuel trims (Bank 1)
    trims_fig = fig_fuel_trims_b1(ts, df)
    if trims_fig:
        sections_html.append(section_one_per_line(
            "Fuel trims",
            "STFT & LTFT (même axe, ligne 0%). O₂ S1 en second axe pour comprendre les bascules riche/pauvre.",
            [to_div(trims_fig)]
        ))

    # B) O2 sensors (Bank 1)
    o2_fig = fig_o2_b1(ts, df)
    if o2_fig:
        sections_html.append(section_one_per_line(
            "Sondes O₂ (Bank 1)",
            "S1 doit osciller, S2 doit être lissée au régime stabilisé. L’indice de lissage (écart-type roulant) signale l’activité du catalyseur.",
            [to_div(o2_fig)]
        ))

    # C) Breathing (Throttle & MAP) + scatter
    breath_figs = fig_breathing(ts, df)
    if breath_figs:
        sections_html.append(section_one_per_line(
            "Admission (Throttle & MAP)",
            "La pression d’admission suit l’ouverture papillon. Le nuage Throttle vs MAP révèle la courbe de réponse (fuites, lag…).",
            [to_div(f) for f in breath_figs]
        ))

    # D) Drivetrain (RPM & Speed)
    drive_fig = fig_drivetrain(ts, df)
    if drive_fig:
        sections_html.append(section_one_per_line(
            "Chaîne cinématique (RPM & Vitesse)",
            "Superposition pour voir passages de rapports et cohérence RPM↔vitesse.",
            [to_div(drive_fig)]
        ))

    # E) Timing vs Load (overlay + scatter)
    timing_figs = fig_timing_vs_load(ts, df)
    if timing_figs:
        sections_html.append(section_one_per_line(
            "Allumage vs Charge",
            "Sous charge, l’avance diminue généralement. La vue temporelle + le scatter montrent la stratégie d’avance.",
            [to_div(f) for f in timing_figs]
        ))

    # F) Warm-up (ECT & IAT)
    warm_fig = fig_warmup(ts, df)
    if warm_fig:
        sections_html.append(section_one_per_line(
            "Montée en température",
            "Coolant (ECT) & IAT pour évaluer thermostat, heat-soak, et le passage en boucle fermée.",
            [to_div(warm_fig)]
        ))

    sections_block = "\n".join(sections_html)

    # ----- Courbes individuelles (one chart per line)
    def norm(s: str) -> str:
        return re.sub(r"\s+", " ", s.strip().lower())

    buckets = {
        "Speed & RPM": [],
        "Throttle / Pedal": [],
        "Airflow / Load": [],
        "Pressures": [],
        "Fuel trims (B1)": [],
        "O2 (B1)": [],
        "Ignition / Timing": [],
        "Temperatures": [],
        "Other": [],
    }
    for c in numeric_cols:
        s = norm(c)
        placed = False
        if any(k in s for k in ["rpm", "speed"]):
            buckets["Speed & RPM"].append(c); placed = True
        elif "throttle" in s:
            buckets["Throttle / Pedal"].append(c); placed = True
        elif "engine_load" in s or "calculated engine load" in s:
            buckets["Airflow / Load"].append(c); placed = True
        elif any(k in s for k in ["intake_pressure", "intake manifold pressure", "map"]):
            buckets["Pressures"].append(c); placed = True
        elif "short_fuel_trim_1" in s or "short term fuel trim - bank 1" in s or "stft" in s:
            buckets["Fuel trims (B1)"].append(c); placed = True
        elif "long_fuel_trim_1" in s or "long term fuel trim - bank 1" in s or "ltft" in s:
            buckets["Fuel trims (B1)"].append(c); placed = True
        elif "o2_b1s1" in s or "sensor 1 voltage" in s:
            buckets["O2 (B1)"].append(c); placed = True
        elif "o2_b1s2" in s or "sensor 2 voltage" in s:
            buckets["O2 (B1)"].append(c); placed = True
        elif any(k in s for k in ["timing_advance", "timing advance", "spark", "advance"]):
            buckets["Ignition / Timing"].append(c); placed = True
        elif any(k in s for k in ["coolant_temp", "intake_temp", "temperature"]):
            buckets["Temperatures"].append(c); placed = True
        if not placed:
            buckets["Other"].append(c)

    def order_bucket(name: str, arr: List[str]) -> List[str]:
        if name == "Fuel trims (B1)":
            stft = [c for c in arr if "short" in norm(c) or "stft" in norm(c)]
            ltft = [c for c in arr if "long" in norm(c) or "ltft" in norm(c)]
            rest = [c for c in arr if c not in stft + ltft]
            return stft + ltft + sorted(rest)
        if name == "O2 (B1)":
            s1 = [c for c in arr if "s1" in norm(c)]
            s2 = [c for c in arr if "s2" in norm(c)]
            rest = [c for c in arr if c not in s1 + s2]
            return s1 + s2 + sorted(rest)
        return sorted(arr)

    ordered_for_individual: List[str] = []
    for b in ["Speed & RPM", "Throttle / Pedal", "Airflow / Load", "Pressures",
              "Fuel trims (B1)", "O2 (B1)", "Ignition / Timing", "Temperatures", "Other"]:
        if buckets[b]:
            ordered_for_individual.extend(order_bucket(b, buckets[b]))

    indiv_blocks: List[str] = []
    roll_n = sampling_window_points(ts, rolling_sec) if rolling_sec and rolling_sec > 0 else 0

    for col in ordered_for_individual:
        unit = units_map.get(col, "")
        series = df[col]
        fig = per_pid_figure(
            ts.iloc[idx], series.iloc[idx], col, unit,
            rolling_n=roll_n, max_points=max_points
        )
        div = to_div(fig)
        indiv_blocks.append(
            f"<section class='chart' id='sec_{safe_id(col)}' "
            f"style='border:1px solid #e0e0e0;border-radius:10px;padding:8px;margin:10px 0;'>\n{div}\n</section>"
        )

    individuals_block = ""
    if indiv_blocks:
        individuals_block = f"""
<section class='report-section'>
  <h3>Courbes individuelles (réordonnées)</h3>
  <p class='muted'>PIDs rapprochés par thème (STFT↔LTFT, O₂ S1↔S2, RPM↔Vitesse…). Utilisez “Link zoom”.</p>
  {''.join(indiv_blocks)}
</section>
"""

    # ----- Sidebar (anchors list) — keep only list, no extra filter input
    all_pids = [c for c in df.columns if c not in known_time]
    sidebar_items = "\n".join(
        f"<li><a href='#sec_{safe_id(c)}'>{c}</a></li>" for c in all_pids
    )
    sidebar_html = f"""
<div class="sidebar-inner">
  <ul id='pidlist'>
    {sidebar_items}
  </ul>
</div>
"""

    # ----- Summary table (numeric columns)
    def fmt(v):
        if v is None or (isinstance(v, float) and np.isnan(v)):
            return ""
        if isinstance(v, float):
            return f"{v:.3f}"
        return str(v)

    summary_rows = []
    for col in ordered_for_individual:
        s = pd.to_numeric(df[col], errors="coerce")
        if s.notna().any():
            summary_rows.append({
                "pid": col,
                "count": int(s.notna().sum()),
                "min": float(s.min(skipna=True)),
                "mean": float(s.mean(skipna=True)),
                "max": float(s.max(skipna=True)),
                "unit": units_map.get(col, ""),
            })

    summary_table_html = (
        "<table class='summary'><thead><tr>"
        "<th>PID</th><th>Count</th><th>Min</th><th>Mean</th><th>Max</th><th>Unit</th>"
        "</tr></thead><tbody>"
        + "\n".join(f"<tr><td>{r['pid']}</td><td>{r['count']}</td><td>{fmt(r['min'])}</td>"
                    f"<td>{fmt(r['mean'])}</td><td>{fmt(r['max'])}</td><td>{r['unit']}</td></tr>"
                    for r in summary_rows)
        + "</tbody></table>"
    )

    # ----- Data blob for template JS (minimal but valid)
    data_blob = {
        "title": title,
        "rows": int(df.shape[0]),
        "pids": all_pids,
        "units_map": {k: units_map.get(k, "") for k in all_pids},
        "source": source_name or "",
    }
    data_json = json.dumps(data_blob, ensure_ascii=False)

    # ----- Build final HTML via template
    html_tpl = load_template(template_path)

    # Only top heatmap (no duplication in body/sections)
    body_for_template = sections_block + individuals_block

    html_out = (
        html_tpl
        .replace("__TITLE__", title)
        .replace("__SIDEBAR__", sidebar_html)
        .replace("__SUMMARY__", summary_table_html)
        .replace("__HEAT__", heat_block)                   # only top heatmap; includes runtime inline
        .replace("__SECTIONS__", body_for_template)        # if template uses __SECTIONS__
        .replace("__BODY__", body_for_template)            # if template uses __BODY__
        .replace("__DATA__", data_json)
    )
    return html_out


def build_html_from_csv(
    csv_path: str,
    out_path: Optional[str] = None,
    title: str = "OBD Report",
    pids: str = "",
    exclude: str = "",
    rolling_sec: float = 5.0,
    max_points: int = 5000,
    corr_top: int = 12,
    template_path: Optional[str] = None,
) -> str:
    """
    Convenience wrapper: load CSV (semicolon separator + units row), build HTML,
    copy CSS/JS assets next to the output file (if out_path given), return HTML string.
    """
    df, units_map = load_csv_with_units(csv_path, sep=";")
    html = build_html_report(
        df=df,
        units_map=units_map,
        title=title,
        pids=pids,
        exclude=exclude,
        rolling_sec=rolling_sec,
        max_points=max_points,
        corr_top=corr_top,
        template_path=template_path,
        source_name=os.path.basename(csv_path),
    )

    if out_path:
        os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
        # Copy CSS/JS assets for the page scaffolding (NOT Plotly; Plotly is embedded inline)
        copy_assets(os.path.dirname(out_path) or ".")
    return html
