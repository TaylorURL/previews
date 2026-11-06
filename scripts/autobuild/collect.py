"""What is real about one business, read from its own website.

The Google listing's phone, address, rating and review count were stored on the
prospect when it was found, so nothing here asks Google. Anything not found
stays empty; nothing is guessed and nothing is borrowed from another business.
"""

import os

# See __main__.py: no proxy lookup, so a later fork on a Mac does not crash.
os.environ.setdefault("no_proxy", "*")

import html
import http.cookiejar
import json
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

UA = "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
PAGE_LIMIT = 2_500_000
MAX_PAGES = 8
# The pages a copy of their site keeps for the session that finishes a
# parked business: every page the home page links to on their own site.
COPY_PAGES = 30
# Less readable text than this on the home page is a page drawn by script,
# which is read again through a browser.
SHELL_TEXT = 400

# The pages worth reading beyond the home page, by what their link says.
WANTED = re.compile(
    r"\b(about|our story|who we are|services?|what we do|contact|areas?|locations?|team|staff|"
    r"insurance|tax|accounting|bookkeeping|roof|repair|replacement|heating|cooling|air|hvac|electrical|"
    r"commercial|residential|title|closing|escrow)\b",
    re.I,
)
# Pages read for the fact sheet alone, after those a brand is made from: what
# customers say on their site, how the work goes, who does it. The regex
# readers in compose.py never see them (page.extra), so they change nothing
# of what those find.
MORE = re.compile(r"\b(testimonials?|reviews?|why (?:us|choose)|process|how it works|what to expect|faqs?|meet|"
                  r"team|our story|history|credentials|certifications?|industries|capabilities|equipment)\b", re.I)
EXTRA_PAGES = 3
SKIP_LINK = re.compile(r"(blog|news|privacy|terms|login|cart|careers|jobs|wp-admin|feed|\.pdf$|\.jpg$|\.png$|mailto:|tel:)", re.I)


# A picture can be far bigger than a page: a photo straight off a phone
# (fetch(url, binary=True, limit=IMAGE_LIMIT)).
IMAGE_LIMIT = 16_000_000
# The most redirects one address may take before it counts as not loading.
REDIRECTS = 10


HEADERS = {"User-Agent": UA, "Accept-Language": "en-US,en"}


class Redirects(urllib.request.HTTPRedirectHandler):
    """Every redirect a browser follows, 307 and 308 included, each hop
    carrying the cookies the hops before it set. A host that answers with a
    307 back to the same address until a cookie is set (a bot check) would
    otherwise look like a loop."""

    max_redirections = REDIRECTS
    # The same address may come round again once its cookie is set.
    max_repeats = 4

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if code in (307, 308) and req.get_method() in ("GET", "HEAD"):
            # Older Pythons refuse to follow these for any method; a GET is safe to repeat.
            newurl = newurl.replace(" ", "%20")
            return urllib.request.Request(newurl, headers={k: v for k, v in req.headers.items()
                                                           if k.lower() not in ("content-length", "content-type")},
                                          origin_req_host=req.origin_req_host, unverifiable=True)
        return super().redirect_request(req, fp, code, msg, headers, newurl)

    http_error_307 = urllib.request.HTTPRedirectHandler.http_error_302
    http_error_308 = urllib.request.HTTPRedirectHandler.http_error_302


def _opener():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()), Redirects())


def fetch(url, timeout=20, binary=False, limit=PAGE_LIMIT):
    try:
        response = _opener().open(urllib.request.Request(url, headers=HEADERS), timeout=timeout)
    except urllib.error.HTTPError as error:
        if error.code not in (301, 302, 303, 307, 308):
            raise
        # A redirect the handler gave up on (a loop it could not break with
        # cookies) is tried once more from where it pointed, afresh. One that
        # points nowhere is a page that moves on by script (a host's bot check
        # answering plain http with a 307 and no Location); the same address
        # over https is what it moves on to.
        target = error.headers.get("Location") if error.headers else None
        if target:
            target = urllib.parse.urljoin(url, target)
        elif url.startswith("http://"):
            target = "https://" + url[len("http://"):]
        else:
            raise
        response = _opener().open(urllib.request.Request(target, headers=HEADERS), timeout=timeout)
    with response:
        data = response.read(limit)
        if binary:
            return response.geturl(), data, response.headers.get("Content-Type", "")
        charset = response.headers.get_content_charset() or "utf-8"
        return response.geturl(), data.decode(charset, errors="replace")


