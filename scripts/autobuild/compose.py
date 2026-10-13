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

# The trades a template is drawn for beyond its own, each under a kind that
# names its vocabulary, its label and its icons. The template itself comes from
# the prospect's industry, which preview_candidates() works out from the trade.
KIND = {
    "insurance agency": "insurance",
    "accountant": "accounting",
    "title company": "title",
    "law firm": "legal",
    "dentist": "dental",
    "chiropractor": "chiropractic",
    "pool service": "pool",
    "landscaping": "landscaping",
    "painting contractor": "painting",
    "concrete contractor": "concrete",
    "pest control": "pest",
    "fencing contractor": "fencing",
    "tree service": "tree",
    "welding": "welding",
    "machine shop": "machining",
    "industrial contractor": "industrial",
    "marine services": "marine",
    "towing service": "towing",
    "storage": "storage",
}

# What the hvac template asks a visitor to do, where the trade does not book a
# visit: work priced before it starts takes a request for a quote, and storage
# takes a reservation. A kind not named here books service.
ASK = {
    "landscaping": "quote",
    "painting": "quote",
    "concrete": "quote",
    "fencing": "quote",
    "tree": "quote",
    "welding": "quote",
    "machining": "quote",
    "industrial": "quote",
    "marine": "quote",
    "storage": "reserve",
}

# A business filed under storage that rents no units of its own - a mover with
# a warehouse - is asked for a quote rather than a reservation.
RENTS_UNITS = re.compile(r"\bunits?\b|climate|drive.?up|self.?storage|\brv\b|boat|vehicle|parking", re.I)


def ask_of(kind, services):
    ask = ASK.get(kind)
    if ask == "reserve" and not any(RENTS_UNITS.search(s["title"]) for s in services):
        return "quote"
    return ask

TRADE_LABEL = {
    "roofing": "Roofing",
    "hvac": "Heating and air",
    "insurance": "Insurance",
    "accounting": "Accounting and tax",
    "title": "Title and closing",
    "legal": "Legal services",
    "dental": "Dentistry",
    "chiropractic": "Chiropractic care",
    "pool": "Pool service",
    "landscaping": "Lawn and landscape",
    "painting": "Painting",
    "concrete": "Concrete work",
    "pest": "Pest control",
    "fencing": "Fencing",
    "tree": "Tree service",
    "welding": "Welding and fabrication",
    "machining": "Machining",
    "industrial": "Industrial services",
    "marine": "Marine services",
    "towing": "Towing",
    "storage": "Storage",
}

