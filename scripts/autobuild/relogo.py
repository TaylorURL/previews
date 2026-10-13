"""Brings the logos already on previews up to what the build makes now.

    python3 -m scripts.autobuild.relogo [--names] (--all | <slug>...)

Each brand's logo file is cut free of any flat background it still carries,
trimmed and placed again, and written with its one-color cut and what it reads on
(logo.write), so the page can draw it on any ground without a box. A badge
cropped to its own edge has no flat ground to cut and keeps what it was drawn
on, and says so.

--names asks the vision check again, for each logo drawn with the name set
beside it (logoName), whether the mark has words in it; one that does loses
the name beside it, which would otherwise show the name twice.
"""

import os

os.environ.setdefault("no_proxy", "*")

import glob
import json
import sys
import tempfile

from PIL import Image

from . import logo, vision
from .__main__ import ROOT

KEYS = ("logo", "logoMono", "logoWidth", "logoHeight", "logoRatio", "logoGround", "logoTones", "logoReads")


def relogo(slug, names=False):
    """Reworks one brand's logo in place; returns what happened, in a few words."""
    path = os.path.join(ROOT, "src", "brands", f"{slug}.json")
    with open(path) as handle:
        brand = json.load(handle)
    b = brand.get("brand") or {}
    source = b.get("logo")
    if not source or not source.startswith(f"/brands/{slug}/"):
        return "no logo of its own"
    file = os.path.join(ROOT, "public") + source
    if not os.path.exists(file):
        return f"{source} is missing"
    with Image.open(file) as image:
        image.load()
        try:
            mark, placement, kind = logo.rework(image)
        except logo.Unfit as reason:
            return f"left as it is: {reason}"
    folder = os.path.dirname(file)
    if names and b.get("logoName"):
        with tempfile.TemporaryDirectory() as scratch:
            from .build import _logo_sheet
            look = vision.judge_logo(_logo_sheet(mark, placement, scratch))
        if look is not None:
            placement["logoName"] = not look["has_name"]
    elif b.get("logoName"):
        placement["logoName"] = True
    fields = logo.write(mark, placement, folder, slug)
    if os.path.abspath(file) != os.path.abspath(os.path.join(folder, "logo.webp")):
        os.remove(file)
    for key in KEYS + ("logoName",):
        b.pop(key, None)
    # The logo's fields go where they were, after the colors and fonts.
    b.update(fields)
    brand["brand"] = b
    with open(path, "w") as handle:
        json.dump(brand, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    said = {"solid": "cut from its " + placement["logoGround"] + " ground", "busy": "kept as drawn, on no flat ground"}.get(
        kind, "already clear of a ground")
    return said + ("" if fields.get("logoMono") else "; no one-color cut") + ("; name beside it" if fields.get("logoName") else "")


def main(argv):
    names = "--names" in argv
    argv = [a for a in argv if a != "--names"]
    if argv == ["--all"]:
        slugs = sorted(os.path.basename(p)[:-5] for p in glob.glob(os.path.join(ROOT, "src", "brands", "*.json")))
    elif argv and not any(a.startswith("-") for a in argv):
        slugs = argv
    else:
        print(__doc__)
        return 2
    for slug in slugs:
        print(f"{slug}: {relogo(slug, names)}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
