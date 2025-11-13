from __future__ import annotations
import os
from importlib import resources

__all__ = ["load_template", "copy_assets"]

def load_template(path: str | None) -> str:
    if path:
        if not os.path.exists(path):
            raise FileNotFoundError(f"Template not found: {path}")
        return open(path, "r", encoding="utf-8").read()
    # Use the 'templates' subpackage explicitly
    with resources.files("obdtools.templates").joinpath("obd_quick_charts_template.html").open("r", encoding="utf-8") as f:
        return f.read()

def copy_assets(dest_dir: str) -> None:
    """Copy packaged CSS/JS assets into dest_dir/assets/{css,js}."""
    import shutil
    css_dir = resources.files("obdtools.assets.css")
    js_dir  = resources.files("obdtools.assets.js")
    out_css = os.path.join(dest_dir, "assets", "css")
    out_js  = os.path.join(dest_dir, "assets", "js")
    os.makedirs(out_css, exist_ok=True)
    os.makedirs(out_js,  exist_ok=True)
    for p in css_dir.iterdir():
        if p.name.endswith(".css"):
            shutil.copyfile(p, os.path.join(out_css, p.name))
    for p in js_dir.iterdir():
        if p.name.endswith(".js"):
            shutil.copyfile(p, os.path.join(out_js, p.name))
