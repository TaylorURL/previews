"""The business's own pictures, made into the files a brand reads, and the
colors taken from its logo.

A photo becomes `<name>-800.webp` and `<name>-1600.webp` (never upscaled), the
logo one `logo.webp` at about twice its drawn width. A picture that is blank,
tiny or the same as one already used is refused rather than shown.
"""

import colorsys
import io
import os
import re
import shutil
import subprocess
import tempfile

from PIL import Image, ImageChops, ImageStat

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def _svg_to_png(data, width=1000):
    """An SVG drawn to PNG bytes on nothing: rsvg-convert where there is one,
    else the Chromium the layout check already uses."""
    if not re.search(rb"<svg[^>]*xmlns=", data[:2000]):
        data = re.sub(rb"<svg\b", b'<svg xmlns="http://www.w3.org/2000/svg"', data, count=1)
    tool = shutil.which("rsvg-convert")
    if tool:
        with tempfile.NamedTemporaryFile(suffix=".svg") as svg:
            svg.write(data)
            svg.flush()
            return subprocess.run([tool, "-w", str(width), svg.name], capture_output=True, check=True, timeout=60).stdout
    with tempfile.TemporaryDirectory() as folder:
        svg, png = os.path.join(folder, "in.svg"), os.path.join(folder, "out.png")
        with open(svg, "wb") as handle:
            handle.write(data)
        subprocess.run(["node", os.path.join(ROOT, "scripts", "autobuild", "raster.mjs"), svg, png, str(width)],
                       cwd=ROOT, capture_output=True, check=True, timeout=90, stdin=subprocess.DEVNULL)
        with open(png, "rb") as handle:
            return handle.read()


def open_image(data):
    """Raster bytes as an image; an SVG is drawn first."""
    head = data[:600].lstrip().lower()
    if head.startswith(b"<?xml") or b"<svg" in head:
        data = _svg_to_png(data)
    image = Image.open(io.BytesIO(data))
    image.load()
    return image


def ahash(image, size=8):
    small = image.convert("L").resize((size, size), Image.LANCZOS)
    pixels = list(small.getdata())
    mean = sum(pixels) / len(pixels)
    return "".join("1" if p > mean else "0" for p in pixels)


def distance(a, b):
    return sum(x != y for x, y in zip(a, b))


def palette(image):
    """The share of a photo in each of 512 coarse colors."""
    small = image.convert("RGB").resize((64, 48))
    counts = [0] * 512
    for r, g, b in small.getdata():
        counts[(r >> 5) * 64 + (g >> 5) * 8 + (b >> 5)] += 1
    return [c / (64 * 48) for c in counts]


def same_scene(a, b, share=0.6):
    """True when two photos are mostly the same colors: two shots of one pool
    or one room from another angle, which the fingerprints call two pictures."""
    return sum(min(x, y) for x, y in zip(palette(a), palette(b))) >= share


def blank(image):
    stat = ImageStat.Stat(image.convert("L"))
    return stat.stddev[0] < 8


def trimmed(image):
    """A photo without the plain white margin their page laid it out with (a
    picture set off to one side of a white panel, a transparent edge), which
    would draw as a pale strip down the side of the frame it fills."""
    rgba = image.convert("RGBA")
    flat = Image.new("RGB", rgba.size, (255, 255, 255))
    flat.paste(rgba, mask=rgba.getchannel("A"))
    box = ImageChops.difference(flat, Image.new("RGB", flat.size, (255, 255, 255))).convert("L").point(lambda v: 255 if v > 16 else 0).getbbox()
    return image.crop(box) if box and box != (0, 0) + image.size else image


def save_photo(image, folder, name):
    """Writes the -800 and -1600 pair and returns the width it was given. A
    picture with any transparency left is laid on white, never on black."""
    if image.mode in ("RGBA", "LA", "P"):
        rgba = image.convert("RGBA")
        image = Image.new("RGB", rgba.size, (255, 255, 255))
        image.paste(rgba, mask=rgba.getchannel("A"))
    image = image.convert("RGB")
    for width in (800, 1600):
        target = min(width, image.width)
        out = image if target == image.width else image.resize(
            (target, round(image.height * target / image.width)), Image.LANCZOS)
        out.save(os.path.join(folder, f"{name}-{width}.webp"), "WEBP", quality=78, method=6)
    return image.width


def _lum(rgb):
    def chan(v):
        c = v / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)


def contrast(a, b):
    la, lb = sorted((_lum(a), _lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def hexof(rgb):
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(v))) for v in rgb)


def rgbof(text):
    text = text.lstrip("#")
    if len(text) == 3:
        text = "".join(c * 2 for c in text)
    return tuple(int(text[i:i + 2], 16) for i in (0, 2, 4))


def shade(rgb, factor):
    """Darker below 1, lighter above it, keeping the hue."""
    h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in rgb))
    l = max(0.0, min(1.0, l * factor if factor < 1 else l + (1 - l) * (factor - 1)))
    return tuple(v * 255 for v in colorsys.hls_to_rgb(h, l, s))


def mix(a, b, share):
    return tuple(x * (1 - share) + y * share for x, y in zip(a, b))


def until_readable(rgb, ground=(255, 255, 255), ratio=4.5):
    """The color darkened step by step until text in it reads on the ground."""
    tries = 0
    while contrast(rgb, ground) < ratio and tries < 40:
        rgb = shade(rgb, 0.92)
        tries += 1
    return rgb


def logo_colors(image):
    """The colored inks of a logo, most used first, with white, black and grays left out."""
    image = image.convert("RGBA")
    image.thumbnail((200, 200))
    pixels = [p[:3] for p in image.getdata() if p[3] > 200]
    if not pixels:
        return []
    flat = Image.new("RGB", (len(pixels), 1))
    flat.putdata(pixels)
    quant = flat.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
    palette = quant.getpalette()
    counts = sorted(quant.getcolors(), reverse=True)
    out = []
    for count, index in counts:
        rgb = tuple(palette[index * 3:index * 3 + 3])
        h, l, s = colorsys.rgb_to_hls(*(v / 255 for v in rgb))
        if s < 0.22 or l > 0.93 or l < 0.08:
            continue
        if count / len(pixels) < 0.02:
            continue
        if any(abs(h - colorsys.rgb_to_hls(*(v / 255 for v in o))[0]) < 0.04 for o in out):
            continue
        out.append(rgb)
    return out


def looks_like_logo(image):
    """A mark worth trying rather than an icon, a spacer or a sliver of one:
    big enough to read, with enough of it drawn. logo.py decides the rest."""
    rgba = image.convert("RGBA")
    box = rgba.getchannel("A").getbbox()
    if box:
        rgba = rgba.crop(box)
    if rgba.width < 60 or rgba.height < 24:
        return False
    small = rgba.copy()
    small.thumbnail((200, 200))
    pixels = list(small.getdata())
    opaque = [p for p in pixels if p[3] > 128]
    share = len(opaque) / max(len(pixels), 1)
    return share >= 0.03 and not blank_mark(rgba)


def blank_mark(image):
    """Whether a logo shows nothing, judged as drawn: a one-color mark on
    nothing is a shape once it sits on a ground, though its color channels
    alone are flat."""
    rgba = image.convert("RGBA")
    for ground in ((255, 255, 255), (0, 0, 0)):
        flat = Image.new("RGB", rgba.size, ground)
        flat.paste(rgba, mask=rgba.getchannel("A"))
        if not blank(flat):
            return False
    return True
