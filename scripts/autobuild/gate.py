"""The quality gate, for a preview built by hand as much as by the pipeline.

    python3 -m scripts.autobuild.gate logo <url-or-file> <slug>
        Cuts the logo's ground away, refuses one that cannot sit cleanly,
        writes public/brands/<slug>/logo.webp and its one-color cut
        logo-mono.webp, and prints the fields that go in the brand file's
        "brand" block.

    python3 -m scripts.autobuild.gate photo [--slot hero|card] <url-or-file>...
        Says of each picture whether it can be shown, and in that slot.

    python3 -m scripts.autobuild.gate check <slug>...
        Every check a brand file must pass before it lands: its facts' shape,
        its pictures and logo, every page drawn by the server build, and the
        built home page opened at desktop and phone size and measured. Needs
        `npm run build` first. Exits 1 when any business has a problem. How
        the pages look is the review's to judge (scripts.autobuild.review),
        which photographs every page and fixes what it finds at the source.

The vision check runs wherever the `claude` command does; PREVIEW_VISION=off
leaves it out.
"""

import os

os.environ.setdefault("no_proxy", "*")

import json
import subprocess
import sys
import tempfile

from . import check, collect, images, logo, quality, vision, visual
from .__main__ import ROOT, render


def _read(source):
    if os.path.exists(source):
        with open(source, "rb") as handle:
            return images.open_image(handle.read())
    return images.open_image(collect.fetch(source, binary=True)[1])


def cmd_logo(source, slug):
    image = _read(source)
    try:
        mark, placement = logo.prepare(image)
    except logo.Unfit as reason:
        print(f"REFUSED: {reason}")
        return 1
    with tempfile.TemporaryDirectory() as folder:
        from .build import _logo_sheet
        look = vision.judge_logo(_logo_sheet(mark, placement, folder))
    if look is not None and not look["ok"]:
        print("REFUSED by the look: " + "; ".join(look["problems"]))
        return 1
    target = os.path.join(ROOT, "public", "brands", slug)
    os.makedirs(target, exist_ok=True)
    if look is not None and not look["has_name"]:
        placement["logoName"] = True
    fields = logo.write(mark, placement, target, slug)
    print(json.dumps(fields, indent=2))
    if look is None:
        print(f"(not looked at: {vision.last_error})")
    return 0


def cmd_photo(args):
    slot = None
    if args[:1] == ["--slot"]:
        slot, args = args[1], args[2:]
    bad = 0
    with tempfile.TemporaryDirectory() as folder:
        paths = []
        for i, source in enumerate(args):
            image = _read(source)
            m = quality.metrics(image)
            why = quality.problems(m, slot)
            path = os.path.join(folder, f"{i:02d}.png")
            copy = image.convert("RGB")
            copy.thumbnail((1400, 1400))
            copy.save(path)
            paths.append((source, path, m, why))
        looks = vision.screen_photos([p for _, p, _, _ in paths]) or {}
        for source, path, m, why in paths:
            verdict = looks.get(path)
            if verdict and not verdict["ok"]:
                why = why + [f"the look: {verdict['why']}"]
            bad += bool(why)
            print(("REFUSED " if why else "OK      ") + source)
            print(f"        {m['width']}x{m['height']} sharp {m['sharp']:.3f} blocky {m['blocky']:.2f} flat {m['flat']:.2f} score {quality.score(m):.3f}"
                  + (f" look {verdict['score']}/5" if verdict else ""))
            for w in why:
                print(f"        - {w}")
        if not looks and vision.last_error:
            print(f"(not looked at: {vision.last_error})")
    return 1 if bad else 0


def cmd_check(slugs):
    found = {}
    for slug in slugs:
        with open(os.path.join(ROOT, "src", "brands", f"{slug}.json")) as handle:
            brand = json.load(handle)
        found[slug] = check.colors(brand) + check.shape(brand) + check.pictures(brand, ROOT, slug) + check.words(brand, ROOT, slug)
    drawn = render(slugs)
    for slug in slugs:
        found[slug] += drawn.get(slug, [])
    if not os.path.isdir(os.path.join(ROOT, "dist", "b")):
        print("dist/ is missing: run npm run build first")
        return 1
    shots = os.path.join(ROOT, ".autobuild", "shots")
    os.makedirs(shots, exist_ok=True)
    out = subprocess.run(["node", "scripts/autobuild/layout.mjs", shots, *slugs], cwd=ROOT, capture_output=True, text=True,
                         stdin=subprocess.DEVNULL)
    seen = json.loads(out.stdout or "{}")
    for slug in slugs:
        result = seen.get(slug)
        if result is None:
            found[slug].append(f"the layout check did not open it: {out.stderr.strip()[-200:]}")
            continue
        found[slug] += result["problems"] + visual.look(result, ask_vision=False)
        for note in result.get("notes", []):
            print(f"{slug}: ({note})")
    bad = 0
    for slug, problems in found.items():
        bad += bool(problems)
        print(("PARK " if problems else "PASS ") + slug)
        for p in problems:
            print(f"     - {p}")
        print(f"     screenshots: {shots}/{slug}-desktop-top.png, {shots}/{slug}-phone-top.png")
    return 1 if bad else 0


def main(argv):
    if not argv or argv[0] not in ("logo", "photo", "check"):
        print(__doc__)
        return 2
    if argv[0] == "logo":
        return cmd_logo(argv[1], argv[2])
    if argv[0] == "photo":
        return cmd_photo(argv[1:])
    return cmd_check(argv[1:])


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
