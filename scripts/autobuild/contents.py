"""What a customer can read on a business's own website that its preview does not say.

    python3 -m scripts.autobuild.gate facts <slug> <site.json>

Every preview must carry what their own site tells a customer: their phones and
addresses, license numbers, hours, the year they began, what they guarantee,
how they can be paid, who they are certified by, where else they can be found.
A second reader going over their whole site again used to catch what the
builder left out; this does the same from the copy of their site the builder
was given (collect.copy), in a second rather than a quarter of an hour, and
names each thing it finds missing with the page it is on.

It reads two kinds of thing. Facts with a shape - a phone number, an email, a
license number, a year, a payment method, a certifying body - are missing when
the preview's own words do not hold them. The home page's headings, and any
question their site answers, are missing when most of their words are nowhere
on the preview: a section of their site or an answer the preview has no place
for yet. Each is for the builder to carry onto the preview or to say why not
(out of date, or plainly wrong on their own site).
"""

import json
import re

PHONE = re.compile(r"(?<!\d)\(?([2-9]\d{2})\)?[\s.-]?(\d{3})[\s.-]?(\d{4})(?!\d)")
EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
NOT_EMAIL = re.compile(r"\.(png|jpe?g|gif|webp|svg)$|sentry|wixpress|example\.|domain\.|yourdomain|email\.com$", re.I)
LICENSE = re.compile(
    r"\b(?:lic(?:ense|\.)?|license\s*(?:no\.?|number)|reg(?:istration)?\s*(?:no\.?|number)|TACLA|TECL|TDLR|RMP|MPL|"
    r"NMLS|TREC|CSLB|ROC)\s*[#:.]?\s*([A-Z]{0,6}[\s-]?\d[\dA-Z-]{2,})",
    re.I)
SINCE = re.compile(r"\b(?:since|established|est\.|founded|serving[^.]{0,40}?since|in business since)\s+(?:in\s+)?"
                   r"(1[89]\d\d|20[0-2]\d)\b", re.I)
YEARS = re.compile(r"\b(\d{1,3})\+?\s+years?\s+(?:of\s+)?(?:experience|in business|serving|in the industry)", re.I)
DAYS = re.compile(r"\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\b", re.I)
TIME = re.compile(r"\b\d{1,2}(?::\d\d)?\s*(?:a\.?m\.?|p\.?m\.?)|\b(?:open\s+)?24\s*hours\b|\bclosed\b", re.I)
# Things a customer weighs before they call, each with the words that say it.
CLAIMS = {
    "around the clock or emergency service": r"24\s*/\s*7|24 hours a day|24-hour|emergency (?:service|repair|call)|after[- ]hours",
    "financing": r"\bfinanc(?:e|ing)\b",
    "a warranty or guarantee": r"\bwarrant(?:y|ies|ied)\b|\bguarantee",
    "that they are licensed": r"\blicensed\b",
    "that they are insured": r"\binsured\b",
    "that they are bonded": r"\bbonded\b",
    "free estimates or quotes": r"free (?:estimate|quote|inspection|consultation)",
    "Spanish spoken": r"se habla espa|hablamos espa|en espa[nñ]ol|spanish[- ]speaking|bilingual",
    "senior, military or first responder discounts": r"(?:senior|military|veteran|first responder)s?(?:'s)? discount",
    "family or locally owned": r"family[- ]owned|locally[- ]owned|veteran[- ]owned|woman[- ]owned|minority[- ]owned",
}
PAYMENTS = ["visa", "mastercard", "american express", "amex", "discover", "zelle", "venmo", "cash app", "paypal",
            "apple pay", "google pay", "personal checks"]
PAYMENT_LINE = re.compile(r"\b(visa|mastercard|master card|american express|amex|zelle|venmo|cash app|paypal|apple pay|"
                          r"google pay|we accept|payment methods?|forms of payment)\b", re.I)
BODIES = ["BBB", "Better Business Bureau", "NATE", "EPA", "ACCA", "NARI", "NRCA", "NAHB", "PHCC", "IICRC", "ASE",
          "Chamber of Commerce", "GAF", "CertainTeed", "Owens Corning", "Energy Star", "Angi", "HomeAdvisor",
          "Lennox", "Carrier", "Trane", "Rheem", "Ruud", "Goodman", "Daikin", "American Standard", "Mitsubishi",
          "Bryant", "Generac", "Kohler", "Kinetico", "Pentair", "Hayward", "Trex", "TimberTech", "Andersen",
          "Pella", "James Hardie", "Sherwin-Williams", "Benjamin Moore", "Mohawk", "Armstrong",
          "Google Guaranteed", "Angie's List", "Super Service Award", "TDLR", "TREC", "NMLS", "AICPA", "TSCPA",
          "Enrolled Agent", "Invisalign", "Medicare", "Medicaid"]
LINKS = re.compile(
    r"facebook\.com|instagram\.com|twitter\.com|x\.com/|linkedin\.com|youtube\.com|tiktok\.com|nextdoor\.com|"
    r"yelp\.com|pinterest\.com|houzz\.com|calendly\.com|housecallpro\.com|getjobber\.com|clienthub|servicetitan|"
    r"squareup\.com|square\.site|acuityscheduling|booksy\.com|vagaro\.com|setmore\.com|zocdoc\.com|schedulicity|"
    r"mindbodyonline|glofox|opentable\.com|toasttab\.com|doordash\.com|ubereats\.com|grubhub\.com", re.I)
