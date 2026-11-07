"""A preview's copy written from its checked fact sheet, and proved sentence by sentence.

    write(prospect, family, kind, sheet, services, own, notes) -> copy, or None

One `claude -p` call writes the hero, the services' summary line, blurbs for
the services their site leaves undescribed or describes poorly, the about
section, highlights and, where their site describes one, the steps of their
process, in the voice voice.md gives the template's family. Each sentence
comes back with the ids of the facts it relies on.

A sentence survives only when both of these pass:

  (a) facts.supported: every number, year, phone, price, capitalised name
      (person, town, brand, licence, body), number word and claim word
      (superlatives, guarantees, "free", 24/7, licensed, family owned) in it
      is in the fact sheet or the listing; and it is free of filler.
  (b) a second call, shown only the facts, the listing and the copy, finds
      every claim in it supported.

A sentence that fails either is rewritten once, in one more call, with its
problems named, and checked again the same way; one that fails again is
dropped. So the usual business costs two calls here (one to write, one to
check) and the worst four. A part of the page left without a sentence falls
back to the business's own words, as the builder made it before; writing that
fails outright returns None and the build goes on with their own words, so the
writer never parks a business by itself.

The copy returned carries `lines`: every surviving sentence with where it is
drawn, the fact ids it cites and the words it was checked against, which the
build keeps as evidence and check.py proves again.
"""

import json
import os
import re

from . import compose, facts

MODEL = os.environ.get("PREVIEW_WRITE_MODEL") or facts.MODEL
CHECK_MODEL = os.environ.get("PREVIEW_CHECK_MODEL") or facts.MODEL
VOICE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "voice.md")

last_error = None

STR = {"type": "string"}
LINE = {"type": "object", "properties": {"text": STR, "facts": {"type": "array", "items": STR}}, "required": ["text", "facts"]}
LINES = {"type": "array", "items": LINE}
ICONS = ["family", "language", "clock", "calendar", "shield", "award", "badge", "wrench", "leaf", "home", "building",
         "truck", "phone", "dollar", "star", "heart", "users", "map", "check", "hammer", "tooth", "scale", "calculator",
         "spark", "anchor", "gauge"]
SCHEMA = {
    "type": "object",
    "properties": {
        "hero": {"type": "object", "properties": {"title": LINE, "titleAccent": LINE, "lead": LINES},
                 "required": ["title", "titleAccent", "lead"]},
        "summary": LINE,
        "blurbs": {"type": "array", "items": {"type": "object", "properties": {"service": STR, "short": LINE, "text": LINES},
                                              "required": ["service", "short", "text"]}},
        "about": {"type": "object", "properties": {"title": LINE, "paragraphs": {"type": "array", "items": LINES}},
                  "required": ["title", "paragraphs"]},
        "highlights": {"type": "array", "items": {"type": "object", "properties": {
            "title": LINE, "text": LINE, "icon": {"type": "string", "enum": ICONS}}, "required": ["title", "text", "icon"]}},
        "steps": {"type": "array", "items": {"type": "object", "properties": {"title": LINE, "text": LINE},
                                             "required": ["title", "text"]}},
    },
    "required": ["hero", "summary", "blurbs", "about", "highlights", "steps"],
}

# A coupon, a discount or a monthly price ("$100 off your first job",
# "Recurring pest control from $39 per month").
OFFER = re.compile(r"\$\s?\d[\d,]*\s*off\b|\d+\s?%\s*off\b|\bcoupons?\b|\bsave \$|\bdiscount|\bper month\b|/\s?mo\b|"
                   r"\bstarting at \$|\bfrom \$\d|\bonly \$\d", re.I)

# Words a good copywriter cuts.
FILLER = re.compile(
    r"\blook no further\b|\bone[- ]stop\b|\bpride ourselves\b|\btake pride\b|\byour satisfaction\b|\bquality service\b|"
    r"\bdedicated team\b|\bsecond to none\b|\btrusted\b|\bstate[- ]of[- ]the[- ]art\b|\bcutting[- ]edge\b|\bsolutions?\b|"
    r"\belevate\b|\bseamless(?:ly)?\b|\bnestled\b|\bboasts?\b|\bpeace of mind\b|\b(?:all )?your \w+ needs\b|"
    r"\bunparalleled\b|\bworld[- ]class\b|\bgo the extra mile\b|\babove and beyond\b|\btop[- ]notch\b", re.I)

