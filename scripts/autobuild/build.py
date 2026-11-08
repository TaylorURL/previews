"""Builds one prospect's brand file and pictures in a checkout.

    build(prospect, root) -> (brand, evidence)   or raises Parked(reason)

`prospect` is a row from preview_candidates. The phone, address, rating and
review count come from that row, which was filled from the Google listing when
the prospect was found. Everything else comes from the business's own website,
read twice: by the regex readers in compose.py, for their services, about text
and description in their own words, and by a model (facts.py) that turns their
pages into a fact sheet whose every item is proved word for word on the page it
came from. The copy - the headline, the lead, the about section, highlights,
steps and the blurbs their site leaves out - is written from that sheet
(write.py), and every sentence of it is proved against the sheet before it is
used. Without the model (PREVIEW_WRITE=off, no `claude` command, a failed
call) the brand is made from their own words, as before there was a sheet.

Reviews are quoted only word for word: up to three recent Google reviews when
PLACES_API_KEY is set and the row has a place_id (the raw answer is kept as
evidence), else the testimonials on their own site.

`evidence` is what the checks prove the brand against: the stored listing
values, the text of every page read, the fact sheet, the written lines with the
facts they cite, and the Places answer.
"""

import colorsys
import glob
import json
import os
import re
import shutil
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

from . import collect, compose, facts, images, logo, quality, vision, write

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


class NoLogo(Parked):
    """No logo of their own sits cleanly. The draft is still built, with the
    business's name set in type where the logo goes; a missing logo never
    stops a draft."""


def _sample(root, template):
    """The template's sample brand, or its shape's while a new layout has none of its own."""
    for name in dict.fromkeys([template, compose.shape_of(template)]):
        path = os.path.join(root, "src", "brands", f"sample-{name}.json")
        if os.path.exists(path):
            with open(path) as handle:
                return json.load(handle)
    raise Parked(f"no sample brand for the {template} template")


SKIP_LOGO = re.compile(r"google|review|badge|bbb|yelp|facebook|award|seal|angi|homeadvisor|nextdoor|thumbtack|houzz|"
                       r"certified|partner", re.I)
SKIP_PHOTO = re.compile(
    r"logo|icon|badge|seal|avatar|sprite|award|bbb|google|facebook|yelp|angi|homeadvisor|\.svg|certif|"
    r"accredit|member|partner|warranty|craftsman|certainteed|gaf|owens|malarkey|atlas|carrier|trane|lennox|"
    r"rheem|goodman|banner|coupon|offer|financ|map|qr|flyer|promo|special|deal|sale|graphic|infographic|"
    r"placeholder|blank|spacer|loader|pixel|emoji|stars?\b|rating|testimonial|headshot|"
    # A stock site's paid photo, which it serves with its mark across it.
    r"plus\.unsplash|premium_photo|istockphoto|shutterstock|gettyimages|dreamstime|depositphotos|"
    r"stock\.adobe|123rf|alamy", re.I)
PHOTO_DOWNLOADS = 24


def _logo_sheet(image, placement, folder):
    """The prepared logo on its ground at the header's size and twice that, for the vision check."""
    from PIL import Image as PILImage
    ground = images.rgbof(placement["logoGround"])
    paths = []
    for scale in (1, 2):
        w, h = placement["logoWidth"] * scale, placement["logoHeight"] * scale
        mark = image.copy()
        mark.thumbnail((w, h), PILImage.LANCZOS)
        strip = PILImage.new("RGB", (w + 48 * scale, h + 32 * scale), ground)
        strip.paste(mark, (24 * scale, 16 * scale), mark)
        path = os.path.join(folder, f"logo-check-{scale}x.png")
        strip.save(path)
        paths.append(path)
    return paths


# The words a logo's file name or alt text carries that say nothing of whose
# logo it is.
LOGO_FILLER = {"logo", "logos", "img", "image", "final", "main", "site", "header", "footer", "web", "new", "color",
               "colour", "white", "black", "dark", "light", "full", "small", "large", "retina", "default", "primary",
               "horizontal", "vertical", "transparent", "copy", "scaled", "cropped", "min", "png", "jpg", "jpeg",
               "webp", "svg", "gif", "asset", "artboard", "untitled", "design", "group", "mark", "brand", "icon", "wp",
               "mobile", "sticky", "top", "home", "of", "and", "for", "the", "a"}
TRADE_WORD = re.compile("|".join(compose.TRADE_WORDS.values()), re.I)


def _names_another(img, name, own_only=False):
    """True when a picture's alt text or file name names someone other than the
    business: a membership or training mark ('LVI', 'Las Vegas Institute') or
    a carrier's ('Mercury Insurance'). A trade's own word ('insurance',
    'roofing') is shared by every business in it, so it names no one. With
    own_only, one that names no one ('logo-2.png') is someone else's too."""
    own = compose.bare_name(name).split()
    joined = "".join(own)
    initials = {"".join(w[0] for w in own), "t" + "".join(w[0] for w in own)}
    own = [w for w in own if not TRADE_WORD.search(w)]
    stem = img["src"].rsplit("/", 1)[-1].rsplit(".", 1)[0]
    words = [w for w in re.split(r"[^a-z0-9]+", f"{img['alt']} {stem}".lower())
             if w and w not in LOGO_FILLER and not TRADE_WORD.search(w) and not re.fullmatch(r"\d+|\d+x\d+|v\d+", w)]
    if not words:
        return own_only
    return not any(w in own or (len(w) >= 4 and w in joined) or w in initials for w in words)


def _plain(img):
    """The picture with only the plain words of its file name, the ones with
    no digit in them, so a file name of hashes ('a1b2c3_d4e5~mv2') says nothing."""
    stem = img["src"].rsplit("/", 1)[-1].rsplit(".", 1)[0]
    return {"alt": img["alt"], "src": " ".join(w for w in re.split(r"[^A-Za-z0-9]+", stem) if w.isalpha())}