VOCAB = {
    "roofing": r"roof|shingle|metal|gutter|siding|storm|hail|leak|inspection|skylight|ventilat|flat|tile|commercial|residential|insurance claim|repair|replacement|coating|tpo",
    "hvac": r"air condition|\bac\b|a/c|heating|furnace|heat pump|duct|indoor air|air quality|thermostat|electrical|wiring|panel|generator|maintenance|installation|repair|refrigeration|commercial|residential|mini.?split|ventilation|cooling|plumbing",
    "insurance": r"insurance|auto|home|homeowner|life|business|commercial|flood|health|renters|umbrella|bond|workers|motorcycle|boat|landlord|liability|medicare|annuit",
    "accounting": r"tax|bookkeeping|payroll|audit|advisory|planning|accounting|irs|consult|quickbooks|cfo|estate|financial statement|business formation|compilation|review",
    # A bare "title" names every company in the trade, so only the services do.
    "title": r"title (?:insurance|search|polic|commitment|exam|transfer)|closing|escrow|refinanc|residential|commercial|1031|owner'?s polic|lender'?s polic|notary|curative",
    "legal": r"\blaw\b|legal|injury|accident|divorce|family|custody|child support|criminal|defense|\bdwi\b|\bdui\b|estate|probate|\bwills?\b|trusts?|immigration|bankruptcy|employment|litigation|wrongful|workers|contracts?|guardianship|adoption|mediation|appeals?|traffic|expunction|landlord|tenant|real estate|business",
    "dental": r"dent|teeth|tooth|cleaning|whitening|implant|crown|bridge|veneer|invisalign|aligner|braces|orthodont|root canal|extraction|filling|cosmetic|pediatric|emergency|periodont|\bgum|oral|sedation|exam|sealant|bonding|smile",
    "chiropractic": r"chiropract|adjust|spinal|spine|back pain|neck pain|sciatica|massage|decompression|rehab|physical therapy|therapy|injur|accident|headache|migraine|posture|sports|wellness|acupuncture|dry needling|alignment|whiplash|\bpain\b",
    "pool": r"pool|\bspa\b|hot tub|cleaning|maintenance|repair|resurfac|plaster|tile|pump|filter|heater|leak|equipment|opening|closing|chemical|acid wash|remodel|renovat|construction|automation|salt",
    "landscaping": r"landscap|lawn|mow|irrigation|sprinkler|\bsod\b|tree|shrub|hardscap|patio|retaining|drainage|mulch|garden|flower|outdoor lighting|trimming|pruning|maintenance|clean.?up|turf|xeriscap|pavers?|leaf|landscape design|installation",
    "painting": r"paint|interior|exterior|cabinet|stain|drywall|texture|wallpaper|pressure wash|power wash|epoxy|coating|commercial|residential|popcorn|trim",
    "concrete": r"concrete|driveway|patio|sidewalk|foundation|\bslab|stamped|decorative|flatwork|retaining|curb|parking|leveling|lifting|resurfac|epoxy|pavers?|demolition|excavat|\bsteps\b|commercial|residential",
    "pest": r"pest|termite|rodent|\bmice\b|\brats?\b|roach|\bants?\b|bed bug|mosquito|spider|flea|\bticks?\b|wildlife|\bbees?\b|wasp|scorpion|inspection|treatment|exterminat|fumigat|prevention|weed|commercial|residential",
    "fencing": r"fenc|\bgates?\b|cedar|vinyl|chain.?link|wrought iron|iron|aluminum|privacy|pipe|ranch|farm|staining|automatic|operator|access control|commercial|residential|repair",
    "tree": r"tree|trimming|pruning|removal|stump|grinding|land clearing|lot clearing|storm|emergency|arborist|cabling|bracing|brush|limb|crane|planting",
    "welding": r"weld|fabricat|steel|metal|aluminum|stainless|pipe|structural|mobile|portable|custom|\bgates?\b|railing|trailer|\btig\b|\bmig\b|plasma|cutting|ornamental|tanks?|repair",
    "machining": r"machin|\bcnc\b|turning|milling|lathe|grinding|fabricat|weld|manufactur|prototyp|production|precision|\bedm\b|boring|threading|assembly|reverse engineering|inspection|valves?|pumps?|shafts?|gears?|repair",
    "industrial": r"industrial|construction|maintenance|mechanical|electrical|instrument|piping|\bpipe|fabricat|weld|scaffold|insulation|coating|blasting|civil|excavat|demolition|turnaround|shutdown|millwright|rigging|crane|structural|steel|tanks?|valves?|environmental|hydro|vacuum|cleaning",
    "marine": r"marine|boat|yacht|vessel|outboard|inboard|engine|motor|detailing|storage|haul|launch|bottom paint|fiberglass|gelcoat|electrical|electronics|rigging|canvas|upholstery|\bdock|\blift|survey|winteriz|propeller|trailer|repair|maintenance",
    "towing": r"\btow|wrecker|roadside|jump start|lockout|tire change|fuel delivery|winch|recovery|flatbed|heavy duty|light duty|medium duty|accident|transport|motorcycle|impound|private property|junk car|car removal|equipment",
    "storage": r"storage|\bunits?\b|climate|drive.?up|\brv\b|boat|vehicle|parking|indoor|outdoor|covered|wine|records|moving|boxes|packing|truck rental|\blocks?\b",
}

