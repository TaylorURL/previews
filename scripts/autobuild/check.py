"""The checks a built brand must pass before it can go live.

Each returns a list of problems, empty when the brand passes. A business with
any problem is parked with them as the reason, and only parked businesses are
handed to a session.
"""

import glob
import json
import os
import re

import numpy as np
from PIL import Image

from . import compose, facts as factsheet, images, logo, quality

REQUIRED = {
    "professional": ["name", "shortName", "phone", "email", "address", "town", "state", "brand", "hero", "services", "about"],
    "roofing": ["name", "shortName", "phone", "address", "town", "state", "brand", "hero", "services", "about", "serviceArea"],
    "hvac": ["name", "shortName", "summary", "phone", "address", "town", "state", "brand", "hero", "groups"],
    # The new layouts draw the hvac shape (outdoor, industrial) and the professional one (health).
    "outdoor": ["name", "shortName", "summary", "phone", "address", "town", "state", "brand", "hero", "groups"],
    "industrial": ["name", "shortName", "summary", "phone", "address", "town", "state", "brand", "hero", "groups"],
    "health": ["kind", "name", "shortName", "phone", "email", "address", "town", "state", "brand", "hero", "services", "about"],
    "restaurant": ["name", "shortName", "cuisine", "phone", "address", "town", "state", "hours", "brand", "hero"],
    "recreation": ["kind", "name", "shortName", "phone", "address", "town", "state", "hours", "brand", "hero", "programs"],
}
HERO = ["title", "lead"]
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
    if brand.get("hero", {}).get("image") and not brand["hero"].get("imageAlt"):
        problems.append("hero.imageAlt is missing")
    for key in BRAND:
        if not brand.get("brand", {}).get(key):
            problems.append(f"brand.{key} is missing")
    return problems


def _listing_not_for_customers(brand, evidence):
    """Whether the page may lead with another number than the listing's: their
    site labels the listing's number as the line for job seekers or a fax, it
    stays among the page's lines under that label, and the number shown first
    is another of those lines (each of which is proved on their site below)."""
    digits = lambda s: re.sub(r"\D", "", str(s or ""))[-10:]
    lines = brand.get("phones") or []
    listed = any(digits(p.get("number")) == digits(evidence["phone"]) and compose.NOT_A_CUSTOMER_LINE.search(p.get("label") or "")
                 for p in lines)
    shown = any(digits(p.get("number")) == digits(brand.get("phone")) and not compose.NOT_A_CUSTOMER_LINE.search(p.get("label") or "")
                for p in lines)
    return listed and shown


def facts(brand, evidence):
    problems = []
    digits = lambda s: re.sub(r"\D", "", str(s or ""))
    if len(digits(brand.get("phone"))) != 10 or digits(brand.get("phone")) != digits(evidence["phone"]) and not _listing_not_for_customers(brand, evidence):
        problems.append("the phone does not match the one stored from the Google listing")
    if not brand.get("address") or brand.get("address") != evidence["address"]:
        problems.append("the address does not match the one stored from the Google listing")
    if "rating" in brand and (brand["rating"] != evidence["rating"] or brand.get("reviewCount") != evidence["reviewCount"]):
        problems.append("the rating does not match the one stored from the Google listing")
    return problems + written(brand, evidence)


def _covered(text, own, lines, corpus):
    """None when every word of `text` is their own (on their pages) or a
    written line still supported by the fact sheet; else what is not."""
    rest = factsheet.normal(text)
    for line in sorted(lines, key=lambda l: -len(l["text"])):
        # A headline drawn without the comma it was written with ("We look
        # for the root cause," before its accent) is still that line.
        said = factsheet.normal(line["text"]).strip(" .,;:!?-")
        if said and said in rest:
            missing = factsheet.supported(line["text"], corpus)
            if missing:
                return f"{line['text'][:60]!r} says what the fact sheet does not ({', '.join(missing[:4])})"
            rest = rest.replace(said, "\x00")
    for part in rest.split("\x00"):
        part = part.strip(" .,;:-")
        if len(part) > 3 and not factsheet.found_in(part, own):
            return f"{part[:60]!r} is neither their own words nor written from the fact sheet"
    return None


