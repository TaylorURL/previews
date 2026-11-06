"""Whether a preview is clearly better than the business's own website: the
last gate before a site is stamped and its letter can go.

    python3 -m scripts.autobuild.versus <slug> <their-website> [trade]

The review (review.py) finds what is broken on a preview. This asks whether it
is worth sending at all. The preview's home page and the business's current one
are each photographed the same way (capture.mjs): the top of the page on a
desktop screen and on a phone, which is all the letter's picture shows, and the
whole desktop page. Both are shown to a model that sees, in an order set by the
slug and without saying which is the preview, and it scores each from 1 to 10
on the things that decide whether an owner clicks and a customer calls (the
first impression at a glance, the photography, the headline and words, the
trust shown, the fit for the trade, the clarity of the next step, the polish).
It also says which site is better and whether clearly. A site passes when the
preview scores at least FLOOR overall, beats theirs by MARGIN, and the model
calls it clearly the better one. Their site not loading at all (no address,
no answer, an error) counts as the weakest possible one, so the preview then
needs only the floor. The site compared is the home page of the website on
file, without the listing's tracking tags.

One call per site per review pass. The answer is checked for its shape and
asked again once when it comes back malformed or not at all. When the `claude`
command is missing, refused or slow, the comparison is "skipped", which is not
a pass: the review stamps nothing it has not compared, so nothing is sent
unjudged.

Every comparison is kept in .autobuild/<slug>.versus.json, with the pictures
under .autobuild/versus/<slug>/, for a person to look at.

    PREVIEW_VERSUS_MODEL    the model that judges (claude-fable-5-1)
    PREVIEW_VERSUS_FLOOR    the preview's least overall score to pass (see FLOOR)
    PREVIEW_VERSUS_MARGIN   how far it must beat their site overall (see MARGIN)
    PREVIEW_VERSUS_TIMEOUT  seconds one judging call may take (480)
    PREVIEW_VERSUS_LOAD_SECONDS  seconds a page may take to start drawing (30)
"""

import os

os.environ.setdefault("no_proxy", "*")

import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from PIL import Image

from . import vision

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PICTURES = os.path.join(ROOT, ".autobuild", "versus")
MODEL = os.environ.get("PREVIEW_VERSUS_MODEL") or "claude-fable-5-1"
# Calibrated on 20 previews already sent and The Salazar Law Firm's hand-built
# one, each judged three times (the notes are in the pull request that added
# this gate). The four clearly better than the site they replace led by 1.75
# to 4.6 and scored 6.0 to 7.75 in every run; the other seventeen never led by
# more than 1.25. A site's scores moved by 0.4 or less between runs, mostly.
FLOOR = float(os.environ.get("PREVIEW_VERSUS_FLOOR") or 6.0)
MARGIN = float(os.environ.get("PREVIEW_VERSUS_MARGIN") or 1.5)
TIMEOUT = int(os.environ.get("PREVIEW_VERSUS_TIMEOUT") or 480)
# A batch of four (pipeline.py) is judged in one round.
AT_ONCE = 4
# Their site is photographed again after this long; a review's second pass
# within it reuses the first pass's pictures.
THEIRS_HOURS = 12
# Pictures older than this are cleared away.
KEEP_DAYS = 14
# The rest of the desktop page, below its first screen, in strips this tall.
STRIP = 2700
STRIPS = 2

