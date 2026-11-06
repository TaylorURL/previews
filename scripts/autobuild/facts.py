"""The facts about one business, read from its own website by a model and
then proved word for word by arithmetic.

    sheet(prospect, pages, business, notes)  -> the fact sheet, or None
    google_reviews(prospect, notes)          -> (reviews, raw response) or ([], None)
    supported(text, corpus)                  -> what in `text` the corpus does not say

One `claude -p` call (vision.py's way of calling it, on the subscription, never
an API key) reads the pages the builder collected and the listing row, and
returns every fact it finds with `quote`, the words on the page that state it,
and `url`, the page they are on. The model is only a reader here: `verify`
keeps an item only when its quote really is on that page once whitespace,
case, quotes and dashes are made alike, and when what the item claims (a
year, a phone number, a language, a person's name) is in that quote. What it
drops is said in the notes, so a sheet that loses most of itself is visible.

Every item carries an id ("s1", "h2", "t1"), which written copy (write.py)
cites sentence by sentence.

PREVIEW_WRITE=off, a missing `claude` command, a refusal or a slow answer all
give None, and the build goes on as it did before there was a sheet.
"""

import functools
import json
import os
import re
import shutil
import subprocess
import tempfile
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

from . import compose, vision

MODEL = os.environ.get("PREVIEW_FACTS_MODEL") or os.environ.get("PREVIEW_VISION_MODEL") or "claude-sonnet-5-5"
TIMEOUT = int(os.environ.get("PREVIEW_WRITE_TIMEOUT") or 420)
# The most of one page, and of all of them, the model is shown.
PAGE_CHARS = 14_000
ALL_CHARS = 90_000

last_error = None


def available():
    return os.environ.get("PREVIEW_WRITE", "on") != "off" and bool(shutil.which("claude"))


def ask(prompt, schema, model=None, timeout=None):
    """One question in words; the structured answer, or None (why is in last_error).

    The prompt goes in on stdin, since a page's worth of text is longer than
    Linux lets one argument be."""
    global last_error
    if not available():
        last_error = "writing is switched off (PREVIEW_WRITE=off) or the claude command is missing"
        return None
    command = ["claude", "-p", "--model", model or MODEL, "--tools", "", "--setting-sources", "",
               "--no-session-persistence", "--output-format", "json", "--json-schema", json.dumps(schema)]
    with tempfile.TemporaryDirectory(prefix="preview-words-") as folder:
        try:
            done = subprocess.run(command, cwd=folder, input=prompt, capture_output=True, text=True,
                                  timeout=timeout or TIMEOUT, env=vision._env())
        except subprocess.TimeoutExpired:
            last_error = f"the model took longer than {timeout or TIMEOUT}s"
            return None
        except OSError as error:
            last_error = f"the claude command could not start: {error}"
            return None
    try:
        out = json.loads(done.stdout)
    except ValueError:
        last_error = f"the model answered nothing readable (exit {done.returncode}): {done.stderr.strip()[-200:]}"
        return None
    answer = out.get("structured_output")
    if out.get("is_error") or not isinstance(answer, dict):
        last_error = f"the model failed: {str(out.get('result'))[:200]}"
        return None
    last_error = None
    return answer


# Making two texts alike before one is looked for in the other.
SAME = str.maketrans({"‘": "'", "’": "'", "‚": "'", "‛": "'", "′": "'", "`": "'", "´": "'",
                      "“": '"', "”": '"', "„": '"', "‟": '"', "″": '"', "«": '"', "»": '"',
                      "‐": "-", "‑": "-", "‒": "-", "–": "-", "—": "-", "―": "-", "−": "-",
                      " ": " ", " ": " ", " ": " ", "…": "...", "*": " ", "_": " "})
MARKER = re.compile(r"(?m)^(?:#{1,6}|-)\s")


@functools.lru_cache(maxsize=512)
def normal(text):
    text = unicodedata.normalize("NFKC", text or "").translate(SAME)
    text = compose.ZERO_WIDTH.sub("", compose.UNDRAWN.sub(" ", text)).lower()
    text = MARKER.sub(" ", text)
    text = re.sub(r"\s+", " ", text)
    # A space their markup leaves before a stop or after a bracket is no word.
    text = re.sub(r"\s+([,.;:!?)\]%])", r"\1", text)
    text = re.sub(r"([(\[$#])\s+", r"\1", text)
    return text.strip()


