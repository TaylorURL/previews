"""What a picture is worth on a preview, measured.

A photo is judged for the slot it would fill: big enough for that slot without
being stretched, sharp, not crushed by compression, a photograph rather than a
graphic, a flyer or a cut-out, and not a copy of a picture already chosen. The
measures are plain arithmetic on the pixels, so they run anywhere the pipeline
does; what arithmetic cannot see (words on the picture, a watermark, a logo or
a cartoon) is asked of the vision check in vision.py.

    metrics(image)              -> the numbers below
    problems(m, slot)           -> why it cannot fill that slot, or []
    score(m)                    -> how good it is, higher is better
    same_picture(a, b)          -> the same photo, cropped or not
"""

import io

import numpy as np
from PIL import Image

# What each slot draws, as width over height, and the fewest source pixels it
# needs across. A wide slot is the hero; a card is a service or about picture.
SLOTS = {
    "hero": {"ratio": 16 / 9, "width": 1400, "height": 700},
    "wide": {"ratio": 3 / 2, "width": 1000, "height": 600},
    "card": {"ratio": 4 / 3, "width": 800, "height": 520},
}

# The cut-offs, set against the photos already on previews and against the
# same photos blurred, enlarged and recompressed (see quality_selftest.py).
SHARP_MIN = 0.016     # finest-detail share; a photo blurred by 1px or enlarged 3x sits under it
DETAIL_MIN = 7.0      # Laplacian spread at 1024px; only a plainly blurred picture sits under it
BLOCKY_MAX = 1.42     # 8px JPEG grid against everywhere else; quality 25 sits over it
JPEG_QUALITY_MIN = 45
FLAT_MAX = 0.5        # share of the picture that is one flat color: flyers, logos, cut-outs
GRAPHIC_COLORS = 160  # a picture this short of colors with any flat ground is a graphic
CROP_KEEP_MIN = 0.58  # share of the picture a slot may keep after cropping


def _gray(image):
    return np.asarray(image.convert("L"), dtype=np.float32)


def _laplacian(g):
    return g[1:-1, :-2] + g[1:-1, 2:] + g[:-2, 1:-1] + g[2:, 1:-1] - 4 * g[1:-1, 1:-1]


def _fit(image, longest):
    if max(image.size) <= longest:
        return image
    scale = longest / max(image.size)
    return image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.LANCZOS)


def jpeg_quality(image):
    """The quality a JPEG was saved at, from its luminance table; None for any other kind."""
    tables = getattr(image, "quantization", None)
    if not tables or 0 not in tables:
        return None
    table = list(tables[0])
    # The standard luminance table at quality 50.
    base = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22,
            29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103,
            121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99]
    if len(table) != 64:
        return None
    scale = sum(table) / sum(base) * 100
    quality = (200 - scale) / 2 if scale <= 100 else 5000 / scale
    return max(1, min(100, round(quality)))