# (key, what the model is told it means, its weight in the overall score)
DIMENSIONS = (
    ("first_impression",
     "what the desktop and phone tops say at a glance, which is all the owner sees in the email: whether it looks "
     "like a real, established business worth calling and a site its owner would be proud of. An empty or flat "
     "hero, a heading set on a plain block of color, a cramped, dated or cluttered top scores low", 2),
    ("photography",
     "real, sharp photos of this business's own work, people, vehicles or place, used well. Stock-looking, "
     "generic, blurry, badly cropped or tiny photos score low; a site with no photos at all scores at most 3", 1),
    ("words",
     "the headline and the copy: specific to this business, written to a customer, plain and persuasive. A "
     "headline that is a list of services, or the trade and the town strung together, and copy that is filler "
     "or reads like keywords, score low", 1),
    ("trust",
     "what shows they are good at it: reviews quoted with who wrote them, the star rating and how many reviews, "
     "years in business, licenses, certifications, memberships, guarantees, the real owner or team", 1),
    ("trade_fit",
     "whether the design, the sections and the call to action suit this trade and the customers it serves (a "
     "company selling to plants, ships or other businesses is not a homeowner booking a visit; a law firm or "
     "an accountant is not a pool cleaner)", 1),
    ("next_step",
     "how plain and easy the next step is - call, ask for a quote, book - on the desktop and on the phone", 1),
    ("polish",
     "the craft: type, spacing, alignment, color, consistency. Anything broken, cut off, overlapping, empty, "
     "unfinished or placeholder scores low", 1),
)
KEYS = [key for key, _, _ in DIMENSIONS]

PROMPT = """These are pictures of {count} for the same small local business: {business}. \
{framing}

For each site there are: the top of its home page on a desktop screen; the top of its home page on a phone; and \
the rest of its desktop home page, top to bottom, in one or two strips. The business's owner is first shown only \
the two tops, in an email, and those decide whether they look any further; the rest decides whether a customer \
who arrives would call.

Judge as a demanding web designer and as a customer of this trade would. Score {each} from 1 to 10 on each of \
these, using the whole range - 3 is a site that hurts the business, 5 an ordinary small-business site, 7 a good \
one, 9 the best in the trade:
{dimensions}

Ignore cookie notices, chat bubbles and language switches, and anything cut by a picture's own edge. \
{closing}

The pictures, in order:
{listed}"""

BLIND = ("One of the two may be the site the business has now and the other a new design, in either order; do not "
         "guess which is which, and judge each on what it shows.")
CLOSING_TWO = ("Then say which site is better for this business to put in front of its customers: \"site1\", "
               "\"site2\" or \"even\", and whether it is clearly better - a difference the owner would see at once, "
               "not a matter of taste. summary: for each site, one plain sentence of what its top shows. reasons: one "
               "or two plain sentences on what most separates the two, calling them only Site 1 and Site 2.")
ALONE = ("The business's own website did not open ({why}), so only the new design is shown, as Site 1.")
CLOSING_ONE = ("summary: one plain sentence of what its top shows. reasons: one or two plain sentences on what most "
               "decides how good it is, calling it Site 1.")


def _site_schema():
    properties = {key: {"type": "integer", "minimum": 1, "maximum": 10} for key in KEYS}
    properties["summary"] = {"type": "string"}
    return {"type": "object", "properties": properties, "required": KEYS + ["summary"]}


def _schema(two):
    properties = {"site1": _site_schema(), "reasons": {"type": "array", "items": {"type": "string"}}}
    required = ["site1", "reasons"]
    if two:
        properties["site2"] = _site_schema()
        properties["better"] = {"type": "string", "enum": ["site1", "site2", "even"]}
        properties["clearly"] = {"type": "boolean"}
        required += ["site2", "better", "clearly"]
    return {"type": "object", "properties": properties, "required": required}


def log(*parts):
    print(datetime.now().strftime("%H:%M:%S"), "versus:", *parts, flush=True)


def capture(jobs, folder):
    """{name: target} photographed by capture.mjs into folder: {name: shots}.
    A target is a web address or dist:<slug>. A job the script never answered
    for is a page that did not open."""
    if not jobs:
        return {}
    os.makedirs(folder, exist_ok=True)
    load = int(os.environ.get("PREVIEW_VERSUS_LOAD_SECONDS") or 30)
    try:
        done = subprocess.run(["node", "scripts/autobuild/capture.mjs", folder, *[f"{n}={t}" for n, t in jobs.items()]],
                              cwd=ROOT, capture_output=True, text=True, stdin=subprocess.DEVNULL,
                              timeout=len(jobs) * load * 5 + 120)
        seen = json.loads(done.stdout or "{}")
        why = done.stderr.strip()[-200:]
    except (subprocess.TimeoutExpired, OSError, ValueError) as error:
        seen, why = {}, f"{type(error).__name__}: {str(error)[:160]}"
    return {name: seen.get(name) or {"ok": False, "url": target, "error": why or "the pictures were not taken"}
            for name, target in jobs.items()}