def found_in(quote, text):
    """True when the quote is in the text once both are made alike. An
    ellipsis in the quote stands for words left out, and each part is then
    looked for in order."""
    q = normal(str(quote or "")).strip(" \"'")
    if len(q) < 3:
        return False
    hay = normal(str(text or ""))
    at = 0
    for part in [p.strip(" ,;:-") for p in re.split(r"\.\.\.|\[\.\.\.\]", q)]:
        if not part:
            continue
        part = part.rstrip(".")
        i = hay.find(part, at)
        if i < 0:
            return False
        at = i + len(part)
    return True


def digits(text):
    return re.sub(r"\D", "", str(text or ""))


# What a sentence can claim that the facts must say before it may.
CLAIMS = [
    (r"\bbest\b", r"\bbest\b"), (r"#\s?1\b|\bnumber one\b|\bno\. 1\b", r"#\s?1\b|\bnumber one\b|\bno\. 1\b"),
    (r"\bleading\b", r"\bleading\b"), (r"\btop[- ]rated\b", r"\btop[- ]rated\b"), (r"\bpremier\b", r"\bpremier\b"),
    (r"\bfinest\b", r"\bfinest\b"), (r"\bunmatched\b|\bunbeatable\b|\bunrivall?ed\b|\bunparalleled\b|\bsecond to none\b",
                                     r"\bunmatched\b|\bunbeatable\b|\bunrivall?ed\b|\bunparalleled\b|\bsecond to none\b"),
    (r"\b(?:greatest|largest|biggest|fastest|cheapest|lowest|highest|oldest)\b", None),
    (r"\bthe most\b", r"\bthe most\b"), (r"\bthe only\b", r"\bthe only\b"),
    (r"\bguarantee", r"\bguarantee|\bwarrant"), (r"\bwarrant", r"\bwarrant|\bguarantee"),
    (r"\bfree\b", r"\bfree\b|\bno[- ](?:cost|charge|obligation)\b|\bcomplimentary\b"),
    (r"\b24/7\b|\b24 hours\b|\baround the clock\b|\bday or night\b", r"\b24/7\b|\b24 hours\b|\b24-hour\b|\baround the clock\b|\bday or night\b|\b24 hr"),
    (r"\bemergenc", r"\bemergenc"), (r"\bsame[- ]day\b", r"\bsame[- ]day\b"),
    (r"\blicensed\b", r"\blicens"), (r"\binsured\b", r"\binsured\b|\binsurance\b"), (r"\bbonded\b", r"\bbonded\b"),
    (r"\bcertified\b|\bcertification", r"\bcertif"), (r"\baward", r"\baward"),
    (r"\bfamily[- ]owned\b|\bfamily[- ]run\b|\bfamily business\b", r"\bfamily\b"),
    (r"\bgenerations?\b", r"\bgeneration"), (r"\bveteran", r"\bveteran"),
    (r"\bwom[ae]n[- ]owned\b", r"\bwom[ae]n[- ]owned\b|\bfemale[- ]owned\b"),
    (r"\bminority[- ]owned\b", r"\bminority"),
    (r"\bfinanc", r"\bfinanc"), (r"\bdiscount", r"\bdiscount"), (r"\$\s?\d|\bprice[ds]?\b|\bpricing\b", None),
    (r"\d\s?%|\bpercent\b", None), (r"\bbilingual\b|\bspanish\b|\bespa[nñ]ol\b", r"\bbilingual\b|\bspanish\b|\bespa[nñ]ol\b|\bhabla"),
    (r"\bupfront\b|\bup[- ]front\b|\bflat[- ]rate\b|\bno hidden\b", r"\bupfront\b|\bup[- ]front\b|\bflat[- ]rate\b|\bhidden\b"),
    (r"\bon time\b|\bon schedule\b", r"\bon time\b|\bon schedule\b|\bon-time\b|\bpunctual"),
    (r"\byears?\b", r"\byears?\b|\bsince\b|\bestablished\b|\bfounded\b"),
]

