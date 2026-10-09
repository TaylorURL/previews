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
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

UA = "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
PAGE_LIMIT = 2_500_000
MAX_PAGES = 8

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


def jsonld_business(pages):
    """The business's own description of itself in structured data, if any."""
    for page in pages:
        for block in page.jsonld:
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