def overall(scores):
    weights = {key: weight for key, _, weight in DIMENSIONS}
    return round(sum(scores[key] * weights[key] for key in KEYS) / sum(weights.values()), 2)


def _strips(path, folder, prefix):
    """The desktop page below its first screen, cut into strips the model reads clearly."""
    out = []
    with Image.open(path) as image:
        image = image.convert("RGB")
        for i, top in enumerate(range(900, min(image.height, 900 + STRIP * STRIPS), STRIP), 1):
            if image.height - top < 200:
                break
            part = image.crop((0, top, image.width, min(image.height, top + STRIP)))
            name = os.path.join(folder, f"{prefix}-rest-{i}.jpg")
            part.save(name, "JPEG", quality=85)
            out.append(name)
    return out


def _shown(shots, label, folder, prefix):
    """The pictures of one site, with what each shows."""
    out = [(shots["desktop_top"], f"{label}: the top of its home page on a desktop screen"),
           (shots["phone_top"], f"{label}: the top of its home page on a phone")]
    rest = _strips(shots["desktop_full"], folder, prefix) if shots.get("desktop_full") else []
    for i, path in enumerate(rest, 1):
        out.append((path, f"{label}: the rest of its desktop home page, part {i} of {len(rest)}"))
    return out


def _valid(answer, two):
    if not isinstance(answer, dict):
        return False
    for site in (("site1", "site2") if two else ("site1",)):
        scores = answer.get(site)
        if not isinstance(scores, dict):
            return False
        for key in KEYS:
            value = scores.get(key)
            if not isinstance(value, int) or isinstance(value, bool) or not 1 <= value <= 10:
                return False
    reasons = answer.get("reasons")
    if not isinstance(reasons, list) or not any(isinstance(r, str) and r.strip() for r in reasons):
        return False
    if two and (answer.get("better") not in ("site1", "site2", "even") or not isinstance(answer.get("clearly"), bool)):
        return False
    return True


def _plain(text, names):
    """A reason with Site 1 and Site 2 named as the preview and their site."""
    text = re.sub(r"\b[Ss]ite ([12])\b", lambda m: names[m.group(1)], " ".join(str(text).split()))
    text = re.sub(r"(^|[.!?]\s+)([a-z])", lambda m: m.group(1) + m.group(2).upper(), text)
    return text[:300]


def ours_first(slug):
    """Whether the preview is shown as Site 1: set by the slug, so a site is
    always shown the same way and the order is even across sites."""
    return int(hashlib.sha256(slug.encode()).hexdigest(), 16) % 2 == 0


def _record(slug, business, ours_shots, theirs_shots):
    return {
        "slug": slug, "verdict": "skipped", "why_skipped": None, "reasons": [],
        "ours": {"overall": None, "scores": None, "summary": None},
        "theirs": {"overall": None, "scores": None, "summary": None, "url": home((business or {}).get("website")) or None,
                   "loaded": bool(theirs_shots and theirs_shots.get("ok")),
                   "error": None if theirs_shots and theirs_shots.get("ok") else (theirs_shots or {}).get("error")},
        "gap": None, "better": None, "clearly": None, "floor": FLOOR, "margin": MARGIN, "model": MODEL,
        "at": datetime.now(timezone.utc).isoformat(),
        "pictures": {"ours": {k: v for k, v in (ours_shots or {}).items() if k.endswith(("_top", "_full"))},
                     "theirs": {k: v for k, v in (theirs_shots or {}).items() if k.endswith(("_top", "_full"))}},
    }