NUMBER_WORDS = {"two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
                "eleven": 11, "twelve": 12, "fifteen": 15, "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50,
                "hundred": 100, "hundreds": 100, "thousand": 1000, "thousands": 1000, "dozen": 12, "dozens": 12}
# Capitalised words a sentence may open on, or use, that name nobody.
COMMON = set("""
a about after all also an and any are as ask at be because before bring call come count each every expect find for
from get give go have here how if in inside into it its just keep know learn let like look make many more most need
needs new no not now of on once one or our out over own plan reach ready request right run see send serve set since
so start still take talk tell than that the their them then there these they this those through to today up us want
we what when where whether which while who why will with without work year years you your yours
family local small big real full fair clear honest careful custom quality whole same first next last good great
proud home homes house yard business businesses owner owners people team crew job jobs project projects
open closed day days week weeks month months hour hours am pm handle handles make makes growth clients client
customers customer every each both most many some few only even always never often once twice again also
quick fast clean done best better simple easy safe sure true real right left top back front side inside outside
""".split())
# A word a sentence opens on in the shape of an ordinary English word
# ("Founded", "Serving", "Proudly") names nobody either.
PLAIN_SHAPE = re.compile(r"(?:ed|ing|ly|ies|ers|ness|ment|tion|sion|ful|less|able|ible|ive|ous|ance|ence)$")


def _corpus_has(word, hay):
    return bool(re.search(rf"(?<![a-z0-9]){re.escape(word)}(?![a-z0-9])", hay))


def supported(text, corpus):
    """The things a sentence states that the corpus never does: its numbers,
    phone numbers, years and prices, its capitalised names (people, towns,
    brands, licences, bodies), number words, and every claim word above
    (superlatives, guarantees, "free", 24/7, licensed, family owned...).
    Empty when everything it says of that kind is in the corpus. It cannot
    tell whether the sentence means what the corpus does; the model's check
    (write.py) is for that."""
    hay = normal(corpus)
    hay_digits = set(re.findall(r"\d+", re.sub(r"(?<=\d)[,.](?=\d{3}\b)", "", hay)))
    said = normal(text)
    out = []
    for number in re.findall(r"\d+", re.sub(r"(?<=\d)[,.](?=\d{3}\b)", "", said)):
        if number not in hay_digits and not (len(number) >= 7 and number in digits(hay)):
            out.append(number)
    for word, value in NUMBER_WORDS.items():
        if _corpus_has(word, said) and not _corpus_has(word, hay) and str(value) not in hay_digits:
            out.append(word)
    for said_pattern, own_pattern in CLAIMS:
        hit = re.search(said_pattern, said)
        if hit and not re.search(own_pattern or re.escape(hit.group(0)), hay):
            out.append(hit.group(0))
    # Capitalised words, read from the text as written. The word a sentence
    # opens on is capitalised for the sentence, so it only counts as a name
    # when it is not in the shape of an ordinary word.
    raw = unicodedata.normalize("NFKC", str(text or "")).translate(SAME)
    for match in re.finditer(r"[^\W\d_](?:[\w'&.-]*[^\W_])?", raw):
        bare = re.sub(r"'s$", "", match.group(0)).strip(".-'")
        if not bare or not bare[0].isupper() or bare.lower() in COMMON or bare == "I":
            continue
        # A time or a model number ("6AM-9PM", "A3") is said by its digits, which are checked above.
        parts = [p for p in re.split(r"[-&.']", bare.lower()) if p and not re.search(r"\d", p)]
        if not parts:
            continue
        opener = not raw[:match.start()].strip() or re.search(r"[.!?:;\"(]\s*$", raw[:match.start()])
        if opener and all(p in COMMON or PLAIN_SHAPE.search(p) for p in parts):
            continue
        if not all(_corpus_has(p, hay) or p in COMMON for p in parts):
            out.append(bare)
    return list(dict.fromkeys(out))