ICONS = {
    "roofing": {},
    # The hvac template's keys, for the trades drawn on it. The last pattern of
    # each list is the one every other service takes.
    "pool": [("droplets", r"leak|water|chemi|acid"), ("filter", r"filter|pump"), ("thermometer", r"heat"),
             ("settings", r"equipment|automation"), ("waves", r".")],
    "landscaping": [("droplets", r"irrigat|sprinkler|drain"), ("lightbulb", r"light"),
                    ("home", r"patio|hardscap|paver|retaining"), ("leaf", r".")],
    "painting": [("building", r"commercial"), ("droplets", r"pressure|power wash"), ("shield", r"coating|epoxy|stain|seal"),
                 ("home", r".")],
    "concrete": [("building", r"commercial|parking|foundation|slab"), ("shield", r"seal|epoxy|coating|resurfac"),
                 ("home", r"driveway|patio|sidewalk|residential|steps"), ("settings", r".")],
    "pest": [("building", r"commercial"), ("leaf", r"lawn|weed|mosquito"), ("home", r"termite|inspection|residential"),
             ("shield", r".")],
    "fencing": [("building", r"commercial|industrial"), ("settings", r"gate|operator|automatic|access"),
                ("home", r"wood|cedar|privacy|vinyl|residential"), ("shield", r".")],
    "tree": [("zap", r"storm|emergency"), ("leaf", r".")],
    "welding": [("zap", r"plasma|cutting"), ("building", r"structural|steel"), ("car", r"trailer"),
                ("flame", r"weld|tig|mig"), ("settings", r".")],
    "machining": [("gauge", r"precision|inspection"), ("flame", r"weld|fabricat"), ("settings", r"cnc|machin|mill|turn|lathe"),
                  ("wrench", r".")],
    "industrial": [("flame", r"weld|fabricat"), ("zap", r"electric|instrument"), ("shield", r"safety|environment|coating|insulation"),
                   ("building", r"construction|civil|structural|steel"), ("chart", r"model|optimi|simulat|stud(y|ies)|analys"),
                   ("compass", r"design|drafting|\bfeed\b|engineer"), ("clipboard", r"project manag|planning|documentation|permit"),
                   ("settings", r".")],
    "marine": [("settings", r"engine|motor|outboard|inboard|propeller"), ("zap", r"electr"), ("car", r"trailer"), ("waves", r".")],
    "towing": [("battery", r"jump"), ("timer", r"roadside|emergency|24"), ("car", r".")],
    "storage": [("thermometer", r"climate"), ("car", r"\brv\b|boat|vehicle|parking"), ("shield", r"secur|lock"),
                ("building", r".")],
    # The professional template's keys, for the practices drawn on it.
    "legal": [("users", r"family|divorce|custody|adoption|child"), ("house", r"real estate|landlord|tenant|estate|probate|wills?|trust"),
              ("briefcase", r"business|employment|contract"), ("car", r"\bauto|accident|injury|wrongful"), ("scale", r".")],
    "dental": [("users", r"family|pediatric|children|kids"), ("shield", r"emergency"), ("stethoscope", r"exam|periodont|gum|oral|sedation"),
               ("smile", r".")],
    "chiropractic": [("car", r"\bauto|accident|whiplash"), ("heart", r"wellness|massage"), ("stethoscope", r"therapy|rehab|acupuncture|needling"),
                     ("bone", r".")],
    "hvac": [("snowflake", r"cool|air cond|\bac\b|a/c"), ("flame", r"heat|furnace"), ("zap", r"electric|panel|wiring|generator"),
             ("wind", r"duct|air quality|ventilat|indoor"), ("wrench", r".")],
    "professional": [("car", r"auto|vehicle|car"), ("house", r"home|homeowner|residential|renters|landlord"),
                     ("heart", r"life|health|medicare"), ("briefcase", r"business|commercial|liability|workers"),
                     ("calculator", r"tax|bookkeeping|payroll|accounting|audit"), ("file", r"title|closing|escrow")],
}