# Image services that resize a picture to the size the address asks for,
# and how to ask each for a large one: GoDaddy's builder (img1.wsimg.com,
# "/:/rs=w:365,h:365,cg:true" after the file), Wix ("/v1/fill/w_365,h_365,.../"),
# Squarespace ("?format=500w"), Duda ("-640w.jpg"), and WordPress's own
# smaller copies ("photo-768x512.jpg" beside "photo.jpg").
LARGE = 2000


def bigger(url):
    """The addresses of the same picture at a large size, the largest first,
    the address itself last; just the address for any other host."""
    out = []
    parts = urllib.parse.urlsplit(url)
    host, path = parts.netloc.lower(), parts.path
    if host.endswith("wsimg.com") and "/:/" in path:
        # The crop is the page's frame for it (a square tile); the photo is the whole picture.
        out.append(urllib.parse.urlunsplit(parts._replace(path=path.split("/:/")[0] + f"/:/rs=w:{LARGE},m", query="")))
    elif host.endswith("wixstatic.com") and "/v1/" in path:
        base, _, rest = path.partition("/v1/")
        name = rest.rsplit("/", 1)[-1]
        out.append(urllib.parse.urlunsplit(parts._replace(path=f"{base}/v1/fit/w_{LARGE},h_{LARGE},q_90/{name}", query="")))
    elif "squarespace-cdn.com" in host or "sqspcdn.com" in host:
        query = [(k, v) for k, v in urllib.parse.parse_qsl(parts.query) if k != "format"]
        out.append(urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(query + [("format", "2500w")]))))
    elif "cdn-website.com" in host and re.search(r"-\d{2,4}w(\.\w+)$", path):
        out.append(urllib.parse.urlunsplit(parts._replace(path=re.sub(r"-\d{2,4}w(\.\w+)$", r"-1920w\1", path).replace("/opt/", "/"))))
    elif re.search(r"-\d{2,4}x\d{2,4}(\.(?:jpe?g|png|webp))$", path, re.I) and "/wp-content/" in path:
        out.append(urllib.parse.urlunsplit(parts._replace(path=re.sub(r"-\d{2,4}x\d{2,4}(\.\w+)$", r"\1", path))))
    out.append(url)
    return list(dict.fromkeys(out))



def parse_srcset(value):
    """[(url, descriptor)] from a srcset. A URL runs to the next space, so one
    with commas in it (an image service's resize options) stays whole."""
    out, i, n = [], 0, len(value)
    while i < n:
        while i < n and (value[i].isspace() or value[i] == ","):
            i += 1
        j = i
        while j < n and not value[j].isspace():
            j += 1
        url, i = value[i:j], j
        if url.endswith(","):
            url, descriptor = url.rstrip(","), ""
        else:
            k = value.find(",", i)
            k = n if k < 0 else k
            descriptor, i = value[i:k].strip(), k + 1
        if url:
            out.append((url, descriptor))
    return out

LAZY_SRC = ("data-src", "data-lazy-src", "data-srclazy", "data-original", "data-orig-src", "data-lazy")
LAZY_SET = ("data-srcset", "data-lazy-srcset", "data-srcsetlazy")
# What a lazy loader's attribute holds when it holds a picture's address,
# not a flag ("true") or a setting.
PICTURE_ADDRESS = re.compile(r"^(?:https?:)?/?/?[^\s\"'<>]*[/.][^\s\"'<>]*$", re.I)