def written(brand, evidence):
    """The copy, reviews and facts a brand carries beyond the listing, proved
    against what the build read: every written sentence supported by the
    fact sheet, every review word for word in its source, every phone line,
    language, credential, person, industry and state on their own pages, and
    every quote in the fact sheet on the page it names."""
    problems = []
    pages = evidence.get("pages") or {}
    own = "\n".join([evidence.get("text") or ""] + list(pages.values()))
    lines = evidence.get("copy") or []
    corpus = evidence.get("corpus") or ""
    # The about text is their own words or written from checked facts.
    for paragraph in (brand.get("about") or {}).get("text") or []:
        why = _covered(paragraph, own, lines, corpus)
        if why:
            problems.append(f"the about text: {why}")
            break
    paths = {l["path"].split(".")[0] for l in lines}
    hero = brand.get("hero") or {}
    checked = [("highlights", [v for h in brand.get("highlights") or [] for v in (h.get("title"), h.get("text"))]),
               ("steps", [v for h in brand.get("steps") or [] for v in (h.get("title"), h.get("text"))])]
    if evidence.get("lead_source") == "written from the fact sheet":
        checked.append(("the lead", [hero.get("lead")]))
    if any(l["path"] == "hero.title" for l in lines) and hero.get("title"):
        checked.append(("the headline", [hero.get("title"), hero.get("titleAccent")]))
    if "summary" in paths and brand.get("summary"):
        checked.append(("the summary", [brand["summary"]]))
    for what, texts in checked:
        for text in texts:
            if text:
                why = _covered(text, own if what not in ("highlights", "steps") else "", lines, corpus)
                if why:
                    problems.append(f"{what}: {why}")
                    break
    # Every written line the page shows is still supported, wherever it went.
    shown = factsheet.normal(json.dumps(brand, ensure_ascii=False))
    for line in lines:
        if factsheet.normal(line["text"]) in shown and factsheet.supported(line["text"], corpus):
            problems.append(f"a written line says what the fact sheet does not: {line['text'][:70]!r}")
    for review in brand.get("reviews") or []:
        if not factsheet.review_proved(review, evidence):
            problems.append(f"quotes a review that is not word for word in {review.get('source') or 'its source'}: "
                            f"{str(review.get('text'))[:50]!r}")
    own_digits = re.sub(r"\D", "", own)
    for line in brand.get("phones") or []:
        number = re.sub(r"\D", "", line.get("number") or "")[-10:]
        if len(number) != 10 or (number not in own_digits and number != re.sub(r"\D", "", evidence["phone"])[-10:]):
            problems.append(f"the phone line {line.get('number')} is not on their site")
    for language in brand.get("languages") or []:
        said = r"spanish|espa[nñ]ol|habla" if language == "Spanish" else re.escape(language.lower())
        if language != "English" and not re.search(said, factsheet.normal(own)):
            problems.append(f"says they speak {language}, which their site does not")
    for item in brand.get("credentials") or []:
        if not factsheet.found_in(item.get("label"), own) or factsheet.supported(item.get("detail") or "", own):
            problems.append(f"the credential {item.get('label')!r} is not on their site as written")
    owner = brand.get("owner") or {}
    if owner and (not factsheet.found_in(owner.get("name"), own) or
                  owner.get("text") and _covered(owner["text"], own, lines, corpus)):
        problems.append(f"the owner {owner.get('name')!r} is not on their site as written")
    for key in ("industries", "statesServed"):
        for name in brand.get(key) or []:
            if not factsheet.found_in(name, own):
                problems.append(f"{key} names {name!r}, which their site does not")
    for fid, _, item in factsheet.items(evidence.get("facts") or {}):
        page = pages.get(item.get("url")) or ""
        if fid[0] not in "af" and not factsheet.found_in(item.get("quote"), page):
            problems.append(f"the fact sheet's {fid} quotes what is not on {item.get('url')}")
            break
    return problems


def _slots(brand):
    """Every photo the brand draws and the slot it fills: the hero's is drawn
    wide, every other one at card size."""
    out = {}
    hero = (brand.get("hero") or {}).get("image")
    if hero:
        out[hero] = "hero"
    for section in ("about",):
        image = (brand.get(section) or {}).get("image")
        if image and image not in out:
            out[image] = "card"
    for item in (brand.get("services") or []) + (brand.get("groups") or []):
        if item.get("image") and item["image"] not in out:
            out[item["image"]] = "card"
    return out


