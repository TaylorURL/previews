"""The business's own pictures, made into the files a brand reads, and the
colors taken from its logo.

A photo becomes `<name>-800.webp` and `<name>-1600.webp` (never upscaled), the
logo one `logo.webp` at about twice its drawn width. A picture that is blank,
tiny or the same as one already used is refused rather than shown.
"""

import colorsys
import io
import os
import shutil
import subprocess
import tempfile

from PIL import Image, ImageStat

LOGO_DRAWN = 200


def open_image(data):
    """Raster bytes as an image; an SVG is drawn with rsvg-convert when there is one."""
    head = data[:600].lstrip().lower()
    if head.startswith(b"<?xml") or b"<svg" in head:
        tool = shutil.which("rsvg-convert")
        if not tool:
            raise ValueError("an SVG logo and no rsvg-convert to draw it")
        with tempfile.NamedTemporaryFile(suffix=".svg") as svg:
            svg.write(data)
            svg.flush()
            out = subprocess.run([tool, "-w", "800", svg.name], capture_output=True, check=True).stdout
        data = out
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


def blank(image):
    stat = ImageStat.Stat(image.convert("L"))
    return stat.stddev[0] < 8


def save_photo(image, folder, name):
    """Writes the -800 and -1600 pair and returns the width it was given."""
    image = image.convert("RGB")
    for width in (800, 1600):
        target = min(width, image.width)
        out = image if target == image.width else image.resize(
            (target, round(image.height * target / image.width)), Image.LANCZOS)
        out.save(os.path.join(folder, f"{name}-{width}.webp"), "WEBP", quality=78, method=6)
    return image.width


def save_logo(image, folder):
    """The logo trimmed to its drawing, saved at about twice its drawn width."""
    image = image.convert("RGBA")
    box = image.getchannel("A").getbbox()
    if box:
        image = image.crop(box)
    # A logo on a solid white or black ground keeps the ground; a transparent
    # one keeps its transparency.
    width = min(image.width, LOGO_DRAWN * 2)
    if width != image.width:
        image = image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
    image.save(os.path.join(folder, "logo.webp"), "WEBP", quality=90, method=6)
    ratio = image.width / max(image.height, 1)
    # Drawn about 56px tall in the headers, capped so a long wordmark fits.
    drawn = int(max(120, min(230, 56 * ratio)))
    return drawn


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
    """A real mark rather than an icon, a spacer or a sliver of one: wide
    enough to read, with enough of it drawn."""
    rgba = image.convert("RGBA")
    box = rgba.getchannel("A").getbbox()
    if box:
        rgba = rgba.crop(box)
    if rgba.width < 120 or rgba.height < 28 or rgba.width / max(rgba.height, 1) < 0.8:
        return False
    small = rgba.copy()
    small.thumbnail((200, 200))
    pixels = list(small.getdata())
    drawn = [p for p in pixels if p[3] > 128 and min(p[:3]) < 235]
    share = len(drawn) / max(len(pixels), 1)
    if not 0.03 <= share <= 0.97 or blank(rgba.convert("RGB")):
        return False
    # A logo drawn for a dark header is white on nothing, and would vanish on
    # the light headers the templates draw.
    opaque = [p for p in pixels if p[3] > 128]
    light = sum(1 for p in opaque if min(p[:3]) > 215)
    return light / max(len(opaque), 1) < 0.6