def judge(ours_shots, theirs_shots, business):
    """The preview against their site, one call: a record of a fixed shape with
    each site's scores and overall, the verdict ("pass", "fail" or "skipped")
    and one or two plain reasons. ours_shots and theirs_shots are capture.mjs's
    answer for each; theirs_shots that is None or not ok is a site that did not
    load. business has the slug, name, trade, town and website."""
    business = business or {}
    slug = business.get("slug") or "site"
    record = _record(slug, business, ours_shots, theirs_shots)
    if not ours_shots or not ours_shots.get("ok"):
        record["why_skipped"] = f"the preview could not be photographed: {(ours_shots or {}).get('error')}"
        return record
    if not vision.available():
        record["why_skipped"] = "the claude command is missing or the vision check is switched off"
        return record
    two = record["theirs"]["loaded"]
    first = ours_first(slug) or not two
    names = {"1": "the preview" if first else "their site", "2": "their site" if first else "the preview"}
    who = ", ".join(str(v) for v in (business.get("name"), business.get("trade"), business.get("town")) if v)
    with tempfile.TemporaryDirectory(prefix="preview-versus-") as folder:
        if two:
            sites = [(ours_shots, "ours"), (theirs_shots, "theirs")] if first else [(theirs_shots, "theirs"), (ours_shots, "ours")]
        else:
            sites = [(ours_shots, "ours")]
        shown = []
        for n, (shots, prefix) in enumerate(sites, 1):
            shown += _shown(shots, f"Site {n}", folder, prefix)
        listed = "\n".join(f"{i:02d}.jpg: {what}" for i, (_, what) in enumerate(shown, 1))
        dimensions = "\n".join(f"- {key}: {what}." for key, what, _ in DIMENSIONS)
        prompt = PROMPT.format(
            count="two websites" if two else "a website", business=who or "a local business",
            framing=BLIND if two else ALONE.format(why=record["theirs"]["error"] or "it did not load"),
            each="each site" if two else "it", dimensions=dimensions,
            closing=CLOSING_TWO if two else CLOSING_ONE, listed=listed)
        schema = _schema(two)
        answer, why = None, None
        for attempt in range(2):
            got = vision.ask(prompt, [p for p, _ in shown], schema, longest=1600, model=MODEL, timeout=TIMEOUT)
            if got and _valid(got["answer"], two):
                answer = got["answer"]
                break
            why = (vision.last_error or "the answer was not in the shape asked for") if not got else \
                "the answer was not in the shape asked for"
            if not vision.available() or attempt:
                break
            log(slug, f"asking again ({why})")
    if answer is None:
        record["why_skipped"] = f"the comparison did not answer: {why}"
        return record

    ours_key, theirs_key = ("site1", "site2") if first else ("site2", "site1")
    ours = {key: answer[ours_key][key] for key in KEYS}
    record["ours"] = {"overall": overall(ours), "scores": ours, "summary": str(answer[ours_key].get("summary", ""))[:300]}
    if two:
        theirs = {key: answer[theirs_key][key] for key in KEYS}
        record["theirs"].update(overall=overall(theirs), scores=theirs,
                                summary=str(answer[theirs_key].get("summary", ""))[:300])
        record["better"] = {"site1": "ours" if first else "theirs", "site2": "theirs" if first else "ours",
                            "even": "even"}[answer["better"]]
        record["clearly"] = answer["clearly"]
    else:
        # A site that does not open is the weakest there can be.
        record["theirs"].update(overall=1.0, scores={key: 1 for key in KEYS}, summary="it did not load")
        record["better"], record["clearly"] = "ours", True
    record["gap"] = round(record["ours"]["overall"] - record["theirs"]["overall"], 2)
    record["reasons"] = [_plain(r, names) for r in answer["reasons"] if str(r).strip()][:2]
    # The scores and the model's own call must agree, so one generous number
    # does not carry a site the model itself would not call clearly better.
    record["verdict"] = "pass" if (record["ours"]["overall"] >= FLOOR and record["gap"] >= MARGIN
                                   and record["better"] == "ours" and record["clearly"]) else "fail"
    return record


