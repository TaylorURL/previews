"""A business's logo, made to sit on the page the way it sits on their own.

    prepare(image) -> (logo, placement)   or raises Unfit(reason)

A logo arrives one of three ways. Drawn on nothing (an SVG or a PNG with
alpha), it keeps its transparency and goes on whichever ground it reads on, a
white header or a dark one. Drawn on a flat color (the usual JPEG on white, a
gold mark on a black square), the color is cut away from the edges inward with
a tolerance, the soft edge left by anti-aliasing is turned back into
transparency rather than a halo, and the header takes that same color, so the
mark sits as it was designed and never in a box. Drawn on a photograph or a
pattern, nothing clean can be cut out or matched, and the logo is refused.

A logo is also refused when it is too small to draw at its header size without
being enlarged, when its edges are soft, or when too little of it stands out
from the ground it would sit on. A business with no logo that passes is parked
rather than shown with a bad one.

`placement` is what the brand file carries: logoWidth and logoHeight (the size
the header draws it, in CSS px), logoRatio, and logoGround (the header color it
sits on).
"""

import numpy as np
from PIL import Image

DARK_GROUND = (20, 24, 31)
WHITE = (255, 255, 255)

# The flood that finds the ground: anything this close to the ground color and
# touching the edge through such pixels is ground; anything very close to it
# anywhere (the inside of an O) is ground too.
LOOSE = 38.0
STRICT = 12.0

# Below this the source would be enlarged to fill its header size.
SOURCE_OVER_DRAWN = 1.1
# Edge sharpness: the steepest edges against the logo's own contrast. A crisp
# mark changes over a pixel or two; one blown up from a thumbnail over four.
EDGE_MIN = 0.42
# Share of the mark's outline that must stand out from the ground it sits on.
# The outline, not every pixel: a navy ring around a white disc reads on a
# white page, and a white wordmark beside a navy icon does not.
LEGIBLE_SHARE = 0.6
LEGIBLE_RATIO = 1.8


class Unfit(Exception):
    """A logo that cannot be shown cleanly, and why."""


def drawn_size(ratio):
    """The size the header draws a logo of this shape, in CSS px: wordmarks
    lower and wider, badges taller so the name inside them reads, nothing
    past 260 across."""
    height = 48 if ratio >= 3.2 else 58 if ratio >= 1.6 else 74
    width = height * ratio
    if width > 260:
        width, height = 260, 260 / ratio
    return round(width), round(height)


def _rgba(image):
    if image.mode == "P" and "transparency" in image.info:
        image = image.convert("RGBA")
    return np.asarray(image.convert("RGBA"), dtype=np.uint8)


def _border(arr, width=2):
    return np.concatenate([
        arr[:width].reshape(-1, 4), arr[-width:].reshape(-1, 4),
        arr[:, :width].reshape(-1, 4), arr[:, -width:].reshape(-1, 4),
    ])


def ground_of(arr):
    """('transparent', None), ('solid', rgb) or ('busy', None) for the ground a logo was drawn on."""
    # Drawn on nothing: real transparency anywhere, even when the mark is
    # cropped so tight that it touches every edge.
    if (arr[..., 3] < 32).mean() > 0.05:
        return "transparent", None
    border = _border(arr)
    alpha = border[:, 3]
    opaque = border[alpha >= 200][:, :3].astype(np.float32)
    if len(opaque) < 0.5 * len(border):
        return "busy", None
    middle = np.median(opaque, axis=0)
    near = np.sqrt(((opaque - middle) ** 2).sum(axis=1)) <= 28
    if near.mean() >= 0.8:
        return "solid", tuple(float(v) for v in middle)
    return "busy", None


def _grow(mask):
    out = mask.copy()
    out[1:] |= mask[:-1]
    out[:-1] |= mask[1:]
    out[:, 1:] |= mask[:, :-1]
    out[:, :-1] |= mask[:, 1:]
    return out


def cut_ground(arr, ground):
    """The logo with its flat ground made transparent and its soft edge kept soft."""
    rgb = arr[..., :3].astype(np.float32)
    bg = np.array(ground, dtype=np.float32)
    dist = np.sqrt(((rgb - bg) ** 2).sum(axis=-1))
    candidate = dist <= LOOSE
    reached = np.zeros_like(candidate)
    reached[0], reached[-1], reached[:, 0], reached[:, -1] = candidate[0], candidate[-1], candidate[:, 0], candidate[:, -1]
    count = -1
    while True:
        reached = _grow(reached) & candidate
        now = int(reached.sum())
        if now == count:
            break
        count = now
    gone = reached | (dist <= STRICT)

    # Colour to alpha on the two pixels around the cut: an edge pixel is part
    # ground and part ink, so its alpha is how far it has moved from the ground
    # and its color is the ink it was mixed with.
    band = _grow(_grow(gone)) & ~gone
    p = rgb / 255
    b = bg / 255
    up = np.where(p > b, (p - b) / np.maximum(1 - b, 1e-6), 0)
    down = np.where(p < b, (b - p) / np.maximum(b, 1e-6), 0)
    a = np.clip(np.maximum(up, down).max(axis=-1), 0, 1)
    ink = np.where(a[..., None] > 0, (p - b) / np.maximum(a[..., None], 1e-6) + b, p)
    ink = np.clip(ink * 255, 0, 255)

    out = arr.astype(np.float32).copy()
    alpha = out[..., 3] / 255
    alpha = np.where(gone, 0, alpha)
    alpha = np.where(band, alpha * a, alpha)
    out[..., :3] = np.where(band[..., None], ink, out[..., :3])
    out[..., 3] = alpha * 255
    return out.astype(np.uint8)


