"""Builds one prospect's brand file and pictures in a checkout.

    build(prospect, root) -> (brand, evidence)   or raises Parked(reason)

`prospect` is a row from preview_candidates. `evidence` is what the checks
prove the brand against: the collected phone, address, rating, review sources
and the text of the business's own pages.
"""

import json
import os
import re

from . import collect, compose, images

TOWNS = [
    "Baytown", "Houston", "Pasadena", "Deer Park", "La Porte", "Mont Belvieu", "League City", "Pearland", "Channelview",
    "Highlands", "Crosby", "Dayton", "Anahuac", "Liberty", "Galveston", "Texas City", "Friendswood", "Webster", "Seabrook",
    "Dickinson", "Alvin", "Santa Fe", "La Marque", "Humble", "Kingwood", "Katy", "Sugar Land", "Spring", "The Woodlands",
    "Conroe", "Cypress", "Tomball", "Atascocita", "Kemah", "Clear Lake", "Bellaire", "Missouri City", "Stafford",
    "Richmond", "Rosenberg", "Beaumont", "Port Arthur", "Lake Jackson", "Angleton", "Clute", "Freeport", "South Houston",
    "Galena Park", "Jacinto City", "Huffman", "Cove", "Hitchcock", "Manvel", "Fresno", "Brookshire",
]


class Parked(Exception):
    """A business this script cannot build without guessing, and why."""


def _sample(root, template):
    with open(os.path.join(root, "src", "brands", f"sample-{template}.json")) as handle:
        return json.load(handle)


def _logo(pages, business):
    """The logo, from the business's own structured data or the header of its site."""
    candidates = []
    logo = business.get("logo")
    if isinstance(logo, dict):
        logo = logo.get("url")
    if isinstance(logo, str):
        candidates.append(logo)
    home = pages[0]
    for img in home.images:
        if "logo" in img["hint"] or "logo" in img["alt"].lower():
            candidates.append(img["src"])
    for img in home.images:
        if img["header"]:
            candidates.append(img["src"])
    for src in dict.fromkeys(candidates):
        if re.search(r"google|review|badge|bbb|yelp|facebook|award|seal|angi|homeadvisor|nextdoor|thumbtack|houzz|certified|partner", src, re.I):
            continue
        try:
            image = images.open_image(collect.fetch(src, binary=True)[1])
        except Exception:
            continue
        if not images.looks_like_logo(image):
            continue
        return image, src
    return None, None


def _photos(pages, place, logo_src, limit=6):
    """Their own photos: the Google listing's first, then the large pictures on their site."""
    found = []
    hashes = []

    def keep(image, source):
        if image.width < 700 or image.height < 380:
            return
        ratio = image.width / image.height
        if not 0.6 <= ratio <= 2.6 or images.blank(image):
            return
        h = images.ahash(image)
        if any(images.distance(h, o) < 6 for o in hashes):
            return
        hashes.append(h)
        found.append((image.convert("RGB"), source))

    for photo in (place.get("photos") or [])[:limit]:
        try:
            keep(images.open_image(collect.place_photo(photo["name"])), "google")
        except Exception:
            continue
    for page in pages[:4]:
        for img in page.images:
            if len(found) >= limit + 2:
                break
            if img["src"] == logo_src or re.search(r"logo|icon|badge|seal|avatar|sprite|award|bbb|google|facebook|yelp|angi|homeadvisor|\.svg", img["hint"] + img["src"].lower()):
                continue
            try:
                keep(images.open_image(collect.fetch(img["src"], binary=True)[1]), "site")
            except Exception:
                continue
    return found