# What one kind of highlight must say in its own quote.
KIND_WORDS = {
    "family_owned": r"\bfamily",
    "bilingual": r"bilingual|spanish|espa[nñ]ol|habla|vietnam|chinese|mandarin|french|korean|hindi|urdu|arabic|tagalog",
    "emergency": r"24/7|24 hours|24-hour|emergenc|around the clock|day or night|after[- ]hours",
    "veteran_owned": r"veteran",
    "woman_owned": r"wom[ae]n|female",
    "minority_owned": r"minority|hispanic|black[- ]owned|latin",
    "founded": r"since|founded|established|est\.?|began|started|opened",
    "years_in_business": r"years?|decades?",
    "warranty": r"warrant|guarantee",
    "free_estimates": r"free|no[- ]cost|no[- ]obligation|complimentary",
    "financing": r"financ|payment plan|monthly payment",
    "licensed_insured": r"licens|insured|bonded",
    "same_day": r"same[- ]day",
    "residential_commercial": r"residential|commercial|industrial",
}
HIGHLIGHT_KINDS = list(KIND_WORDS) + ["other"]

ITEM = lambda **props: {"type": "object", "properties": {**props, "quote": {"type": "string"}, "url": {"type": "string"}},
                        "required": [*props, "quote", "url"]}
STR = {"type": "string"}
SCHEMA = {
    "type": "object",
    "properties": {
        "services": {"type": "array", "items": ITEM(title=STR, description=STR)},
        "highlights": {"type": "array", "items": ITEM(kind={"type": "string", "enum": HIGHLIGHT_KINDS}, text=STR,
                                                      number={"type": "integer"})},
        "phones": {"type": "array", "items": ITEM(number=STR, label=STR)},
        "languages": {"type": "array", "items": ITEM(language=STR)},
        "testimonials": {"type": "array", "items": {"type": "object", "properties": {"author": STR, "text": STR, "url": STR},
                                                    "required": ["author", "text", "url"]}},
        "credentials": {"type": "array", "items": ITEM(kind={"type": "string", "enum": [
            "license", "certification", "membership", "carrier", "bar", "accreditation", "award", "other"]}, label=STR, detail=STR)},
        "people": {"type": "array", "items": ITEM(name=STR, role=STR, bio=STR, owner={"type": "boolean"})},
        "industries": {"type": "array", "items": ITEM(name=STR)},
        "states": {"type": "array", "items": ITEM(name=STR)},
        "towns": {"type": "array", "items": ITEM(name=STR)},
        "steps": {"type": "array", "items": ITEM(title=STR, text=STR)},
        "story": {"type": "array", "items": ITEM(text=STR)},
        "home_leads_with": {"type": "array", "items": {"type": "object", "properties": {"text": STR, "quote": STR},
                                                       "required": ["text", "quote"]}},
        "tone": {"type": "object", "properties": {"value": {"type": "string", "enum": ["bold", "classic"]}, "why": STR},
                 "required": ["value", "why"]},
    },
    "required": ["services", "highlights", "phones", "languages", "testimonials", "credentials", "people", "industries",
                 "states", "towns", "steps", "story", "home_leads_with", "tone"],
}