# A link to a share button or the platform's own home says nothing of them.
NOT_THEIRS = re.compile(r"sharer|share\?|intent/tweet|/share|/plugins/|/policies|/legal|^https?://(www\.)?[a-z.]+/?$", re.I)
# Headings every site has that say nothing of this business.
GENERIC = re.compile(
    r"^(home|menu|about( us)?|contact( us)?|our (services|team|work|story)|services|gallery|testimonials|reviews|"
    r"faqs?|blog|news|quick links|follow us|connect with us|get in touch|get a (free )?(quote|estimate)|call (us )?now|"
    r"request (a )?(quote|service|estimate)|learn more|read more|why choose us|welcome|navigation|useful links|"
    r"hours|location|locations|our location|service areas?|areas we serve|privacy policy|terms.*|sitemap|"
    r"copyright.*|all rights reserved.*|login|search|cart|shop|book now|schedule (now|service|online)|"
    r"see more|view (all|more)|next|previous|close|submit|send|subscribe.*|newsletter)$", re.I)
STEP = re.compile(r"^(step\s*\d|\d+[.)]\s)", re.I)
STOP = {"with", "your", "that", "this", "from", "have", "they", "will", "what", "when", "where", "which", "their",
        "about", "more", "there", "here", "into", "over", "than", "then", "them", "were", "been", "also", "just",
        "only", "each", "every", "most", "some", "such", "very", "make", "made", "best", "free", "call", "today",
        "need", "help", "near", "area", "areas", "service", "services", "company", "contact", "team", "work", "home"}


def flatten(value):
    """Every word the brand file puts on the preview, in one string."""
    if isinstance(value, dict):
        return " ".join(flatten(v) for k, v in value.items()
                        if k not in ("template", "preview", "image", "logo", "logoMono", "fonts"))
    if isinstance(value, list):
        return " ".join(flatten(v) for v in value)
    return str(value) if value is not None else ""


def _alnum(text):
    return re.sub(r"[^a-z0-9]", "", text.lower())


def _words(text):
    return [w for w in re.findall(r"[a-z][a-z']{3,}", text.lower()) if w not in STOP]


def _stem(word):
    return re.sub(r"(ies|es|s|ing|ed)$", "", word)


def _line_with(text, pattern):
    return next((line.strip() for line in text.splitlines() if re.search(pattern, line, re.I)), "")[:160]


def missing(brand, site, most=60, headings=15):
    """[(what, page)] for each thing on their site the preview does not say:
    the facts first, then at most `headings` of their headings."""
    said = flatten(brand)
    lower = said.lower()
    digits = re.sub(r"\D", "", said)
    squashed = _alnum(said)
    stems = {_stem(w) for w in re.findall(r"[a-z][a-z']+", lower)}
    found, sections, seen = [], [], set()

    def add(what, where, into=found, key=None):
        key = (key or what).lower()
        if key not in seen:
            seen.add(key)
            into.append((what, where))

    for number, page in enumerate(site["pages"]):
        url, text = page["url"], page["text"]
        for m in PHONE.finditer(text):
            if "".join(m.groups()) not in digits:
                add(f"the phone number {m.group(0).strip()}", url)
        for address in EMAIL.findall(text):
            if not NOT_EMAIL.search(address) and address.lower() not in lower:
                add(f"the email address {address}", url)
        for m in LICENSE.finditer(text):
            number = _alnum(m.group(1))
            if len(re.sub(r"\D", "", number)) >= 3 and number not in squashed:
                add(f"the license or registration number '{m.group(0).strip()}'", url)
        for m in SINCE.finditer(text):
            if m.group(1) not in said:
                add(f"the year they began, {m.group(1)}: '{m.group(0).strip()}'", url)
        for m in YEARS.finditer(text):
            if not re.search(rf"\b{m.group(1)}\b", said) and not brand.get("since"):
                add(f"'{m.group(0).strip()}'", url)
        if not brand.get("hours") and any(DAYS.search(line) and TIME.search(line) for line in text.splitlines()):
            add(f"their opening hours: '{next(l for l in text.splitlines() if DAYS.search(l) and TIME.search(l))[:160]}'", url)
        for what, pattern in CLAIMS.items():
            if re.search(pattern, text, re.I) and not re.search(pattern, said, re.I):
                add(f"{what}: '{_line_with(text, pattern)}'", url, key=what)
        # "Discover" is as often a verb, so it is a card only beside another.
        for line in text.splitlines():
            if PAYMENT_LINE.search(line):
                for method in PAYMENTS:
                    if re.search(rf"\b{re.escape(method)}\b", line, re.I) and method not in lower:
                        add(f"that they take {method}", url)
        for body in BODIES:
            pattern = rf"\b{re.escape(body)}\b"
            if re.search(pattern, text) and body.lower() not in lower:
                add(f"{body}: '{_line_with(text, pattern)}'", url, key=body)
        for href, _ in page["links"]:
            if LINKS.search(href) and not NOT_THEIRS.search(href):
                path = re.sub(r"^https?://(www\.)?", "", href).split("?")[0].rstrip("/")
                if _alnum(path) not in squashed:
                    add(f"their page at {href}", url)
        # A section of the home page, or a question they answer anywhere: an
        # inner page's headings are mostly the steps and selling points of
        # one service, which are its page's to say rather than the preview's.
        for line in page["headings"]:
            line = " ".join(line.split())
            if not line or len(line) > 120 or GENERIC.match(line.strip(" :.!?")) or STEP.match(line):
                continue
            if number and not line.endswith("?"):
                continue
            words = _words(line)
            if words and sum(1 for w in words if _stem(w) in stems) * 2 < len(words):
                add(f"the section or question '{line}'", url, sections)
    return (found + sections[:headings])[:most]


def report(brand_path, site_path):
    with open(brand_path) as handle:
        brand = json.load(handle)
    with open(site_path) as handle:
        site = json.load(handle)
    return missing(brand, site)
