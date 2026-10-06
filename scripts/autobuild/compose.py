"""One business's brand file, made from what was collected about it.

The copy is the business's own words wherever there are words: service names as
their site gives them, their own descriptions, their own about text trimmed and
never rewritten, and Google reviews quoted as written. The only sentences this
file writes itself are the frames a template needs around those facts - a
headline of their name, town and main service - and every one of those states
only something the collected data already says.

A field with nothing real to put in it is left out. Where a template cannot do
without it, the business is parked with the reason rather than padded.
"""

import json
import os
import re
import urllib.parse

from . import collect, images

# Templates this file can fill. Any other is parked for a person or a session.
AUTOMATED = {"professional", "roofing", "hvac"}

KIND = {"insurance agency": "insurance", "accountant": "accounting", "title company": "title"}

TRADE_LABEL = {
    "roofing": "Roofing",
    "hvac": "Heating and air",
    "insurance": "Insurance",
    "accounting": "Accounting and tax",
    "title": "Title and closing",
}

VOCAB = {
    "roofing": r"roof|shingle|metal|gutter|siding|storm|hail|leak|inspection|skylight|ventilat|flat|tile|commercial|residential|insurance claim|repair|replacement|coating|tpo",
    "hvac": r"air condition|\bac\b|a/c|heating|furnace|heat pump|duct|indoor air|air quality|thermostat|electrical|wiring|panel|generator|maintenance|installation|repair|refrigeration|commercial|residential|mini.?split|ventilation|cooling|plumbing",
    "insurance": r"insurance|auto|home|homeowner|life|business|commercial|flood|health|renters|umbrella|bond|workers|motorcycle|boat|landlord|liability|medicare|annuit",
    "accounting": r"tax|bookkeeping|payroll|audit|advisory|planning|accounting|irs|consult|quickbooks|cfo|estate|financial statement|business formation|compilation|review",
    "title": r"title|closing|escrow|refinanc|residential|commercial|1031|policy|search|notary|transaction",
}

ICONS = {
    "roofing": {},
    "hvac": [("snowflake", r"cool|air cond|\bac\b|a/c"), ("flame", r"heat|furnace"), ("zap", r"electric|panel|wiring|generator"),
             ("wind", r"duct|air quality|ventilat|indoor"), ("wrench", r".")],
    "professional": [("car", r"auto|vehicle|car"), ("house", r"home|homeowner|residential|renters|landlord"),
                     ("heart", r"life|health|medicare"), ("briefcase", r"business|commercial|liability|workers"),
                     ("calculator", r"tax|bookkeeping|payroll|accounting|audit"), ("file", r"title|closing|escrow")],
}

SINCE = re.compile(r"\b(?:since|established|founded|est\.?|serving [^.]{0,40} since)\s+((?:19|20)\d\d)\b", re.I)
LICENSE = re.compile(r"\b((?:TDLR|TACLA|TECL|TDI|NPN|License|Lic\.)\s*(?:No\.?|#|Number)\s*:?\s*[A-Z]{0,6}-?\d[\w-]{3,})", re.I)
NOT_A_SERVICE = re.compile(r"\b(guide|tips?|season|vs\.?|versus|how to|why|what|when|your|schedule|consult|estimator|calculator|types of|our |blog|news|faq|cost|price|pricing|near me|reviews?|testimonials?|careers?|financing|coupons?|specials?|offer|% off|\$|free|contact|call|about|portal|login|pay|apply|learn|read|welcome|meet|experts?|areas?|locations?|view|more|projects?|types?|gallery|portfolio|resources?)\b", re.I)
ACRONYMS = {"IRS", "CFO", "CPA", "CPAS", "HVAC", "AC", "A/C", "TPO", "LLC", "QB", "EPDM", "UV", "HOA", "1031", "S-CORP"}
GENERIC_NAV = re.compile(r"^(home|about( us)?|contact( us)?|services|our services|blog|faq|reviews|gallery|careers|menu|get a quote|request a quote|free estimate|call now|learn more|read more|more|portal|login|pay online|resources|team|our team|testimonials)$", re.I)

FONTS = [
    "Montserrat", "Open Sans", "Roboto", "Lato", "Poppins", "Raleway", "Oswald", "Source Sans 3", "Nunito", "Nunito Sans",
    "Merriweather", "Playfair Display", "PT Sans", "Work Sans", "Rubik", "Inter", "Barlow", "Barlow Condensed", "Libre Baskerville",
    "Lora", "Mulish", "Quicksand", "Josefin Sans", "Archivo", "Bebas Neue", "Anton", "DM Sans", "Manrope", "Karla", "Cabin",
    "Fira Sans", "Heebo", "IBM Plex Sans", "Noto Sans", "Hind", "Titillium Web", "Exo 2", "Kanit", "Teko", "Source Serif 4",
    "Cormorant Garamond", "EB Garamond", "Crimson Text", "Arimo", "Outfit", "Plus Jakarta Sans", "Red Hat Display", "Urbanist",
]