PROMPT = """You are reading a small local business's own website to make a fact sheet. A new website will be written \
for them from this sheet alone, so it must hold everything a customer would want to know, and nothing their pages do \
not say. Their pages follow, each starting with a line "PAGE <url>" (lines starting # are headings, - are list items). \
Use no outside knowledge, infer nothing, round nothing up.

Every item needs `quote`: the exact words on that page that state it, copied character for character as one \
unbroken run of the page's text (usually 5 to 40 words; never stitch words from different places together), and \
`url`: the PAGE url it is on. An item you cannot quote this way, leave out. A theme's leftover demo text, another \
company's name or a stock testimonial that is clearly not about this business is not a fact about them.

- services: each service or line of work they sell, the main ones first, up to 12. title: as their site names it, \
in Title Case. description: their own sentence or sentences describing that service, copied exactly; "" if their \
site only names it.
- highlights: what sets them apart, as they state it: family owned, bilingual, 24/7 or emergency service, veteran, \
woman or minority owned, the year they were founded (number = the year), years in business (number = the years), \
warranties or guarantees, free estimates, financing, licensed and insured, same-day service, residential and \
commercial, and anything else they lead with (kind "other"). text: a few plain words that say it ("Family owned", \
"Free estimates", "Founded in 2010"). number: 0 unless the kind is founded or years_in_business.
- phones: every phone number they give customers, with the label their site gives it (English, Español, Office, \
Emergency, Sales, Service, Mobile...) or "". Never a fax number.
- languages: the languages they say they serve customers in (including English only when they say so beside another).
- testimonials: reviews or testimonials from customers shown on their own pages: author as shown ("" if none), \
text copied exactly and in full. Only ones about this business.
- credentials: licence numbers, certifications, memberships, insurance carriers they represent, bar admissions, \
accreditations, manufacturer certifications, awards. label: the body or name as written ("TDLR", "State Bar of \
Texas", "GAF"); detail: the number or one short line in their words ("License No. 12345", "Master Elite \
Contractor") or "".
- people: owners, founders, partners, doctors, attorneys and named staff: name, role as stated ("" if none), bio: \
their own sentences about that person copied exactly ("" if none), owner: true for an owner, founder or principal.
- industries: industries or kinds of client they say they work for (refineries, municipalities, homeowners...).
- states: states they say they work in.
- towns: towns, cities or areas they say they serve.
- steps: how working with them goes, only where a page describes their process as steps; title and text in their words.
- story: up to 8 facts about their history, origin, people, approach, values or what makes them different, each a \
short plain statement in text. These are what a writer builds their headline from, so take the specific ones \
(who started it, when, with what, why, what they insist on) over slogans.
- home_leads_with: what the home page puts first, in order: its first headline and first claims, up to 5. text: a \
few words; quote from the home page.
- tone: "classic" when the site presents itself as traditional and formal (an established firm, serif type, quiet \
colors), "bold" when it is loud, modern or direct. why: a few words.

The business, from its Google listing (for context; quote only their pages):
{listing}

{pages}
"""


def listing_lines(prospect):
    rating = compose.listing_rating(prospect)
    out = [f"Name: {compose.plain(prospect.get('name'))}", f"Trade: {prospect.get('trade')}",
           f"Address: {compose.plain(prospect.get('address'))}", f"Phone: {compose.plain(prospect.get('phone'))}",
           f"Website: {prospect.get('website')}"]
    if rating[0]:
        out.append(f"Google rating: {rating[0]} from {rating[1]} reviews")
    return out


def page_texts(pages, business=None):
    """{url: the page's words as a customer reads them}, the home page first:
    what the sheet is read from and proved against."""
    out = {}
    for page in pages:
        lines = list(getattr(page, "lines", None) or [t for _, t, _ in page.blocks])
        head = [f"Title: {page.title}"] if page.title else []
        for key in ("description", "og:description"):
            if page.meta.get(key):
                head.append(f"Description: {compose.plain(page.meta[key])}")
                break
        out.setdefault(page.url, "\n".join(head + lines))
    if business:
        out[f"{pages[0].url}#structured-data"] = json.dumps(business, ensure_ascii=False)[:6000]
    return out


def _material(texts):
    out, used = [], 0
    for url, text in texts.items():
        room = min(PAGE_CHARS, ALL_CHARS - used)
        if room < 500:
            break
        part = text[:room]
        used += len(part)
        out.append(f"PAGE {url}\n{part}")
    return "\n\n".join(out)


def _page_of(item, texts):
    """The text of the page an item names, matched loosely (a trailing slash,
    the www, the scheme), else None."""
    url = str(item.get("url") or "")
    if url in texts:
        return url
    key = lambda u: urllib.parse.urlparse(u).netloc.replace("www.", "") + urllib.parse.urlparse(u).path.rstrip("/") + \
        ("#" + urllib.parse.urlparse(u).fragment if urllib.parse.urlparse(u).fragment else "")
    return next((u for u in texts if key(u) == key(url)), None)


def _locate(item, texts, quote):
    """The page the quote is on: the one the item names, or failing that any
    page of theirs that carries it (a footer is on every page)."""
    named = _page_of(item, texts)
    if named and found_in(quote, texts[named]):
        return named
    return next((u for u, t in texts.items() if found_in(quote, t)), None)