def trim(arr, pad=2):
    alpha = arr[..., 3]
    rows = np.where((alpha > 8).any(axis=1))[0]
    cols = np.where((alpha > 8).any(axis=0))[0]
    if not len(rows) or not len(cols):
        raise Unfit("the logo is empty once its ground is taken away")
    top, bottom = max(0, rows[0] - pad), min(arr.shape[0], rows[-1] + 1 + pad)
    left, right = max(0, cols[0] - pad), min(arr.shape[1], cols[-1] + 1 + pad)
    return arr[top:bottom, left:right]


def _luminance(rgb):
    c = rgb / 255
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def legibility(arr, ground):
    """The share of the mark's outline that stands out from the ground, by contrast ratio."""
    alpha = arr[..., 3].astype(np.float32) / 255
    ink = alpha > 0.5
    if ink.sum() < 30:
        return 0.0
    lum = _luminance(arr[..., :3].astype(np.float32))
    g = float(_luminance(np.array(ground, dtype=np.float32)))
    stands = (np.maximum(lum, g) + 0.05) / (np.minimum(lum, g) + 0.05) >= LEGIBLE_RATIO
    outline = ink & _grow(~ink)
    # The better of the outline and the whole mark: a white keyline round
    # black letters reads on white by its letters.
    shares = [float(stands[ink].mean())]
    if outline.sum() >= 30:
        shares.append(float(stands[outline].mean()))
    return max(shares)


def on_ground(arr, ground):
    """The logo composited onto its ground, as an RGB image."""
    image = Image.fromarray(arr, "RGBA")
    flat = Image.new("RGB", image.size, tuple(int(round(v)) for v in ground))
    flat.paste(image, mask=image.getchannel("A"))
    return flat


def edge_sharpness(arr, ground, height):
    """How steep the logo's edges are when drawn `height` px tall: the strongest
    gradients against its own contrast. Crisp art is near 0.8, a blown-up
    thumbnail under 0.4."""
    flat = on_ground(arr, ground)
    if flat.height > height:
        flat = flat.resize((max(1, round(flat.width * height / flat.height)), height), Image.LANCZOS)
    g = np.asarray(flat.convert("L"), dtype=np.float32)
    if g.shape[0] < 4 or g.shape[1] < 4:
        return 0.0
    gx = np.abs(np.diff(g, axis=1))[:-1]
    gy = np.abs(np.diff(g, axis=0))[:, :-1]
    grad = np.maximum(gx, gy)
    span = float(np.percentile(g, 98) - np.percentile(g, 2))
    if span < 20:
        return 0.0
    return float(np.percentile(grad, 99.5) / span)


def hexof(rgb):
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(round(v)))) for v in rgb)


def prepare(image):
    """The logo cut, trimmed and placed. Raises Unfit when it cannot be shown cleanly."""
    arr = _rgba(image)
    kind, ground = ground_of(arr)
    if kind == "busy":
        raise Unfit("the logo sits on a picture or pattern that cannot be cut away or matched")
    if kind == "solid":
        # Near-white is white, so the mark sits on the page's own white header.
        if min(ground) >= 238:
            ground_for_header = WHITE
        else:
            ground_for_header = ground
        arr = cut_ground(arr, ground)
    arr = trim(arr)
    h, w = arr.shape[:2]
    ratio = w / h

    if kind == "solid":
        grounds = [ground_for_header]
    else:
        grounds = [WHITE, DARK_GROUND]
    scored = [(legibility(arr, g), g) for g in grounds]
    best_share, best = max(scored, key=lambda s: s[0])
    # A transparent mark that reads on white goes on white.
    if kind != "solid" and scored[0][0] >= LEGIBLE_SHARE:
        best_share, best = scored[0]
    if best_share < LEGIBLE_SHARE:
        raise Unfit(f"too little of the logo stands out from its ground ({best_share:.0%} of it)")

    width, height = drawn_size(ratio)
    if w < width * SOURCE_OVER_DRAWN or h < height * SOURCE_OVER_DRAWN:
        raise Unfit(f"the logo is only {w}x{h}px, too small to draw {width}x{height} without enlarging it")
    sharp = edge_sharpness(arr, best, height * 2)
    if sharp < EDGE_MIN:
        raise Unfit(f"the logo's edges are soft ({sharp:.2f}), as if enlarged from a thumbnail")

    out = Image.fromarray(arr, "RGBA")
    keep = min(out.width, width * 2)
    if keep < out.width:
        out = out.resize((keep, max(1, round(out.height * keep / out.width))), Image.LANCZOS)
    placement = {
        "logoWidth": width,
        "logoHeight": height,
        "logoRatio": round(ratio, 3),
        "logoGround": hexof(best),
        "logoSharpness": round(sharp, 3),
        "logoLegible": round(best_share, 3),
    }
    return out, placement


def save(image, path):
    image.save(path, "WEBP", lossless=True, quality=100, method=6)