# What each family's template draws, said to the writer.
FIELDS = {
    "hvac": "hero (title, titleAccent, lead), summary, service blurbs, about, highlights, steps",
    "roofing": "hero (title, titleAccent, lead), service blurbs, about, highlights, steps; leave summary empty",
    "professional": "hero (title, lead; leave titleAccent empty), service blurbs, about, highlights, steps; leave summary empty",
}
FAMILY = {
    "hvac": "hvac (home service)", "outdoor": "outdoor", "industrial": "industrial", "roofing": "roofing",
    "professional": "professional", "health": "health",
}


def _voice():
    try:
        with open(VOICE) as handle:
            return handle.read()
    except OSError:
        return ""


def _fact_block(sheet, listing_ids):
    out = [f"[{i}] listing: {text}" for i, text in listing_ids]
    for fid, group, item in facts.items(sheet):
        if group == "home_leads_with":
            out.append(f"[{fid}] the home page leads with: {item['text']} | quote: \"{item['quote']}\"")
            continue
        what = {k: item[k] for k in ("title", "description", "kind", "text", "number", "label", "detail", "name", "role",
                                     "bio", "owner", "language", "author") if item.get(k) not in (None, "", 0, False)}
        out.append(f"[{fid}] {group}: {json.dumps(what, ensure_ascii=False)} | quote: \"{item.get('quote', '')[:400]}\"")
    tone = (sheet or {}).get("tone") or {}
    if tone:
        out.append(f"(their site's tone reads as {tone.get('value')}: {tone.get('why')})")
    return "\n".join(out)


def _listing_ids(prospect, town, state):
    out = [("L1", f"name {compose.plain(prospect['name'])}"), ("L2", f"town {town}, {compose.STATES.get(state, state)}"),
           ("L3", f"phone {compose.plain(prospect.get('phone'))}"), ("L4", f"trade {prospect.get('trade')}")]
    rating, count = compose.listing_rating(prospect)
    if rating:
        out.append(("L5", f"Google rating {rating} from {count} reviews"))
    return out


PROMPT = """{voice}

---

The business: {name} ({trade}), {town}, {state}. Template family: {family}{kind}.
Write: {fields}.
Where the headline has a titleAccent, the two read as one line: title first, then titleAccent, which is never
repeated inside title.

The facts, each with its id. These and the listing are everything known about them; cite the ids every sentence
relies on in its `facts` (a sentence relying on nothing but the listing cites L ids):
{facts}

The services the page shows, by their own names, with their own description where their site gives one:
{services}
Write a blurb (`text`: one or two sentences; `short`: a phrase of at most 6 words for a menu) for each service
marked NEEDS A BLURB, and for any other whose own description is cut off, a fragment, filler, or says nothing
about the work; leave the rest out of `blurbs`. `service` is the service's name exactly as listed.

They are where their Google listing says ({town}, {state}). Words of their pages that set them anywhere else were
written for another business or place; never repeat them.
Highlights come only from highlight, credential, language, people and story facts, never a service restated,
a phone number or a way to book; fewer than two such facts and `highlights` is empty.

Every `text` is one sentence (a headline or a short title is one line). An empty text means "nothing to say here":
steps empty unless the facts include their process, highlights only from facts, an about paragraph only from facts.
"""


def _services_facts(services):
    """The services the page shows, as facts: their names are on their pages
    (the builder read them there), and so are the words beside them."""
    out = ["The services the page shows, by their own names (each is on their site):"]
    for i, s in enumerate(services, 1):
        own = compose.plain(s.get("text") or "")
        out.append(f"[S{i}] service: {s['title']}" + (f" | their words: \"{own[:400]}\"" if own else ""))
    return "\n".join(out)


def _services_block(services):
    out = []
    for s in services:
        own = compose.plain(s.get("text") or "")
        out.append(f"- {s['title']}: " + (f"\"{own[:400]}\"" if own else "NEEDS A BLURB (their site only names it)"))
    return "\n".join(out)