def problem(record):
    """What a site that did not pass is parked for, in one line."""
    if record["verdict"] == "skipped":
        return f"not compared with their current site, so not passed: {record['why_skipped']}"
    theirs = "theirs did not load" if not record["theirs"]["loaded"] else f"theirs {record['theirs']['overall']:g}"
    return (f"not clearly better than their current site (the preview {record['ours']['overall']:g} of 10, {theirs}; "
            f"it needs {FLOOR:g} and a lead of {MARGIN:g}): " + " ".join(record["reasons"]))


def brief(record):
    """One site's comparison as the run's report carries it."""
    return {"verdict": record["verdict"], "ours": record["ours"]["overall"], "theirs": record["theirs"]["overall"],
            "gap": record["gap"], "theirs_loaded": record["theirs"]["loaded"],
            "scores": {"ours": record["ours"]["scores"], "theirs": record["theirs"]["scores"]},
            "reasons": record["reasons"] or ([record["why_skipped"]] if record["why_skipped"] else [])}


def lowest(records, most=3):
    """The lowest-scoring comparisons of a run, for a person to look at:
    [{"slug", "verdict", "ours", "theirs", "gap", "reasons", "file"}]."""
    judged = [(slug, r) for slug, r in records.items() if r.get("ours") is not None]
    judged.sort(key=lambda item: (item[1]["ours"], item[1]["gap"] if item[1]["gap"] is not None else 0))
    return [{"slug": slug, "verdict": r["verdict"], "ours": r["ours"], "theirs": r["theirs"], "gap": r["gap"],
             "reasons": r["reasons"], "file": record_path(slug)} for slug, r in judged[:most]]


def record_path(slug):
    return os.path.join(ROOT, ".autobuild", f"{slug}.versus.json")


def _keep(record):
    os.makedirs(os.path.dirname(record_path(record["slug"])), exist_ok=True)
    with open(record_path(record["slug"]), "w") as handle:
        json.dump(record, handle, indent=2, ensure_ascii=False)


def _prune():
    if not os.path.isdir(PICTURES):
        return
    cutoff = time.time() - KEEP_DAYS * 86400
    for name in os.listdir(PICTURES):
        path = os.path.join(PICTURES, name)
        if os.path.isdir(path) and os.path.getmtime(path) < cutoff:
            shutil.rmtree(path, ignore_errors=True)


# Hosts where a business's page is a path of a shared site, so the path is kept.
SHARED = re.compile(r"(^|\.)(facebook|instagram|linktr|yelp|nextdoor|google|wixsite|square|godaddysites|business)"
                    r"\.(com|ee|site)$")


def home(url):
    """The home page of the website on file: the listing often links a contact
    or service page, or carries tracking tags, and the letter is about the home
    page. A page on a shared site (a Facebook page, a Wix site under a path)
    keeps its path."""
    url = (url or "").strip()
    if not url:
        return ""
    if not re.match(r"^https?://", url, re.I):
        url = "http://" + url
    parts = urllib.parse.urlsplit(url)
    host = (parts.hostname or "").lower()
    if SHARED.search(host):
        query = urllib.parse.urlencode([(k, v) for k, v in urllib.parse.parse_qsl(parts.query)
                                        if not k.lower().startswith("utm_") and k.lower() not in ("gclid", "fbclid")])
        return urllib.parse.urlunsplit((parts.scheme, parts.netloc, parts.path or "/", query, ""))
    return urllib.parse.urlunsplit((parts.scheme, parts.netloc, "/", "", ""))