def _logo(pages, business, name, scratch, notes):
    """The logo, from the business's own structured data, a file named for it
    in its header, an SVG drawn in its header, the header's pictures, or a file
    named for it elsewhere on the page that names no one else: the first that
    sits cleanly once its ground is cut away or matched."""
    candidates = []
    found = business.get("logo")
    if isinstance(found, dict):
        found = found.get("url")
    # Structured data a site theme brought with it describes the theme's demo
    # company, so a logo in it is tried only when its name is the business's.
    # The site's maker can leave its own mark there under the business's name,
    # so one whose file name says it is someone else's is not tried either.
    owner = business.get("name")
    if isinstance(owner, str) and _names_another({"alt": owner, "src": ""}, name):
        found = None
    if isinstance(found, str) and _names_another(_plain({"alt": "", "src": found}), name):
        found = None
    if isinstance(found, str):
        candidates.append(("url", found))
    home = pages[0]
    # A picture named a logo is as often a mark the business shows for a body
    # it trained with or belongs to, so one whose name says it is someone
    # else's is never tried, and one below the header is tried last.
    named = [img for img in home.images if "logo" in img["hint"] or "logo" in img["alt"].lower()]
    others = {img["src"] for img in named if _names_another(img, name)}
    # So is a picture in the header not named a logo whose alt text or file
    # name says in plain words that it is someone else's (a financing
    # partner's mark beside the menu); a file name of hashes and numbers
    # names no one.
    others |= {img["src"] for img in home.images if img["header"] and _names_another(_plain(img), name)}
    for img in named:
        if img["header"] and img["src"] not in others:
            candidates.append(("url", img["src"]))
    for svg in getattr(home, "svgs", []):
        candidates.append(("svg", svg))
    for img in home.images:
        if img["header"] and img["src"] not in others:
            candidates.append(("url", img["src"]))
    # Below the header, a picture named a logo and nothing more is as often a
    # partner's badge in a row of them, so only one named for the business is tried.
    for img in named:
        if not img["header"] and not _names_another(img, name, own_only=True):
            candidates.append(("url", img["src"]))
    refused = []
    seen = set()
    for kind, value in candidates:
        if value in seen or (kind == "url" and SKIP_LOGO.search(value)):
            continue
        seen.add(value)
        # A logo, like a photo, is fetched at the largest size its image
        # service will give (a header's "rs=h:149" copy is soft at its size).
        image = None
        for address in ([None] if kind == "svg" else collect.bigger(value)):
            try:
                data = value.encode() if kind == "svg" else collect.fetch(address, binary=True)[1]
                image = images.open_image(data)
                break
            except Exception:
                continue
        if image is None:
            continue
        if not images.looks_like_logo(image):
            continue
        try:
            prepared, placement = logo.prepare(image)
        except logo.Unfit as reason:
            refused.append(str(reason))
            continue
        look = vision.judge_logo(_logo_sheet(prepared, placement, scratch)) if vision.available() else None
        if look is None and vision.available():
            notes.append(f"the logo was not looked at: {vision.last_error}")
        if look is not None and not look["ok"]:
            refused.append("the logo did not pass the look: " + "; ".join(look["problems"])[:200])
            continue
        if look is not None and not look["has_name"]:
            # A mark with no name in it is drawn with the name set beside it.
            placement["logoName"] = True
        source = "inline SVG on their home page" if kind == "svg" else value
        return prepared, placement, source, image
    if refused:
        raise NoLogo("no logo on their website sits cleanly: " + "; ".join(dict.fromkeys(refused))[:300])
    raise NoLogo("no usable logo on their website")


def _skipped(img, logo_src):
    text = img["hint"] + " " + img["alt"].lower() + " " + img["src"].lower()
    return img["src"] == logo_src or bool(SKIP_PHOTO.search(text))


def _photo_candidates(pages, logo_src):
    urls = []
    for page in pages:
        og = page.meta.get("og:image")
        for img in page.images:
            if _skipped(img, logo_src):
                continue
            urls.append(img["src"])
        if og and not SKIP_PHOTO.search(og.lower()):
            urls.append(og)
    return list(dict.fromkeys(urls))


# Fewer pictures than this in their pages' own markup, or none wide enough
# for the hero, and their pages are drawn in a browser for the photos put on
# them by script, loaded as they are scrolled to, or set as backgrounds.
DRAW_BELOW = 4
DRAWN_DOWNLOADS = 20
# A picture drawn smaller than this on their page, from a file no bigger, is
# an icon, a thumbnail or a badge rather than a photo they show.
DRAWN_MIN = 200


def _drawn_candidates(drawn, logo_src, tried):
    """The pictures a browser showed on their pages that are worth trying as
    photos, the largest drawn first, leaving out those already tried."""
    out = []
    for img in drawn:
        w, h = (img.get("drawn") or [0, 0])[:2]
        if _skipped(img, logo_src) or collect.bigger(img["src"])[0] in tried:
            continue
        if img["kind"] != "background" and max(w, img.get("width") or 0) < DRAWN_MIN:
            continue
        # A picture in the header or menu drawn narrower than half the page is
        # the logo or a badge beside it; a background there is often the hero.
        if img["header"] and img["kind"] != "background" and w < 500:
            continue
        out.append(img["src"])
    return list(dict.fromkeys(out))


_shown = None


def _shown_elsewhere(root, slug, own=()):
    """The fingerprint of every photo already on another business's preview.
    `own` names other slugs that are this business's own earlier preview."""
    global _shown
    if _shown is None:
        _shown = []
        for path in glob.glob(os.path.join(root, "public", "brands", "*", "*-800.webp")):
            try:
                with Image.open(path) as image:
                    _shown.append((path.replace(os.sep, "/"), images.ahash(image)))
            except Exception:
                continue
    mine = [f"/brands/{s}/" for s in (slug, *own)]
    return [h for path, h in _shown if not any(m in path for m in mine)]


# Pictures fetched at once, and the longest side one is kept at once judged:
# enough for the hero's widest file, and a phone's 4000px photo is not held whole.
FETCHERS = 6
KEEP_SIDE = 2400
# The most photos the look is asked about, the best by their pixels first.
PHOTO_LOOKS = 16
# How long one business's photos may take to fetch and judge, all of them.
PHOTO_SECONDS = int(os.environ.get("PREVIEW_PHOTO_SECONDS") or 150)


def _download(url):
    """The picture at the largest size its image service will give, else as
    linked; (address, image) or None."""
    for address in collect.bigger(url):
        try:
            return address, images.trimmed(images.open_image(collect.fetch(address, binary=True, limit=collect.IMAGE_LIMIT)[1]))
        except Exception:
            continue
    return None


def _downloads(urls, until):
    """(url, (address, image) or None) for each url in order, fetched a few at
    a time; those not started by `until` (a time.time()) are left out."""
    with ThreadPoolExecutor(FETCHERS) as pool:
        for at in range(0, len(urls), FETCHERS):
            if time.time() > until:
                return
            batch = urls[at:at + FETCHERS]
            yield from zip(batch, pool.map(_download, batch))