SINCE = re.compile(r"\b(?:since|established|founded|est\.?|serving [^.]{0,40} since)\s+((?:19|20)\d\d)\b", re.I)
LICENSE = re.compile(r"\b((?:TDLR|TACLA|TECL|TDI|NPN|License|Lic\.)\s*(?:No\.?|#|Number)\s*:?\s*[A-Z]{0,6}-?\d[\w-]{3,})", re.I)
NOT_A_SERVICE = re.compile(r"\b(guide|tips?|season|vs\.?|versus|how|why|patient education|what|when|your|schedule|consult|consultation|request|checklist|estimator|calculator|types of|our |blog|news|faq|cost|price|pricing|near me|reviews?|testimonials?|careers?|financing|coupons?|specials?|offer|% off|\$|free|contact|call|about|portal|login|pay|apply|learn|read|welcome|meet|experts?|areas?|locations?|view|more|projects?|types?|gallery|portfolio|resources?|trusted|best|top|leading|most|#1|number one|award|privacy|terms|glossary|forms|payments?|order|explore|steps|chart|options|by the numbers|excellence|one-stop|you can|solutions?|division|team|office|branch|powered|serving|products|vice president|vp|agents?|industry|page|companies|finance a)\b", re.I)
ACRONYMS = {"IRS", "CFO", "CPA", "CPAS", "HVAC", "AC", "A/C", "TPO", "LLC", "QB", "EPDM", "UV", "HOA", "1031", "S-CORP"}
# A business's own name, or anything carrying a corporate suffix, is never
# one of its services.
CORPORATE = re.compile(r"\b(llc|l\.l\.c|inc|incorporated|corp|corporation|ltd|pllc|co|company)\b", re.I)
# A numbered step, an emoji or a trademark sign, a page aimed at a town
# ("... Houston, TX", "... in Pasadena"), and a product's one-word brand name
# ("ClosingLock") are headings on their site, not services they sell.
NOT_A_SERVICE_SHAPE = re.compile(r"^\d+\.\s|[^\w\s&'\u2019,./()\-\u2013+]|,\s*[A-Za-z]{2}$|\b(?i:tx|texas)$|\bin [A-Z][a-z]|^[A-Z][a-z]+[A-Z]\w*$")
NAME_FILLER = {"the", "llc", "inc", "co", "company", "corp", "ltd", "pllc", "agency", "group"}


def bare_name(text):
    words = re.sub(r"[^a-z0-9 ]", " ", (text or "").lower()).split()
    return " ".join(w for w in words if w not in NAME_FILLER)


def names_the_business(title, own):
    """True when a heading is the business's own name or carries it."""
    if CORPORATE.search(title):
        return True
    own = bare_name(own).split()
    if not own:
        return False
    lead = " ".join(own[:2])
    return f" {lead} " in f" {bare_name(title)} " and (len(own) > 1 or len(lead) >= 4)


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
    """Their words, cut at a sentence boundary and never mid-sentence. A space
    their page leaves before a comma or stop is closed up, and a last sentence
    that stops on a comma, a list their page cut off, is left out."""
    out = []
    for sentence in sentences(re.sub(r"\s+([,.;:!?])", r"\1", plain(text))):
        if len(" ".join(out + [sentence])) > limit:
            break
        out.append(sentence)
    while out and re.search(r"[,;:–—-]$", out[-1]):
        out.pop()
    return " ".join(out)


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