def _theirs_kept(slug, url):
    """Their site's pictures from a pass in the last THEIRS_HOURS, or None."""
    path = os.path.join(PICTURES, slug, "theirs.json")
    try:
        with open(path) as handle:
            kept = json.load(handle)
    except (OSError, ValueError):
        return None
    if kept.get("asked") != url or time.time() - kept.get("taken", 0) > THEIRS_HOURS * 3600:
        return None
    if kept.get("ok") and not all(os.path.exists(kept.get(k) or "") for k in ("desktop_top", "phone_top", "desktop_full")):
        return None
    return kept


def compare(slugs, businesses, ours=None):
    """Each preview against its business's own site: {slug: record}, each kept
    in .autobuild/<slug>.versus.json. businesses is {slug: {"name", "trade",
    "town", "website"}}; a slug with no business known is skipped. ours is
    {slug: target} for where each preview is photographed from, the built one
    in dist/ when not given."""
    _prune()
    ours = ours or {}
    records, jobs = {}, {}
    known = {}
    for slug in slugs:
        business = (businesses or {}).get(slug)
        if business is None:
            record = _record(slug, {}, None, None)
            record["why_skipped"] = "the business's own website is not known"
            records[slug] = record
            continue
        known[slug] = dict(business, slug=slug)
        jobs[f"{slug}/ours"] = ours.get(slug) or f"dist:{slug}"
        url = home(business.get("website"))
        if url and not _theirs_kept(slug, url):
            jobs[f"{slug}/theirs"] = url
    shots = {}
    if jobs:
        # One browser for every page of the batch, each moved into its site's folder.
        taken = capture({name.replace("/", "--"): target for name, target in jobs.items()},
                        os.path.join(PICTURES, "_batch"))
        for key, got in taken.items():
            slug, side = key.rsplit("--", 1)
            folder = os.path.join(PICTURES, slug)
            os.makedirs(folder, exist_ok=True)
            for field in ("desktop_top", "phone_top", "desktop_full"):
                if got.get(field):
                    moved = os.path.join(folder, f"{side}-{field.replace('_', '-')}.jpg")
                    os.replace(got[field], moved)
                    got[field] = moved
            shots[(slug, side)] = got
            if side == "theirs":
                with open(os.path.join(folder, "theirs.json"), "w") as handle:
                    json.dump(dict(got, asked=jobs[f"{slug}/theirs"], taken=time.time()), handle)

    def one(slug):
        business = known[slug]
        url = home(business.get("website"))
        if not url:
            theirs = {"ok": False, "error": "the business has no website on file"}
        else:
            theirs = shots.get((slug, "theirs")) or _theirs_kept(slug, url)
        record = judge(shots.get((slug, "ours")), theirs, business)
        _keep(record)
        line = f"{record['verdict']}: the preview {record['ours']['overall']}, theirs {record['theirs']['overall']}" \
            if record["verdict"] != "skipped" else f"skipped: {record['why_skipped']}"
        log(slug, line)
        return record

    with ThreadPoolExecutor(AT_ONCE) as pool:
        futures = {slug: pool.submit(one, slug) for slug in known}
        for slug, future in futures.items():
            try:
                records[slug] = future.result()
            except Exception as error:
                record = _record(slug, known[slug], None, None)
                record["why_skipped"] = f"the comparison broke: {type(error).__name__}: {str(error)[:160]}"
                _keep(record)
                records[slug] = record
    return records


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    slug, website = argv[0], argv[1]
    business = {"name": slug, "website": website, "trade": argv[2] if len(argv) > 2 else None}
    path = os.path.join(ROOT, "src", "brands", f"{slug}.json")
    if os.path.exists(path):
        with open(path) as handle:
            brand = json.load(handle)
        business.update(name=brand.get("name") or slug, town=brand.get("town"))
    target = None if os.path.isdir(os.path.join(ROOT, "dist", "b")) else f"https://{slug}.taylorurl.com/?staff"
    record = compare([slug], {slug: business}, {slug: target} if target else None)[slug]
    print(json.dumps(record, indent=2, ensure_ascii=False))
    return 0 if record["verdict"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