def _photos(pages, logo_src, logo_image, scratch, notes, root, slug, earlier=None):
    """Their own photos, each judged by its pixels and then by the look, best first.

    Returns [{"image", "source", "metrics", "score", "look"}] of the photos
    worth showing, the strongest first. Anything blurry, enlarged, crushed by
    compression, flat like a graphic, a cut-out, a duplicate or the logo again
    is left out, as is anything the vision check refuses.

    The pictures in their pages' markup are tried first. Where those are
    few, or none is wide and sharp enough for the hero, the pages are drawn in
    a browser (photos.mjs) and every picture it shows is tried too. Where
    still none fits the hero, `earlier` (the photos of this business's own
    earlier preview, which came from their site) is tried last.
    """
    logo_prints = quality.fingerprints(logo_image.convert("RGB")) if logo_image is not None else None
    shown = _shown_elsewhere(root, slug, (earlier or {}).get("slugs") or ())
    kept, refused, tried = [], [], set()

    until = time.time() + PHOTO_SECONDS

    def consider(url, image):
        if image.width < 700 or image.height < 400:
            return
        m = quality.metrics(image)
        why = quality.problems(m)
        if max(image.size) > KEEP_SIDE:
            # Judged at full size; kept at a size that still fills every slot.
            image = image.copy()
            image.thumbnail((KEEP_SIDE, KEEP_SIDE), Image.LANCZOS)
        if why:
            refused.append(f"{url.rsplit('/', 1)[-1][:40]}: {why[0]}")
            return
        stamp = images.ahash(image)
        # A stock photo another preview already shows. The check allows two
        # bits between the saved files; the source before saving drifts a
        # little further, so this is looser to stay ahead of it.
        if any(images.distance(stamp, h) <= 4 for h in shown):
            refused.append(f"{url.rsplit('/', 1)[-1][:40]}: already on another preview")
            return
        prints = quality.fingerprints(image.convert("RGB"))
        if logo_prints and quality.same_picture(prints, logo_prints, limit=8):
            return
        twin = next((k for k in kept if quality.same_picture(prints, k["prints"])), None)
        item = {"image": image, "source": url, "metrics": m, "score": quality.score(m), "prints": prints, "look": None}
        if twin:
            # The sharper copy of one picture is kept, unless the look already passed the other.
            if item["score"] > twin["score"] and not twin.get("looked"):
                kept[kept.index(twin)] = item
            return
        kept.append(item)

    def fetch_all(urls):
        for url, got in _downloads(urls, until):
            tried.add(collect.bigger(url)[0])
            if got:
                consider(*got)

    def look():
        """The look at every kept photo, the best PHOTO_LOOKS of them by
        their pixels; those it refuses are dropped."""
        fresh = [k for k in kept if not k.get("looked")]
        if len(fresh) > PHOTO_LOOKS:
            # The best by their pixels, those wide enough for the hero first.
            fresh.sort(key=lambda k: (_fits(k, "hero"), k["score"]), reverse=True)
            for item in fresh[PHOTO_LOOKS:]:
                kept.remove(item)
            fresh = fresh[:PHOTO_LOOKS]
        for item in fresh:
            item["looked"] = True
        if not fresh or not vision.available():
            return
        paths = []
        for item in fresh:
            path = os.path.join(scratch, f"candidate-{len(refused):02d}-{len(paths):02d}.png")
            copy = item["image"].convert("RGB")
            copy.thumbnail((1400, 1400))
            copy.save(path)
            paths.append(path)
        looks = vision.screen_photos(paths)
        if looks is None:
            notes.append(f"the photos were not looked at: {vision.last_error}")
            return
        for item, path in zip(fresh, paths):
            item["look"] = looks.get(path)
            if not item["look"] or not item["look"]["ok"]:
                refused.append(f"{item['source'].rsplit('/', 1)[-1][:40]}: {(item['look'] or {}).get('why', 'no verdict')}")
                kept.remove(item)

    hero_ready = lambda: any(_fits(k, "hero") for k in kept)
    static = _photo_candidates(pages, logo_src)
    fetch_all(static[:PHOTO_DOWNLOADS])
    if os.environ.get("PREVIEW_DRAW", "on") != "off" and (len(static) < DRAW_BELOW or not hero_ready()):
        drawn = collect.drawn_images([page.url for page in pages])
        more = _drawn_candidates(drawn, logo_src, tried)
        before = len(kept)
        fetch_all(more[:DRAWN_DOWNLOADS])
        notes.append(f"their pages drawn in a browser showed {len(more)} more pictures; {len(kept) - before} of them "
                     "passed their pixels" + (f" ({collect.last_draw_error})" if collect.last_draw_error else ""))
    # One look at them all, as before there was a browser's read.
    look()
    if earlier and earlier.get("photos") and not hero_ready():
        # Their earlier preview's photos were looked at when it was built,
        # and its review passed them; they are not asked about again.
        before = len(kept)
        for path, image in earlier["photos"]:
            consider(path, image)
        for item in kept:
            item["looked"] = True
        if len(kept) > before:
            notes.append(f"no photo on their site now fits the hero, so {len(kept) - before} of the photos of their earlier "
                         f"preview (from their site) were kept")
    # The look's score leads; the pixels break ties.
    kept.sort(key=lambda k: ((k["look"] or {}).get("score", 3), k["score"]), reverse=True)
    return kept, refused


def _earlier(root, slug, name):
    """The photos this business's own preview already shows, when there is
    one: the brand file at this slug, or at the slug its name alone gives,
    that carries its name. Those came from its own site when that preview was
    built. {"slugs": [...], "photos": [(path, image)]}, the hero's first, or None."""
    from .slug import slug_for
    for other in dict.fromkeys([slug, slug_for(name, None, root)]):
        path = os.path.join(root, "src", "brands", f"{other}.json")
        try:
            with open(path) as handle:
                brand = json.load(handle)
        except (OSError, ValueError):
            continue
        if compose.plain(brand.get("name")) != name:
            continue
        refs = [(brand.get("hero") or {}).get("image"), (brand.get("about") or {}).get("image")]
        refs += [item.get("image") for item in (brand.get("groups") or []) + (brand.get("services") or [])
                 + (brand.get("projects") or [])]
        photos = []
        for ref in dict.fromkeys(r for r in refs if isinstance(r, str) and r.startswith(f"/brands/{other}/")):
            file = os.path.join(root, "public") + f"{ref}-1600.webp"
            try:
                with Image.open(file) as image:
                    image.load()
                    photos.append((ref, image.copy()))
            except Exception:
                continue
        return {"slugs": [other], "photos": photos}
    return None