# The groups whose words can set a business somewhere: a site written for
# another place, or a theme's demo copy, says so in them.
PLACED = {"highlights", "credentials", "industries", "states", "towns", "steps", "story", "home_leads_with"}


def verify(raw, texts, prospect, towns=()):
    """The sheet with only what is proved, each item with an id; and what was
    dropped, each with why. An item whose words set the business in another
    state than its Google listing's, and never in its own town or state
    ("a local roofing company out of Kansas City, MO" for a roofer in Crosby,
    TX), is dropped: their site was written for somewhere else."""
    kept, dropped = {}, []
    listing = " ".join(listing_lines(prospect))
    _, town, state, _ = compose.address_parts(prospect)

    def drop(group, item, why):
        dropped.append(f"{group}: {str(item.get('title') or item.get('text') or item.get('name') or item.get('label') or item.get('number') or '')[:60]!r} ({why})")

    def place(group, item, quote_key="quote"):
        quote = str(item.get(quote_key) or "").strip()
        if len(normal(quote)) < 3:
            drop(group, item, "no quote")
            return None
        url = _locate(item, texts, quote)
        if not url:
            drop(group, item, "its quote is not on their pages")
            return None
        item["url"] = url
        return url

    prefix = {"services": "s", "highlights": "h", "phones": "p", "languages": "l", "testimonials": "t",
              "credentials": "c", "people": "o", "industries": "i", "states": "st", "towns": "tw", "steps": "k",
              "story": "y", "home_leads_with": "f"}
    for group, letter in prefix.items():
        kept[group] = []
        for item in raw.get(group) or []:
            if not isinstance(item, dict):
                continue
            item = {k: (compose.plain(v) if isinstance(v, str) else v) for k, v in item.items()}
            if group == "testimonials":
                item["quote"] = item.get("text", "")
            if group == "home_leads_with":
                item["url"] = next(iter(texts), "")
            url = place(group, item)
            if not url:
                continue
            quote, page = item["quote"], texts[url]
            ok, why = True, ""
            said = " ".join(str(item.get(k) or "") for k in ("quote", "text", "name", "label", "detail"))
            if group in PLACED and compose.placed_elsewhere(said, town, state, towns):
                drop(group, item, f"it sets them outside {state}, where their listing is")
                continue
            if group == "services":
                title = item.get("title", "")
                if not title or supported(title, quote + " " + page):
                    ok, why = False, "its title is not their words"
                elif item.get("description") and not found_in(item["description"], page):
                    item["description"] = ""
                    dropped.append(f"services: {title!r} description (not word for word on the page)")
            elif group == "highlights":
                kind = item.get("kind")
                pattern = KIND_WORDS.get(kind)
                if pattern and not re.search(pattern, normal(quote)):
                    ok, why = False, f"its quote does not say {kind}"
                elif supported(item.get("text", ""), quote):
                    ok, why = False, f"its words say more than its quote: {supported(item.get('text', ''), quote)}"
                elif kind in ("founded", "years_in_business") and (not item.get("number") or str(item["number"]) not in digits(quote) and
                                                                  str(item["number"]) not in re.findall(r"\d+", quote)):
                    ok, why = False, "its number is not in its quote"
            elif group == "phones":
                number = digits(item.get("number"))[-10:]
                if len(number) != 10 or number not in digits(quote):
                    ok, why = False, "the number is not in its quote"
                elif re.search(r"\bfax\b", normal(quote)) and not re.search(r"\b(?:phone|call|tel|office)\b", normal(quote)):
                    ok, why = False, "a fax number"
                else:
                    item["number"] = f"({number[:3]}) {number[3:6]}-{number[6:]}"
                    label = item.get("label", "")
                    if label and not _corpus_has(normal(label), normal(quote)) and \
                            not (re.match(r"espa", normal(label)) and re.search(r"espa[nñ]ol|spanish", normal(quote))):
                        item["label"] = ""
            elif group == "languages":
                language = normal(item.get("language", ""))
                said = normal(quote)
                if not language or not (_corpus_has(language, said) or language == "spanish" and re.search(r"espa[nñ]ol|habla", said)
                                        or language == "english" and re.search(r"english|ingl[eé]s", said)):
                    ok, why = False, "its quote does not name the language"
            elif group == "testimonials":
                author = item.get("author", "")
                if len(normal(item.get("text"))) < 20:
                    ok, why = False, "too short to be a testimonial"
                elif author and not found_in(author, page):
                    item["author"] = ""
            elif group == "credentials":
                said = (item.get("label", "") + " " + item.get("detail", "")).strip()
                # The body or name is drawn as written, so it must be on the page as written.
                if not item.get("label") or not found_in(item["label"], page):
                    ok, why = False, "its name is not on the page as written"
                elif supported(said, quote):
                    ok, why = False, f"says more than its quote: {supported(said, quote)}"
            elif group == "people":
                name = item.get("name", "")
                if not name or not found_in(name, page):
                    ok, why = False, "the name is not on the page"
                else:
                    if item.get("role") and supported(item["role"], quote + " " + page):
                        item["role"] = ""
                    if item.get("bio") and not found_in(item["bio"], page):
                        item["bio"] = ""
                        dropped.append(f"people: {name!r} bio (not word for word on the page)")
            elif group in ("industries", "states", "towns"):
                if not item.get("name") or supported(item["name"], quote) or not found_in(item["name"].split(",")[0], quote):
                    ok, why = False, "its quote does not name it"
            elif group == "steps":
                if not item.get("title") or supported(f"{item.get('title')} {item.get('text', '')}", quote + " " + page):
                    ok, why = False, "says more than its page"
            elif group in ("story", "home_leads_with"):
                if not item.get("text") or supported(item["text"], quote + " " + listing):
                    ok, why = False, f"says more than its quote: {supported(item.get('text', ''), quote + ' ' + listing)}"
            if not ok:
                drop(group, item, why)
                continue
            item["id"] = f"{letter}{len(kept[group]) + 1}"
            kept[group].append(item)
    tone = raw.get("tone") if isinstance(raw.get("tone"), dict) else {}
    kept["tone"] = {"value": tone.get("value") if tone.get("value") in ("bold", "classic") else "bold", "why": str(tone.get("why", ""))[:80]}
    # One phone number is listed once, under the first label it has.
    seen, phones = set(), []
    for p in kept["phones"]:
        if p["number"] not in seen:
            seen.add(p["number"])
            phones.append(p)
    kept["phones"] = phones
    return kept, dropped