class Page(HTMLParser):
    """The parts of one page a brand is made from."""

    BLOCK = {"p", "li", "h1", "h2", "h3", "h4", "h5", "td", "dd", "dt", "address", "blockquote", "figcaption"}

    def __init__(self, url):
        super().__init__(convert_charrefs=True)
        self.url = url
        self.title = ""
        self.meta = {}
        self.jsonld = []
        self.links = []
        self.images = []
        self.blocks = []  # (tag, text, in_header)
        self.styles = []
        self.stylesheets = []
        self.icons = []
        self._stack = []
        self._text = []
        self._script = None
        self._style = False
        self._link = None
        self._edge = False
        self._header = 0
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        a = {k: (v or "") for k, v in attrs}
        if tag in ("header", "nav") or "header" in a.get("class", "").lower().split():
            self._header += 1
            self._stack.append(("hdr", tag))
        if tag in ("footer", "form", "noscript", "svg"):
            self._skip += 1
            self._stack.append(("skip", tag))
        if tag == "script":
            self._script = [] if "ld+json" in a.get("type", "") else None
            self._style = False
        elif tag == "style":
            self._style = True
        elif tag == "meta":
            key = (a.get("property") or a.get("name") or "").lower()
            if key:
                self.meta[key] = a.get("content", "")
        elif tag == "link":
            rel = a.get("rel", "").lower()
            if "stylesheet" in rel and a.get("href"):
                self.stylesheets.append(urllib.parse.urljoin(self.url, a["href"]))
            if "icon" in rel and a.get("href"):
                self.icons.append((a.get("sizes", ""), urllib.parse.urljoin(self.url, a["href"])))
        elif tag == "a":
            self._link = [a.get("href", ""), []]
            self._edge = True
        elif tag == "img":
            # A lazy loader keeps the real picture in a data- attribute and a
            # placeholder in src until the page is scrolled to it.
            lazy = next((a[k].strip() for k in LAZY_SRC if PICTURE_ADDRESS.match(a.get(k, "").strip())
                         and not a[k].strip().startswith("data:")), "")
            src = lazy or a.get("src") or ""
            srcset = a.get("srcset") or next((a[k] for k in LAZY_SET if a.get(k)), "")
            if srcset:
                best = sorted(parse_srcset(srcset), key=lambda c: float(re.sub(r"[^\d.]", "", c[1]) or 0))
                if best:
                    src = best[-1][0]
            if src and not src.startswith("data:"):
                self.images.append({
                    "src": urllib.parse.urljoin(self.url, src),
                    "alt": a.get("alt", ""),
                    "hint": " ".join([a.get("class", ""), a.get("id", ""), a.get("data-aid", ""), a.get("data-ux", ""),
                                      src.rsplit("/", 1)[-1]]).lower(),
                    "header": self._header > 0,
                    "width": int(re.sub(r"\D", "", a.get("width", "")) or 0),
                })
        if tag in self.BLOCK:
            self._text = []
        elif tag in ("br", "div"):
            # A heading their page sets on two lines ("Residential<br>Chain
            # Link Fencing") is two words, not one run together.
            self.handle_data(" ")
        if a.get("style"):
            self.styles.append(a["style"])

    def handle_endtag(self, tag):
        if tag == "script" and self._script is not None:
            raw = "".join(self._script).strip()
            try:
                self.jsonld.append(json.loads(raw))
            except ValueError:
                pass
            self._script = None
        if tag == "style":
            self._style = False
        if tag == "a" and self._link:
            self.links.append((self._link[0], " ".join("".join(self._link[1]).split())))
            self._link = None
            self._edge = True
        if tag in self.BLOCK and not self._skip:
            text = " ".join("".join(self._text).split())
            if text:
                self.blocks.append((tag, text, self._header > 0))
            self._text = []
        if self._stack and self._stack[-1][1] == tag:
            kind, _ = self._stack.pop()
            if kind == "hdr":
                self._header -= 1
            else:
                self._skip -= 1

    def handle_data(self, data):
        if self._script is not None:
            self._script.append(data)
            return
        if self._style:
            self.styles.append(data)
            return
        # Text split by a tag, a lowercase word on one side and a capital on
        # the other ("Outdoor Lighting for<span>Houston Homes</span>" set on
        # two lines by their stylesheet), is two words, not one run together.
        if self._text and re.search(r"[a-z]$", self._text[-1]) and re.match(r"[A-Z]", data):
            data = " " + data
        # So is text running straight into or out of a link ("contact
        # <a>us</a>today"): a link is its own word or words, not half of one.
        # An address their link cut short ("<a>sales@jrhengineering.ne</a>t")
        # is still one address, and runs on.
        elif self._edge and self._text and re.search(r"[A-Za-z]$", self._text[-1]) and re.match(r"[A-Za-z]", data) \
                and not re.search(r"\w[@.][\w.-]*$", "".join(self._text)):
            data = " " + data
        self._edge = False
        if self._link is not None:
            self._link[1].append(data)
        self._text.append(data)
        if not self.title and self._stack == [] and False:
            pass

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)


