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
              ("plane", r"aviation|plane|aircraft|helicopter"), ("anchor", r"maritime|offshore|jones act|boat|vessel"),
              ("truck", r"truck|18.?wheeler|commercial vehicle"), ("motorbike", r"motorcycle"), ("footprints", r"pedestrian"),
              ("hard-hat", r"workplace|construction|oilfield|industrial|workers"), ("briefcase", r"business|employment|contract"),
              ("heart", r"wrongful"), ("car", r"\bauto|accident|injury"), ("scale", r".")],
    "dental": [("users", r"family|pediatric|children|kids"), ("shield", r"emergency"), ("stethoscope", r"exam|periodont|gum|oral|sedation"),
               ("smile", r".")],
    "chiropractic": [("car", r"\bauto|accident|whiplash"), ("heart", r"wellness|massage"), ("stethoscope", r"therapy|rehab|acupuncture|needling"),
                     ("bone", r".")],
    "hvac": [("snowflake", r"cool|air cond|\bac\b|a/c"), ("flame", r"heat|furnace"), ("zap", r"electric|panel|wiring|generator"),
             ("wind", r"duct|air quality|ventilat|indoor"), ("wrench", r".")],
    "professional": [("car", r"\bauto|vehicle|\bcars?\b"),("house", r"home|homeowner|residential|renters|landlord"),
                     ("heart", r"life|health|medicare"), ("briefcase", r"business|commercial|liability|workers"),
                     ("calculator", r"tax|bookkeeping|payroll|accounting|audit"), ("file", r"title|closing|escrow")],
}

# The roofing template's menu columns, each the label over its list on the
# services page and the eyebrow of its pages. A service whose title names
# none is left without one, and the template lists it under General: an
# inspection or a gutter is not only a home's. A building of many homes
# (multi-family, apartments, condos) is roofed as a commercial job, not a house's.
ROOF_GROUPS = [("commercial", r"commercial|industrial|multi[- ]?family|apartment|condo"), ("storm", r"storm|hail|insurance|claim|emergency"),
               ("residential", r"residential|\bhomes?\b|\bhouses?\b")]

# The words that name each trade as a business would of itself. A site built on
# a theme for another trade can keep the theme's copy ("a team of 30 plumbing
# professionals" on a pool cleaner's site), so a paragraph that sells another
# trade's services and never names its own is the theme's, not theirs.
TRADE_WORDS = {
    "roofing": r"\broof",
    "hvac": r"\bhvac\b|air condition|heating|furnace|cooling|mechanical|plumb|electric",
    "insurance": r"insur",
    "accounting": r"account|\btax|bookkeep|\bcpas?\b",
    "title": r"\btitle\b|escrow|closing",
    "legal": r"\blaw\b|lawyer|attorney|legal",
    "dental": r"\bdent",
    "chiropractic": r"chiropract",
    "pool": r"\bpools?\b|\bspas?\b|hot tub",
    "landscaping": r"landscap|\blawn|irrigat|\btrees?\b",
    "painting": r"\bpaint",
    "concrete": r"concrete",
    "pest": r"\bpest|extermin|termite",
    "fencing": r"\bfenc",
    "tree": r"\btrees?\b|arborist|landscap",
    "welding": r"\bweld|fabricat|machin",
    "machining": r"machin|\bcnc\b|weld|fabricat",
    "industrial": r"industrial|weld|fabricat|machin|electric|instrument|piping|mechanical",
    "marine": r"marine|\bboats?\b|yacht",
    "towing": r"\btow|wrecker",
    "storage": r"storage",
    "plumbing": r"plumb",
}
TRADE_SOLD = re.compile(rf"\b(?:{'|'.join(TRADE_WORDS.values())})\w*\s+(?:services?|professionals?|solutions?|compan(?:y|ies)|contractors?|experts?|specialists?)\b", re.I)


def other_trade(text, trade):
    """True when the words sell another trade's services and never name this one."""
    own = TRADE_WORDS.get(trade)
    return bool(own) and not re.search(own, text, re.I) and bool(TRADE_SOLD.search(text))


STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado",
    "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana",
    "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
    "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota",
    "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
}


def placed_elsewhere(text, town=None, state=None, towns=()):
    """True when the words set them in another state ("Kansas City's trusted
    roofing contractor", "out of Kansas City, MO") and never in their own town
    or state: a site written for another place, or a theme's demo copy."""
    if not state or state not in STATES:
        return False
    # A town near them, even one named for another state ("Missouri City"), sets them here.
    if any(re.search(rf"\b{re.escape(t)}\b", text) for t in [town, *towns] if t):
        return False
    if re.search(rf"\b{re.escape(STATES[state])}\b|,\s*{state}\b", text):
        return False
    # Washington is as often a street's name as a state's.
    others = [n for c, n in STATES.items() if c not in (state, "WA")]
    codes = [c for c in STATES if c != state]
    return bool(re.search(rf"\b(?:{'|'.join(others)})\b|,\s*(?:{'|'.join(codes)})\b", text))


# Spam slipped into a hacked page sells medicine ("...consulting with a
# healthcare professional about generic Clonidine" on an accountant's). Only a
# trade that cares for health or insures it has reason to speak of it.
MEDICINE = re.compile(r"\b(?:medications?|medicines?|prescriptions?|pharmac(?:y|ies|ists?)|pills?|dosages?|hypertension|blood pressure|viagra|cialis|levitra|tramadol|xanax|clonidine)\b", re.I)
HEALTH_KINDS = {"dental", "chiropractic", "insurance"}


def sells_medicine(text, trade):
    """True when the words speak of medicine for a trade that has nothing to do with it."""
    return trade not in HEALTH_KINDS and bool(MEDICINE.search(text))


# A year can follow its word with "in" ("Established in 2014").
SINCE = re.compile(r"\b(?:since|established|founded|est\.?|serving [^.]{0,40} since)\s+(?:in\s+)?((?:19|20)\d\d)\b", re.I)
LICENSE = re.compile(r"\b((?:TDLR|TACLA|TECL|TDI|NPN|License|Lic\.)\s*(?:No\.?|#|Number)\s*:?\s*[A-Z]{0,6}-?\d[\w-]{3,})", re.I)
NOT_A_SERVICE = re.compile(r"\b(guide|tips?|season|vs\.?|versus|how|why|patient education|what|when|where|your|schedule|consult|consultation|request|quotes?|checklist|estimator|calculator|types of|signs (?:of|that|you)|causes? of|(?:needed|required) for|(?:benefits?|advantages|importance) of|our|blog|news|faqs?|frequently asked|questions?|costs?|prices?|pricing|understanding|near me|reviews?|testimonials?|careers?|financing|coupons?|specials?|offer|% off|\$|free|contact|call|about|portal|login|pay|apply|learn|read|welcome|meet|experts?|areas?|locations?|view|more|projects?|types?|gallery|portfolio|resources?|(?<!chain[- ])links?|trusted|best|top|leading|most|#1|number one|award|privacy|terms|glossary|forms|payments?|order|explore|steps|chart|options|by the numbers|excellence|one-stop|you can|solutions?|division|team|crews?|staff|professionals?|pros|painters?|technicians?|office|branch|powered|serving|products|vice president|vp|agents?|assistants?|hygienists?|dentists?|orthodontists?|periodontists?|endodontists?|prosthodontists?|surgeons?|physicians?|providers?|receptionists?|coordinators?|managers?|industry|page|apps?|directory|companies|contractors?|finance a|overview|dangers?)\b", re.I)
ACRONYMS = {"IRS", "CFO", "CPA", "CPAS", "HVAC", "AC", "A/C", "TPO", "LLC", "QB", "EPDM", "UV", "HOA", "1031", "S-CORP"}
# A business's own name, or anything carrying a corporate suffix, is never
# one of its services.
CORPORATE = re.compile(r"\b(llc|l\.l\.c|inc|incorporated|corp|corporation|ltd|pllc|co|company)\b", re.I)
# A numbered step, an emoji or a trademark sign, a page aimed at a town
# ("... Houston, TX", "... in Pasadena"), a product's one-word brand name
# ("ClosingLock") and a person's name with its initial ("Nicholas M. Wills"),
# with or without a title after it ("Charles H. Mansour, Closing Attorney"),
# are headings on their site, not services they sell.
NOT_A_SERVICE_SHAPE = re.compile(r"^\d+\.\s|[^\w\s&'\u2019,./()\-\u2013+]|,\s*[A-Za-z]{2}$|\b(?i:tx|texas)$|\bin [A-Z][a-z]|^[A-Z][a-z]+[A-Z]\w*$|^[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+(?:,|$)")
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