def build(prospect, root, slug):
    template = prospect["industry"]
    if template not in compose.AUTOMATED:
        raise Parked(f"no automatic build for the {template} template yet")
    try:
        pages = collect.site(prospect["website"])
    except Exception as error:
        raise Parked(f"their website did not load: {str(error)[:120]}")
    try:
        place = collect.places(prospect.get("place_id"))
    except Exception as error:
        raise Parked(f"the Google listing could not be read: {str(error)[:120]}")
    business = collect.jsonld_business(pages)
    text = compose.page_text(pages)
    css = collect.css_text(pages)
    sample = _sample(root, template)

    name = compose.plain(prospect["name"])
    short = compose.short_name(name)
    phone = place.get("nationalPhoneNumber") or prospect.get("phone")
    street, town, state, zip_ = compose.address_parts(place, prospect)
    if not phone or not street or not town:
        raise Parked("no phone or street address on the Google listing")

    folder = os.path.join(root, "public", "brands", slug)
    os.makedirs(folder, exist_ok=True)

    logo, logo_src = _logo(pages, business)
    if logo is None:
        raise Parked("no usable logo on their website")
    logo_width = images.save_logo(logo, folder)
    inks = images.logo_colors(logo)
    colors = compose.colors_of(inks, css, template)
    if not colors:
        raise Parked("no brand color in the logo or the site's stylesheet")

    photos = _photos(pages, place, logo_src)
    if not photos:
        raise Parked("no usable photo on the Google listing or the website")
    names = []
    for i, (image, source) in enumerate(photos, 1):
        images.save_photo(image, folder, f"photo{i}")
        names.append((f"/brands/{slug}/photo{i}", source))

    kind = compose.KIND.get(prospect["trade"])
    vocab_key = kind or template
    services = compose.services_of(pages, compose.VOCAB[vocab_key])
    if len(services) < 2:
        raise Parked("fewer than two services named on their website")
    about = compose.about_of(pages, name)
    lead, lead_source = compose.lead_of(pages, about)
    if not lead:
        raise Parked("no description of the business in its own words")
    reviews = place and compose.reviews_of(place) or []
    areas = compose.areas_of(text, town, TOWNS)
    since = compose.SINCE.search(text)
    license_line = compose.LICENSE.search(text)

    label = compose.TRADE_LABEL[kind or template]
    main = services[0]["title"]
    brand = {
        "template": template,
        "preview": True,
        "name": name,
        "shortName": short,
        "phone": phone,
        "email": prospect.get("email"),
        "address": street,
        "town": town,
        "state": state,
    }
    if zip_:
        brand["zip"] = zip_
    if place.get("rating") and place.get("userRatingCount"):
        brand["rating"] = place["rating"]
        brand["reviewCount"] = place["userRatingCount"]
    if since:
        brand["since"] = int(since.group(1))
    if license_line:
        brand["license"] = compose.plain(license_line.group(1))
    hours = compose.hours_of(place)
    if hours:
        brand["hours"] = hours

    brand["brand"] = {
        **colors,
        **compose.font_block(compose.fonts_of(css), sample),
        "logo": f"/brands/{slug}/logo.webp",
        "logoWidth": logo_width,
    }
    hero_image = names[0][0]
    brand["hero"] = {
        "eyebrow": f"{label} in {town}",
        "title": short,
        "lead": lead,
        "image": hero_image,
        "imageAlt": f"A photo of {short}" if names[0][1] == "site" else f"A photo from {short}'s Google listing",
    }
    if template in ("roofing", "hvac"):
        brand["hero"]["titleAccent"] = f"{main} in {town}."
    else:
        what = " and ".join(t if t.isupper() else t.lower() for t in [x["title"] for x in services[:2]])
        brand["hero"]["title"] = f"{what[:1].upper()}{what[1:]} in {town} from {short}"

    if reviews:
        brand["reviews"] = [{"author": r["author"], "text": r["text"]} for r in reviews]
    brand["serviceArea"] = areas

    spare = [n for n, _ in names[1:]]
    about_image = spare[0] if spare else hero_image

    if template == "professional":
        brand["kind"] = kind
        items = []
        for s in services:
            icon = next((k for k, p in compose.ICONS["professional"] if re.search(p, s["title"], re.I)), None)
            item = {"slug": compose.slugify(s["title"]), "title": s["title"], "summary": compose.trim(s["text"], 50) or s["title"], "text": compose.trim(s["text"], 170) or ""}
            if s["text"]:
                item["lead"] = s["text"]
            if icon:
                item["icon"] = icon
            items.append(item)
        brand["services"] = items
        if not about:
            raise Parked("no about text on their website")
        brand["about"] = {"title": f"About {short}", "text": about, "image": about_image, "imageAlt": f"A photo of {short}"}

    elif template == "roofing":
        brand["services"] = [
            {"slug": compose.slugify(s["title"]), "title": s["title"], "short": compose.trim(s["text"], 70) or s["title"], "text": compose.trim(s["text"], 170) or "", **({"body": [s["text"]]} if s["text"] else {})}
            for s in services
        ]
        if not about:
            raise Parked("no about text on their website")
        brand["about"] = {"title": f"About {short}", "text": about, "image": about_image, "imageAlt": f"A photo of {short}"}

    elif template == "hvac":
        brand["summary"] = lead
        groups = []
        for i, s in enumerate(services[:5]):
            if not s["text"]:
                continue
            icon = next((k for k, p in compose.ICONS["hvac"] if re.search(p, s["title"], re.I)), "wrench")
            group = {"slug": compose.slugify(s["title"]), "title": s["title"], "icon": icon, "summary": compose.trim(s["text"], 140) or s["text"], "intro": s["text"]}
            if i + 1 < len(spare):
                group["image"] = spare[i + 1]
                group["imageAlt"] = f"A photo of {short}"
            groups.append(group)
        if len(groups) < 2:
            raise Parked("fewer than two services described on their website")
        brand["groups"] = groups
        if about:
            brand["about"] = {"eyebrow": "About us", "title": f"About {short}", "text": about, "image": about_image, "imageAlt": f"A photo of {short}"}

    evidence = {
        "phone": phone,
        "address": street,
        "rating": place.get("rating"),
        "reviewCount": place.get("userRatingCount"),
        "reviews": [r["_source"] for r in reviews],
        "lead_source": lead_source,
        "text": text,
        "photos": [s for _, s in names],
    }
    with open(os.path.join(root, "src", "brands", f"{slug}.json"), "w") as handle:
        json.dump(brand, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    return brand, evidence