def _title(html_text):
    m = re.search(r"<title[^>]*>(.*?)</title>", html_text, re.S | re.I)
    return " ".join(html.unescape(m.group(1)).split()) if m else ""


# An SVG drawn inline in the page's header, or just inside anything named a
# logo: many sites draw their logo this way and never as a file.
HEADER = re.compile(r"<header\b[\s\S]*?</header>", re.I)
LOGO_TAG = re.compile(r"<(?:a|div|span|figure)\b[^>]*(?:class|id)=[\"'][^\"']*logo[^\"']*[\"'][^>]*>", re.I)
SVG = re.compile(r"<svg\b[\s\S]*?</svg>", re.I)


def inline_svgs(text):
    found = []
    for tag in LOGO_TAG.finditer(text):
        near = text.find("<svg", tag.end(), tag.end() + 400)
        if near >= 0:
            m = SVG.match(text, near)
            if m:
                found.append(m.group(0))
    header = HEADER.search(text)
    if header:
        found.extend(SVG.findall(header.group(0))[:2])
    # A real mark carries some drawing; an icon is a line or two.
    out = []
    for svg in found:
        if len(svg) >= 600 and svg not in out:
            out.append(svg)
    return out[:3]


def read_page(url, text=None):
    """One page, fetched, or from `text` already read (the home page as a
    browser drew it)."""
    final = url
    if text is None:
        final, text = fetch(url)
    page = Page(final)
    try:
        page.feed(text)
    except Exception:
        pass
    page.title = _title(text)
    page.svgs = inline_svgs(text)
    # Every line a customer reads on it, footer and forms' labels included,
    # headings marked "#" and list items "-": what the fact sheet is read
    # from and proved against (facts.py).
    page.lines = readable(text).lines
    return page


def _things(node):
    """Every schema.org object in a JSON-LD block, flattened."""
    if isinstance(node, list):
        for item in node:
            yield from _things(item)
    elif isinstance(node, dict):
        yield node
        for key in ("@graph", "mainEntity", "itemListElement"):
            if key in node:
                yield from _things(node[key])


# The title of a host's bot check rather than of their page.
CHALLENGE = re.compile(r"just a moment|attention required|access denied|checking your browser|verify you are human|"
                       r"you are being redirected|forbidden|not found", re.I)


