"""What is real about one business, read from its own website.

The Google listing's phone, address, rating and review count were stored on the
prospect when it was found, so nothing here asks Google. Anything not found
stays empty; nothing is guessed and nothing is borrowed from another business.
"""

import os

# See __main__.py: no proxy lookup, so a later fork on a Mac does not crash.
os.environ.setdefault("no_proxy", "*")

import html
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
SKIP_LINK = re.compile(r"(blog|news|privacy|terms|login|cart|careers|jobs|wp-admin|feed|\.pdf$|\.jpg$|\.png$|mailto:|tel:)", re.I)


def fetch(url, timeout=20, binary=False):
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        data = response.read(PAGE_LIMIT)
        if binary:
            return response.geturl(), data, response.headers.get("Content-Type", "")
        charset = response.headers.get_content_charset() or "utf-8"
        return response.geturl(), data.decode(charset, errors="replace")



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
            src = a.get("src") or a.get("data-src") or a.get("data-lazy-src") or ""
            srcset = a.get("srcset") or a.get("data-srcset") or ""
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


def read_page(url):
    final, text = fetch(url)
    page = Page(final)
    try:
        page.feed(text)
    except Exception:
        pass
    page.title = _title(text)
    page.svgs = inline_svgs(text)
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


def site(website):
    """Reads the home page and the pages it links to that a brand is made from."""
    home = read_page(website)
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