def _flatten(answer):
    """Every line of the answer as (path, line), in reading order."""
    out = []
    hero = answer.get("hero") or {}
    out.append(("hero.title", hero.get("title")))
    out.append(("hero.titleAccent", hero.get("titleAccent")))
    for i, line in enumerate(hero.get("lead") or []):
        out.append((f"hero.lead.{i}", line))
    out.append(("summary", answer.get("summary")))
    for i, blurb in enumerate(answer.get("blurbs") or []):
        out.append((f"blurbs.{i}.short", blurb.get("short")))
        for j, line in enumerate(blurb.get("text") or []):
            out.append((f"blurbs.{i}.text.{j}", line))
    about = answer.get("about") or {}
    out.append(("about.title", about.get("title")))
    for p, paragraph in enumerate(about.get("paragraphs") or []):
        for j, line in enumerate(paragraph or []):
            out.append((f"about.paragraphs.{p}.{j}", line))
    for i, item in enumerate(answer.get("highlights") or []):
        out.append((f"highlights.{i}.title", item.get("title")))
        out.append((f"highlights.{i}.text", item.get("text")))
    for i, item in enumerate(answer.get("steps") or []):
        out.append((f"steps.{i}.title", item.get("title")))
        out.append((f"steps.{i}.text", item.get("text")))
    lines = []
    for path, line in out:
        if isinstance(line, dict) and compose.plain(line.get("text")):
            lines.append({"path": path, "text": compose.plain(line["text"]), "facts": [str(f) for f in line.get("facts") or []]})
    return lines


ROLE = {"hero.title": "headline", "hero.titleAccent": "end of the headline", "hero.lead": "lead under the headline",
        "summary": "line under the services heading", "blurbs": "service blurb", "about.title": "about heading",
        "about.paragraphs": "about paragraph sentence", "highlights": "highlight", "steps": "process step"}


def _role(path):
    return next((v for k, v in ROLE.items() if path.startswith(k)), path)


# A headline that bids the reader to act ("Schedule your appointment
# online") is a button's words, not a benefit or their story.
BIDDING = re.compile(r"^(?:schedule|call|contact|book|request|get|order|visit|click|reach|ask|find|choose|let us|start)\b", re.I)


def problems_of(line, corpus, town, services, state=None, towns=()):
    """What the arithmetic finds wrong with one line: (a) above, a line that
    sets them in another state than their listing's, and a headline that is
    a keyword string or a call to action."""
    out = []
    if compose.placed_elsewhere(line["text"], town, state, towns):
        out.append(f"sets them outside {state}, where their Google listing is")
    missing = facts.supported(line["text"], corpus)
    if missing:
        out.append("says what the facts do not: " + ", ".join(missing[:6]))
    filler = FILLER.search(line["text"])
    if filler:
        out.append(f"filler: {filler.group(0)!r}")
    if "!" in line["text"]:
        out.append("an exclamation mark")
    if line["path"] in ("hero.title", "hero.titleAccent"):
        named = sum(1 for s in services if s["title"].lower() in line["text"].lower())
        if named >= 2 or (named and town and re.search(rf"\bin {re.escape(town)}\b", line["text"], re.I)):
            out.append("a headline of service names and the town, not a benefit or their story")
        if line["path"] == "hero.title" and BIDDING.match(line["text"]):
            out.append("a headline that tells the reader to act, not a benefit or their story")
    return out


CHECK_SCHEMA = {
    "type": "object",
    "properties": {"lines": {"type": "array", "items": {"type": "object", "properties": {
        "id": STR, "supported": {"type": "boolean"}, "problems": {"type": "array", "items": STR}},
        "required": ["id", "supported", "problems"]}}},
    "required": ["lines"],
}

CHECK_PROMPT = """You check website copy written for a small business against the only facts known about it. You \
have not seen the business; the facts and the listing below are all that is true. For each line, decide whether \
everything it states or implies is stated by the facts or the listing. A plain restatement, a fair summary, or a \
benefit that follows directly from a stated fact ("someone answers in Spanish" from "bilingual staff") is \
supported. Mark supported=false when the line states or implies anything else: a number, year, duration, price, \
guarantee, warranty, licence, certification, award, ranking or superlative; a service, product, brand, place, \
person, credential or kind of client not in the facts; a promise about speed, price, timing or results; a \
quality of the business ("experienced", "fast", "affordable") no fact gives; a place for them other than the \
listing's town and state (their listing is where they are); or a review's opinion stated as fact. \
problems: name each unsupported claim in a few words; empty when supported. Answer for every line by its id.

Facts and listing:
{facts}

Lines to check:
{lines}
"""