def address_parts(prospect):
    """Street, town, state and zip from the address stored off the Google
    listing: "2323 S Voss Rd Ste 510, Houston, TX 77057, USA"."""
    parts = [p.strip() for p in plain(prospect.get("address")).split(",") if p.strip()]
    if parts and parts[-1].upper() in ("USA", "US", "UNITED STATES"):
        parts = parts[:-1]
    state, zip_ = "TX", None
    at = next((i for i, p in enumerate(parts) if re.fullmatch(r"[A-Z]{2}(\s+\d{5}(-\d{4})?)?", p)), None)
    if at is None or at < 2:
        return None, prospect.get("town"), state, None
    m = re.fullmatch(r"([A-Z]{2})(?:\s+(\d{5}))?(?:-\d{4})?", parts[at])
    state, zip_ = m.group(1), m.group(2)
    town = parts[at - 1]
    street = ", ".join(parts[:at - 1])
    return street, town or prospect.get("town"), state, zip_


# Fewer reviews than this and the rating says little, so the page and the
# letter leave it out rather than show it. It decides only what is shown: a
# business with no reviews at all still gets its preview.
RATING_SHOWN_FROM = 5


def listing_rating(prospect):
    """The rating and review count stored off the Google listing, or nothing
    when there is none or too few to show."""
    try:
        rating = round(float(prospect.get("rating")), 1)
        count = int(prospect.get("rating_count"))
    except (TypeError, ValueError):
        return None, None
    if rating <= 0 or count < RATING_SHOWN_FROM:
        return None, None
    return (int(rating) if rating == int(rating) else rating), count


DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
DAY_CODES = {"mo": 0, "tu": 1, "we": 2, "th": 3, "fr": 4, "sa": 5, "su": 6, "monday": 0, "tuesday": 1, "wednesday": 2,
             "thursday": 3, "friday": 4, "saturday": 5, "sunday": 6}


def _clock(text):
    m = re.fullmatch(r"(\d{1,2}):(\d{2})(?::\d{2})?", text.strip())
    if not m:
        return None
    h, mi = int(m.group(1)), int(m.group(2))
    if h > 24 or mi > 59:
        return None
    suffix = "AM" if h < 12 or h == 24 else "PM"
    h12 = h % 12 or 12
    return f"{h12}:{mi:02d} {suffix}" if mi else f"{h12} {suffix}"


def hours_of(business):
    """Opening hours as the business's own structured data states them, or
    nothing. Only the schema.org forms are read; prose hours are left alone
    rather than guessed at."""
    week = {}
    for spec in business.get("openingHoursSpecification") or []:
        if not isinstance(spec, dict):
            continue
        days = spec.get("dayOfWeek")
        days = days if isinstance(days, list) else [days]
        opens, closes = _clock(str(spec.get("opens", ""))), _clock(str(spec.get("closes", "")))
        if not (opens and closes):
            return []
        for d in days:
            key = str(d or "").rsplit("/", 1)[-1].lower()
            if key not in DAY_CODES:
                return []
            week[DAY_CODES[key]] = f"{opens} – {closes}"
    raw = business.get("openingHours")
    for line in ([raw] if isinstance(raw, str) else raw or []):
        m = re.fullmatch(r"\s*([A-Za-z]{2})(?:\s*-\s*([A-Za-z]{2}))?\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*", str(line))
        if not m or m.group(1).lower() not in DAY_CODES:
            return []
        first = DAY_CODES[m.group(1).lower()]
        last = DAY_CODES.get((m.group(2) or m.group(1)).lower(), first)
        opens, closes = _clock(m.group(3)), _clock(m.group(4))
        if not (opens and closes) or last < first:
            return []
        for d in range(first, last + 1):
            week[d] = f"{opens} – {closes}"
    if not week:
        return []
    # Only the days their data names: a day it leaves out is not called closed.
    rows = []
    for d in sorted(week):
        time = week[d]
        if rows and rows[-1][2] == time and rows[-1][1] == d - 1:
            rows[-1][1] = d
        else:
            rows.append([d, d, time])
    return [[DAYS[a] if a == b else f"{DAYS[a]} – {DAYS[b]}", t] for a, b, t in rows]


