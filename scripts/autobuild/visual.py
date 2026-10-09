"""The built home page looked at as a reader sees it, from the pictures layout.mjs takes.

    look(result) -> problems

`result` is one business's entry from layout.mjs run with a shots directory.
The logo is read from the screenshot itself, so what is judged is what the
browser drew: whether the logo sits in a box of another color than the header
behind it, and whether enough of it stands out from that header to read. Then,
when the vision check is on, the top of the page at desktop and phone size and
the whole desktop page are shown to it, and anything it finds wrong with the
logo or the photos is a problem too.
"""

import os
import tempfile

import numpy as np
from PIL import Image

from . import vision

# A pixel this far from the header's color is not the header.
APART = 30.0
# The share of the logo box's own edge that may differ from the header before
# the logo reads as sitting in a box.
BOX_EDGE_MAX = 0.6


def _luminance(rgb):
    c = rgb / 255
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def logo_sits(path, box):
    """What is wrong with how the logo sits in one screenshot, or []."""
    with Image.open(path) as image:
        arr = np.asarray(image.convert("RGB"), dtype=np.float32)
    s = box.get("scale", 1)
    x0, y0 = int(round(box["x"] * s)), int(round(box["y"] * s))
    x1, y1 = int(round((box["x"] + box["width"]) * s)), int(round((box["y"] + box["height"]) * s))
    h, w = arr.shape[:2]
    if x1 - x0 < 8 or y1 - y0 < 8 or x0 < 0 or y0 < 0 or x1 > w or y1 > h:
        return []
    pad, gap = int(10 * s), int(3 * s)
    outer = arr[max(0, y0 - pad):min(h, y1 + pad), max(0, x0 - pad):min(w, x1 + pad)]
    keep = np.ones(outer.shape[:2], bool)
    iy0, ix0 = (y0 - gap) - max(0, y0 - pad), (x0 - gap) - max(0, x0 - pad)
    keep[max(0, iy0):iy0 + (y1 - y0) + 2 * gap, max(0, ix0):ix0 + (x1 - x0) + 2 * gap] = False
    ring = outer[keep]
    if not len(ring):
        return []
    ground = np.median(ring, axis=0)
    if np.sqrt(((ring - ground) ** 2).sum(axis=1)).mean() > 25:
        # The header behind the logo is not one color (a photo shows through);
        # there is no single ground to judge it against.
        return []

    inside = arr[y0:y1, x0:x1]
    # A logo drawn inside a frame of its own (an outline round the name) has
    # the header showing through the middle; a logo in a box does not.
    ih, iw = inside.shape[:2]
    middle = inside[ih // 5:ih - ih // 5, iw // 10:iw - iw // 10].reshape(-1, 3)
    framed = len(middle) and np.sqrt(((np.median(middle, axis=0) - ground) ** 2).sum()) <= APART
    e = max(1, int(2 * s))
    edge = np.concatenate([inside[:e].reshape(-1, 3), inside[-e:].reshape(-1, 3),
                           inside[:, :e].reshape(-1, 3), inside[:, -e:].reshape(-1, 3)])
    apart = np.sqrt(((edge - ground) ** 2).sum(axis=1)) > APART
    problems = []
    if apart.mean() > BOX_EDGE_MAX and not framed:
        frame = np.median(edge[apart], axis=0)
        problems.append(
            "the logo sits in a box of %s on a %s header" % ("#%02x%02x%02x" % tuple(int(v) for v in frame),
                                                           "#%02x%02x%02x" % tuple(int(v) for v in ground)))
        return problems

    pixels = inside.reshape(-1, 3)
    ink = pixels[np.sqrt(((pixels - ground) ** 2).sum(axis=1)) > APART]
    if len(ink) < 0.03 * len(pixels):
        problems.append("the logo all but disappears into its header")
        return problems
    lum = _luminance(ink)
    g = float(_luminance(ground))
    ratio = (np.maximum(lum, g) + 0.05) / (np.minimum(lum, g) + 0.05)
    if (ratio >= 1.8).mean() < 0.5:
        problems.append("the logo is too faint against its header to read")
    return problems


def look(result, ask_vision=True):
    problems = []
    for name, box in (result.get("logo") or {}).items():
        shot = (result.get("shots") or {}).get(name, {}).get("top")
        if shot and os.path.exists(shot):
            problems += [f"{name}: {p}" for p in logo_sits(shot, box)]
    shots = result.get("shots") or {}
    if ask_vision and vision.available() and shots.get("desktop") and shots.get("phone"):
        with tempfile.TemporaryDirectory(prefix="preview-page-") as folder:
            paths = [shots["desktop"]["top"]]
            # The whole desktop page, cut to a height the model reads clearly.
            with Image.open(shots["desktop"]["full"]) as full:
                full = full.convert("RGB")
                for i, top in enumerate(range(900, min(full.height, 900 + 2 * 2600), 2600)):
                    part = full.crop((0, top, full.width, min(full.height, top + 2600)))
                    path = os.path.join(folder, f"desktop-rest-{i}.png")
                    part.save(path)
                    paths.append(path)
            paths.append(shots["phone"]["top"])
            verdict = vision.judge_page(paths)
        if verdict is None:
            result.setdefault("notes", []).append(f"the page was not looked at: {vision.last_error}")
        elif not verdict["ok"]:
            problems += [f"the look: {p}" for p in verdict["problems"]] or ["the look: refused without saying why"]
    return problems