def sheet(prospect, pages, business, notes, towns=()):
    """The proved fact sheet of one business, with `pages` ({url: text}) and
    `dropped` beside it; None when the model could not be asked."""
    texts = page_texts(pages, business)
    prompt = PROMPT.replace("{listing}", "\n".join(listing_lines(prospect))).replace("{pages}", _material(texts))
    raw = ask(prompt, SCHEMA)
    if raw is None:
        notes.append(f"no fact sheet: {last_error}")
        return None
    kept, dropped = verify(raw, texts, prospect, towns)
    elsewhere = [d for d in dropped if "where their listing is" in d]
    kept["elsewhere"] = len(elsewhere)
    if len(elsewhere) >= 3:
        notes.append(f"{len(elsewhere)} things on their site set them outside their listing's state; their site may be "
                     "a theme's copy or written for another place")
    total = sum(len(raw.get(k) or []) for k in kept if k not in ("tone", "elsewhere"))
    kept["read"] = total
    count = sum(len(v) for k, v in kept.items() if isinstance(v, list))
    if dropped:
        notes.append(f"the fact sheet kept {count} of {total} items; it dropped " + "; ".join(dropped[:12])
                     + (f" and {len(dropped) - 12} more" if len(dropped) > 12 else ""))
    kept["dropped"] = dropped
    kept["pages"] = texts
    return kept


def items(fact_sheet):
    """Every fact as (id, group, item)."""
    for group, values in (fact_sheet or {}).items():
        if isinstance(values, list):
            for item in values:
                if isinstance(item, dict) and item.get("id"):
                    yield item["id"], group, item