# An address at one of these is a person's own, not another business's.
FREE_MAIL = re.compile(r"@(gmail|yahoo|hotmail|outlook|live|msn|aol|icloud|me|att|sbcglobal|comcast|bellsouth|ymail|protonmail)\.", re.I)
MAILTO = re.compile(r"^mailto:([^?\s]+@[^?\s]+)", re.I)
# An address for investors, the press, job seekers or the website itself is not
# where a customer asks for work, however the box is prefixed ('corporatehumanresources@').
NOT_FOR_CUSTOMERS = re.compile(r"^(ir|investors?|investor[._-]?relations|shareholders?|media|press|pr|careers?|jobs|recruiting|hr|privacy|legal|compliance|ethics|webmaster|no-?reply|do-?not-?reply"
                               r"|[^@]*(human[._-]?resources|recruit(ing|ment|er)?|careers|hiring|payroll)[^@]*)@", re.I)


def email_of(stored, pages, business):
    """The email the contact page lists: the one stored from the listing where
    it is at their own website's domain, a free mail address, or one their own
    pages list, and otherwise the first their pages list at their own domain.
    An address at another business's domain (a listing that carries the email
    of a practice they share a building or an owner with), or one meant for
    investors, the press or job seekers, is never shown."""
    host = urllib.parse.urlparse(pages[0].url).netloc.lower().replace("www.", "")
    listed = [m.group(1).lower() for page in pages for href, _ in page.links if (m := MAILTO.match(href.strip()))]
    if isinstance(business.get("email"), str):
        listed.append(business["email"].lower().removeprefix("mailto:"))
    listed = [e for e in listed if not NOT_FOR_CUSTOMERS.match(e)]
    own = lambda e: e.rsplit("@", 1)[-1] == host
    # A listing that stores the link ("mailto:info@...") stores the address in it.
    stored = plain(stored).lower().removeprefix("mailto:")
    if NOT_FOR_CUSTOMERS.match(stored):
        stored = ""
    if stored and (own(stored) or FREE_MAIL.search(stored) or stored in listed):
        return stored
    return next((e for e in listed if own(e)), None)


GENERIC_NAV = re.compile(r"^(home|about( us)?|contact( us)?|services|our services|blog|faq|reviews|gallery|careers|menu|get a quote|request a quote|free estimate|call now|learn more|read more|more|portal|login|pay online|resources|team|our team|testimonials)$", re.I)

FONTS = [
    "Montserrat", "Open Sans", "Roboto", "Lato", "Poppins", "Raleway", "Oswald", "Source Sans 3", "Nunito", "Nunito Sans",
    "Merriweather", "Playfair Display", "PT Sans", "Work Sans", "Rubik", "Inter", "Barlow", "Barlow Condensed", "Libre Baskerville",
    "Lora", "Mulish", "Quicksand", "Josefin Sans", "Archivo", "Bebas Neue", "Anton", "DM Sans", "Manrope", "Karla", "Cabin",
    "Fira Sans", "Heebo", "IBM Plex Sans", "Noto Sans", "Hind", "Titillium Web", "Exo 2", "Kanit", "Teko", "Source Serif 4",
    "Cormorant Garamond", "EB Garamond", "Crimson Text", "Arimo", "Outfit", "Plus Jakarta Sans", "Red Hat Display", "Urbanist",
]


# A control character their page carries ("our customers \x03to complete")
# has no glyph and draws as a box; it stands for a space, and a zero-width
# mark or byte-order mark for nothing.
UNDRAWN = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]")
ZERO_WIDTH = re.compile(r"[​⁠﻿]")
# A list item's bullet set in its text ("◦ Audits of entities...") is their
# page's markup, not their words.
BULLET = re.compile(r"^[•◦▪▫‣⁃●○■□]\s*")


def plain(text):
    return BULLET.sub("", " ".join(UNDRAWN.sub(" ", ZERO_WIDTH.sub("", str(text or ""))).split()))


def sentences(text):
    out = []
    for s in re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"'])", plain(text)):
        s = s.strip()
        if not s:
            continue
        # A stop after a shortening ("Dr. Revel, and Dr. Lowery") or an
        # initial ("G.B. Industry") ends no sentence.
        if out and (last := re.search(r"\b([A-Za-z]+)\.$", out[-1])) and (last.group(1).lower() in SHORTENED or len(last.group(1)) == 1):
            out[-1] += " " + s
        else:
            out.append(s)
    return out


# A sentence that opens on a subordinating word and never reaches a comma is a
# leading clause whose point was in the next one ("As patients are becoming
# aware... health. They have their parameters...").
FRAGMENT = re.compile(r"(?:as|because|although|though|whereas|while|unless|whether)\b[^,;:–—]*$", re.I)

# A clause that opens on one of these leads into a sentence rather than being one.
LEADING = re.compile(r"(?:at|in|on|for|with|from|by|through|throughout|since|after|before|during|when|whenever|if|once|as|because|although|though|whereas|while|unless|whether|to|whatever)\b", re.I)

# A sentence that announces a list ("We centered our company around three
# major aspects.") has its point in the sentences after it.
ANNOUNCES = re.compile(r"\b(?:two|three|four|five|six|seven|several|a few|the following)\s+(?:\w+\s+)?(?:aspects|things|reasons|ways|steps|principles|values|pillars|parts|goals|points|qualities)[.:]?$", re.I)

# A sentence that sets up a case ("Suppose you have a cracked tooth.") has its
# point in the sentence after it.
SUPPOSES = re.compile(r"(?:suppose|supposing|imagine|picture this|let's say|let us say)\b", re.I)

# A paragraph that opens on its block's headline, run in without a stop ("Give
# Your Roof a New Lease on Life Your roof has always..."), starts its sentence
# where a capitalised opener meets a lowercase word; the headline is cut away.
RUN_IN = re.compile(r"^(?:(?:[A-Z][\w'’-]*,?|a|an|the|and|or|of|on|in|for|to|with|at|by|&)\s+){3,}[A-Z][\w'’-]*\s+(?=(?:Your|Our|We|You|At|When|If|This|It|Whether|With)\s+[a-z])")

# Misspellings their page makes of a common word, put right.
MISSPELT = {r"\bverity of\b": "variety of", r"\bVerity of\b": "Variety of", r"\blazer\b": "laser", r"\bLazer\b": "Laser", r"\bvist\b": "visit", r"\bVist\b": "Visit",
            r"\b(began|begun|started|start|launched) (their|his|her|our|my) carriers\b": r"\1 \2 careers"}