def plain(text):
    return " ".join(str(text or "").split())


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"'])", plain(text)) if s.strip()]


def trim(text, limit):
    """Their words, cut at a sentence boundary and never mid-sentence."""
    out = ""
    for sentence in sentences(text):
        if len(out) + len(sentence) + 1 > limit:
            break
        out = f"{out} {sentence}".strip()
    return out


def slugify(text):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", text.lower())).strip("-")[:40]


def title_case(text):
    small = {"a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "with"}
    out = []
    for i, w in enumerate(plain(text).split(" ")):
        if w.upper() in ACRONYMS:
            out.append("CPAs" if w.upper() == "CPAS" else w.upper())
            continue
        if w.isupper():
            w = w.lower()
        out.append(w.lower() if i and w.lower() in small else w[:1].upper() + w[1:])
    return " ".join(out)


def short_name(name):
    cut = re.sub(r",?\s+\b(LLC|L\.L\.C\.|Inc\.?|Co\.?|Corp\.?|PLLC|PC|P\.C\.|LP|Ltd\.?)$", "", plain(name), flags=re.I)
    cut = re.sub(r"\s+-\s+.*$", "", cut)
    return cut.strip() or plain(name)


def address_parts(place, prospect):
    parts = {c["types"][0]: c for c in place.get("addressComponents", []) if c.get("types")}
    street = " ".join(x for x in [parts.get("street_number", {}).get("longText"), parts.get("route", {}).get("shortText")] if x)
    if parts.get("subpremise"):
        street = f"{street}, {parts['subpremise']['longText']}"
    town = parts.get("locality", {}).get("longText") or prospect.get("town")
    state = parts.get("administrative_area_level_1", {}).get("shortText") or "TX"
    zip_ = parts.get("postal_code", {}).get("longText")
    if not street and prospect.get("address"):
        street = prospect["address"].split(",")[0]
    return street, town, state, zip_


def hours_of(place):
    """Google's opening hours, consecutive days with the same hours run together."""
    lines = (place.get("regularOpeningHours") or {}).get("weekdayDescriptions") or []
    rows = []
    for line in lines:
        if ":" not in line:
            continue
        day, time = line.split(":", 1)
        time = plain(time).replace(" ", " ").replace(" ", " ").replace(" – ", " – ")
        if rows and rows[-1][1] == time:
            rows[-1][0].append(day[:3])
        else:
            rows.append([[day[:3]], time])
    out = []
    for days, time in rows:
        label = days[0] if len(days) == 1 else f"{days[0]} – {days[-1]}"
        out.append([label, time])
    return out


def reviews_of(place, limit=3):
    out = []
    for review in place.get("reviews") or []:
        if (review.get("rating") or 0) < 4:
            continue
        source = (review.get("originalText") or review.get("text") or {}).get("text") or ""
        text = trim(source, 320)
        author = plain((review.get("authorAttribution") or {}).get("displayName"))
        if len(text) < 40 or not author:
            continue
        out.append({"author": author, "text": text, "_source": source})
        if len(out) == limit:
            break
    return out


def page_text(pages):
    return "\n".join(t for p in pages for _, t, _ in p.blocks)


def services_of(pages, vocab):
    """Their own service names, with their own description where the site gives one."""
    pattern = re.compile(vocab, re.I)
    found = {}
    order = []

    def add(name, text=None):
        name = plain(name).strip(" -|:")
        if not (3 <= len(name) <= 42) or len(name.split()) > 6 or GENERIC_NAV.match(name):
            return
        if not pattern.search(name) or re.search(r"[?!@]|\d{3}", name) or NOT_A_SERVICE.search(name) or re.match(r"(on|for|with|to|in|at|from|and)\b", name, re.I):
            return

        key = re.sub(r"[^a-z0-9 ]", "", name.lower())
        stem = lambda k: re.sub(r"s\b", "", k)
        if any(stem(key).startswith(stem(k)) or stem(k).startswith(stem(key)) for k in found if k != key):
            return
        if key not in found:
            found[key] = {"title": title_case(name), "text": None}
            order.append(key)
        if text and not found[key]["text"]:
            found[key]["text"] = text

    for page in pages[:1]:
        for href, text in page.links:
            if "service" in href.lower() or pattern.search(href):
                add(text)
    for page in pages:
        blocks = page.blocks
        for i, (tag, text, header) in enumerate(blocks):
            if tag in ("h2", "h3", "h4") and not header:
                desc = None
                for nxt_tag, nxt, _ in blocks[i + 1:i + 3]:
                    if nxt_tag == "p" and 60 <= len(nxt) <= 700:
                        desc = trim(nxt, 360)
                        break
                    if nxt_tag.startswith("h"):
                        break
                add(text, desc)
        for href, text in page.links:
            if "service" in href.lower() or pattern.search(href):
                add(text)
    return [found[k] for k in order][:8]


def about_of(pages, name):
    """Their own about text: the about page first, then the home page's own paragraphs about them."""
    chosen = []
    ordered = sorted(pages, key=lambda p: 0 if re.search(r"about|story|who-we", p.url, re.I) else 1)
    short = short_name(name).lower().split(" ")[0]
    for page in ordered:
        is_about = bool(re.search(r"about|story|who-we", page.url, re.I))
        for tag, text, header in page.blocks:
            if tag != "p" or header or len(text) < 90:
                continue
            if re.search(r"cookie|javascript|copyright|all rights reserved|privacy|©|% off|\$\d|off any|coupon|call (us|now|today)|click here", text, re.I):
                continue
            if not is_about and not re.search(rf"\b(we|our|{re.escape(short)})\b", text, re.I):
                continue
            if not re.match(r"[A-Z0-9\"'\u201c]", text) or "\u2026" in text or "..." in text:
                continue
            cut = trim(text, 600)
            if cut and cut not in chosen:
                chosen.append(cut)
            if len(chosen) == 3:
                return chosen
        if chosen and is_about:
            return chosen
    return chosen


def lead_of(pages, about):
    for page in pages[:1]:
        for key in ("og:description", "description"):
            text = trim(page.meta.get(key, ""), 220)
            if len(text) >= 60 and re.match(r"[A-Z]", text) and not re.search(r"cookie|javascript|\||near me|call us|\u2026|\.\.\.", text, re.I):
                return text, f"{page.url} meta {key}"
    if about:
        text = trim(about[0], 220)
        if len(text) >= 60:
            return text, "about text"
    return None, None


def areas_of(text, town, towns):
    found = [town] if town else []
    for t in towns:
        if t != town and re.search(rf"\b{re.escape(t)}\b", text):
            found.append(t)
    return found[:12]


def fonts_of(css):
    seen = []
    for family in re.findall(r"font-family\s*:\s*([^;}{]+)", css, re.I):
        for name in family.split(","):
            name = name.strip().strip("'\"")
            match = next((f for f in FONTS if f.lower() == name.lower()), None)
            if match and match not in seen:
                seen.append(match)
    for name in re.findall(r"family=([A-Za-z+]+)", css):
        name = name.replace("+", " ")
        match = next((f for f in FONTS if f.lower() == name.lower()), None)
        if match and match not in seen:
            seen.append(match)
    return seen


def font_block(found, sample):
    """The site's own faces where they are Google fonts, else the template's own pair."""
    if not found:
        return {k: sample["brand"][k] for k in ("heading", "body", "fonts")}
    heading = found[0]
    body = found[1] if len(found) > 1 else found[0]
    fams = [heading] if heading == body else [heading, body]
    query = "&".join(f"family={urllib.parse.quote_plus(f)}:wght@400;600;700" for f in fams)
    serif = {"Merriweather", "Playfair Display", "Libre Baskerville", "Lora", "Source Serif 4", "Cormorant Garamond", "EB Garamond", "Crimson Text"}
    stack = lambda f: f"'{f}', {'Georgia, serif' if f in serif else 'system-ui, sans-serif'}"
    return {"heading": stack(heading), "body": stack(body), "fonts": f"https://fonts.googleapis.com/css2?{query}&display=swap"}


def colors_of(logo_inks, css, template):
    css_hex = [h for h in re.findall(r"#([0-9a-fA-F]{6})\b", css)]
    inks = list(logo_inks)
    if not inks:
        counts = {}
        for h in css_hex:
            rgb = images.rgbof(h)
            import colorsys
            hh, l, s = colorsys.rgb_to_hls(*(v / 255 for v in rgb))
            if s > 0.3 and 0.15 < l < 0.8:
                counts[h.lower()] = counts.get(h.lower(), 0) + 1
        inks = [images.rgbof(h) for h, _ in sorted(counts.items(), key=lambda kv: -kv[1])[:3]]
    if not inks:
        return None
    primary = images.until_readable(inks[0])
    accent = inks[1] if len(inks) > 1 else images.shade(inks[0], 1.25)
    deep = images.shade(primary, 0.7)
    ink = images.mix((22, 26, 32), primary, 0.08)
    # The accent is drawn on the dark charcoal grounds, so it is lightened
    # until it reads there.
    tries = 0
    while images.contrast(accent, ink) < 4 and tries < 40:
        accent = images.shade(accent, 1.12)
        tries += 1
    surface = images.mix((255, 255, 255), inks[0], 0.06)
    out = {
        "primary": images.hexof(primary),
        "primaryDeep": images.hexof(deep),
        "accent": images.hexof(accent),
        "ink": images.hexof(ink),
        "surface": images.hexof(surface),
    }
    if template in ("professional", "hvac"):
        out["muted"] = "#5b6470"
        out["line"] = images.hexof(images.mix((255, 255, 255), ink, 0.14))
    if template == "professional":
        out["cream"] = images.hexof(images.mix((255, 252, 246), inks[0], 0.03))
    return out