def metrics(image):
    """The numbers a photo is judged by. `image` is a PIL image as downloaded."""
    m = {"width": image.width, "height": image.height, "ratio": image.width / max(image.height, 1)}
    m["jpeg_quality"] = jpeg_quality(image)
    rgba = image.convert("RGBA")
    alpha = np.asarray(rgba.getchannel("A"))
    m["transparent"] = float((alpha < 250).mean())
    rgb = Image.new("RGB", rgba.size, (255, 255, 255))
    rgb.paste(rgba, mask=rgba.getchannel("A"))

    # Sharpness at a fixed size, so a big photo and a small one are judged alike.
    work = _fit(rgb, 1024)
    g = _gray(work)
    lap = _laplacian(g)
    m["detail"] = float(lap.std())
    # The share of the picture's energy in its finest detail. A photo enlarged
    # from a smaller one, or out of focus, has almost none there.
    half = _gray(work.resize((max(1, work.width // 2), max(1, work.height // 2)), Image.LANCZOS))
    fine = float((lap ** 2).mean())
    coarse = float((_laplacian(half) ** 2).mean())
    m["sharp"] = fine / (coarse + 1e-6) / 16 if coarse > 0 else 0.0

    # Blockiness at the picture's own size: the JPEG 8px grid shows as a jump
    # in brightness at every eighth column and row.
    native = _gray(_fit(rgb, 2400)) if max(rgb.size) > 2400 else _gray(rgb)
    if native.shape[0] > 32 and native.shape[1] > 32:
        dx = np.abs(np.diff(native, axis=1)).mean(axis=0)
        dy = np.abs(np.diff(native, axis=0)).mean(axis=1)
        edge_x = dx[7::8].mean() / (np.delete(dx, np.s_[7::8]).mean() + 1e-6)
        edge_y = dy[7::8].mean() / (np.delete(dy, np.s_[7::8]).mean() + 1e-6)
        m["blocky"] = float((edge_x + edge_y) / 2)
    else:
        m["blocky"] = 1.0

    # A graphic, a flyer or a cut-out is mostly flat color and few colors.
    small = np.asarray(_fit(rgb, 256), dtype=np.int16)
    h, w = small.shape[0] // 8 * 8, small.shape[1] // 8 * 8
    if h and w:
        blocks = small[:h, :w].reshape(h // 8, 8, w // 8, 8, 3).std(axis=(1, 3)).max(axis=-1)
        m["flat"] = float((blocks < 2.5).mean())
    else:
        m["flat"] = 1.0
    packed = (small[..., 0] >> 3) * 1024 + (small[..., 1] >> 3) * 32 + (small[..., 2] >> 3)
    m["colors"] = int(len(np.unique(packed)))
    m["mean"] = float(g.mean())
    m["spread"] = float(g.std())
    return m


def crop_keep(ratio, slot_ratio):
    """The share of a picture a slot of slot_ratio keeps when it fills by cropping."""
    return min(ratio / slot_ratio, slot_ratio / ratio)


def problems(m, slot=None):
    """Why this picture cannot be shown, or in this slot; [] when it can."""
    out = []
    if m["transparent"] > 0.02:
        out.append("a cut-out on a transparent ground, not a photograph")
    if m["flat"] > FLAT_MAX:
        out.append(f"mostly flat color ({m['flat']:.0%}), a graphic or a plain-ground cut-out")
    if m["colors"] < GRAPHIC_COLORS and m["flat"] > 0.25:
        out.append(f"only {m['colors']} colors on a flat ground, a graphic rather than a photograph")
    if m["sharp"] < SHARP_MIN:
        out.append(f"soft or enlarged (fine detail {m['sharp']:.3f})")
    if m["detail"] < DETAIL_MIN:
        out.append(f"blurry or hazy (detail {m['detail']:.0f})")
    if m["blocky"] > BLOCKY_MAX:
        out.append(f"heavy compression blocks ({m['blocky']:.2f})")
    if m["jpeg_quality"] is not None and m["jpeg_quality"] < JPEG_QUALITY_MIN:
        out.append(f"saved at JPEG quality {m['jpeg_quality']}")
    if m["mean"] < 28 or m["mean"] > 238:
        out.append("nearly all black or all white")
    if slot:
        need = SLOTS[slot]
        if m["width"] < need["width"] or m["height"] < need["height"]:
            out.append(f"{m['width']}x{m['height']} is too small for the {slot} (needs {need['width']}x{need['height']})")
        keep = crop_keep(m["ratio"], need["ratio"])
        if keep < CROP_KEEP_MIN:
            out.append(f"its shape would lose {1 - keep:.0%} of it to fill the {slot}")
    return out


def score(m):
    """Higher is better: resolution, sharpness and a photograph's richness, with wide shapes first."""
    size = min(1.0, m["width"] / 1800) * 0.5 + min(1.0, m["height"] / 1000) * 0.5
    sharp = min(1.0, m["sharp"] / 0.05) * 0.6 + min(1.0, m["detail"] / 60) * 0.4
    rich = (1 - m["flat"]) * min(1.0, m["colors"] / 2500)
    wide = 1.0 if 1.3 <= m["ratio"] <= 2.2 else 0.8 if m["ratio"] > 1.05 else 0.6
    return round(size * 0.35 + sharp * 0.4 + rich * 0.25, 4) * wide


def _dhash(image, size=8):
    g = np.asarray(image.convert("L").resize((size + 1, size), Image.LANCZOS), dtype=np.int16)
    return (g[:, 1:] > g[:, :-1]).flatten()


def _center(image, share):
    w, h = image.size
    dw, dh = int(w * (1 - share) / 2), int(h * (1 - share) / 2)
    return image.crop((dw, dh, w - dw, h - dh))


def fingerprints(image):
    return [_dhash(image), _dhash(_center(image, 0.7)), _dhash(_center(image, 0.5))]


def same_picture(a, b, limit=10):
    """True when two fingerprints are one photo, whole or cropped from the middle."""
    return any(int((x != y).sum()) <= limit for x in a for y in b)


def from_bytes(data):
    image = Image.open(io.BytesIO(data))
    image.load()
    return image
