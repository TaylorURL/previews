"""A business's logo, made to sit on the page the way it sits on their own.

    prepare(image) -> (logo, placement)   or raises Unfit(reason)

A logo arrives one of three ways. Drawn on nothing (an SVG or a PNG with
alpha), it keeps its transparency and goes on whichever ground it reads on, a
white header or a dark one, unless it is a flat plate with its name knocked
out through it, which is a flat ground of its own. Drawn on a flat color (the usual JPEG on white, a
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
the header draws it, in CSS px), logoRatio, logoGround (the ground the mark was
drawn for), and logoReads (how much of the mark survives on grays from black
to white).

A logo is never boxed and never decides the page's colors. The template keeps
its own header and footer, and the site draws the mark on whatever ground it
lands on: in its own colors where enough of it survives there (logoReads lets
the page work that out for any ground), and otherwise as a one-color cut of it
(logo-mono.webp, written by `write`) painted in the ink of that spot, white on
a dark footer and the page's own ink on a light header.
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


# A strip of words set apart above or below the rest of the mark (a tagline
# under the name) is drawn at least this tall, so its letters read, up to the
# height a badge is drawn at. A run of rows thinner than RULE_SHARE of the mark
# is a rule, not words.
STRIP_MIN = 14
STRIP_MOST = 74
RULE_SHARE = 0.05
# A badge's name is set small inside it, often over its picture (a red name
# across a map and a skyline), so it is drawn up to this tall where its file
# holds the pixels, and never under 74.
BADGE_MOST = 84
# A long wordmark ("SCOTT SINGLETON FINCHER" across eight times its height) is
# drawn this tall where it fits this wide.
LONG_LOW = 40
LONG_MOST = 340


def _runs(ink):
    """The heights of the runs of inked rows, rules left out."""
    rows = ink.any(axis=1)
    edges = np.flatnonzero(np.diff(np.concatenate([[False], rows, [False]]).astype(np.int8)))
    return [end - start for start, end in zip(edges[::2], edges[1::2]) if end - start >= RULE_SHARE * len(rows)]


def strip_share(arr):
    """The share of the mark's height its thinnest strip of words takes, where
    clear rows part the mark into strips; 1 for a mark in one piece. Lines of
    words stacked beside a symbol (a tagline under the name, next to a badge)
    are parted only on their own side, so each half of the mark is read too,
    where it stacks three strips or more (not one word and the dot of an i),
    or holds one line of words alone beside a tall symbol (a thin name beside
    a bird that spans the mark)."""
    ink = arr[..., 3] > 32
    half = ink.shape[1] // 2
    runs = _runs(ink)
    shares = [min(runs) / len(ink)] if len(runs) > 1 else []
    for side in (ink[:, :half], ink[:, half:]):
        runs = _runs(side)
        if len(runs) > 2 or len(runs) == 1:
            shares.append(min(runs) / len(ink))
    return min(shares, default=1.0)


def drawn_size(ratio, strip=1.0, most=None):
    """The size the header draws a logo of this shape, in CSS px: wordmarks
    lower and wider, badges taller so the name inside them reads, a mark with
    a thin strip of words taller so the strip reads (never past `most`, the
    file's own height), nothing past 260 across. A long wordmark held to 260
    across would be drawn too low for its thin letters to read, so it runs on
    to LONG_MOST across to stay LONG_LOW tall (never past `most`)."""
    height = 48 if ratio >= 3.2 else 58 if ratio >= 1.6 else max(74, min(BADGE_MOST, most or BADGE_MOST))
    height = max(height, min(STRIP_MIN / strip, STRIP_MOST, most or STRIP_MOST))
    width = height * ratio
    if width > 260:
        height = max(260 / ratio, min(height, LONG_LOW, LONG_MOST / ratio, most or LONG_LOW))
        width = height * ratio
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


# A pattern drawn in tints of its ground (contour lines across a navy square)
# leaves most of the edge the ground's color, but its faint lines cross the
# edge again and again, where a mark run out to the edge crosses it a few times
# and in solid ink. Past this many faint crossings the ground is a pattern.
PATTERN_CROSSINGS = 8


def _faint_crossings(arr, ground):
    """How many times a faint line, a tint of the ground that never reaches
    solid ink, crosses the picture's outermost ring of pixels."""
    ring = np.concatenate([arr[0], arr[1:, -1], arr[-1, -2::-1], arr[-2:0:-1, 0]])[:, :3].astype(np.float32)
    dist = np.sqrt(((ring - ground) ** 2).sum(axis=1))
    off = dist > 28
    if off.all() or not off.any():
        return 0
    # The walk round the ring starts on the ground, so no line is split in two.
    start = int(np.argmin(off))
    off, dist = np.roll(off, -start), np.roll(dist, -start)
    edges = np.flatnonzero(np.diff(np.concatenate([[False], off, [False]]).astype(np.int8)))
    return sum(1 for a, b in zip(edges[::2], edges[1::2]) if dist[a:b].max() < 90)


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
    if _faint_crossings(arr, middle) > PATTERN_CROSSINGS:
        return "busy", None
    dist = np.sqrt(((opaque - middle) ** 2).sum(axis=1))
    near = dist <= 28
    if near.mean() >= 0.8:
        return "solid", tuple(float(v) for v in middle)
    # A flat ground the mark runs out to the edge of (a black roofline across
    # a yellow square): most of the edge is the ground, and the rest is ink
    # far from it rather than the in-between colors a photograph's edge has.
    if near.mean() >= 0.55 and ((dist > 28) & (dist < 90)).mean() < 0.08:
        return "solid", tuple(float(v) for v in middle)
    return "busy", None


# A mark drawn on nothing can still bring a ground of its own: a flat plate
# filling its own bounds, the name knocked out through it to show the page it
# was drawn for. At least this much of its outer ring is opaque and one color.
PLATE_RING = 0.95


def _plate(arr):
    """A transparent mark that is a flat plate with its name knocked out
    through it, as the flat ground it is: the holes filled with the ink they
    were cut to show (dark through a light plate, white through a dark one), so
    the plate is cut away like any flat ground and the name stays. The filled
    mark and the plate's color, or None when the mark is no plate."""
    alpha = arr[..., 3]
    rows = np.flatnonzero((alpha > 8).any(axis=1))
    cols = np.flatnonzero((alpha > 8).any(axis=0))
    if not len(rows) or not len(cols):
        return None
    arr = arr[rows[0]:rows[-1] + 1, cols[0]:cols[-1] + 1]
    ring = _border(arr)
    opaque = ring[:, 3] >= 200
    if opaque.mean() < PLATE_RING:
        return None
    rgb = ring[opaque][:, :3].astype(np.float32)
    plate = np.median(rgb, axis=0)
    if (np.sqrt(((rgb - plate) ** 2).sum(axis=1)) <= 28).mean() < PLATE_RING:
        return None
    hole = np.array(DARK_GROUND if _luminance(plate) >= 0.4 else WHITE, dtype=np.float32)
    a = arr[..., 3:].astype(np.float32) / 255
    out = np.empty_like(arr)
    out[..., :3] = np.clip(arr[..., :3] * a + hole * (1 - a), 0, 255).astype(np.uint8)
    out[..., 3] = 255
    return out, tuple(float(v) for v in plate)


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


# A line no thicker than this along the picture's edge, set apart from the mark
# by clear rows or columns, is a seam the ground was cropped or scaled with (a
# lighter edge row on a navy square), not ink, and is cut away with the ground.
SEAM = 3


def _seams(arr):
    """The logo without a seam along any of its four edges."""
    arr = arr.copy()
    for axis in (0, 1):
        n = arr.shape[axis]
        for order in (list(range(n)), list(range(n - 1, -1, -1))):
            lines = (arr[..., 3] > 8).any(axis=1 - axis)[order]
            start = int(np.argmax(lines)) if lines.any() else n
            stop = start + int(np.argmin(lines[start:])) if not lines[start:].all() else n
            if start < SEAM and stop - start <= SEAM and lines[stop:].any():
                cut = order[start:stop]
                if axis == 0:
                    arr[cut, :, 3] = 0
                else:
                    arr[:, cut, 3] = 0
    return arr


# A dotted or dashed line drawn round the whole mark, no thicker than SEAM and
# set apart from it by clear rows and columns, is the box a page editor draws
# round a picture of a name, not ink: it is cut away with the faint patch it
# held, so the mark is trimmed to itself. A side inked along more than
# FRAME_BROKEN of its length is a solid frame, and is left to _keyline; one
# inked along less than FRAME_SPAN is not a line.
FRAME_SPAN = 0.3
FRAME_BROKEN = 0.9


def _keyline(arr):
    """The logo without a thin box drawn round it in one line. A line no
    thicker than SEAM (twice that with its soft edges) running round the whole
    mark in one piece, clear of it, sits the mark in a box on the header rather
    than on it, solid or broken where a word is set into a side (INSURANCE in
    the foot of the box), so long as each side runs FRAME_SPAN of its length.
    A frame thicker than that is the design's own, and is kept."""
    ink = arr[..., 3] > 8
    rows, cols = np.flatnonzero(ink.any(axis=1)), np.flatnonzero(ink.any(axis=0))
    if len(rows) <= 4 * SEAM or len(cols) <= 4 * SEAM:
        return arr
    # The line is followed from the mark's top row through the ink it touches.
    line = np.zeros_like(ink)
    line[rows[0]] = ink[rows[0]]
    count = -1
    while True:
        line = _grow(line) & ink
        now = int(line.sum())
        if now == count:
            break
        count = now
    ys, xs = np.nonzero(line)
    top, bottom, left, right = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    edge = 2 * SEAM
    if bottom - top <= 2 * edge or left > cols[0] or right < cols[-1] + 1:
        return arr
    box = line[top:bottom, left:right]
    inside = np.zeros_like(box)
    inside[edge:-edge, edge:-edge] = True
    if (box & inside).any() or not ink[top:bottom, left:right][inside].any():
        return arr
    spans = [box[:edge].any(axis=0), box[-edge:].any(axis=0), box[:, :edge].any(axis=1), box[:, -edge:].any(axis=1)]
    if not all(span.mean() >= FRAME_SPAN for span in spans):
        return arr
    arr = arr.copy()
    arr[..., 3][line] = 0
    return arr


def _frame(arr):
    """The logo without a broken box drawn round it."""
    solid = arr[..., 3] > 127
    rows, cols = np.flatnonzero(solid.any(axis=1)), np.flatnonzero(solid.any(axis=0))
    if len(rows) <= 4 * SEAM or len(cols) <= 4 * SEAM:
        return arr
    top, bottom, left, right = rows[0], rows[-1] + 1, cols[0], cols[-1] + 1
    box = solid[top:bottom, left:right]
    # Each side's line is measured inside the other sides' lines, so they do
    # not join it, and must be followed by a clear line before the mark.
    widths = []
    for lines in (box[:, SEAM:-SEAM].any(axis=1), box[SEAM:-SEAM].any(axis=0)):
        for run in (lines, lines[::-1]):
            thick = int(np.argmin(run))
            if not 1 <= thick <= SEAM or not run[thick:].any():
                return arr
            widths.append(thick)
    t, b, l, r = widths
    spans = [box[:t].any(axis=0), box[-b:].any(axis=0), box[:, :l].any(axis=1), box[:, -r:].any(axis=1)]
    if not all(FRAME_SPAN <= span.mean() < FRAME_BROKEN for span in spans):
        return arr
    arr = arr.copy()
    lines = arr[top:bottom, left:right, 3]
    lines[:t], lines[-b:], lines[:, :l], lines[:, -r:] = 0, 0, 0, 0
    # The patch: anything faint further than two pixels from the mark's ink.
    arr[..., 3][~_grow(_grow(arr[..., 3] > 127))] = 0
    return arr


def trim(arr, pad=2):
    arr = _frame(_seams(_keyline(arr)))
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


# A strip of words set apart by clear rows at the top or foot of the mark (a
# tagline in pale gray under the name) whose strongest ink stands less than this
# contrast ratio from the ground it was drawn for cannot be read at the size a
# header draws it, and is cut away, so the mark is trimmed and sized without it.
FAINT_RATIO = 3.0


def _faint_strips(arr, ground):
    """The logo without a faint strip of words at its top or foot."""
    alpha = arr[..., 3]
    rows = (alpha > 8).any(axis=1)
    edges = np.flatnonzero(np.diff(np.concatenate([[False], rows, [False]]).astype(np.int8)))
    runs = list(zip(edges[::2], edges[1::2]))
    if len(runs) < 2:
        return arr
    a = alpha[..., None].astype(np.float32) / 255
    bg = np.array(ground, dtype=np.float32)
    lum = _luminance(arr[..., :3].astype(np.float32) * a + bg * (1 - a))
    g = float(_luminance(bg))
    contrast = (np.maximum(lum, g) + 0.05) / (np.minimum(lum, g) + 0.05)
    faint = [np.percentile(contrast[start:stop][alpha[start:stop] > 8], 95) < FAINT_RATIO for start, stop in runs]
    # The mark itself is never cut away, only a strip beside one that reads.
    if all(faint):
        return arr
    arr = arr.copy()
    for i in {0, len(runs) - 1}:
        start, stop = runs[i]
        if faint[i] and stop - start < 0.5 * len(rows):
            arr[start:stop, :, 3] = 0
    return arr


# A strip of words at the top or foot of the mark that would still be drawn
# shorter than this, once the mark is drawn as tall as its header allows (a
# two-line tagline under a badge, each line a tenth of it), is a smudge at that
# size, and is cut away, so the rest of the mark is sized and drawn without it.
STRIP_READS = 10


def _small_strips(arr):
    """The logo without a strip of words at its top or foot too small to read
    at the size the header draws the mark."""
    ink = arr[..., 3] > 32
    rows = ink.any(axis=1)
    edges = np.flatnonzero(np.diff(np.concatenate([[False], rows, [False]]).astype(np.int8)))
    runs = [(start, stop) for start, stop in zip(edges[::2], edges[1::2]) if stop - start >= RULE_SHARE * len(rows)]
    if len(runs) < 2:
        return arr
    h, w = arr.shape[:2]
    _, height = drawn_size(w / h, strip_share(arr), h / SOURCE_OVER_DRAWN)
    small = [(stop - start) * height / h < STRIP_READS for start, stop in runs]
    # The mark itself is never cut away: what is cut is at most half of it.
    top, foot = 0, len(runs)
    while foot - top > 1 and small[foot - 1] and runs[foot - 1][0] - runs[0][0] >= 0.5 * h:
        foot -= 1
    while foot - top > 1 and small[top] and runs[foot - 1][1] - runs[top + 1][0] >= 0.5 * h:
        top += 1
    if (top, foot) == (0, len(runs)):
        return arr
    arr = arr.copy()
    arr[:runs[top][0], :, 3] = 0
    arr[runs[foot - 1][1]:, :, 3] = 0
    return arr


# A wash drawn behind or beside the mark in a pale tint of its ground (gray
# swirls fading out behind a name on white) stands less than this contrast
# ratio from that ground: on the header it is a smudge rather than part of the
# mark. Such pixels further than two pixels from the ink that reads are cut
# away, so the mark is trimmed and sized to its ink, and a strip of words the
# wash ran behind is parted from the rest again. A mark mostly drawn in such
# tints is left whole. A tint lies between the ground and the ink that reads: on
# a dark ground a pale ring reads by, ink darker than the ground (the black an
# SVG's unstyled shapes are drawn in) is a second ink, not a wash, and is kept.
WASH_RATIO = 1.5
WASH_MOST = 0.5


def _wash(arr, ground):
    """The logo without a pale wash round its ink."""
    alpha = arr[..., 3]
    a = alpha[..., None].astype(np.float32) / 255
    bg = np.array(ground, dtype=np.float32)
    lum = _luminance(arr[..., :3].astype(np.float32) * a + bg * (1 - a))
    g = float(_luminance(bg))
    contrast = (np.maximum(lum, g) + 0.05) / (np.minimum(lum, g) + 0.05)
    inked = alpha > 8
    readable = inked & (contrast >= WASH_RATIO)
    if not readable.any():
        return arr
    side = np.sign(np.median(lum[readable]) - g)
    wash = inked & (contrast < WASH_RATIO) & (np.sign(lum - g) != -side) & ~_grow(_grow(readable))
    if not wash.any() or wash.sum() > WASH_MOST * inked.sum():
        return arr
    arr = arr.copy()
    arr[..., 3][wash] = 0
    return arr


def _outline(ink):
    """The mark's own edge: its pixels next to anything that is not mark,
    the edge of the picture included, so a badge cropped to its frame has
    the frame for an outline."""
    padded = np.pad(ink, 1, constant_values=False)
    return (padded & _grow(~padded))[1:-1, 1:-1]


def legibility(arr, ground):
    """The share of the mark's outline that stands out from the ground, by contrast ratio."""
    alpha = arr[..., 3].astype(np.float32) / 255
    ink = alpha > 0.5
    if ink.sum() < 30:
        return 0.0
    lum = _luminance(arr[..., :3].astype(np.float32))
    g = float(_luminance(np.array(ground, dtype=np.float32)))
    stands = (np.maximum(lum, g) + 0.05) / (np.minimum(lum, g) + 0.05) >= LEGIBLE_RATIO
    outline = _outline(ink)
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


# The grounds a mark is tried on: grays from black to white, evenly spaced in
# lightness. A colored ground reads as the gray of its own lightness.
READ_LEVELS = 11


def _edges(arr, ground):
    """How sharply lightness changes at each pixel of the mark drawn on `ground`."""
    level = np.asarray(on_ground(arr, ground).convert("L"), dtype=np.float32)
    across = np.zeros_like(level)
    down = np.zeros_like(level)
    across[:, 1:] = np.abs(np.diff(level, axis=1))
    down[1:] = np.abs(np.diff(level, axis=0))
    return np.maximum(across, down)


def _stands(arr, ground):
    """Which of the mark's inked pixels stand out from `ground`, by contrast ratio."""
    lum = _luminance(arr[..., :3].astype(np.float32))[arr[..., 3] > 127]
    g = float(_luminance(np.array(ground, dtype=np.float32)))
    return (np.maximum(lum, g) + 0.05) / (np.minimum(lum, g) + 0.05) >= LEGIBLE_RATIO


def reads(arr, native):
    """How much of the mark survives on each of READ_LEVELS gray grounds, black
    to white: the share of the edges it shows on the ground it was drawn for
    that it still shows there, from 0 (gone, a white name on white) to 1 (all
    of it). The page reads this to decide, for whatever ground a logo lands on,
    whether to draw it in its own colors or as its one-color cut.

    Edges alone overrate a mark whose letters are filled with an ink close to
    the ground and outlined in another (black letters in a blue keyline on a
    navy footer): the keyline keeps its edges while the letters sink into the
    ground. So each level is also no more than the share of the ink standing
    out on the native ground that still stands out there.

    Both of those are measured against the ground the mark was drawn for, so
    on that ground they are 1 by construction, however pale the mark is: a
    logo set in tints too light to read on the white it was drawn for scores
    the same as a black one. So each level is also no more than the share of
    the mark's ink that stands out on that level's own ground, read as the
    page reads it. A pale mark then falls below the share the page draws its
    own colors at, and its one-color cut is painted in the ink of the spot
    instead, which is what such a mark needs."""
    own = _edges(arr, native)
    total = float(own.sum())
    ink = _stands(arr, native)
    out = []
    for i in range(READ_LEVELS):
        gray = round(255 * i / (READ_LEVELS - 1))
        there = _edges(arr, (gray, gray, gray))
        stands = _stands(arr, (gray, gray, gray))
        edges = float(np.minimum(own, there).sum()) / total if total else 0.0
        kept = float((ink & stands).sum()) / ink.sum() if ink.any() else 0.0
        reads_there = float(stands.mean()) if stands.size else 0.0
        out.append(round(min(edges, kept, reads_there), 3))
    return out


# How far, in RGB distance from the ground the mark was drawn for, a pixel has
# to stand before it is ink in the one-color cut: under the first it is ground
# showing through, past the second it is solid ink.
MONO_FROM = 24.0
MONO_FULL = 110.0
# The share of the mark that has to survive into the one-color cut for it to
# be worth drawing: a mark drawn in tints of its own ground has nothing to cut.
MONO_KEEPS = 0.3


# A mark drawn as one ink set inside another far apart from it in lightness
# (yellow letters on a navy block, a white name across a red badge, a black elk
# on a green square) keeps them apart in the cut: the outer ink is drawn and
# each shape of the inner one that lies inside it is cut through, as a
# one-color version of such a logo is drawn by hand, while a shape of the inner
# ink outside it (a name set beside the badge) is drawn. Two inks closer than
# this, or one of them a sliver of the mark, are drawn as one ink.
SPLIT_RATIO = 3.0
SPLIT_SHARE = 0.12


# A region of the outer ink this full of its own bounds is a block (a badge, a
# square, a bar), and what lies in its bounds lies in it, even where the inner
# shape runs to its edge as an elk's legs run to the foot of its square.
BLOCK_FILL = 0.45
# Each inner shape is cut through, or drawn, whole: one that lies this much
# inside the outer ink is cut through, so a letter is never sliced in two.
WHOLE_INSIDE = 0.8
# The masks are read at no more than this many pixels across.
READ_WIDTH = 240


def _filled(mask):
    """The mask with every region it encloses filled in: whatever the outside
    cannot reach through the gaps in it."""
    outside = np.zeros_like(mask)
    free = ~mask
    outside[0], outside[-1], outside[:, 0], outside[:, -1] = free[0], free[-1], free[:, 0], free[:, -1]
    count = -1
    while True:
        outside = _grow(outside) & free
        now = int(outside.sum())
        if now == count:
            break
        count = now
    return ~outside


def _regions(mask):
    """The connected regions of a small mask, as a label per pixel (0 for none)."""
    h, w = mask.shape
    labels = np.zeros((h, w), dtype=np.int32)
    parent = [0]

    def root(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for y in range(h):
        for x in range(w):
            if not mask[y, x]:
                continue
            up = labels[y - 1, x] if y else 0
            left = labels[y, x - 1] if x else 0
            if up and left:
                a, b = root(up), root(left)
                labels[y, x] = min(a, b)
                parent[max(a, b)] = min(a, b)
            elif up or left:
                labels[y, x] = up or left
            else:
                parent.append(len(parent))
                labels[y, x] = len(parent) - 1
    return np.array([root(i) for i in range(len(parent))], dtype=np.int32)[labels]


def _held(inner, outer):
    """The shapes of the inner ink that lie inside the outer one, as a mask at
    full size: inside a region it encloses, or inside the bounds of one of its
    blocks."""
    step = max(1, int(np.ceil(inner.shape[1] / READ_WIDTH)))
    small_in, small_out = inner[::step, ::step], outer[::step, ::step]
    within = _filled(small_out)
    labels = _regions(small_out)
    total = max(1, int(small_out.sum()))
    for label in np.unique(labels[labels > 0]):
        ys, xs = np.nonzero(labels == label)
        if len(ys) < 0.02 * total:
            continue
        box = (ys.max() - ys.min() + 1) * (xs.max() - xs.min() + 1)
        if len(ys) / box >= BLOCK_FILL:
            within[ys.min():ys.max() + 1, xs.min():xs.max() + 1] = True
    shapes = _regions(small_in)
    held = np.zeros_like(small_in)
    for label in np.unique(shapes[shapes > 0]):
        shape = shapes == label
        if within[shape].mean() >= WHOLE_INSIDE:
            held |= shape
    full = np.repeat(np.repeat(held, step, axis=0), step, axis=1)[:inner.shape[0], :inner.shape[1]]
    # Out to the soft edge of each shape, which the reading at a coarser
    # size can leave just outside it.
    for _ in range(step + 1):
        full = _grow(full)
    return full


def _split(level, weight):
    """The lightness (log luminance) that best divides the mark's ink in two,
    the light and dark means either side of it, and the share of the ink on the
    light side: Otsu's threshold over a weighted histogram."""
    bins = np.linspace(level.min(), level.max() + 1e-6, 65)
    hist, _ = np.histogram(level, bins=bins, weights=weight)
    mids = (bins[:-1] + bins[1:]) / 2
    total = hist.sum()
    best, cut = -1.0, mids[0]
    for i in range(1, len(hist)):
        w0, w1 = hist[:i].sum(), hist[i:].sum()
        if not w0 or not w1:
            continue
        m0 = (hist[:i] * mids[:i]).sum() / w0
        m1 = (hist[i:] * mids[i:]).sum() / w1
        between = w0 * w1 * (m1 - m0) ** 2
        if between > best:
            best, cut = between, bins[i]
    low, high = level < cut, level >= cut
    m0 = np.average(level[low], weights=weight[low]) if weight[low].sum() else cut
    m1 = np.average(level[high], weights=weight[high]) if weight[high].sum() else cut
    return cut, m0, m1, weight[high].sum() / total


def mono(arr, ground):
    """The mark in one color, as white with an alpha, for a ground its own
    colors do not read on. Each pixel is as opaque as it stands apart from the
    ground the mark was drawn for, so a white name inside a navy badge drawn for
    white becomes a hole in a solid badge; and a mark in two inks far apart in
    lightness keeps only the one further from that ground, the other cut
    through. None when too little of the mark survives the cut."""
    rgb = arr[..., :3].astype(np.float32)
    native = np.array(ground, dtype=np.float32)
    dist = np.sqrt(((rgb - native) ** 2).sum(axis=-1))
    stands = np.clip((dist - MONO_FROM) / (MONO_FULL - MONO_FROM), 0, 1)
    alpha = arr[..., 3].astype(np.float32) / 255
    ink = (alpha > 0.5) & (stands > 0.5)
    if not ink.any():
        return None
    level = np.log(_luminance(rgb) + 0.05)
    keep = np.ones(alpha.shape, dtype=np.float32)
    if ink.sum() >= 60:
        cut, m0, m1, light = _split(level[ink], (alpha * stands)[ink])
        if np.exp(m1 - m0) >= SPLIT_RATIO and SPLIT_SHARE <= light <= 1 - SPLIT_SHARE:
            dark, bright = ink & (level < cut), ink & (level >= cut)
            # Each ink keeps the holes the other cuts in it: the elk through
            # its green square and the name through the dark bar beneath.
            # Half a stop either side of the threshold is drawn part-way, so
            # the edge between the two inks stays as smooth as the art's.
            # A shape that is itself cut through holds nothing: the red inside
            # a white O on a red badge is badge, not a hole in a hole.
            bright_in_dark, dark_in_bright = _held(bright, dark), _held(dark, bright)
            bright_in_dark, dark_in_bright = _held(bright, dark & ~dark_in_bright), _held(dark, bright & ~bright_in_dark)
            keep = np.where(bright_in_dark, np.clip((cut - level) / 0.5 + 0.5, 0, 1), keep)
            keep = np.minimum(keep, np.where(dark_in_bright, np.clip((level - cut) / 0.5 + 0.5, 0, 1), 1))
            # A fill that fades toward the ground the mark was drawn for (red
            # letters washing to white inside a black outline) is cut through
            # whole: its faint tints, too close to that ground to be ink, go
            # with the shape they fade from rather than hang as a haze in its hole.
            holes = bright_in_dark | dark_in_bright
            faint = (alpha > 0.5) & ~ink
            count = -1
            while int(holes.sum()) != count:
                count = int(holes.sum())
                holes |= _grow(holes) & faint
            keep = np.where(holes & faint, 0.0, keep)
    opacity = alpha * stands * keep
    marked = alpha > 0.5
    if (opacity[marked] > 0.5).mean() < MONO_KEEPS * (1 if keep.min() == 1 else 0.5):
        return None
    out = np.full(arr.shape, 255, dtype=np.uint8)
    out[..., 3] = np.clip(opacity * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def write(mark, placement, folder, slug):
    """Saves the mark and its one-color cut into the brand's folder and returns
    the fields the brand file carries for them."""
    import os
    save(mark, os.path.join(folder, "logo.webp"))
    fields = {"logo": f"/brands/{slug}/logo.webp"}
    cut = mono(np.asarray(mark.convert("RGBA")), _rgb(placement["logoGround"]))
    mono_path = os.path.join(folder, "logo-mono.webp")
    if cut is not None:
        save(cut, mono_path)
        fields["logoMono"] = f"/brands/{slug}/logo-mono.webp"
    elif os.path.exists(mono_path):
        os.remove(mono_path)
    for key in ("logoWidth", "logoHeight", "logoRatio", "logoGround", "logoReads", "logoName"):
        if key in placement:
            fields[key] = placement[key]
    return fields


def _rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def hexof(rgb):
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(round(v)))) for v in rgb)