def page_text(pages):
    return "\n".join(t for p in pages for _, t, _ in p.blocks)


def services_of(pages, vocab, own=None, town=None, described_first=False):
    """Their own service names, with their own description where the site gives one.

    A menu lists a site's services before any page describes them, so the
    first eight found are often names alone. A template that draws a service
    only with its description asks for the described ones first, so a site
    that describes its work further down is not parked for describing none.
    """
    pattern = re.compile(vocab, re.I)
    # "Houston Bookkeeping" and "Tax Preparation (Houston)" are pages written
    # for a search engine; the service under them is listed on its own.
    local = re.compile(rf"\b{re.escape(town)}\b", re.I) if town else None
    found = {}
    order = []

    def add(name, text=None):
        name = plain(name).strip(" -|:")
        if not (3 <= len(name) <= 42) or len(name.split()) > 6 or GENERIC_NAV.match(name):
            return
        if not pattern.search(name) or re.search(r"[?!@]|\d{3}", name) or NOT_A_SERVICE.search(name) or re.match(r"(on|for|with|to|in|at|from|and)\b", name, re.I):
            return
        if NOT_A_SERVICE_SHAPE.search(name) or (own and names_the_business(name, own)) or (local and local.search(name)):
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
    if described_first:
        order.sort(key=lambda k: found[k]["text"] is None)
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
            # A customer's review quoted on their page ("5 Stars - ...") is not their description of themselves.
            if re.fullmatch(r"[\"\u201c].*[\"\u201d]", text, re.S) or re.search(r"\b[1-5]\s*stars?\b|\u2605", text, re.I):
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
    serif = {"Merriweather", "Playfair Display", "Libre Baskerville", "Lora", "Source Serif 4", "Cormorant Garamond", "EB Garamond", "Crimson Text"}
    if body in serif and heading not in serif:
        # A serif paired with a sans sets the headings and the sans the text.
        heading, body = body, heading
    fams = [heading] if heading == body else [heading, body]
    query = "&".join(f"family={urllib.parse.quote_plus(f)}:wght@400;600;700" for f in fams)
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


# A service named only for the trade or the firm ("Roofing Services", "Our
# Contractors") says nothing a headline can use.
GENERIC_SERVICE = re.compile(
    r"^(?:(?:roofing|roof|hvac|heating and air|heating|air conditioning|electrical|insurance|accounting|tax|title|"
    r"bookkeeping|cpa|legal|law|dental|chiropractic|pool|landscaping|landscape|lawn|painting|concrete|pest control|pest|"
    r"fencing|fence|tree|welding|machining|machine shop|industrial|marine|towing|storage)\s+)?"
    r"(?:services?|contractors?|company|solutions|specialists?|experts?|care|work)$", re.I)


def hero_line(services, town, label):
    """The headline a template draws under the name: the business's own two
    leading services and its town, worded once ("Auto and home insurance in
    Baytown", "Roof repair and roof replacement in Tomball"). With no two
    services worth naming it is the trade and the town."""
    named = [s["title"] for s in services if not GENERIC_SERVICE.match(s["title"])][:2]
    lower = [" ".join(w if (w.isupper() and len(w) > 1) or w.upper() in ACRONYMS else w.lower() for w in t.split()) for t in named]
    if len(lower) == 2:
        a, b = lower
        tail_a, tail_b = a.rsplit(" ", 1), b.rsplit(" ", 1)
        # "Auto insurance and home insurance" reads as "auto and home insurance".
        if len(tail_a) == 2 and len(tail_b) == 2 and tail_a[1].lower() == tail_b[1].lower():
            what = f"{tail_a[0]} and {b}"
        else:
            what = f"{a} and {b}"
    elif lower:
        what = lower[0]
    else:
        what = label.lower()
    return f"{what[:1].upper()}{what[1:]} in {town}"