def _fits(item, slot):
    return not quality.problems(item["metrics"], slot)


# Words in a service's name that say what kind of job it is, not what it is of.
JOB_WORDS = {"service", "services", "repair", "repairs", "install", "installation", "installations", "replacement",
             "maintenance", "company", "contractor", "contractors", "residential", "commercial", "emergency"}


# Machines a photo can show that are a line of work of their own; one no
# service of theirs names (an ice machine on an air conditioner's site) is not
# a picture of any service they offer.
SIDE_LINES = (r"\bice (?:machine|maker)", r"\brefrigerat", r"\bfreezer", r"\bgenerator", r"\bwater heater",
              r"\bpools?\b", r"\bhot tub", r"\bsolar", r"\bappliance")

# What the look says of a photo whose person is cut to an arm and a torso
# ("Person is cropped to body parts, so it works better as a secondary
# image"): fine on a card, but the hero draws it large and first.
OFF_HERO = (r"\bbody parts?\b", r"\bsecondary\b", r"\bheadless\b", r"\bhead(?:s)? (?:is |are )?(?:cut|cropped)",
            r"\b(?:no|without a) (?:head|face)\b", r"\bfaceless\b")

# The trade's own work under names that do not say the trade: a concrete
# contractor's driveway, parking lot or foundation is a pour like any other,
# so a photo of their trade at large belongs on that page too.
TRADE_WORK = {"concrete": r"driveway|parking|foundation|\bslab|sidewalk|patio|flatwork|\bcurb|\bsteps\b"}


def _own_words(title, services):
    """The words of a service's name no other service's name has, as plain lowercase."""
    others = {w for s in services if s["title"] != title for w in re.findall(r"[a-z]+", s["title"].lower())}
    return [w for w in re.findall(r"[a-z]+", title.lower()) if len(w) >= 4 and w not in others and w not in JOB_WORDS]


def _said(item):
    """What is known of a photo's subject in words: its file name and the look's few words on it."""
    name = item["source"].rsplit("/", 1)[-1].rsplit(".", 1)[0]
    return re.sub(r"[_\W\d]+", " ", f"{name} {(item['look'] or {}).get('why', '')}").lower()


def build(prospect, root, slug):
    """A business it cannot finish raises Parked carrying, as `known`, what it
    had already made of them: the brand so far, the logo's and the photos'
    sources, and the services and words it found. The run that finishes the
    business by hand starts from that rather than from nothing."""
    known = {}
    try:
        return _build(prospect, root, slug, known)
    except Parked as reason:
        reason.known = known
        raise