def prepare(image):
    """The logo cut, trimmed and placed. Raises Unfit when it cannot be shown cleanly."""
    arr = _rgba(image)
    kind, ground = ground_of(arr)
    plate = _plate(arr) if kind == "transparent" else None
    if plate is not None:
        (arr, ground), kind = plate, "solid"
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

    arr = trim(_small_strips(trim(_faint_strips(_wash(arr, best), best))))
    h, w = arr.shape[:2]
    ratio = w / h
    width, height = drawn_size(ratio, strip_share(arr), h / SOURCE_OVER_DRAWN)
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
        "logoReads": reads(np.asarray(out), best),
        "logoSharpness": round(sharp, 3),
        "logoLegible": round(best_share, 3),
    }
    return out, placement


def rework(image):
    """A logo already on a preview, brought up to what `prepare` makes now,
    without refusing it: its flat ground cut away if it still carries one,
    trimmed, and placed again. A mark on no flat ground (a badge cropped to its
    own edge) keeps what it was drawn on."""
    arr = _rgba(image)
    kind, ground = ground_of(arr)
    plate = _plate(arr) if kind == "transparent" else None
    if plate is not None:
        (arr, ground), kind = plate, "solid"
    # A badge cropped to its own edge, or a mark on a picture, keeps what it
    # was drawn on: there is no flat ground to take away.
    if kind == "solid":
        arr = cut_ground(arr, ground)
        native = WHITE if min(ground) >= 238 else ground
    arr = trim(arr)
    if kind != "solid":
        on_white, on_dark = legibility(arr, WHITE), legibility(arr, DARK_GROUND)
        native = WHITE if on_white >= LEGIBLE_SHARE or on_white >= on_dark else DARK_GROUND
    arr = trim(_small_strips(trim(_faint_strips(_wash(arr, native), native))))
    h, w = arr.shape[:2]
    width, height = drawn_size(w / h, strip_share(arr), h / SOURCE_OVER_DRAWN)
    out = Image.fromarray(arr, "RGBA")
    keep = min(out.width, width * 2)
    if keep < out.width:
        out = out.resize((keep, max(1, round(out.height * keep / out.width))), Image.LANCZOS)
    placement = {
        "logoWidth": width,
        "logoHeight": height,
        "logoRatio": round(w / h, 3),
        "logoGround": hexof(native),
        "logoReads": reads(np.asarray(out), native),
    }
    return out, placement, kind


def save(image, path):
    image.save(path, "WEBP", lossless=True, quality=100, method=6)