REWRITE_SCHEMA = {
    "type": "object",
    "properties": {"lines": {"type": "array", "items": {"type": "object", "properties": {
        "id": STR, "text": STR, "facts": {"type": "array", "items": STR}}, "required": ["id", "text", "facts"]}}},
    "required": ["lines"],
}

REWRITE_PROMPT = """{voice}

---

These lines of copy for {name} ({trade}, {town}) failed the fact check for the reasons given. Rewrite each once so \
it says only what the facts state, keeping its role, its length and its voice, and cite the fact ids it relies \
on. Where nothing true can be said in its place, return text "". Answer for every id.

Facts and listing:
{facts}

Lines:
{lines}
"""


def _check(lines, block, notes):
    """{id: [problems]} from the second model's reading; None when it could not be asked."""
    if not lines:
        return {}
    listed = "\n".join(f"[{l['id']}] ({_role(l['path'])}) {l['text']}  (cites: {', '.join(l['facts']) or 'nothing'})" for l in lines)
    answer = facts.ask(CHECK_PROMPT.replace("{facts}", block).replace("{lines}", listed), CHECK_SCHEMA, model=CHECK_MODEL)
    if answer is None:
        notes.append(f"the copy's fact check could not be asked: {facts.last_error}")
        return None
    verdicts = {str(v.get("id")): v for v in answer.get("lines") or [] if isinstance(v, dict)}
    out = {}
    for line in lines:
        verdict = verdicts.get(line["id"])
        if verdict is None:
            out[line["id"]] = ["the check gave no verdict for it"]
        elif not verdict.get("supported"):
            out[line["id"]] = [str(p)[:160] for p in verdict.get("problems") or []] or ["not supported by the facts"]
    return out


def write(prospect, family, kind, sheet, services, notes, town=None, state=None, own=None, towns=()):
    """The written copy for one business, proved; None when it could not be written."""
    global last_error
    if not sheet or not facts.available():
        return None
    short = compose.short_name(compose.plain(prospect["name"]))
    shape = compose.SHAPE.get(family, family)
    listing_ids = _listing_ids(prospect, town, state)
    # Their own about paragraphs and description, where they are word for
    # word on their pages, are facts too: the story a headline is made from.
    pages = sheet.get("pages") or {}
    extra = []
    for i, paragraph in enumerate((own or {}).get("about") or [], 1):
        if any(facts.found_in(paragraph, t) for t in pages.values()):
            extra.append({"id": f"a{i}", "text": paragraph, "quote": paragraph})
    if (own or {}).get("lead") and any(facts.found_in(own["lead"], t) for t in pages.values()):
        extra.append({"id": "d1", "text": own["lead"], "quote": own["lead"]})
    sheet = dict(sheet, own_words=extra)
    block = _fact_block(sheet, listing_ids) + "\n" + _services_facts(services)
    corpus = facts.corpus(sheet, prospect, [t for _, t in listing_ids] + [s["title"] + " " + (s.get("text") or "") for s in services])
    voice = _voice()
    prompt = PROMPT.format(voice=voice, name=compose.plain(prospect["name"]), trade=prospect.get("trade"), town=town,
                           state=state, family=FAMILY.get(family, family), kind=f", kind {kind}" if kind else "",
                           fields=FIELDS[shape], facts=block, services=_services_block(services))
    answer = facts.ask(prompt, SCHEMA, model=MODEL)
    if answer is None:
        last_error = facts.last_error
        notes.append(f"the copy was not written, so it is their own words: {facts.last_error}")
        return None
    lines = _flatten(answer)
    if shape != "hvac":
        lines = [l for l in lines if l["path"] != "summary"]
    if shape == "professional":
        lines = [l for l in lines if l["path"] != "hero.titleAccent"]
    for i, line in enumerate(lines, 1):
        line["id"] = f"w{i}"
    known = {fid for fid, _, _ in facts.items(sheet)} | {i for i, _ in listing_ids} | {f"S{i}" for i in range(1, len(services) + 1)}

    def prove(batch):
        """{id: problems} for the lines that fail (a) or (b); None when (b) could not be asked."""
        found = {}
        for line in batch:
            line["facts"] = [f for f in line["facts"] if f in known]
            why = problems_of(line, corpus, town, services, state, towns)
            if why:
                found[line["id"]] = why
        read = _check(batch, block, notes)
        if read is None:
            return None
        for key, why in read.items():
            found.setdefault(key, []).extend(why)
        return found

    failed = prove(lines)
    if failed is None:
        # Copy that could not be checked is not used.
        return None
    dropped = []
    if failed:
        listed = "\n".join(f"[{l['id']}] ({_role(l['path'])}) {l['text']}\n    problems: {'; '.join(failed[l['id']])}"
                           for l in lines if l["id"] in failed)
        again = facts.ask(REWRITE_PROMPT.format(voice=voice, name=compose.plain(prospect["name"]), trade=prospect.get("trade"),
                                                town=town, facts=block, lines=listed), REWRITE_SCHEMA, model=MODEL)
        redone = {str(r.get("id")): r for r in (again or {}).get("lines") or [] if isinstance(r, dict)}
        fresh = []
        for line in lines:
            if line["id"] not in failed:
                continue
            new = redone.get(line["id"])
            text = compose.plain((new or {}).get("text"))
            if not text:
                dropped.append({**line, "problems": failed[line["id"]]})
                line["text"] = ""
                continue
            line.update(text=text, facts=[str(f) for f in new.get("facts") or []], rewritten=True)
            fresh.append(line)
        still = prove(fresh) if fresh else {}
        if still is None:
            still = {line["id"]: ["the rewrite could not be checked"] for line in fresh}
        for line in fresh:
            if line["id"] in still:
                dropped.append({**line, "problems": still[line["id"]]})
                line["text"] = ""
    kept = [l for l in lines if l["text"]]
    if dropped:
        notes.append(f"the writer dropped {len(dropped)} of {len(lines)} lines: "
                     + "; ".join(f"{d['text'][:60]!r} ({'; '.join(d['problems'])[:90]})" for d in dropped[:6]))
    for line in kept:
        cited = [item for fid, _, item in facts.items(sheet) if fid in line["facts"]]
        line["against"] = " ".join(facts.said_by(item) for item in cited)
    return _assemble(kept, answer, short, town, sheet, dropped, corpus)