def _build(prospect, root, slug, known):
    template = prospect["industry"]
    if template not in compose.AUTOMATED:
        raise Parked(f"no automatic build for the {template} template yet")
    shape = compose.shape_of(template)
    try:
        read = collect.site(prospect["website"])
    except Exception as error:
        raise Parked(f"their website did not load: {str(error)[:120]}")
    # The pages read for the fact sheet alone stay out of the regex readers'
    # way, so what those find is what they found before the sheet.
    pages = [page for page in read if not getattr(page, "extra", False)]
    business = collect.jsonld_business(pages)
    text = compose.page_text(pages)
    css = collect.css_text(pages)
    sample = _sample(root, template)

    name = compose.plain(prospect["name"])
    short = compose.short_name(name)
    phone = compose.us_phone(prospect.get("phone"))
    street, town, state, zip_ = compose.address_parts(prospect)
    if not phone or not street or not town:
        raise Parked("no phone or street address stored from the Google listing")

    folder = os.path.join(root, "public", "brands", slug)
    os.makedirs(folder, exist_ok=True)
    notes = []
    scratch = tempfile.mkdtemp(prefix=f"preview-{slug}-")
    try:
        try:
            mark, placement, logo_src, logo_raw = _logo(pages, business, name, scratch, notes)
        except NoLogo as reason:
            # The page sets the name in type where the logo goes (BrandLogo in
            # src/templates/shared.jsx), and the colors come from their stylesheet.
            mark = placement = logo_src = logo_raw = None
            notes.append(f"the name is set in type for a logo: {reason}")
        logo_fields = logo.write(mark, placement, folder, slug) if mark is not None else {}
        inks = images.logo_colors(mark) if mark is not None else []
        if placement:
            # A mark cut from a colored ground keeps that color as the brand's own.
            ground = images.rgbof(placement["logoGround"])
            h_, l_, s_ = colorsys.rgb_to_hls(*(v / 255 for v in ground))
            if s_ >= 0.22 and 0.12 < l_ < 0.85:
                inks = [ground] + inks
        known["logo_source"] = logo_src
        known["brand"] = {"brand": {**compose.font_block(compose.fonts_of(css), sample), **logo_fields}}
        known["notes"] = notes
        colors = compose.colors_of(inks, css, template)
        if not colors:
            raise Parked("no brand color in the logo or the site's stylesheet")
        known["brand"]["brand"].update(colors)
        photos, refused = _photos(pages, logo_src, logo_raw, scratch, notes, root, slug, earlier=_earlier(root, slug, name))
        known["photos_refused"] = refused
    finally:
        shutil.rmtree(scratch, ignore_errors=True)

    # The hero takes the strongest photo wide and sharp enough for it; the
    # rest go where a card-sized picture is drawn. Too few good ones and the
    # page is drawn without them rather than with weak ones.
    # A photo that fills the hero as a 16:9 band is taken first, as before the
    # hero had a split style; else the best one its split frame takes.
    # Each is measured again as saved, as the check before landing measures
    # it: a photo just over the line can fall under it once recompressed, and
    # then the next one is taken instead.
    names, failed = [], []

    def place(item, slot):
        if any(item is f for f in failed):
            return False
        name = f"photo{len(names) + 1}"
        images.save_photo(item["image"], folder, name)
        with Image.open(os.path.join(folder, f"{name}-1600.webp")) as saved:
            why = quality.problems(quality.metrics(saved), slot)
        if why:
            for width in (800, 1600):
                os.remove(os.path.join(folder, f"{name}-{width}.webp"))
            refused.append(f"{item['source'].rsplit('/', 1)[-1][:40]}: once saved, {why[0]}")
            failed.append(item)
            return False
        names.append((f"/brands/{slug}/{name}", item))
        if _shown is not None:
            # Taken now, so the next business in the same run cannot take it too.
            _shown.append((os.path.join(folder, f"{name}-800.webp").replace(os.sep, "/"), images.ahash(item["image"])))
        return True

    # A photo the look says is cut to body parts is left to the cards.
    framed = [p for p in photos if not any(re.search(w, ((p["look"] or {}).get("why") or "").lower()) for w in OFF_HERO)]
    heroes = [p for p in framed if _fits(p, "band")] + [p for p in framed if _fits(p, "hero") and not _fits(p, "band")]
    hero_pick = next((p for p in heroes if place(p, "hero")), None)
    for item in [p for p in photos if p is not hero_pick and _fits(p, "card")]:
        if len(names) - bool(hero_pick) >= 5:
            break
        place(item, "card")
    hero_image = names[0][0] if hero_pick else None
    spare = [n for n, _ in (names[1:] if hero_pick else names)]
    known["photos"] = [{"path": n, "source": item["source"], "slot": "hero" if n == hero_image else "card",
                        "look": (item["look"] or {}).get("why")} for n, item in names]

    kind = compose.KIND.get(prospect["trade"])
    vocab_key = kind or (template if template in compose.VOCAB else shape)
    services = compose.services_of(pages, compose.VOCAB[vocab_key], name, town, described_first=shape == "hvac", towns=TOWNS)
    # The fact sheet: one model read of every page, each item proved on its page.
    sheet = facts.sheet(prospect, read, business, notes, TOWNS) if facts.available() else None
    if sheet is None and not facts.available():
        notes.append(f"no fact sheet: {facts.last_error or 'writing is switched off or the claude command is missing'}")
    known["facts"] = {k: v for k, v in (sheet or {}).items() if k != "pages"}
    # A site that sets them in another state again and again ("a local roofing
    # company out of Kansas City, MO" for a roofer in Crosby, TX) was written
    # for another place, or is another business of the same name: what it says
    # of the work is not known to be theirs.
    if sheet and sheet.get("elsewhere", 0) >= 5 and sheet["elsewhere"] * 4 >= sheet.get("read", 0):
        raise Parked(f"their website sets them outside {state} {sheet['elsewhere']} times, where their Google listing is; "
                     "it may be another business's site")
    google, places = facts.google_reviews(prospect, notes)
    services = _with_facts(services, sheet, name, shape, notes)
    known["services"] = services
    if len(services) < 2:
        raise Parked("fewer than two services named on their website")
    about = compose.about_of(pages, name, vocab_key, services, town, state, TOWNS)
    lead, lead_source = compose.lead_of(pages, about, vocab_key, services, town, state, TOWNS, name)
    known["about"], known["lead"] = about, lead
    copy = write.write(prospect, template, kind, sheet, services, notes, town=town, state=state,
                       own={"lead": lead, "about": about}, towns=TOWNS) if sheet else None
    if copy:
        known["copy"] = [{k: l[k] for k in ("path", "text", "facts")} for l in copy["lines"]]
        for s in services:
            blurb = copy["blurbs"].get(s["title"].lower())
            if blurb:
                s["text"], s["short"], s["written"] = blurb["text"], blurb.get("short") or None, True
    if shape == "professional":
        # Where most services are described the grid draws cards with their
        # words, so a service named alone is left out rather than drawn as a
        # card and a page with nothing in them; where most are named alone
        # the grid draws them all as a list of links.
        described = [s for s in services if s["text"]]
        if len(described) * 2 > len(services):
            services = described
    written = (copy or {}).get("hero") or {}
    lead = written.get("lead") or lead
    if copy and written.get("lead"):
        lead_source = "written from the fact sheet"
    if not lead:
        raise Parked("no description of the business in its own words")
    if (copy or {}).get("about"):
        about = copy["about"]["text"]
    text_areas = compose.areas_of(text, town, TOWNS)
    towns_said = [compose.plain(t["name"]).split(",")[0].strip() for t in (sheet or {}).get("towns") or []]
    towns_said = [t for t in towns_said if t and len(t) <= 30 and not re.search(r"\d", t) and not compose.COUNTRY.fullmatch(t) and not compose.REGION.fullmatch(t)]
    areas = list(dict.fromkeys([town] + towns_said))[:12] if towns_said else text_areas
    # The year they were founded is the earliest they give; a later one
    # ("Since 2023") dates something newer, such as a move or a new service.
    since = min((int(m.group(1)) for m in compose.SINCE.finditer(text)), default=None)
    if not since:
        founded = [h["number"] for h in (sheet or {}).get("highlights") or [] if h.get("kind") == "founded" and 1850 < int(h.get("number") or 0) <= 2026]
        since = min(founded, default=None)
    license_line = compose.LICENSE.search(text)

    label = compose.TRADE_LABEL.get(kind) or compose.TRADE_LABEL.get(template) or compose.TRADE_LABEL[shape]
    brand = {
        "template": template,
        "preview": True,
        "name": name,
        "shortName": short,
        "phone": phone,
        "email": compose.email_of(prospect.get("email"), pages, business),
        "address": street,
        "town": town,
        "state": state,
    }
    if zip_:
        brand["zip"] = zip_
    rating, count = compose.listing_rating(prospect)
    if rating and count:
        brand["rating"] = rating
        brand["reviewCount"] = count
    if since:
        brand["since"] = since
    if license_line:
        brand["license"] = compose.plain(license_line.group(1))
    hours = compose.hours_of(business)
    if hours:
        brand["hours"] = hours

    fonts = compose.fonts_of(css)
    brand["brand"] = {
        **colors,
        **compose.font_block(fonts, sample),
        **logo_fields,
    }
    # How the hero is drawn: across a wide, strong photo; beside a decent one;
    # in type where there is none. Classic where their own headings are set
    # in a serif or the site reads as a traditional firm, else bold.
    brand["heroStyle"] = _hero_style(hero_pick)
    brand["tone"] = "classic" if compose.heading_serif(css, fonts) or ((sheet or {}).get("tone") or {}).get("value") == "classic" else "bold"
    # From here the brand is what a park leaves behind, as far as it got.
    known["brand"] = brand
    brand["hero"] = {
        "eyebrow": f"{label} in {town}",
        "title": short,
        "lead": lead,
    }
    if hero_image:
        brand["hero"]["image"] = hero_image
        brand["hero"]["imageAlt"] = f"A photo of {short}"
    if written.get("title"):
        # A written headline says a benefit or their story; the name and town
        # lead above it in small type.
        brand["hero"]["eyebrow"] = f"{short} · {town}"
        brand["hero"]["title"] = written["title"]
        if written.get("titleAccent") and shape in ("roofing", "hvac"):
            brand["hero"]["titleAccent"] = written["titleAccent"]
        elif written.get("titleAccent"):
            brand["hero"]["title"] = f"{written['title']} {written['titleAccent']}"
    else:
        line = compose.hero_line(services, town, label, vocab_key, short)
        if shape in ("roofing", "hvac"):
            # The name leads in small type; the work is the headline and the town
            # its accent, so a long business name never fills the hero.
            what, _, where = line.rpartition(f" in {town}")
            brand["hero"]["eyebrow"] = short
            brand["hero"]["title"] = what or line
            if what:
                brand["hero"]["titleAccent"] = f"in {town}"
        else:
            brand["hero"]["eyebrow"] = short
            brand["hero"]["title"] = line

    brand["serviceArea"] = areas
    _facts_fields(brand, sheet, copy, google, phone, template, state)

    # The about section is drawn on the home page under the hero, so it takes
    # the first spare photo that is not another shot of the hero's scene.
    # The roofing and hvac About pages also draw it as their hero, across half
    # the page, so there it must be sharp enough for the hero slot, not just a card.
    pictures = dict(names)
    about_image = next((n for n in spare if not (hero_pick and images.same_scene(pictures[n]["image"], hero_pick["image"]))
                        and (shape not in ("roofing", "hvac") or _fits(pictures[n], "hero"))), None)
    about_title = ((copy or {}).get("about") or {}).get("title") or f"About {short}"

    def about_block(**extra):
        block = {**extra, "title": about_title, "text": about}
        if about_image:
            block["image"] = about_image
            block["imageAlt"] = f"A photo of {short}"
        return block

    if shape == "professional":
        brand["kind"] = kind
        items = []
        for s in services:
            icon = next((k for k, p in compose.ICONS.get(kind) or compose.ICONS["professional"] if re.search(p, s["title"], re.I)), None)
            summary = s.get("short") if s.get("short") and len(s["short"]) <= 50 else compose.gist(s["text"], 50)
            item = {"slug": compose.slugify(s["title"]), "title": s["title"], "summary": summary, "text": compose.gist(s["text"], 170)}
            if s["text"]:
                item["lead"] = s["text"]
            if icon:
                item["icon"] = icon
            items.append(item)
        # The grid draws its services as cards unless most have no line of
        # their own (ServiceGrid in Professional.jsx), and a name alone among
        # described cards is a card with nothing under its title; it is left out.
        if sum(1 for item in items if not item["text"]) * 2 < len(items):
            items = [item for item in items if item["text"]]
        brand["services"] = items
        if not about:
            raise Parked("no about text on their website")
        brand["about"] = about_block()

    elif shape == "roofing":
        # A service page leads on the service's text under its heading, so its
        # body carries only the sentences that text has not already said.
        # A single short sentence left over would sit alone on the page under
        # the heading; it stays in the text the heading leads on instead.
        def untold(text):
            return " ".join(compose.sentences(text)[len(compose.sentences(compose.trim(text, 170))):])

        def lone(rest):
            return len(compose.sentences(rest)) == 1 and len(rest) < 120

        # A short line that is only the service's name says nothing under it;
        # the card then takes the opening of its text, as one with no line does.
        def named(s):
            return compose.plain(s.get("short") or "").lower() == compose.plain(s["title"]).lower()
        items = [
            {"slug": compose.slugify(s["title"]), "title": s["title"],
             **({"group": group} if (group := next((k for k, p in compose.ROOF_GROUPS if re.search(p, s["title"], re.I)), None)) else {}),
             "short": (s.get("short") if s.get("short") and len(s["short"]) <= 70 and not named(s) else None) or compose.gist(s["text"], 70) or s["title"],
             "text": (compose.trim(s["text"], 300) if lone(rest := untold(s["text"])) else compose.trim(s["text"], 170)) or "",
             **({"body": [rest]} if rest and not lone(rest) else {})}
            for s in services
        ]
        # Where most services are described the home grid draws them as cards,
        # and a service their site only names is a page with nothing under its
        # heading but the inspection card; it is left out, as on professional.
        if sum(1 for item in items if not item["text"]) * 2 < len(items):
            items = [item for item in items if item["text"]]
        brand["services"] = items
        if not about:
            raise Parked("no about text on their website")
        brand["about"] = about_block()

    elif shape == "hvac":
        ask = compose.ask_of(kind, services)
        if ask:
            brand["ask"] = ask
        groups = []
        # The about section takes its spare photo; each group one of the others
        # of its own, and none shares a picture. A group page draws its
        # photo beside the heading at near half the page, so only one sharp
        # enough for a wide slot goes there; a group without one shows its
        # services in that place instead.
        wide = [n for n, item in names if n in spare and n != about_image and _fits(item, "wide")]
        # A photo whose file name or look names one service's own word (a
        # generator, a panel) shows that service, so it goes to that service's
        # page or to none; the others go in order to the pages left.
        # A photo of a machine none of their services is of goes to no page.
        # A photo that names no service shows their trade at large (a
        # painter's living room), so it goes only to a page whose service
        # names that trade, not to a side job named for something else (a
        # fence, a deck, pressure washing).
        trade = compose.TRADE_WORDS.get(kind) if kind else compose.VOCAB["hvac"]
        if kind in TRADE_WORK:
            trade = f"{trade}|{TRADE_WORK[kind]}"
        named = {}
        offered = " ".join(f"{s['title']} {s.get('text') or ''}" for s in services).lower()
        for n in list(wide):
            said = _said(pictures[n])
            if any(re.search(p, said) and not re.search(p, offered) for p in SIDE_LINES):
                wide.remove(n)
                continue
            owner = next((s["title"] for s in services if any(re.search(rf"\b{w}", said) for w in _own_words(s["title"], services))), None)
            if owner:
                wide.remove(n)
                named.setdefault(owner, n)
        for i, s in enumerate(services[:5]):
            if not s["text"]:
                continue
            icon = next((k for k, p in compose.ICONS.get(kind) or compose.ICONS["hvac"] if re.search(p, s["title"], re.I)), "wrench")
            summary = compose.card_line(s["text"], 140) or s["text"]
            # The intro is their description whole, but put right as the
            # summary's is ("STACKABLE METAL RACKS will Optimize the vertical
            # space, If you have..." takes the sentence's case and its stop).
            intro = compose.trim(s["text"], 2 * len(s["text"])) or s["text"]
            group = {"slug": compose.slugify(s["title"]), "title": s["title"], "icon": icon, "summary": summary, "intro": intro}
            if s["title"] in named or (wide and (not trade or re.search(trade, s["title"], re.I))):
                group["image"] = named.get(s["title"]) or wide.pop(0)
                group["imageAlt"] = f"A photo of {short}"
            groups.append(group)
        if len(groups) < 2:
            raise Parked("fewer than two services described on their website")
        # The services heading's line names the services and the towns; the
        # lead, their description of themselves, is the hero's alone.
        brand["summary"] = (copy or {}).get("summary") or compose.summary_line(groups, short, areas or [town])
        brand["groups"] = groups
        if about:
            brand["about"] = about_block(eyebrow="About us")

    pages_text = (sheet or {}).get("pages") or facts.page_texts(read, business)
    evidence = {
        "phone": phone,
        "address": street,
        "rating": rating,
        "reviewCount": count,
        "lead_source": lead_source,
        "text": compose.page_text(read),
        "pages": pages_text,
        "facts": {k: v for k, v in (sheet or {}).items() if k != "pages"},
        "copy": [{k: l[k] for k in ("path", "text", "facts", "against")} for l in (copy or {}).get("lines") or []],
        "corpus": (copy or {}).get("corpus") or "",
        "places": places,
        "photos": [item["source"] for _, item in names],
        "photo_looks": {path: (item["look"] or {}).get("why") for path, item in names},
        "photos_refused": refused,
        "logo_source": logo_src,
        "notes": notes,
    }
    # An optional fact their site does not bear out word for word (an industry
    # it words otherwise) is left out rather than parking the business.
    facts.drop_unproved(brand, evidence, notes)
    with open(os.path.join(root, "src", "brands", f"{slug}.json"), "w") as handle:
        json.dump(brand, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    _keep_evidence(root, slug, evidence, (copy or {}).get("dropped") or [])
    return brand, evidence


def _with_facts(services, sheet, name, shape, notes):
    """The regex's services, each undescribed one given the description the
    fact sheet proved for it, or the fact sheet's own where the regex found
    fewer than two."""
    if not sheet:
        return services
    found = []
    for item in sheet.get("services") or []:
        title = compose.plain(re.sub(r"\s*\([^)]*\)$", "", item["title"]))
        # The sheet gives titles in Title Case, initials ("DOT Exams") kept;
        # one set all in one case is put right.
        if title.islower() or title.isupper():
            title = compose.title_case(title)
        if not (3 <= len(title) <= 42) or len(title.split()) > 6 or compose.names_the_business(title, name) \
                or compose.NOT_A_SERVICE_SHAPE.search(title) or compose.GENERIC_NAV.match(title) \
                or re.search(r"\b(privacy|terms|glossary)\b", title, re.I):
            continue
        if any(facts.normal(f["title"]) == facts.normal(title) for f in found):
            continue
        found.append({"title": title, "text": compose.plain(item.get("description")) or None, "fact": item["id"]})
    by_title = {facts.normal(f["title"]): f for f in found}
    for s in services:
        match = by_title.get(facts.normal(s["title"]))
        if not s["text"] and match and match["text"]:
            s["text"] = match["text"]
    services = compose.said_shorter(services)
    if len(services) < 2 <= len(found):
        notes.append("the services are the fact sheet's: " + ", ".join(f["title"] for f in found[:8]))
        services = found[:8]
    # A heading the check refuses as no service ("Nationwide Ship-in Balancing
    # and Machining" reads as a page aimed at a town) is left out here rather
    # than parking the business for it.
    refused = [s["title"] for s in services if compose.NOT_A_SERVICE_SHAPE.search(s["title"]) or compose.names_the_business(s["title"], name)]
    if refused:
        notes.append("left out headings the check refuses as services: " + ", ".join(refused))
        services = [s for s in services if s["title"] not in refused]
    # A heading that is only one of the industries they serve ("Steel" beside
    # "Food & Beverage" and "Petrochemical") names who they work for, not a
    # service; the industries band names it, and it is no capability page.
    served = {facts.normal(re.sub(r"^the\s+|\s+(?:industry|industries|sectors?)$", "", compose.plain(i["name"]), flags=re.I))
              for i in sheet.get("industries") or []}
    industry = [s["title"] for s in services if facts.normal(s["title"]) in served]
    if industry:
        notes.append("left out headings that are industries they serve: " + ", ".join(industry))
        services = [s for s in services if s["title"] not in industry]
    if shape == "hvac":
        services.sort(key=lambda s: not s["text"])
    return services


def _hero_style(pick):
    """photo for a wide, sharp photo the look rated strong; split for any
    other the hero can take; type with none.

    The photo style spreads the picture across the whole band under the
    brand's deep wash, so it also needs one sharp from edge to edge, not a
    close-up on a soft, out-of-focus ground (its blur fills the band), and one
    not mostly pale (the thin wash at the right turns white to a faded tint)."""
    if not pick:
        return "type"
    m = pick["metrics"]
    look = (pick.get("look") or {}).get("score")
    strong = m["width"] >= 1800 and m["height"] >= 900 and m["ratio"] >= 1.45 and (look >= 4 if look else pick["score"] >= 0.8)
    across = m.get("detail", 0) >= 0.4 * m.get("focus", 0) and m.get("mean", 0) <= 175
    return "photo" if strong and across else "split"


SPANISH = re.compile(r"^(?:spanish|espa[nñ]ol)$", re.I)

# A doctor as the health template's isDoctor knows one: a "Dr." name, a
# D.C. or D.D.S. after it, or a dentist's, chiropractor's or doctor's role.
DOCTOR = lambda p: bool(
    re.match(r"dr\.?\s", p.get("name") or "", re.I)
    or re.search(r"\b(?:D\.?C|D\.?D\.?S|D\.?M\.?D|M\.?D|D\.?O)\.?$", re.sub(r",?\s*$", "", p.get("name") or ""), re.I)
    or re.search(r"\b(?:dentist|chiropractor|doctor|orthodontist|periodontist|endodontist|prosthodontist|oral surgeon|physician)\b", p.get("role") or "", re.I)
)


def _facts_fields(brand, sheet, copy, google, phone, template, state):
    """The brand's fields that come straight from the proved fact sheet and
    the written copy: highlights, steps, phone lines, languages, reviews,
    credentials, the owner, industries and states served."""
    if copy:
        if copy.get("highlights"):
            brand["highlights"] = copy["highlights"]
        if copy.get("steps"):
            brand["steps"] = copy["steps"]
    sheet = sheet or {}
    digits = lambda s: re.sub(r"\D", "", s or "")[-10:]
    lines = sheet.get("phones") or []
    if any(digits(p["number"]) != digits(phone) for p in lines):
        out = []
        for p in lines:
            label = p.get("label") or ("Main" if digits(p["number"]) == digits(phone) else "Phone")
            if SPANISH.match(label):
                label = "Español"
            out.append({"label": compose.title_case(label) if label.islower() else label, "number": p["number"]})
        # The listing's own number is always one of them.
        if not any(digits(p["number"]) == digits(phone) for p in out):
            out.insert(0, {"label": "Main", "number": phone})
        brand["phones"] = out[:4]
        # The listing's number is the one a customer is shown first, unless their
        # own site says it is the line for job seekers or a fax: then the first
        # line their site gives customers leads, and the listing's stays below it
        # under its own label.
        listed = next((p for p in brand["phones"] if digits(p["number"]) == digits(phone)), None)
        if listed and compose.NOT_A_CUSTOMER_LINE.search(listed["label"]):
            main = next((p for p in brand["phones"] if not compose.NOT_A_CUSTOMER_LINE.search(p["label"])), None)
            if main:
                brand["phone"] = main["number"]
    spoken = []
    for item in sheet.get("languages") or []:
        language = "Spanish" if SPANISH.match(item["language"].strip()) else compose.title_case(item["language"].strip())
        if language not in spoken:
            spoken.append(language)
    if any(l != "English" for l in spoken):
        # Their site is written in English, so English is one of them.
        brand["languages"] = list(dict.fromkeys(["English"] + spoken))
    reviews = [{**r, "text": compose.unemoji(r["text"])} for r in google]
    for t in sheet.get("testimonials") or []:
        if len(reviews) >= facts.REVIEWS_SHOWN:
            break
        if len(t["text"]) <= 600:
            reviews.append({"author": t.get("author") or "", "text": compose.unemoji(t["text"]), "source": "their site"})
    if reviews:
        brand["reviews"] = [{k: v for k, v in r.items() if v not in ("", None)} for r in reviews]
    credentials = []
    for c in sheet.get("credentials") or []:
        said = f"{c['label']} {c.get('detail') or ''}"
        if compose.SPONSORSHIP.search(said) or (template != "professional" and compose.BONDER.search(said)):
            continue
        entry = {"label": c["label"]}
        # A detail that only says how their site shows it ("Shown as a badge
        # on our website") is left out, and the name stands alone.
        if c.get("detail") and facts.normal(c["detail"]) != facts.normal(c["label"]) and not compose.SITE_SHOWN.search(c["detail"]):
            # Their words are put right as a description's are ("workman's
            # comp", which reads as cut off, is said in full).
            entry["detail"] = c["detail"]
            for wrong, right in compose.MISSPELT.items():
                entry["detail"] = re.sub(wrong, right, entry["detail"])
            # A short detail that says the name again inside it ("Certified in
            # 3-A & FDA Weld Specs" under "3-A & FDA Weld Specs") is the name
            # said in full, so it stands as the name, alone.
            if facts.normal(c["label"]) in facts.normal(entry["detail"]) and len(entry["detail"]) <= 60 and not re.search(r"[.!?;]\s", entry["detail"]):
                entry = {"label": entry["detail"].rstrip(".")}
        if entry not in credentials:
            credentials.append(entry)
    if credentials:
        brand["credentials"] = credentials[:8]
    owner = next((p for p in sheet.get("people") or [] if p.get("owner")), None)
    # A practice's owner stands as "Meet the doctor": one who is not a doctor
    # (a managing partner) gives way to the doctor their site names.
    if template == "health" and owner and not DOCTOR(owner):
        owner = next((p for p in sheet.get("people") or [] if DOCTOR(p)), owner)
    if owner:
        block = {"name": owner["name"]}
        if owner.get("role"):
            block["role"] = owner["role"]
        if owner.get("bio"):
            told = []
            for sentence in compose.sentences(owner["bio"]):
                if len(" ".join(told + [sentence])) > 300:
                    break
                told.append(sentence)
            if told:
                block["text"] = " ".join(told)
        brand["owner"] = block
    # Who they work for says something of an industrial firm; of a
    # landscaper it only says "homes and businesses".
    # One named as a sector ("Energy industry") is the sector's name, and one
    # of two sectors said as one ("Petrochemical and maritime industry") is
    # the two by their own names; a trade that is one ("Oil and gas") stays.
    def sectors(name):
        bare = re.fullmatch(r"(?:the\s+)?(.+?)\s+(?:industry|industries|sectors?)", name, re.I)
        if not bare:
            return [name]
        parts = [p for p in re.split(r",\s*(?:and\s+)?|\s+(?:and|&)\s+", bare.group(1)) if p]
        if len(parts) < 2 or not all(re.fullmatch(r"[A-Za-z-]+(?:al|ic|ime|ine|ive)", p) for p in parts):
            parts = [bare.group(1)]
        return [p[:1].upper() + p[1:] for p in parts]
    industries = list(dict.fromkeys(n for i in sheet.get("industries") or [] for n in sectors(compose.plain(i["name"]))))
    if industries and template == "industrial":
        brand["industries"] = industries[:10]
    states = list(dict.fromkeys(compose.plain(s["name"]) for s in sheet.get("states") or []))
    home = compose.STATES.get(state or "")
    if len(states) >= 2 or (states and (states != [home] or template == "industrial")):
        brand["statesServed"] = states[:12]


def _keep_evidence(root, slug, evidence, dropped):
    """What the copy was written and proved from, beside the checkout, for a
    person reading why the preview says what it says (.autobuild is ignored by git)."""
    folder = os.path.join(root, ".autobuild", "facts")
    try:
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, f"{slug}.json"), "w") as handle:
            json.dump({**{k: v for k, v in evidence.items() if k not in ("text", "pages")}, "copy_dropped": dropped,
                       "pages": list((evidence.get("pages") or {}).keys())}, handle, indent=1, ensure_ascii=False, default=str)
    except OSError:
        pass
