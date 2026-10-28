"""Builds one prospect's brand file and pictures in a checkout.

    build(prospect, root) -> (brand, evidence)   or raises Parked(reason)

`prospect` is a row from preview_candidates. The phone, address, rating and
review count come from that row, which was filled from the Google listing when
the prospect was found, so no Google API is asked anything here. Everything
else comes from the business's own website. `evidence` is what the checks
prove the brand against: the stored listing values and the text of the
business's own pages.

No review is quoted. Nothing stored holds review text, and a review read from
anywhere but its source cannot be proved word for word, so the page shows the
stored rating and count alone, which is true.
"""

import colorsys
import glob
import json
import os
import re
import shutil
import tempfile

from PIL import Image

from . import collect, compose, images, logo, quality, vision

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
    with open(os.path.join(root, "src", "brands", f"sample-{template}.json")) as handle:
        return json.load(handle)


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
        try:
            data = value.encode() if kind == "svg" else collect.fetch(value, binary=True)[1]
            image = images.open_image(data)
        except Exception:
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


def _photo_candidates(pages, logo_src):
    urls = []
    for page in pages:
        og = page.meta.get("og:image")
        for img in page.images:
            text = img["hint"] + " " + img["alt"].lower() + " " + img["src"].lower()
            if img["src"] == logo_src or SKIP_PHOTO.search(text):
                continue
            urls.append(img["src"])
        if og and not SKIP_PHOTO.search(og.lower()):
            urls.append(og)
    return list(dict.fromkeys(urls))


_shown = None


def _shown_elsewhere(root, slug):
    """The fingerprint of every photo already on another business's preview."""
    global _shown
    if _shown is None:
        _shown = []
        for path in glob.glob(os.path.join(root, "public", "brands", "*", "*-800.webp")):
            try:
                with Image.open(path) as image:
                    _shown.append((path.replace(os.sep, "/"), images.ahash(image)))
            except Exception:
                continue
    return [h for path, h in _shown if f"/brands/{slug}/" not in path]


def _photos(pages, logo_src, logo_image, scratch, notes, root, slug):
    """Their own photos, each judged by its pixels and then by the look, best first.

    Returns [{"image", "source", "metrics", "score", "look"}] of the photos
    worth showing, the strongest first. Anything blurry, enlarged, crushed by
    compression, flat like a graphic, a cut-out, a duplicate or the logo again
    is left out, as is anything the vision check refuses.
    """
    logo_prints = quality.fingerprints(logo_image.convert("RGB")) if logo_image is not None else None
    shown = _shown_elsewhere(root, slug)
    kept, refused = [], []
    for url in _photo_candidates(pages, logo_src)[:PHOTO_DOWNLOADS]:
        try:
            image = images.trimmed(images.open_image(collect.fetch(url, binary=True)[1]))
        except Exception:
            continue
        if image.width < 700 or image.height < 400:
            continue
        m = quality.metrics(image)
        why = quality.problems(m)
        if why:
            refused.append(f"{url.rsplit('/', 1)[-1][:40]}: {why[0]}")
            continue
        stamp = images.ahash(image)
        # A stock photo another preview already shows. The check allows two
        # bits between the saved files; the source before saving drifts a
        # little further, so this is looser to stay ahead of it.
        if any(images.distance(stamp, h) <= 4 for h in shown):
            refused.append(f"{url.rsplit('/', 1)[-1][:40]}: already on another preview")
            continue
        prints = quality.fingerprints(image.convert("RGB"))
        if logo_prints and quality.same_picture(prints, logo_prints, limit=8):
            continue
        twin = next((k for k in kept if quality.same_picture(prints, k["prints"])), None)
        item = {"image": image, "source": url, "metrics": m, "score": quality.score(m), "prints": prints, "look": None}
        if twin:
            if item["score"] > twin["score"]:
                kept[kept.index(twin)] = item
            continue
        kept.append(item)
    if kept and vision.available():
        paths = []
        for i, item in enumerate(kept):
            path = os.path.join(scratch, f"candidate-{i:02d}.png")
            copy = item["image"].convert("RGB")
            copy.thumbnail((1400, 1400))
            copy.save(path)
            paths.append(path)
        looks = vision.screen_photos(paths)
        if looks is None:
            notes.append(f"the photos were not looked at: {vision.last_error}")
        else:
            for item, path in zip(list(kept), paths):
                item["look"] = looks.get(path)
                if not item["look"] or not item["look"]["ok"]:
                    refused.append(f"{item['source'].rsplit('/', 1)[-1][:40]}: {(item['look'] or {}).get('why', 'no verdict')}")
                    kept.remove(item)
    # The look's score leads; the pixels break ties.
    kept.sort(key=lambda k: ((k["look"] or {}).get("score", 3), k["score"]), reverse=True)
    return kept, refused


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