# One that opens on whom it speaks of ("We're...", "Our...", "You...") or on
# how they work ("Built on trust...", "Serving..."), runs three words or more
# and has its own full stop is a sentence, not the end of the title's. One
# that opens on a name or a service ("Houston has relied on for decades.",
# "Roof Replacement in Houston.") goes on from the title.
STARTS_A_SENTENCE = re.compile(
    r"^(?:We|We['’](?:re|ve|ll)|Our|Us|You|You['’](?:re|ll)|Your|It|It['’]s|They|They['’]re|Their|There|This|That|"
    r"Built|Serving|Trusted|Proudly|Family|Locally)\b\S*(?:\s+\S+){2,}[.!?]$")


def _assemble(kept, answer, short, town, sheet, dropped, corpus):
    by = {l["path"]: l for l in kept}
    text = lambda path: by[path]["text"] if path in by else ""
    copy = {"lines": kept, "dropped": dropped, "corpus": corpus}
    title, accent = text("hero.title"), text("hero.titleAccent")
    lead = " ".join(text(p) for p in sorted((p for p in by if p.startswith("hero.lead.")), key=lambda p: int(p.rsplit(".", 1)[1])))
    if title:
        # An accent said again at the end of its title is said once, as the
        # accent. The hvac and industrial heroes set the accent on the same
        # line ("We do not compromise on quality, speed, or value."), so a
        # title keeps the comma that joins them; one without an accent ends
        # on its last word.
        said = accent.rstrip(".").lower()
        if said and title.lower() == said:
            accent = ""
        elif said and title.lower().endswith(said):
            title = title[:-len(said)]
        # An accent that opens on a word its title has already said ("made
        # right and delivered on time." after "Precision CNC components, made
        # since 2009") makes a second claim the same way, and the line reads
        # as two stitched together; the title is kept on its own.
        opens = re.match(r"[A-Za-z]{4,}\b", accent)
        if opens and not re.fullmatch(r"with|your|that|this|from|have|they|will|what|when|where|which|their|our|and",
                                      opens.group(), re.I) \
                and re.search(rf"\b{re.escape(opens.group())}\b", title, re.I):
            accent = ""
        title = title.rstrip() if accent else title.rstrip(" ,;:–—-")
        # An accent that is a sentence of its own ("We're not comfortable until
        # you are." after "Baytown's family HVAC company since 1947") is set on
        # the same line, so a title that ends on a word without its full stop
        # runs the two together; the title is given its full stop.
        if accent and STARTS_A_SENTENCE.match(accent) and re.search(r"[\w’')]$", title) \
                and not re.search(r"\b(?:for|of|and|or|the|to|with|in|on|at|by|a|an|your|our|their|from|than)$", title, re.I):
            title += "."
        copy["hero"] = {"title": title, **({"titleAccent": accent} if accent else {}), **({"lead": lead} if lead else {})}
    elif lead:
        copy["hero"] = {"lead": lead}
    if text("summary"):
        copy["summary"] = text("summary")
    blurbs = {}
    for i, blurb in enumerate(answer.get("blurbs") or []):
        said = " ".join(text(p) for p in sorted((p for p in by if p.startswith(f"blurbs.{i}.text.")), key=lambda p: int(p.rsplit(".", 1)[1])))
        if said and blurb.get("service"):
            blurbs[compose.plain(blurb["service"]).lower()] = {"text": said, "short": text(f"blurbs.{i}.short")}
    copy["blurbs"] = blurbs
    paragraphs = []
    for p, paragraph in enumerate((answer.get("about") or {}).get("paragraphs") or []):
        said = " ".join(text(f"about.paragraphs.{p}.{j}") for j in range(len(paragraph or [])) if text(f"about.paragraphs.{p}.{j}"))
        if said:
            paragraphs.append(said)
    if paragraphs:
        copy["about"] = {"title": text("about.title") or f"About {short}", "text": paragraphs}
    highlights = []
    for i, item in enumerate(answer.get("highlights") or []):
        if text(f"highlights.{i}.title") and text(f"highlights.{i}.text"):
            cites = set(by[f"highlights.{i}.title"]["facts"]) | set(by[f"highlights.{i}.text"]["facts"])
            # A highlight sets them apart; a service restated does not, and
            # nor does a coupon or a price, which goes stale on a page
            # nobody keeps up.
            if not any(re.match(r"(?:h|c|l|o|y|a)\d", c) for c in cites):
                continue
            if OFFER.search(text(f"highlights.{i}.title") + " " + text(f"highlights.{i}.text")):
                continue
            # Nor does one whose words only say its title again ('Angi Super
            # Service 2025' over 'Angi Super Service 2025.'): a card of filler.
            if set(re.findall(r"\w+", text(f"highlights.{i}.text").lower())) <= set(re.findall(r"\w+", text(f"highlights.{i}.title").lower())):
                continue
            highlights.append({"title": text(f"highlights.{i}.title"), "text": text(f"highlights.{i}.text"),
                               "icon": item.get("icon") or "check", "_cites": cites, "_at": i})
    highlights.sort(key=lambda h: (_lead_rank(h["_cites"], sheet), h["_at"]))
    if len(highlights) >= 2:
        copy["highlights"] = [{k: v for k, v in h.items() if not k.startswith("_")} for h in highlights[:4]]
    steps = [{"title": text(f"steps.{i}.title"), "text": text(f"steps.{i}.text")}
             for i in range(len(answer.get("steps") or [])) if text(f"steps.{i}.title") and text(f"steps.{i}.text")]
    if len(steps) >= 3 and len((sheet or {}).get("steps") or []) >= 2:
        copy["steps"] = steps[:4]
    return copy


def _lead_rank(cites, sheet):
    """How early their home page says what a highlight cites: its place in
    what the home page leads with first, then where its quote stands on the
    home page; one the home page never says comes after."""
    pages = (sheet or {}).get("pages") or {}
    home = facts.normal(next(iter(pages.values()), ""))
    leads = [item for item in (sheet or {}).get("home_leads_with") or []]
    best = 10 ** 9
    for fid, group, item in facts.items(sheet):
        if fid not in cites:
            continue
        quote = facts.normal(item.get("quote", ""))
        for rank, lead in enumerate(leads):
            if quote and (quote in facts.normal(lead.get("quote", "")) or facts.normal(lead.get("quote", "")) in quote):
                best = min(best, rank)
        at = home.find(quote) if quote else -1
        if at >= 0:
            best = min(best, 100 + at)
    return best