def logo_problems(brand, root):
    """Whether the logo file is a clean cut-out of the mark, with what the page
    needs to draw it on any ground."""
    b = brand.get("brand", {})
    if not b.get("logo"):
        # No logo is drawn as the name set in type, which needs nothing more.
        return []
    path = os.path.join(root, "public") + b["logo"]
    if not os.path.exists(path):
        return [f"{b['logo']} does not exist"]
    if not b.get("logoGround") or not b.get("logoHeight") or len(b.get("logoReads") or []) != logo.READ_LEVELS:
        return ["the logo has no logoGround, logoHeight or logoReads: prepare it with python3 -m scripts.autobuild.gate logo"]
    if b.get("logoMono") and not os.path.exists(os.path.join(root, "public") + b["logoMono"]):
        problems_early = [f"{b['logoMono']} does not exist"]
    else:
        problems_early = []
    with Image.open(path) as image:
        arr = np.asarray(image.convert("RGBA"))
    problems = problems_early
    ground = images.rgbof(b["logoGround"])
    kind, color = logo.ground_of(arr)
    if kind == "solid":
        # The page sets the mark on its own grounds, so the file carries none.
        problems.append(f"the logo still carries its own {logo.hexof(color)} background: cut it with python3 -m scripts.autobuild.gate logo")
    if kind == "busy":
        problems.append("the logo carries a picture or pattern behind it")
    share = logo.legibility(arr, ground)
    if share < logo.LEGIBLE_SHARE:
        problems.append(f"too little of the logo stands out from its {b['logoGround']} header ({share:.0%})")
    h, w = arr.shape[:2]
    if w < b.get("logoWidth", 0) * logo.SOURCE_OVER_DRAWN or h < b.get("logoHeight", 0) * logo.SOURCE_OVER_DRAWN:
        problems.append(f"the logo file is {w}x{h}px, too small for the {b.get('logoWidth')}x{b.get('logoHeight')} it is drawn")
    sharp = logo.edge_sharpness(arr, ground, int(b["logoHeight"]) * 2)
    if sharp < logo.EDGE_MIN:
        problems.append(f"the logo's edges are soft ({sharp:.2f})")
    return problems


def pictures(brand, root, slug):
    problems = []
    folder = os.path.join(root, "public")
    refs = set(re.findall(rf"/brands/{re.escape(slug)}/[a-z0-9-]+(?:\.webp)?", json.dumps(brand)))
    slots = _slots(brand)
    mine = {}
    for ref in refs:
        files = [ref] if ref.endswith(".webp") else [f"{ref}-800.webp", f"{ref}-1600.webp"]
        for f in files:
            path = folder + f
            if not os.path.exists(path):
                problems.append(f"{f} does not exist")
                continue
            with Image.open(path) as image:
                if images.blank_mark(image) if f.endswith(("logo.webp", "logo-mono.webp")) else images.blank(image.convert("RGB")):
                    problems.append(f"{f} is blank")
                if f.endswith("-1600.webp") and ref in slots:
                    for why in quality.problems(quality.metrics(image), slots[ref]):
                        problems.append(f"{ref}: {why}")
                if f.endswith("-800.webp") or f.endswith("logo.webp"):
                    mine[f] = images.ahash(image)
    problems += logo_problems(brand, root)
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
    # Nor may one photo fill two places on this one.
    used = [(brand.get("hero") or {}).get("image"), (brand.get("about") or {}).get("image")]
    used += [item.get("image") for item in (brand.get("services") or []) + (brand.get("groups") or [])]
    used = [u for u in used if u]
    if len(used) != len(set(used)):
        problems.append("one photo is used in two places")
    return problems


def words(brand, root, slug):
    problems = []
    text = json.dumps(brand, ensure_ascii=False)
    hit = PLACEHOLDER.search(text)
    if hit:
        problems.append(f"placeholder text: {hit.group(0)}")
    own = brand["name"].lower()
    for item in brand.get("services") or brand.get("groups") or []:
        title = item.get("title") or ""
        if compose.names_the_business(title, brand["name"]):
            problems.append(f"lists the business's own name as a service: {title}")
        elif compose.NOT_A_SERVICE_SHAPE.search(title) or re.search(r"\b(privacy|terms|glossary)\b", title, re.I):
            problems.append(f"lists a heading that is not a service: {title}")
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
            # Whole words only: "Xpress" inside "American Express" and "Next
            # Step" inside "next steps" name nobody. Nor does a lowercase run
            # of the same words - "the next step depends on the system" - so
            # the match is case-sensitive: a business's name is written the way
            # the business writes it.
            if len(name) < 6 or name.lower() in own:
                continue
            hits = list(re.finditer(rf"\b{re.escape(name)}\b", text))
            if key == "shortName":
                # A short name that a capitalised word extends belongs to a
                # longer proper name of something else: the Special Needs
                # Alliance is an association, not Alliance Industrial Group.
                # The full name above still catches that business itself
                # wherever it is written out.
                hits = [hit for hit in hits
                        if not re.search(r"\b[A-Z][\w&.'-]*\s+$", text[:hit.start()])
                        and not re.match(r"\s+[A-Z][\w&.'-]*", text[hit.end():])]
            if hits:
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