def site(website):
    """Reads the home page and the pages it links to that a brand is made from."""
    try:
        home = read_page(website)
    except urllib.error.HTTPError as error:
        # A host whose bot check a plain fetch cannot pass (a script that sets
        # a cookie and reloads) lets a browser through. A page the browser
        # still finds the check on, or next to nothing on, did not load.
        drawn = rendered(website) if error.code in (301, 302, 303, 307, 308, 403, 429, 503) else None
        if not drawn or len("".join(readable(drawn).lines)) < SHELL_TEXT or CHALLENGE.search(_title(drawn)):
            raise
        home = read_page(website, drawn)
    host = urllib.parse.urlparse(home.url).netloc.replace("www.", "")
    pages = [home]
    seen = {home.url.rstrip("/")}
    for href, text in home.links:
        if len(pages) >= MAX_PAGES:
            break
        url = urllib.parse.urljoin(home.url, href).split("#")[0]
        if not url.startswith("http") or SKIP_LINK.search(url):
            continue
        if urllib.parse.urlparse(url).netloc.replace("www.", "") != host:
            continue
        if url.rstrip("/") in seen:
            continue
        if not (WANTED.search(text) or WANTED.search(urllib.parse.urlparse(url).path)):
            continue
        seen.add(url.rstrip("/"))
        try:
            pages.append(read_page(url))
        except Exception:
            continue
    extra = 0
    for href, text in home.links:
        if extra >= EXTRA_PAGES:
            break
        url = urllib.parse.urljoin(home.url, href).split("#")[0]
        if not url.startswith("http") or SKIP_LINK.search(url) or url.rstrip("/") in seen:
            continue
        if urllib.parse.urlparse(url).netloc.replace("www.", "") != host:
            continue
        if not (MORE.search(text) or MORE.search(urllib.parse.urlparse(url).path)):
            continue
        seen.add(url.rstrip("/"))
        try:
            page = read_page(url)
        except Exception:
            continue
        page.extra = True
        pages.append(page)
        extra += 1
    return pages


def css_text(pages, limit=4):
    """The site's own stylesheets, for its colors and type."""
    out = []
    for page in pages[:1]:
        out.extend(page.styles)
        for href in page.stylesheets[:limit]:
            if "fonts.googleapis" in href:
                out.append("@import " + href)
                continue
            try:
                out.append(fetch(href, timeout=15)[1])
            except Exception:
                continue
    return "\n".join(out)


def business_of(blocks):
    """The business's own description of itself among a page's structured data blocks, if any."""
    for block in blocks:
        for thing in _things(block):
            kind = thing.get("@type")
            kinds = kind if isinstance(kind, list) else [kind]
            if any(isinstance(k, str) and (k.endswith("Business") or k in (
                "Organization", "LocalBusiness", "RoofingContractor", "HVACBusiness", "Electrician",
                "Plumber", "InsuranceAgency", "AccountingService", "ProfessionalService",
                "HomeAndConstructionBusiness", "GeneralContractor", "LegalService", "FinancialService"))
                for k in kinds):
                return thing
    return {}


def jsonld_business(pages):
    """The business's own description of itself in structured data, if any."""
    for page in pages:
        found = business_of(page.jsonld)
        if found:
            return found
    return {}