SHORTENED = {"etc", "vs", "approx", "incl", "est", "ft", "sq", "no", "st", "dr", "mr", "mrs", "ms", "jr", "sr", "inc", "co", "ltd", "llc", "ave", "rd", "blvd", "hwy", "ste"}


def trim(text, limit):
    """Their words, cut at a sentence boundary and never mid-sentence. A space
    their page leaves before a comma or stop is closed up, one it leaves out
    after them ("pool service.Innovative Pools", "service,maintenance") is put
    in, and a last sentence that stops on a comma, a list their page cut off,
    is left out, as is one that is only a leading clause, the announcement
    of a list or the setting up of a case the cut parted from its point."""
    text = re.sub(r"\s+([,.;:!?])", r"\1", plain(text))
    # A web address ("pools.com") and a figure ("1,200") keep theirs: a stop
    # opens up only before a capital, and either only after a word.
    text = re.sub(r"(?<=[a-z]{2})(,|:|[.!?](?=[A-Z][a-z]))(?=[A-Za-z])", r"\1 ", text)
    # A year their page set apart runs into the next word ("in 2019and is").
    text = re.sub(r"\b((?:19|20)\d\d)(?=[a-z]{2,})", r"\1 ", text)
    # A sentence their page opens in lowercase ("for over 30 years. call
    # Rainforest Dental") takes its capital, unless the stop ends a shortening.
    text = re.sub(r"\b([A-Za-z]{2,})([.!?] )([a-z])",
                  lambda m: m.group(0) if m.group(1).lower() in SHORTENED else m.group(1) + m.group(2) + m.group(3).upper(), text)
    for wrong, right in MISSPELT.items():
        text = re.sub(wrong, right, text)
    # A name that ends in a plural ("Aloha Swimming Pools's expert services")
    # takes the apostrophe alone; one that ends in a double s ("Bass's") keeps it.
    text = re.sub(r"\b([A-Z][a-z]*[^\Ws]s)(['’])s\b", r"\1\2", text)
    out = []
    for sentence in sentences(text):
        if len(" ".join(out + [sentence])) > limit:
            break
        out.append(sentence)
    while out and (re.search(r"[,;:–—-]$", out[-1]) or (len(out) > 1 and (FRAGMENT.match(out[-1]) or ANNOUNCES.search(out[-1]) or SUPPOSES.match(out[-1])))):
        out.pop()
    return " ".join(out)


def gist(text, limit):
    """trim() for a card's line: when even the first sentence is too long, its
    opening clause, if it reads as a sentence of its own, stands for it. One
    that opens on a preposition or a subordinating word ("At our chiropractic
    clinic, we offer...") only sets the scene for the sentence, so it doesn't.
    A cut inside a list ("We believe maintaining timely, complete, and accurate
    books...") leaves the sentence without its point, so the clause runs on to
    the first stop after the list is closed."""
    cut = trim(text, limit)
    if cut or not sentences(text):
        return cut
    parts = re.split(r"([,;:–—]\s)", sentences(text)[0])
    if LEADING.match(parts[0]):
        return ""
    listed = False
    for i in range(0, len(parts), 2):
        head = "".join(parts[:i + 1]).rstrip(".!? ")
        rest = "".join(parts[i + 2:])
        listed = bool(re.match(r"(?:[\w'’-]+,?\s+){1,3}(?:and|or)\s", rest) or (listed and re.match(r"(?:and|or)\s", rest)))
        if not listed:
            break
    return head + "." if len(head.split()) >= 4 and len(head) < limit else ""


# A sentence that opens on an answer ("If so, ...", "If not, ...", "Yes, ...")
# reads only after the question before it.
ANSWERS = re.compile(r"(?:if (?:so|not|yes|you do|that's the case)\b|(?:yes|no)[,.!])", re.I)


def card_line(text, limit):
    """gist() for a service card, after the hook their description opens on.
    A short first sentence with no comma ("Texas sun is hard on a house.",
    "There's a reason this list is short.") leads into the description and
    says nothing of the work on its own; the card starts after it. One the
    next sentence answers ("Do you run a business? If so, ...") stays, or the
    card would answer a question it never asked."""
    said = sentences(text)
    while len(said) > 1 and len(said[0].split()) <= 9 and not re.search(r"[,;:–—]", said[0]) and not ANSWERS.match(said[1]):
        said = said[1:]
    rest = " ".join(said)
    return trim(rest, limit) or gist(rest, limit)


def slugify(text):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", text.lower())).strip("-")[:40]