def _own_words(title, services):
    """The words of a service's name no other service's name has, as plain lowercase."""
    others = {w for s in services if s["title"] != title for w in re.findall(r"[a-z]+", s["title"].lower())}
    return [w for w in re.findall(r"[a-z]+", title.lower()) if len(w) >= 4 and w not in others and w not in JOB_WORDS]


def _said(item):
    """What is known of a photo's subject in words: its file name and the look's few words on it."""
    name = item["source"].rsplit("/", 1)[-1].rsplit(".", 1)[0]
    return re.sub(r"[_\W\d]+", " ", f"{name} {(item['look'] or {}).get('why', '')}").lower()


def build(prospect, root, slug):
    template = prospect["industry"]
    if template not in compose.AUTOMATED:
        raise Parked(f"no automatic build for the {template} template yet")
    try:
        pages = collect.site(prospect["website"])
    except Exception as error:
        raise Parked(f"their website did not load: {str(error)[:120]}")
    business = collect.jsonld_business(pages)
    text = compose.page_text(pages)
    css = collect.css_text(pages)
    sample = _sample(root, template)

    name = compose.plain(prospect["name"])
    short = compose.short_name(name)
    phone = compose.plain(prospect.get("phone"))
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
        colors = compose.colors_of(inks, css, template)
        if not colors:
            raise Parked("no brand color in the logo or the site's stylesheet")
        photos, refused = _photos(pages, logo_src, logo_raw, scratch, notes, root, slug)
    finally:
        shutil.rmtree(scratch, ignore_errors=True)

    # The hero takes the strongest photo wide and sharp enough for it; the
    # rest go where a card-sized picture is drawn. Too few good ones and the
    # page is drawn without them rather than with weak ones.
    hero_pick = next((p for p in photos if _fits(p, "hero")), None)
    cards = [p for p in photos if p is not hero_pick and _fits(p, "card")][:5]
    names = []
    for i, item in enumerate(([hero_pick] if hero_pick else []) + cards, 1):
        images.save_photo(item["image"], folder, f"photo{i}")
        names.append((f"/brands/{slug}/photo{i}", item))
        if _shown is not None:
            # Taken now, so the next business in the same run cannot take it too.
            _shown.append((os.path.join(folder, f"photo{i}-800.webp").replace(os.sep, "/"), images.ahash(item["image"])))
    hero_image = names[0][0] if hero_pick else None
    spare = [n for n, _ in (names[1:] if hero_pick else names)]

    kind = compose.KIND.get(prospect["trade"])
    vocab_key = kind or template
    services = compose.services_of(pages, compose.VOCAB[vocab_key], name, town, described_first=template == "hvac", towns=TOWNS)
    if len(services) < 2:
        raise Parked("fewer than two services named on their website")
    if template == "professional":
        # Where most services are described the grid draws cards with their
        # words, so a service named alone is left out rather than drawn as a
        # card and a page with nothing in them; where most are named alone
        # the grid draws them all as a list of links.
        described = [s for s in services if s["text"]]
        if len(described) * 2 > len(services):
            services = described
    about = compose.about_of(pages, name, vocab_key, services, town, state, TOWNS)
    lead, lead_source = compose.lead_of(pages, about, vocab_key, services, town, state, TOWNS)
    if not lead:
        raise Parked("no description of the business in its own words")
    areas = compose.areas_of(text, town, TOWNS)
    # The year they were founded is the earliest they give; a later one
    # ("Since 2023") dates something newer, such as a move or a new service.
    since = min((int(m.group(1)) for m in compose.SINCE.finditer(text)), default=None)
    license_line = compose.LICENSE.search(text)

    label = compose.TRADE_LABEL[kind or template]
    main = services[0]["title"]
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

    brand["brand"] = {
        **colors,
        **compose.font_block(compose.fonts_of(css), sample),
        **logo_fields,
    }
    brand["hero"] = {
        "eyebrow": f"{label} in {town}",
        "title": short,
        "lead": lead,
    }
    if hero_image:
        brand["hero"]["image"] = hero_image
        brand["hero"]["imageAlt"] = f"A photo of {short}"
    line = compose.hero_line(services, town, label, vocab_key, short)
    if template in ("roofing", "hvac"):
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

    # The about section is drawn on the home page under the hero, so it takes
    # the first spare photo that is not another shot of the hero's scene.
    # The roofing About page also draws it as its hero, across half the page,
    # so there it must be sharp enough for the hero slot, not just a card.
    pictures = dict(names)
    about_image = next((n for n in spare if not (hero_pick and images.same_scene(pictures[n]["image"], hero_pick["image"]))
                        and (template != "roofing" or _fits(pictures[n], "hero"))), None)

    def about_block(**extra):
        block = {**extra, "title": f"About {short}", "text": about}
        if about_image:
            block["image"] = about_image
            block["imageAlt"] = f"A photo of {short}"
        return block

    if template == "professional":
        brand["kind"] = kind
        items = []
        for s in services:
            icon = next((k for k, p in compose.ICONS.get(kind) or compose.ICONS["professional"] if re.search(p, s["title"], re.I)), None)
            item = {"slug": compose.slugify(s["title"]), "title": s["title"], "summary": compose.gist(s["text"], 50), "text": compose.gist(s["text"], 170)}
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

    elif template == "roofing":
        # A service page leads on the service's text under its heading, so its
        # body carries only the sentences that text has not already said.
        def untold(text):
            return " ".join(compose.sentences(text)[len(compose.sentences(compose.trim(text, 170))):])
        brand["services"] = [
            {"slug": compose.slugify(s["title"]), "title": s["title"],
             **({"group": group} if (group := next((k for k, p in compose.ROOF_GROUPS if re.search(p, s["title"], re.I)), None)) else {}),
             "short": compose.trim(s["text"], 70) or s["title"], "text": compose.trim(s["text"], 170) or "",
             **({"body": [rest]} if (rest := untold(s["text"])) else {})}
            for s in services
        ]
        if not about:
            raise Parked("no about text on their website")
        brand["about"] = about_block()

    elif template == "hvac":
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
            group = {"slug": compose.slugify(s["title"]), "title": s["title"], "icon": icon, "summary": compose.card_line(s["text"], 140) or s["text"], "intro": s["text"]}
            if s["title"] in named or (wide and (not trade or re.search(trade, s["title"], re.I))):
                group["image"] = named.get(s["title"]) or wide.pop(0)
                group["imageAlt"] = f"A photo of {short}"
            groups.append(group)
        if len(groups) < 2:
            raise Parked("fewer than two services described on their website")
        # The services heading's line names the services and the towns; the
        # lead, their description of themselves, is the hero's alone.
        brand["summary"] = compose.summary_line(groups, short, areas or [town])
        brand["groups"] = groups
        if about:
            brand["about"] = about_block(eyebrow="About us")

    evidence = {
        "phone": phone,
        "address": street,
        "rating": rating,
        "reviewCount": count,
        "lead_source": lead_source,
        "text": text,
        "photos": [item["source"] for _, item in names],
        "photo_looks": {path: (item["look"] or {}).get("why") for path, item in names},
        "photos_refused": refused,
        "logo_source": logo_src,
        "notes": notes,
    }
    with open(os.path.join(root, "src", "brands", f"{slug}.json"), "w") as handle:
        json.dump(brand, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    return brand, evidence
