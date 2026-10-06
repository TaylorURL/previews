"""The checks a built brand must pass before it can go live.

Each returns a list of problems, empty when the brand passes. A business with
any problem is parked with them as the reason, and only parked businesses are
handed to a session.
"""

import glob
import json
import os
import re

from PIL import Image

from . import images

REQUIRED = {
    "professional": ["name", "shortName", "phone", "email", "address", "town", "state", "brand", "hero", "services", "about"],
    "roofing": ["name", "shortName", "phone", "address", "town", "state", "brand", "hero", "services", "about", "serviceArea"],
    "hvac": ["name", "shortName", "summary", "phone", "address", "town", "state", "brand", "hero", "groups"],
}
HERO = ["title", "lead", "image", "imageAlt"]
BRAND = ["primary", "heading", "body", "fonts"]
PLACEHOLDER = re.compile(r"lorem|ipsum|sample-|example\.com|555-01|\bTODO\b|\bTBD\b|xxx|placeholder", re.I)


def shape(brand):
    problems = []
    for key in REQUIRED.get(brand["template"], []):
        if brand.get(key) in (None, "", [], {}):
            problems.append(f"{key} is missing")
    for key in HERO:
        if not brand.get("hero", {}).get(key):
            problems.append(f"hero.{key} is missing")
    for key in BRAND:
        if not brand.get("brand", {}).get(key):
            problems.append(f"brand.{key} is missing")
    return problems


def facts(brand, evidence):
    problems = []
    digits = lambda s: re.sub(r"\D", "", str(s or ""))
    if len(digits(brand.get("phone"))) != 10 or digits(brand.get("phone")) != digits(evidence["phone"]):
        problems.append("the phone does not match the one stored from the Google listing")
    if not brand.get("address") or brand.get("address") != evidence["address"]:
        problems.append("the address does not match the one stored from the Google listing")
    if "rating" in brand and (brand["rating"] != evidence["rating"] or brand.get("reviewCount") != evidence["reviewCount"]):
        problems.append("the rating does not match the one stored from the Google listing")
    # Nothing stored holds review text, so no review may be quoted.
    if brand.get("reviews"):
        problems.append("quotes reviews that cannot be proved word for word")
    page = " ".join(evidence["text"].split())
    for paragraph in (brand.get("about") or {}).get("text") or []:
        if paragraph not in page:
            problems.append("the about text is not word for word from their site")
    return problems


def pictures(brand, root, slug):
    problems = []
    folder = os.path.join(root, "public")
    refs = set(re.findall(rf"/brands/{re.escape(slug)}/[a-z0-9-]+(?:\.webp)?", json.dumps(brand)))
    mine = {}
    for ref in refs:
        files = [ref] if ref.endswith(".webp") else [f"{ref}-800.webp", f"{ref}-1600.webp"]
        for f in files:
            path = folder + f
            if not os.path.exists(path):
                problems.append(f"{f} does not exist")
                continue
            with Image.open(path) as image:
                if images.blank(image.convert("RGB")):
                    problems.append(f"{f} is blank")
                if not f.endswith("logo.webp") and image.width < 700 and f.endswith("-1600.webp"):
                    problems.append(f"{f} is too small")
                if f.endswith("-800.webp") or f.endswith("logo.webp"):
                    mine[f] = images.ahash(image)
    # No picture may be one already shown on another business's preview.
    for other in glob.glob(os.path.join(folder, "brands", "*", "*-800.webp")):
        if f"/brands/{slug}/" in other.replace(os.sep, "/"):
            continue
        try:
            with Image.open(other) as image:
                h = images.ahash(image)
        except Exception:
            continue
        for f, mh in mine.items():
            if images.distance(h, mh) <= 2:
                problems.append(f"{f} is the same picture as {os.path.relpath(other, folder)}")
    return problems


def words(brand, root, slug):
    problems = []
    text = json.dumps(brand, ensure_ascii=False)
    hit = PLACEHOLDER.search(text)
    if hit:
        problems.append(f"placeholder text: {hit.group(0)}")
    own = brand["name"].lower()
    for path in glob.glob(os.path.join(root, "src", "brands", "*.json")):
        other_slug = os.path.basename(path)[:-5]
        if other_slug == slug:
            continue
        try:
            with open(path) as handle:
                other = json.load(handle)
        except Exception:
            continue
        for key in ("name", "shortName"):
            name = (other.get(key) or "").strip()
            if len(name) >= 6 and name.lower() not in own and name.lower() in text.lower():
                problems.append(f"names another business: {name}")
    return problems


def colors(brand):
    b = brand.get("brand", {})
    problems = []
    try:
        if images.contrast(images.rgbof(b["primary"]), (255, 255, 255)) < 4.5:
            problems.append("white text does not read on the brand color")
        if "accent" in b and "ink" in b and images.contrast(images.rgbof(b["accent"]), images.rgbof(b["ink"])) < 3:
            problems.append("the accent color does not read on the dark grounds")
    except (KeyError, ValueError):
        problems.append("the brand colors are not all set")
    return problems


def all_checks(brand, evidence, root, slug):
    return colors(brand) + shape(brand) + facts(brand, evidence) + pictures(brand, root, slug) + words(brand, root, slug)