def title_case(text):
    small = {"a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "with"}
    out = []
    for i, w in enumerate(plain(text).split(" ")):
        if w.upper() in ACRONYMS:
            out.append("CPAs" if w.upper() == "CPAS" else w.upper())
            continue
        # A form's code ("SR-22", "W-2", "1099-NEC") keeps its capitals; only
        # a word set in capitals for the heading ("ROOF REPAIR") is put right.
        if w.isupper() and re.search(r"\d", w):
            out.append(w)
            continue
        # So does a name's initials in brackets ("Client Accounting Services (CAS)").
        if re.fullmatch(r"\([A-Z]{2,6}\)", w):
            out.append(w)
            continue
        if w.isupper():
            w = w.lower()
        # A capital held one letter too long ("INterior") is put right.
        if re.fullmatch(r"[A-Z]{2}[a-z]{2,}", w):
            w = w[0] + w[1:].lower()
        out.append(w.lower() if i and w.lower() in small else w[:1].upper() + w[1:])
    return " ".join(out)


def short_name(name):
    # "& Co." is part of the name ("JAG CPA & Co."), not a suffix after it.
    cut = re.sub(r",?\s+\b(LLC|L\.L\.C\.|Inc\.?|(?<!&\s)(?<!\band\s)Co\.?|Corp\.?|PLLC|PC|P\.C\.|LP|Ltd\.?)$", "", plain(name), flags=re.I)
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
WHOLE_DAY = {"12 AM – 11:59 PM", "12 AM – 12 AM"}


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
    # Midnight to midnight on every day is a site builder's default, not hours
    # anyone keeps ("12 AM – 11:59 PM").
    if not week or all(t in WHOLE_DAY for t in week.values()):
        return []
    # Opening and closing at the same moment is schema.org's way of saying a
    # day is closed ("12 AM – 12 AM"), and the templates say "Closed".
    for d, t in week.items():
        opens, _, closes = t.partition(" – ")
        if opens == closes:
            week[d] = "Closed"
    # Only the days their data names: a day it leaves out is not called closed.
    rows = []
    for d in sorted(week):
        time = week[d]
        if rows and rows[-1][2] == time and rows[-1][1] == d - 1:
            rows[-1][1] = d
        else:
            rows.append([d, d, time])
    return [[DAYS[a] if a == b else f"{DAYS[a]} – {DAYS[b]}", t] for a, b, t in rows]


CONTACT_LINE = re.compile(r"[\w.+-]+@[\w-]+\.\w|\bwww\.[\w-]+\.\w", re.I)


def page_text(pages):
    return "\n".join(t for p in pages for _, t, _ in p.blocks)


def services_of(pages, vocab, own=None, town=None, described_first=False, towns=()):
    """Their own service names, with their own description where the site gives one.

    A menu lists a site's services before any page describes them, so the
    first eight found are often names alone. A template that draws a service
    only with its description asks for the described ones first, so a site
    that describes its work further down is not parked for describing none.
    """
    pattern = re.compile(vocab, re.I)
    # "Houston Bookkeeping" and "Tax Preparation (Houston)" are pages written
    # for a search engine, and "Houston Weather and Commercial Exteriors" an
    # article about the area; the service under them is listed on its own. A
    # town whose name is a word ("Spring Cleanup") is left to the word.
    near = [t for t in [town, *towns] if t and t not in ("Spring", "Liberty", "Highlands", "Humble", "Cove")]
    local = re.compile(rf"\b(?:{'|'.join(re.escape(t) for t in near)})\b", re.I) if near else None
    # A description's sentence that sets the work in another town ("...brings
    # your dreams to life in Kingwood") was written for that town's page, and
    # is left out. A town that opens a sentence ("Spring is...") is a word.
    others = [t for t in towns if t != town]
    elsewhere = re.compile(rf"(?<=\s)(?:{'|'.join(re.escape(t) for t in others)})\b") if others else None
    # So is one that sends the reader to a link of their page ("Click the
    # link below for details"), which the preview does not have, and one left
    # without its full stop where that link was cut away.
    pointer = re.compile(r"\bclick\b|\b(?:link|button|form)s? (?:below|above)\b", re.I)
    # A pointer tacked on after a dash ("...and tax projection services –
    # click to learn more.") is cut away, and the sentence before it kept.
    tacked = re.compile(r"\s*[–—-]\s*(?:click|tap)\b[^.!?]*(?=[.!?]$)", re.I)
    # A sentence that opens on their offer ("10% off any repair or $100 off
    # any system for teachers...") or names a coupon is the deal set by the
    # heading, not the work.
    offer = re.compile(r"^(?:take |get |save )?(?:\d+\s?%|\$\d[\d,]*) off\b|\bcoupons?\b", re.I)
    # A short sentence that only promises to bring the reader's vision to life
    # ("AJ's will bring you vision to life.") is a slogan that names no work.
    slogan = re.compile(r"^(?:\S+\s){0,5}brings? (?:your?|the) (?:visions?|dreams?|ideas?) to life\b[^.!?]{0,20}[.!?]$", re.I)
    # A sentence under a label ("Color: They are brown with black...") is a
    # line of a fact sheet about the subject, not a description of the work.
    # Their page can drop the space after it ("Primer:drywall primer over...").
    label = re.compile(r"^[A-Z][a-z]+(?: [a-z]+)?:\s?")
    # A sentence that hands the work to a named company ("With Aquatic
    # Service, you don't have to!") was copied from that company's site
    # unless the name is their own.
    credit = re.compile(r"^(?i:with|at|call|choose|trust)\s+((?:[A-Z][\w'’&]*\s?){1,5}),\s*(?:you|we)\b")
    stranger = lambda s: bool(own) and bool(credit.match(s)) and not names_the_business(credit.match(s).group(1), own)
    found = {}
    order = []

    def add(name, text=None):
        name = plain(name).strip(" -|:")
        # "Exterior Painting Across North Houston" is the service with the
        # area it covers tacked on; the area is already theirs to list.
        name = re.sub(r"\s+(?:across|throughout)\s+.*$", "", name, flags=re.I)
        # "Finishing the Job with Stump Grinding" is a line about the work
        # with the service at its end; the service is what it is done with.
        name = re.sub(r"^\w+ing (?:the|your|our|a|an|every) .+? (?:with|by|through) ", "", name, flags=re.I)
        # "We Do Seamless Gutters" is the service said in their own voice; the
        # service is what they do.
        name = re.sub(r"^we (?:also )?(?:do|offer|provide|install|specialize in) (?=\w)", "", name, flags=re.I)
        # "DRYWALL Drywall Installation & Repair" is a card's label run into
        # its heading; the word is said once.
        name = re.sub(r"\b(\w+)\s+(?=\1\b)", "", name, flags=re.I)
        if not (3 <= len(name) <= 42) or len(name.split()) > 6 or GENERIC_NAV.match(name):
            return
        if not pattern.search(name) or re.search(r"[?!@]|\d{3}", name) or NOT_A_SERVICE.search(name) or re.match(r"(on|for|with|to|in|at|from|and|i|my|we)\b", name, re.I):
            return
        # A heading that opens on a bidding verb ("Find Storage", "Rent a Unit",
        # "Select a Fence Style", "Keep the Wheels Turning", "Upgrade to a Roof
        # That Lasts", "Compare AC Equipment") is a call to action or a slogan,
        # not a service, and one that names a warranty ("Warranty on Fence
        # Materials") is a promise.
        if re.match(r"(find|rent|reserve|book|get|browse|shop|keep|let|stay|click|tap|compare|explore|discover|view)\b|(select|choose) (a|an|the|your)\b|upgrade (to|your)\b", name, re.I):
            return
        # One that ends on a full stop ("Click shingles to compare roof
        # colors.") is a sentence of their page, not the name of a service.
        if re.search(r"[a-z]{2}\.$", name, re.I):
            return
        # One that opens on its place in their process ("Step Three
        # Construction and Remodeling", "Phase 2: Design") is a stage of the
        # job, not a service.
        if re.match(r"(?:step|phase|stage)\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b", name, re.I):
            return
        if re.search(r"\b(warrant(y|ies)|guarantees?) (on|for)\b", name, re.I):
            return
        # One that opens on a claim made of them ("Fits All Vehicles", "Keeps
        # Your Home Cool") or on what the reader gains ("Saving Money with a
        # Repair") is a selling point, not a service.
        if re.match(r"(fits|keeps|suits|offers|provides|protects|helps|makes|saves|saving|gives|delivers|lets)\b", name, re.I):
            return
        # So is one that praises what they work with ("High-Quality Materials
        # and Equipment", "Quality Parts and Equipment"); it sells the job.
        if re.match(r"(?:(?:high|top|premium|best)[- ]?quality|quality|premium|durable|reliable) (?:materials?|parts|equipment|tools|supplies|products)\b", name, re.I):
            return
        # One that praises the trade as a whole ("Quality Roofing and
        # Remodeling Services", "Reliable Roofing Solutions") is the heading
        # over their services, said as a slogan.
        if re.match(r"(?:(?:high|top|best)[- ]?quality|quality|premium|reliable|trusted|dependable|affordable)\s", name, re.I) and re.search(r"\b(?:services|solutions)$", name, re.I):
            return
        # So is one that opens on praise of the work ("Extraordinary Real
        # Estate Closings", "Exceptional Roofing"), whatever it ends on.
        if re.match(r"(?:extraordinary|exceptional|outstanding|unmatched|unparalleled|unbeatable|superb|amazing|incredible|remarkable|world[- ]class|first[- ]class)\s", name, re.I):
            return
        # One that gathers the rest ("All Accounting Services", "Other Tax
        # Services") is their menu's link to the services page, not a service.
        if re.match(r"(?:all|other)\s.*\bservices$", name, re.I):
            return
        # One that ends on how a job came out ("Insurance Claim Approved",
        # "Roof Replaced") is news of a job done, not a service.
        if re.search(r"\b(?:approved|denied|accepted|replaced|completed|finished|done)$", name, re.I):
            return
        # One that says how the work is done ("Roofs Serviced with Precision",
        # "Built with Care") is a slogan about it, not a service.
        if re.search(r"\b\w+(?:ed|t) (?:with|by) (?:precision|care|pride|integrity|quality|skill|expertise|excellence|confidence|experts?|professionals?)$", name, re.I):
            return
        # A heading that opens on an article or a comparison ("A Tradition of
        # Quality Construction", "The Need for Commercial Storage", "Better
        # Decisions Before Construction"), or on every one of a thing ("Every
        # Fence Tells a Story"), or on all of the trade ("Everything
        # Electrical, Under One Roof"), or that speaks of their history, is a
        # slogan, not a service. So is one that sells the fit of their work
        # ("Premium Pool Services Tailored for Austin", "Effective Treatments
        # for Every Texas Pest") or measures it against before ("Making Pools
        # Look Better Than Ever").
        if re.match(r"(a|an|the|every|everything|each|better|smarter|faster)\s", name, re.I) or re.search(r"\b(traditions?|legacy|decisions?|tailored|than ever|for (?:every|each)|under one roof)\b|\w+er than\b", name, re.I):
            return
        # So is one that says how things ought to be ("Boating Should Be Fun,
        # Not Stressful"), or sets one thing against another (", Not"), or
        # says after a comma how the work comes ("Modern Equipment, Standard",
        # "Quality Work, Guaranteed").
        if re.search(r"\b(should|must|ought|deserves?)\b|,\s*not\b|,\s*(?:standard|included|guaranteed|built[- ]in|\w+ed)$", name, re.I):
            return
        # One in their own voice ("Paints We Use") heads a page about how they
        # work, not a service.
        if re.search(r"\b(we|us)\b", name, re.I):
            return
        # One that says where the trouble is seen ("Termite Swarms Near
        # Bathrooms or Doorways") is a sign to look for, not a service.
        if re.search(r"\bnear\b", name, re.I):
            return
        # One named only for the trade ("Insurance Services", "Roofing
        # Solutions") is the heading over their services, not one of them.
        if GENERIC_SERVICE.match(name) and re.search(r"\b(?:services|solutions)$", name, re.I):
            return
        # One that ends on the people who do the work ("Electricians and
        # Generator Installers", "Tax and Accounting Professionals") says who
        # they are, not a service; one for them ("Estimating Support for
        # Contractors") is still a service.
        # So does one that ends on one of them ("Tax Strategy Consultant"),
        # which is a job on their team, and so does one that ends on a rank
        # ("Tax Manager", "Office Coordinator").
        if re.search(r"\b(?:electricians|technicians|installers|contractors|plumbers|roofers|painters|builders|remodelers|specialists|experts|professionals|pros|mechanics|welders|landscapers|exterminators|inspectors|engineers|machinists|fabricators|consultants?|advis[eo]rs?|accountants?|bookkeepers?|preparers?|managers?|directors?|supervisors?|coordinators?|assistants?|clerks?)$", name, re.I) and not re.search(r"\b(?:for|to|with)\b", name, re.I):
            return
        # Words under it that describe an opening on their team ("This
        # position is responsible for...") make it a job, not a service.
        if text and re.search(r"\b(?:this|the) (?:position|role|job) (?:is|will|requires)\b|\bideal candidate\b|\bminimal supervision\b", text, re.I):
            return
        if NOT_A_SERVICE_SHAPE.search(name) or (own and names_the_business(name, own)) or (local and local.search(name)):
            return

        # "Marine Equipment & Sales" is "Marine Equipment Sales" said again.
        key = " ".join(w for w in re.sub(r"[^a-z0-9 ]", " ", name.lower()).split() if w != "and")
        # "IRS Bank Levies" is "IRS Bank Levy" said again: a plural in -ies
        # is its word in -y.
        stem = lambda k: re.sub(r"s\b", "", re.sub(r"ies\b", "y", k))
        # So is "Residential Painting for Homes" of "Residential Painting
        # Services": the word for the offer and whom it is for name no work.
        # "General Medicare" is "Medicare" said again; "general" names none.
        core = lambda k: re.sub(r"^general |(?: (?:services?|solutions))?(?: for (?:homes?|homeowners|your home|residences?))?$", "", k)
        same = next((k for k in found if k != key and (stem(key).startswith(stem(k)) or stem(k).startswith(stem(key)) or core(k) == core(key))), None)
        if same:
            # The words under the name said again describe the one kept.
            if text and not found[same]["text"]:
                found[same]["text"] = text
            return
        # A one-word heading that ends another ("Repair" of "Roof Repair") is
        # that service with the trade left off; the full name is kept.
        if " " not in key and any(stem(k).endswith(" " + stem(key)) for k in found):
            return
        for k in [k for k in order if " " not in k and stem(key).endswith(" " + stem(k))]:
            text = text or found[k]["text"]
            del found[k]
            order.remove(k)
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
                    # A contact line under the heading ("kmllc@gmail.com Brian
                    # Knight 832-221-3003 www.knightsmarinellc.com") is who to
                    # call, not what the service is.
                    if nxt_tag == "p" and CONTACT_LINE.search(nxt):
                        continue
                    if nxt_tag == "p" and 60 <= len(nxt) <= 700:
                        desc = trim(" ".join(
                            s for s in (tacked.sub("", s) for s in sentences(RUN_IN.sub("", plain(nxt))))
                            if not (elsewhere and elsewhere.search(s)) and not pointer.search(s) and not offer.search(s) and not slogan.match(s) and not label.match(s) and not stranger(s) and FINISHED.search(s)
                        ), 360)
                        break
                    if nxt_tag.startswith("h"):
                        break
                add(text, desc)
        for href, text in page.links:
            if "service" in href.lower() or pattern.search(href):
                add(text)
    # One paragraph under several headings ("ICC Machining offers assembly
    # services..." under Reverse Engineering, Fabrication and Welding) is the
    # site's filler, and describes none of them.
    texts = [found[k]["text"] for k in order if found[k]["text"]]
    for k in order:
        if texts.count(found[k]["text"]) > 1:
            found[k]["text"] = None
    # Words under an emergency heading that say nothing of haste ("After your
    # dentist reviews your x-rays...", under Emergency Dentistry) describe a
    # visit of another kind, and describe none of the emergency work.
    haste = re.compile(r"emergenc|urgent|immediate|right away|as soon as|same[- ]day|24|around the clock|round[- ]the[- ]clock|day or night|after hours|quick|fast|rapid|sudden|pain|injur|broken|knocked|swell|burst|leak|storm|can(?:no|')t wait|don't wait", re.I)
    for k in order:
        if found[k]["text"] and re.search(r"\b(?:emergenc|urgent)", found[k]["title"], re.I) and not haste.search(found[k]["text"]):
            found[k]["text"] = None
    # A page that sets each card's words between its heading and the next
    # gives a heading the next card's words ("Successful termite treatments..."
    # under Mosquito and Wasp Control). Words that name another service and
    # not their own heading's are that service's, and go to it where its own
    # do not name it. Words that only pass by another service ("A self-sealing
    # membrane installed in valleys to stop water from getting under
    # shingles...", under Leak Barrier) are still their own heading's; the
    # card that belongs elsewhere names its service in its opening words.
    stems = lambda t: {w[:5] for w in re.findall(r"[a-z]{4,}", t.lower())} - {"servi", "repai", "contr"}
    named = {k: stems(found[k]["title"]) for k in order}
    moved = {}
    for k in order:
        text = found[k]["text"]
        if text and not named[k] & stems(text):
            opening = stems(" ".join(text.split()[:6]))
            other = next((o for o in order if o != k and named[o] & opening), None)
            if other:
                moved.setdefault(other, text)
                found[k]["text"] = None
    for k, text in moved.items():
        if not (found[k]["text"] and named[k] & stems(found[k]["text"])):
            found[k]["text"] = text
    if described_first:
        order.sort(key=lambda k: found[k]["text"] is None)
    return [found[k] for k in order][:8]


def about_of(pages, name, trade=None, services=(), town=None, state=None, towns=()):
    """Their own about text: the about page first, then the home page's own paragraphs about them."""
    chosen = []
    # A service's own words, set under its heading on their page ("Poor airflow
    # can trap heat and moisture in your attic...", under Attic & Roof
    # Ventilation), tell what one service is, not who they are. A service
    # named only for the trade ("Roofing Services") can be told in their story's words.
    # Its opening is read on to six words at least, so one that opens on a
    # short question ("New roof? We tear off the old one...") is still known.
    def opening(text):
        said = set()
        for s in sentences(text):
            said |= set(re.findall(r"[a-z]+", s.lower()))
            if len(said) >= 6:
                break
        return said
    told_of = [opening(s["text"]) for s in services if s.get("text") and not GENERIC_SERVICE.match(s["title"])]
    ordered = sorted(pages, key=lambda p: 0 if re.search(r"about|story|who-we", p.url, re.I) else 1)
    short = short_name(name).lower().split(" ")[0]
    for page in ordered:
        is_about = bool(re.search(r"about|story|who-we", page.url, re.I))
        for tag, text, header in page.blocks:
            if tag != "p" or header or len(text) < 90:
                continue
            # Nor is the site's notice to an old browser ("You are currently using Internet Explorer 7/8/9, which is not supported by our site").
            if re.search(r"cookie|javascript|internet explorer|\bbrowsers?\b|copyright|all rights reserved|privacy|©|% off|\$\d|off any|coupon|call (us|now|today)|click here", text, re.I):
                continue
            # Their contact form's own instructions ("Use the form to request an appointment") are not about them.
            # Nor is what to put in it ("Share the building address... in our commercial request form").
            # Nor is its fine print ("By submitting, you agree... Do not upload payment-card information").
            # Nor is how to use a tool on their page ("Enter the property address and we'll measure the roof...").
            if re.search(r"\b(?:use|fill (?:out|in)|complete|submit) (?:the|our|this)(?: \w+)? form\b|\b(?:in|on|through|via|with) (?:the|our|this)(?: [\w-]+){0,2} form\b(?! of)|\bby submitting\b|\bdo not (?:upload|submit|send|include)\b", text, re.I) \
                    or re.match(r"(?:enter|type|input|put in) (?:the|your)(?: [\w-]+){0,2} (?:address|zip(?: code)?|postcode|details|information)\b", text, re.I):
                continue
            # Nor is a notice of trouble on their end ("We're currently experiencing phone issues. If you can't reach us...").
            if re.search(r"\bcurrently experiencing\b|\b(?:can(?:no|')t|unable to) reach us\b|\bphones? (?:lines? )?(?:are|is) (?:down|out)\b", text.replace("’", "'"), re.I):
                continue
            # Nor is the site's legal disclaimer ("Attorney Advertising. This website is designed for general information only... not be construed to be formal legal advice"),
            # or its notice that they are not another company ("We are not affiliated, associated... with the Turbo Tax... Dismiss").
            if re.search(r"\battorney advertising\b|\bgeneral information(?:al)? (?:only|purposes)\b|\bnot (?:be )?construed\b|\b(?:lawyer|attorney)[/-]client relationship\b|\bdoes not constitute\b|\bnot (?:in any way )?(?:affiliated|associated|endorsed)\b|\bofficially connected\b", text, re.I):
                continue
            # Nor are its fields scraped as a paragraph ("Full Name * Phone Number * ... If you are human, leave this field blank.").
            if re.search(r"\b(?:name|e-?mail|phone(?: number)?|message)\s*\*|\bleave this field (?:blank|empty)\b", text, re.I):
                continue
            # An article's byline ("Written by Roman Torres... Reviewed and published by... Last updated") says who wrote the page, not who they are.
            if re.search(r"\b(?:written|reviewed|published|posted) by\b|\blast updated\b", text, re.I):
                continue
            # A draft they never filled in ("backed by [warranty terms], in writing") is a template's words, not theirs.
            if re.search(r"\[[^\]]{2,40}\]", text):
                continue
            # Their call for job seekers ("Join a team... View our list of open positions") is a careers page, not their story.
            if re.search(r"\bopen positions\b|\bjob openings\b|\bnow hiring\b|\bjoin (?:a|our|the) (?:team|family)\b|\bapply to (?:be|join)\b", text, re.I):
                continue
            # Nor is the site's foreword to its own pages ("The following pages
            # should give you an idea of what we're all about. We hope you enjoy
            # them!"), which the preview does not have.
            if re.search(r"\b(?:the following|these|the next|our other) pages\b|\b(?:this|our) (?:web ?site|site) (?:should|will|lets?|is designed to)\b|\bwe hope you enjoy (?:them|it|our (?:web ?site|site|pages))\b", text, re.I):
                continue
            if not is_about and not re.search(rf"\b(we|our|{re.escape(short)})\b", text, re.I):
                continue
            # A paragraph that trails off ("...decisions. And when you do, here
            # are a few ..") lost its list; the sentences left lead into nothing.
            if not re.match(r"[A-Z0-9\"'\u201c]", text) or "\u2026" in text or re.search(r"\.\s?\.", text):
                continue
            # A numbered step of how they work ("1. Walkthrough and measurements
            # We review...") is a process with its heading run in, not their story,
            # as is a numbered item of a list of their services, its space lost
            # ("3.Siding & Trim Installation: Enhance your home's...").
            if re.match(r"(?:step\s*)?\d{1,2}[.):](?:\s|[A-Z])", text, re.I):
                continue
            # A customer's review quoted on their page ("5 Stars - ...") is not their description of themselves.
            if re.fullmatch(r"[\"\u201c].*[\"\u201d]", text, re.S) or re.search(r"\b[1-5]\s*stars?\b|\u2605", text, re.I):
                continue
            # Or one whose opening quote was lost and only the closing one is
            # left ("...and our pool looks great!\"").
            if re.search(r"[.!?][\"\u201d]$", text) and text.count('"') == 1 and "\u201c" not in text:
                continue
            # Nor is one pasted without quotes, told in the first person about
            # them ("I needed a unit... would recommend them to anyone").
            if re.search(r"\b(?:I|my|me)\b", text) and re.search(r"\brecommend(?:ed)? (?:them|him|her|this (?:place|company|business)|these guys)\b", text, re.I):
                continue
            # Or one that speaks of them as "they" or of their staff helping
            # the writer ("They fix pain fast! I had accepted...", "Dr. Barlas
            # helped... He showed me"), or tells of the writer's visit to them
            # ("I was at Pasadena office the agent... explained to me", "I
            # stopped by a-best insurance last Saturday... Your agent was
            # polite"), or recommends them or thanks one of them by name ("I
            # would highly recommend American Veteran Roofing", "Would definitely
            # recommend...", "Thank you Daniel for a great experience"), with no
            # "we" or "our" of their own.
            if re.search(r"\b(?:I|my|me)\b", text) and not re.search(r"\b(?:we|our|us)\b", text, re.I) and (
                re.match(r"(?:they|these guys)\b", text, re.I)
                or re.search(r"\b(?:helped|showed|treated|fixed|taught|walked|took care of|got) me\b", text, re.I)
                or re.search(r"\bI (?:stopped by|dropped by|came in|walked in|was at [\w ]{0,30}office)\b|\bexplained (?:\w+ )?to me\b|\bmy experience (?:was|with)\b|\b(?:I(?:'d| would| will)?|would) (?:(?:highly|definitely|strongly) )?recommend\b|\bgive them a call\b|\byour (?:agent|staff|team) (?:was|were|is|are)\b", text.replace("’", "'"), re.I)
                or re.search(r"\b(?:thank you|thanks) (?-i:[A-Z][a-z]+)\b", text, re.I)
            ):
                continue
            # Or one a customer signs as "we", of the owner as "he" or "she"
            # ("We've known Scott with Highland Roofing for almost 10 years...
            # he consistently checked on our roof").
            if re.search(r"\bwe(?:'ve|’ve| have) (?:known|used|hired|trusted) [A-Z]", text) or (
                re.search(r"\b(?:he|she)\b", text, re.I)
                and re.search(r"\b(?:on|to|at) (?:our|my) (?:roof|home|house|property|yard|pool)\b|\bset (?:him|her|them) apart\b|\bgave (?:us|me) peace of mind\b", text, re.I)
            ):
                continue
            # Or one that tells of them as "they" doing the work for the writer
            # or of finding them ("These Ladies did an amazing job for us... they
            # constantly work for us", "I am so glad I found Ripkowski
            # Insurance. Just tell them what you need, and they do all the work").
            if re.search(r"\b(?:I|me|my|us)\b", text) and re.search(r"\b(?:they|them)\b", text, re.I) and (
                re.search(r"\b(?:they|these \w+)\b[^.!?]{0,40}\bfor (?:us|me)\b", text, re.I)
                or re.search(r"\bI found (?:them\b|[A-Z])", text)
            ):
                continue
            # Or one a customer writes to them as "you", thanking them ("Thank
            # you for the clear and concise explanation... Judith and I really
            # appreciate the efforts of you and your team members").
            if re.search(r"\b(?:I|me|my)\b", text) and (re.match(r"(?:thank you|thanks)\b", text, re.I) or re.search(r"\byou and your (?:team|staff|crew|office)\b", text, re.I)):
                continue
            # Nor is their reply to one ("Hi, Tom. We must have done something
            # right...", "Thank you so much for your kind words, Tonya!").
            if re.match(r"(?:hi|hello|hey|dear)\b", text, re.I) or re.search(r"\b(?:thank you|thanks)\b[^.!?]{0,40}\b(?:kind words|review|rating|feedback)\b|\brat(?:e|ing) us\b", text, re.I):
                continue
            if other_trade(text, trade):
                continue
            # Nor is one that sets them in another state ("a local roofing
            # company out of Kansas City, MO" for a roofer in Crosby, TX).
            if placed_elsewhere(text, town, state, towns):
                continue
            if sells_medicine(text, trade):
                continue
            said = set(re.findall(r"[a-z]+", text.lower()))
            if any(len(t) >= 6 and len(t & said) >= 0.8 * len(t) for t in told_of):
                continue
            # A sentence written around a search phrase ("searching for highly
            # rated Deer Park dentists near me") is left out of the paragraph.
            # A sentence their page set apart in a link or in bold is lost from
            # the paragraph's text or left bare in it ("Did you know" gone
            # before "Express Pool Plastering expanded our business...?", "Check
            # out our custom pool and spa builds" with no stop), and is left
            # out, as is one that leans on the one before it ("We also
            # build...") once it opens the paragraph. So is a search phrase set
            # down as a sentence, the trade run straight into a town ("Air
            # Conditioning & Heating Company Alvin.") or into a list of towns
            # ("Cooling tech services, Manvel, Pearland, and Houston, Texas.").
            kept = [
                s for s in sentences(text)
                if not re.search(r"\bnear me\b", s, re.I) and FINISHED.search(s)
                and not re.search(r"\b(?i:company|contractors?|services?|repairs?)\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\.$", s)
                and not re.match(r"[^,]*\b(?i:services?|repairs?),(?:\s*(?:and\s+)?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?,?)+\.$", s)
                and not (s.endswith("?") and re.match(rf"(?:we|our|i|{re.escape(short)})\b", s, re.I))
            ]
            while kept and re.match(r"\w+ also\b", kept[0], re.I):
                kept.pop(0)
            # A sentence a paragraph already told says again with a word or two
            # changed ("KleeCo specializes in advising and finding the right
            # insurance coverage..." over "KleeCo Insurance specializes in
            # advising and finding insurance coverage...") is told once.
            words = lambda t: set(re.findall(r"[a-z]+", t.lower()))
            told = [words(s) for c in chosen for s in sentences(c)]
            kept = [s for s in kept if not any(min(len(words(s)), len(t)) >= 8 and len(words(s) & t) >= 0.8 * min(len(words(s)), len(t)) for t in told)]
            # A lone sentence that opens a story it never tells ("...was born
            # from a simple frustration and an entrepreneurial spark that
            # changed everything") is a teaser for a page we don't have.
            if len(kept) == 1 and re.search(r"\b(?:was born (?:from|out of)|it all (?:started|began)|changed everything)\b", kept[0], re.I):
                continue
            text = " ".join(kept)
            cut = trim(text, 600)
            # Their name left on its own after the paragraph ("...advisory
            # services.Scott Singleton Fincher & Co.") is a caption run into
            # it, not a sentence of their story.
            cut = " ".join(s for s in sentences(cut) if bare_name(s) not in (bare_name(name), bare_name(short_name(name))))
            # A paragraph their site repeats with a word or two changed
            # ("the team at Alex Pools Service" on one page, "Alex Pools" on
            # another) is the same paragraph, and is told once.
            if cut and any(len(words(cut) & words(c)) >= 0.8 * min(len(words(cut)), len(words(c))) for c in chosen):
                continue
            if cut and cut not in chosen:
                chosen.append(cut)
            if len(chosen) == 3:
                return chosen
        if chosen and is_about:
            return chosen
    return chosen


# A description made from a page's text can run its heading into the first
# sentence ("Meet Shane Pellerin I am Attorney..."); the heading is left off.
HEADING_RUN_IN = re.compile(r"^(?:Meet|Welcome to|About)\s[^.!?,:;]*?\s(?=(?:I|We|Our)\s)")
# A description that stops without a full stop was cut off by the page or the
# search snippet ("...that has defined our Houston"), as was one that trails off
# ("Why Commercial Fences Matter for Every Business Every...", "home insurance
# in Houston, TX is.."), an article's teaser for a page we don't have.
FINISHED = re.compile(r"(?<![.…])[.!?][\"'”)]?$")


def names_a_service(text, services):
    """True when the words name one of the services found, by the stem of any
    word of its title ("coatings" names "Surface Preparation and Coating")."""
    stems = {w[:5] for s in services for w in re.findall(r"[a-z]{4,}", s["title"].lower()) if w not in ("service", "services", "repair")}
    return any(w[:5] in stems for w in re.findall(r"[a-z]{4,}", text.lower()))


# A sentence that gives a number to call ("Call (832) 893-2847.") can give
# another office's; the page shows their own number beside the lead.
PHONE = re.compile(r"\(?\b\d{3}\)?[\s.-]*\d{3}[\s.-]\d{4}\b")


def unphoned(text):
    return " ".join(s for s in sentences(text) if not PHONE.search(s))


# A sentence that points at their website rather than their work ("Take a look
# at our Home page.") is the site theme's filler, not something to read.
SITE_TALK = re.compile(r"(?:(?:take|have) a look at|look at|check out|browse|explore|visit|welcome to)\s+(?:our|this|the)\s+(?:[\w'’-]+\s+){0,2}(?:page|site|website|web site)\b[^.!?]*[.!?]$", re.I)


def unsited(text):
    return " ".join(s for s in sentences(text) if not SITE_TALK.match(s))


def lead_of(pages, about, trade=None, services=(), town=None, state=None, towns=()):
    about = [unsited(unphoned(p)) for p in about]
    for page in pages[:1]:
        for key in ("og:description", "description"):
            text = trim(unsited(unphoned(HEADING_RUN_IN.sub("", plain(page.meta.get(key, ""))))), 220)
            if other_trade(text, trade) or sells_medicine(text, trade) or not FINISHED.search(text):
                continue
            # A description that sets them in another state ("Kansas City's
            # trusted roofing contractor" for a roofer in Crosby, TX) was
            # written for somewhere else; under their hero it contradicts their address.
            if placed_elsewhere(text, town, state, towns):
                continue
            # A description left from the theme or another company's site
            # ("industrial machinery, tools, and engineering services" on a
            # scaffolding and coating contractor's) names none of their
            # services; their own about text says what they do.
            if services and not names_a_service(text, services):
                continue
            # A description the site filled from its contact form ("Contact Us
            # ... parts@... Name(Required) First Last Email(Required)...") is
            # the form's labels, not what they do.
            if CONTACT_LINE.search(text) or re.search(r"\(required\)", text, re.I):
                continue
            # A description whose list names the same place twice ("to Deer
            # Park, TX, and TX, AZ, ME, TN, and CO") was pieced together by the
            # site's settings, not written; their own about text says it.
            if re.search(r"\b(\w+), and \1\b", text):
                continue
            # A description that opens on the page's title chain ("AIT -
            # Insurance - Affordable Insurance of Texas is...") is directory
            # copy, like one split by "|".
            if re.search(r"\s-\s[^.!?]*\s-\s", text):
                continue
            if len(text) >= 60 and re.match(r"[A-Z]", text) and not re.search(r"cookie|javascript|internet explorer|\bbrowsers?\b|\||near me|call us|\u2026|\.\.", text, re.I):
                return text, f"{page.url} meta {key}"
    # A paragraph that opens on a sentence too long for the hero gives way to
    # the next. One that asks a question ("Who is A.J. Benys? He is a native
    # Houstonian...") or tells of one person ("...operated his fledgling
    # business") is about the owner, not what the business does.
    told = [p for p in about if not re.search(r"\?|\b(?:He|She)\s", p) and not (re.search(r"\b(?:his|her)\b", p, re.I) and not re.search(r"\b(?:we|our|us)\b", p, re.I))]
    for paragraph in told:
        text = trim(paragraph, 220)
        if len(text) >= 60 and FINISHED.search(text):
            return text, "about text"
    # Failing those, a paragraph's own sentences after its too-long opener.
    for paragraph in about:
        text = trim(" ".join(sentences(paragraph)[1:]), 220)
        if len(text) >= 60 and FINISHED.search(text) and not re.search(r"\?|\b(?:He|She|his|her)\b", text):
            return text, "about text"
    return None, None


def areas_of(text, town, towns):
    found = [town] if town else []
    for t in towns:
        # "Liberty" in "Liberty Hill" is the longer town's name, not a second town.
        rest = text
        for longer in [town, *towns]:
            if longer and longer != t and re.search(rf"\b{re.escape(t)}\b", longer):
                rest = re.sub(rf"\b{re.escape(longer)}\b", "", rest)
        if t != town and re.search(rf"\b{re.escape(t)}\b", rest):
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
    if template == "professional":
        # The professional template draws the accent as small labels on white,
        # so it is darkened again until it reads there, as far as it still
        # reads on the dark grounds.
        while images.contrast(accent, (255, 255, 255)) < 4.5 and images.contrast(images.shade(accent, 0.92), ink) >= 3 and tries < 80:
            accent = images.shade(accent, 0.92)
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
# The most words two services joined may take before the town.
HEADLINE_WORDS = 5


def hero_line(services, town, label, trade=None, name=""):
    """The headline a template draws under the name: the business's own two
    leading services and its town, worded once ("Auto and home insurance in
    Baytown", "Roof repair and roof replacement in Tomball"). With no two
    services worth naming it is the trade and the town."""
    named = [s["title"] for s in services if not GENERIC_SERVICE.match(s["title"])]
    # Services that name their own trade lead, so a roofer whose menu opens on
    # siding is not headlined "Residential siding install".
    words = TRADE_WORDS.get(trade)
    if words:
        named.sort(key=lambda t: not re.search(words, t, re.I))
    # Initials in brackets ("Client Accounting Services (CAS)") only lengthen a headline.
    named = [re.sub(r"\s*\([^)]*\)$", "", t) for t in named]
    # Each half of a slashed word ("Controller/CFO") keeps its own initials.
    low = lambda w: w if (w.isupper() and len(w) > 1) or w.upper() in ACRONYMS else "/".join(low(p) for p in w.split("/")) if "/" in w else w.lower()
    every = [" ".join(low(w) for w in t.split()) for t in named]
    lower = every[:2]
    phrase = lambda t: re.search(r"&|\b(?:and|or|for|of|with|to)\b", t, re.I)

    def joined(a, b):
        tail_a, tail_b = a.rsplit(" ", 1), b.rsplit(" ", 1)
        # "Auto insurance and home insurance" reads as "auto and home insurance".
        if len(tail_a) == 2 and len(tail_b) == 2 and tail_a[1].lower() == tail_b[1].lower():
            both = f"{tail_a[0]} and {b}"
        else:
            both = f"{a} and {b}"
        # Two long names joined ("Outdoor sound system installation and
        # landscape lighting installation") run the headline over five lines;
        # the first alone is the headline.
        return both if len(both.split()) <= HEADLINE_WORDS else a
    # A name that is a phrase of its own ("Storage for moving & life changes")
    # can't be joined to another with "and"; the trade stands for the two,
    # where their services name it. A listing filed under another trade
    # ("Painting" for a builder of lighting and fences) gives way to their
    # first service alone. One that lists the trade itself among its
    # services ("Pest Control" beside "Mosquito and Wasp Control") is filed
    # under its own. Under a name that already says the trade ("Sugar
    # Roofing") the trade says nothing again; their next two names that
    # join stand for it.
    if len(lower) == 2 and any(phrase(t) for t in lower):
        trade = label.lower().split()[0]
        pair = [t for t in every if not phrase(t)][:2]
        if re.search(rf"\b{re.escape(trade)}", name, re.I) and len(pair) == 2:
            what = joined(*pair)
        else:
            what = label.lower() if any(re.search(rf"\b{re.escape(trade)}", s["title"], re.I) for s in services) else lower[0]
    elif len(lower) == 2:
        what = joined(*lower)
    elif lower:
        what = lower[0]
    else:
        # A service named only for the trade ("Electrical Services") still names
        # theirs, where the label may be the template's: an electrician drawn on
        # the hvac template is not "heating and air".
        own = [t for t in (s["title"] for s in services) if len(t.split()) > 1][:1]
        what = " ".join(w if w.upper() in ACRONYMS else w.lower() for w in own[0].split()) if own else label.lower()
    return f"{what[:1].upper()}{what[1:]} in {town}"


def summary_line(groups, short, areas):
    """The line under the home services heading: the services by their own
    names and the towns they cover ("Aaron's offers panel upgrades and
    generators across Houston, Katy and Cypress"), so it never repeats the
    hero's lead, which is their own description of themselves."""
    named = [" ".join(w if (w.isupper() and len(w) > 1) or w.upper() in ACRONYMS or w in areas else w.lower() for w in g["title"].split()) for g in groups[:3]]
    # A name with its own "and" ("Repair and Upgrades") keeps the list apart with a comma.
    join = ", and " if any(re.search(r"\band\b|&", t) for t in named) else " and "
    what = join.join([", ".join(named[:-1]), named[-1]]) if len(named) > 1 else named[0]
    towns = areas[:3]
    where = f"across {', '.join(towns[:-1])} and {towns[-1]}" if len(towns) > 1 else f"in and around {towns[0]}"
    return f"{short} offers {what} {where}."