def said_by(item):
    """A fact's own words, all of them: what it states and the quote that proves it."""
    keys = ("title", "description", "text", "number", "label", "detail", "name", "role", "bio", "language", "author", "quote")
    return " ".join(str(item[k]) for k in keys if item.get(k) not in (None, "", 0))


def corpus(fact_sheet, prospect, extra=()):
    """Everything the facts and the listing say, as one text to look in."""
    state = compose.address_parts(prospect)[2]
    out = listing_lines(prospect) + [compose.STATES.get(state or "", "")]
    out += [said_by(item) for _, _, item in items(fact_sheet)]
    return "\n".join(out + list(extra))


# --- Google reviews -------------------------------------------------------------------------------

PLACES = "https://places.googleapis.com/v1/places/{}"
REVIEWS_SHOWN = 3


def author_of(name):
    """"Maria Gonzalez" as "Maria G.", one name as itself."""
    words = [w for w in re.split(r"\s+", compose.plain(name)) if w]
    if not words:
        return ""
    first = words[0][:1].upper() + words[0][1:]
    if len(words) == 1:
        return first
    last = next((w for w in reversed(words[1:]) if w[:1].isalpha()), "")
    return f"{first} {last[:1].upper()}." if last else first


def review_text(review):
    """A review's words as its author wrote them, never a translation."""
    for key in ("originalText", "text"):
        value = review.get(key)
        if isinstance(value, dict) and str(value.get("text") or "").strip():
            return value["text"].strip()
    return ""


def google_reviews(prospect, notes):
    """Up to three recent four- and five-star Google reviews, quoted as written
    with the author as first name and last initial, and the raw answer they
    came from, which the checks prove every quote against. Nothing without
    PLACES_API_KEY or a place_id."""
    key = os.environ.get("PLACES_API_KEY")
    place = prospect.get("place_id")
    if not key or not place or os.environ.get("PREVIEW_REVIEWS", "on") == "off":
        return [], None
    request = urllib.request.Request(PLACES.format(urllib.parse.quote(place)), headers={
        "X-Goog-Api-Key": key, "X-Goog-FieldMask": "id,rating,userRatingCount,reviews"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            raw = json.loads(response.read().decode())
    except (urllib.error.URLError, ValueError, OSError) as error:
        notes.append(f"the Google reviews were not read: {str(error)[:120]}")
        return [], None
    listed = compose.listing_rating(prospect)
    if listed[0] and raw.get("rating") and (abs(float(raw["rating"]) - float(listed[0])) > 0.2 or
                                            abs(int(raw.get("userRatingCount") or 0) - int(listed[1])) > max(5, listed[1] * 0.25)):
        notes.append(f"Google now says {raw.get('rating')} from {raw.get('userRatingCount')} reviews; the listing stored "
                     f"{listed[0]} from {listed[1]}")
    picked = []
    for review in sorted(raw.get("reviews") or [], key=lambda r: r.get("publishTime") or "", reverse=True):
        text = review_text(review)
        author = author_of((review.get("authorAttribution") or {}).get("displayName"))
        if int(review.get("rating") or 0) < 4 or len(text) < 40 or not author:
            continue
        picked.append({"author": author, "text": text, "source": "Google", "rating": int(review["rating"]),
                       "_long": len(text) > 480})
    # The shorter ones read whole on a home page; a long one only where too few are short.
    picked.sort(key=lambda r: r["_long"])
    out = [{k: v for k, v in r.items() if k != "_long"} for r in picked[:REVIEWS_SHOWN]]
    return out, raw


def review_proved(review, evidence):
    """True when a quoted review is word for word in what it says it came
    from: the Places answer for Google, their own pages for their site."""
    text = review.get("text") or ""
    if review.get("source") == "Google":
        for raw in (evidence.get("places") or {}).get("reviews") or []:
            if normal(review_text(raw)) == normal(text) and author_of((raw.get("authorAttribution") or {}).get("displayName")) == review.get("author"):
                return True
        return False
    pages = evidence.get("pages") or {}
    return any(found_in(text, t) for t in pages.values()) and \
        (not review.get("author") or any(found_in(review["author"], t) for t in pages.values()))