class Readable(HTMLParser):
    """A page's words as a customer reads them, footer included, one line per
    block, headings marked as headings and list items as list items."""

    LINE = {"p", "div", "section", "article", "header", "footer", "nav", "main", "aside", "ul", "ol", "table", "tr",
            "td", "th", "dd", "dt", "address", "blockquote", "figcaption", "form", "label", "button", "br"}
    HEADING = {"h1", "h2", "h3", "h4", "h5", "h6"}
    HIDDEN = {"script", "style", "noscript", "svg", "template", "iframe", "title"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lines = []
        self.headings = []
        self.items = []
        self._now = []
        self._kind = None
        self._hidden = 0

    def _flush(self):
        text = " ".join("".join(self._now).split())
        if text:
            if self._kind in self.HEADING:
                self.lines.append("#" * int(self._kind[1]) + " " + text)
                self.headings.append(text)
            elif self._kind == "li":
                self.lines.append("- " + text)
                self.items.append(text)
            elif not self.lines or self.lines[-1] != text:
                self.lines.append(text)
        self._now = []
        self._kind = None

    def handle_starttag(self, tag, attrs):
        if tag in self.HIDDEN:
            self._hidden += 1
            return
        if tag in self.HEADING or tag == "li":
            self._flush()
            self._kind = tag
        elif tag in self.LINE:
            self._flush()
        elif tag in ("a", "span", "strong", "em", "b", "i"):
            self._now.append(" ")

    def handle_endtag(self, tag):
        if tag in self.HIDDEN:
            self._hidden = max(0, self._hidden - 1)
            return
        if tag in self.HEADING or tag == "li" or tag in self.LINE:
            self._flush()
        elif tag in ("a", "span", "strong", "em", "b", "i"):
            self._now.append(" ")

    def handle_data(self, data):
        if not self._hidden:
            self._now.append(data)

    def close(self):
        super().close()
        self._flush()


def readable(text):
    reader = Readable()
    try:
        reader.feed(text)
        reader.close()
    except Exception:
        pass
    return reader


def rendered(url):
    """The page as a browser draws it, for a site whose words are put on the
    page by script; None when no browser could open it."""
    here = os.path.dirname(os.path.abspath(__file__))
    try:
        done = subprocess.run(["node", os.path.join(here, "fetchpage.mjs"), url], capture_output=True, text=True,
                              timeout=90, stdin=subprocess.DEVNULL)
    except (OSError, subprocess.TimeoutExpired):
        return None
    return done.stdout if done.returncode == 0 and done.stdout.strip() else None


# How long the browser may spend drawing one business's pages for their
# photos, all its pages together; the Pi is a small machine.
DRAW_SECONDS = int(os.environ.get("PREVIEW_DRAW_SECONDS") or 75)
last_draw_error = None


def drawn_images(urls, seconds=None):
    """Every picture a browser shows on these pages of their site, the home
    page's first and each page's largest first, in the shape Page.images
    has, with "drawn" (its size on the page, [w, h]) and "kind" (img,
    srcset, lazy, picture, poster or background) beside it. [] when no
    browser could open them (why is in last_draw_error)."""
    global last_draw_error
    seconds = seconds or DRAW_SECONDS
    here = os.path.dirname(os.path.abspath(__file__))
    try:
        done = subprocess.run(["node", os.path.join(here, "photos.mjs"), str(seconds), *urls], capture_output=True,
                              text=True, timeout=seconds + 45, stdin=subprocess.DEVNULL)
        pages = json.loads(done.stdout or "[]")
    except (OSError, subprocess.TimeoutExpired, ValueError) as error:
        last_draw_error = f"{type(error).__name__}: {str(error)[:160]}"
        return []
    if done.returncode != 0 and not pages:
        last_draw_error = f"exit {done.returncode}: {done.stderr.strip()[-200:]}"
        return []
    last_draw_error = "; ".join(f"{p.get('url')}: {p.get('error')}" for p in pages if not p.get("ok"))[:300] or None
    out = []
    for page in pages:
        for img in page.get("images") or []:
            src = img.get("src") or ""
            if not src.startswith("http"):
                continue
            out.append({
                "src": src,
                "alt": img.get("alt") or "",
                "hint": " ".join([img.get("hint") or "", src.split("?")[0].rsplit("/", 1)[-1]]).lower(),
                "header": bool(img.get("header")),
                "width": int((img.get("natural") or [0])[0] or 0),
                "drawn": img.get("drawn") or [0, 0],
                "kind": img.get("kind") or "",
                "page": page.get("final") or page.get("url"),
            })
    return out


class NotAPage(Exception):
    """A link to a video, a document or a picture rather than a page."""


# Most of one page a copy keeps: a page longer than this is a list or a dump.
PAGE_TEXT = 40_000


def _copy_page(url, browser=False):
    """One page of their site: its words, headings, list items, links and pictures."""
    final, data, kind = fetch(url, binary=True)
    if kind and "html" not in kind.lower():
        raise NotAPage(kind)
    match = re.search(r"charset=([\w-]+)", kind or "")
    text = data.decode(match.group(1) if match else "utf-8", errors="replace")
    if browser:
        text = rendered(final) or text
    page = Page(final)
    try:
        page.feed(text)
    except Exception:
        pass
    words = readable(text)
    return {
        "url": final,
        "title": _title(text),
        "description": page.meta.get("description") or page.meta.get("og:description") or "",
        "text": "\n".join(words.lines)[:PAGE_TEXT],
        "headings": words.headings,
        "items": words.items,
        "links": [[urllib.parse.urljoin(final, href), label] for href, label in page.links if href and not href.startswith("#")],
        "images": [{k: img[k] for k in ("src", "alt", "header", "width")} for img in page.images],
        "jsonld": page.jsonld,
    }


MEDIA = re.compile(r"\.(mp4|mov|webm|m4v|mp3|wav|zip|docx?|xlsx?|pptx?|jpe?g|png|gif|webp|svg|pdf)$", re.I)
SOCIAL = re.compile(r"facebook\.com|instagram\.com|twitter\.com|x\.com/|linkedin\.com|youtube\.com|tiktok\.com|"
                    r"nextdoor\.com|yelp\.com|google\.com/maps|g\.page|maps\.app\.goo\.gl|pinterest\.com|houzz\.com|"
                    r"angi\.com|homeadvisor\.com|bbb\.org|thumbtack\.com", re.I)


def copy(website):
    """A copy of their site for whoever finishes the preview by hand: the home
    page and every page it links to on their own site, each as its words,
    headings, list items, links and pictures. {"pages": [...], "business": {...}}."""
    home = _copy_page(website)
    browser = len(home["text"]) < SHELL_TEXT
    if browser:
        home = _copy_page(website, browser=True)
    host = urllib.parse.urlparse(home["url"]).netloc.replace("www.", "")
    pages, seen = [home], {home["url"].rstrip("/")}
    for href, _ in home["links"]:
        if len(pages) >= COPY_PAGES:
            break
        url = href.split("#")[0]
        if not url.startswith("http") or SKIP_LINK.search(url) or MEDIA.search(urllib.parse.urlparse(url).path):
            continue
        if urllib.parse.urlparse(url).netloc.replace("www.", "") != host or url.rstrip("/") in seen:
            continue
        seen.add(url.rstrip("/"))
        try:
            pages.append(_copy_page(url, browser=browser))
        except Exception:
            continue
    business = next((found for page in pages if (found := business_of(page["jsonld"]))), {})
    return {"pages": pages, "business": business, "rendered": browser}


def copy_markdown(site):
    """The copy as one document to read top to bottom."""
    out = []
    first = site["pages"][0] if site["pages"] else {}
    out.append(f"# Their website: {first.get('url', '')}")
    if site.get("rendered"):
        out.append("(Their pages are drawn by script; this copy was read through a browser.)")
    off = sorted({href for page in site["pages"] for href, _ in page["links"] if SOCIAL.search(href)})
    if off:
        out.append("\nTheir profiles elsewhere:\n" + "\n".join(f"- {href}" for href in off))
    if site.get("business"):
        out.append("\nTheir own structured data:\n" + json.dumps(site["business"], indent=1, ensure_ascii=False)[:3000])
    out.append("\nPages in this copy:\n" + "\n".join(f"- {p['url']} ({p['title']})" for p in site["pages"]))
    for page in site["pages"]:
        out.append(f"\n\n---\n## PAGE {page['url']}\nTitle: {page['title']}")
        if page["description"]:
            out.append(f"Description: {page['description']}")
        out.append("")
        out.append(page["text"])
        pictures = [img for img in page["images"] if not img["src"].startswith("data:")]
        if pictures:
            out.append("\nPictures on this page:")
            out.extend(f"- {img['src']}" + (f" (alt: {img['alt']})" if img["alt"] else "")
                       + (" [header]" if img["header"] else "") for img in pictures[:40])
    return "\n".join(out) + "\n"
