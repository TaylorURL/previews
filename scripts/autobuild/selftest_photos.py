"""python3 -m scripts.autobuild.selftest_photos

Proves, with no website and no model asked, the parts of the photo search and
the fact checks that decide what a preview shows: the large sizes asked of
image services, the lazy loaders' attributes, redirects a browser follows
(307 and 308, a 307 back to itself until a cookie is set), a site that sends
its visitors to an address with the port written in still counting as itself,
the hero's shapes, the quality rules against photographs blurred, flattened and
recompressed, and the optional facts left out rather than parking a business.
"""

import http.server
import io
import os
import threading
import types

os.environ.setdefault("no_proxy", "*")

import numpy as np
from PIL import Image, ImageFilter

from . import collect, compose, facts, quality


def _photo(width=1400, height=900, seed=7):
    """A picture with a photograph's grain: smooth shapes, edges and noise."""
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[0:height, 0:width]
    base = np.stack([128 + 60 * np.sin(x / 37.0 + c) * np.cos(y / 53.0 - c) for c in (0, 1, 2)], axis=-1)
    for _ in range(40):
        cx, cy, r = rng.integers(0, width), rng.integers(0, height), rng.integers(20, 120)
        base[(x - cx) ** 2 + (y - cy) ** 2 < r * r] += rng.integers(-70, 70, 3)
    base += rng.normal(0, 6, base.shape)
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))


def _jpeg(image, quality_):
    data = io.BytesIO()
    image.save(data, "JPEG", quality=quality_)
    data.seek(0)
    out = Image.open(data)
    out.load()
    return out


def bigger():
    cases = {
        "https://img1.wsimg.com/isteam/ip/abc/IMG_1.jpg/:/cr=t:0%25,l:0%25,w:100%25,h:75%25/rs=w:365,h:365,cg:true":
            "https://img1.wsimg.com/isteam/ip/abc/IMG_1.jpg/:/rs=w:2000,m",
        "https://static.wixstatic.com/media/a_1~mv2.jpg/v1/fill/w_365,h_365,al_c,q_80/a_1~mv2.jpg":
            "https://static.wixstatic.com/media/a_1~mv2.jpg/v1/fit/w_2000,h_2000,q_90/a_1~mv2.jpg",
        "https://images.squarespace-cdn.com/content/v1/5f/IMG.jpg?format=500w":
            "https://images.squarespace-cdn.com/content/v1/5f/IMG.jpg?format=2500w",
        "https://site.com/wp-content/uploads/2024/02/roof-1024x683.jpg": "https://site.com/wp-content/uploads/2024/02/roof.jpg",
    }
    for url, large in cases.items():
        got = collect.bigger(url)
        assert got == [large, url], got
    assert collect.bigger("https://site.com/img/photo-1024x683.jpg") == ["https://site.com/img/photo-1024x683.jpg"]


def lazy():
    page = collect.Page("https://x.com/")
    page.feed('<img data-lazy="true" src="/real.jpg"><img src="/placeholder.png" data-srclazy="//cdn.x.com/a.jpg">'
              '<img src="data:image/gif;base64,R0" data-src="/b.jpg">'
              '<img src="/p.png" data-srcsetlazy="//cdn.x.com/c.jpg/:/rs=w:365,h:365 1x, //cdn.x.com/c.jpg/:/rs=w:1095,h:1095 3x">')
    assert [i["src"] for i in page.images] == ["https://x.com/real.jpg", "https://cdn.x.com/a.jpg", "https://x.com/b.jpg",
                                              "https://cdn.x.com/c.jpg/:/rs=w:1095,h:1095"], [i["src"] for i in page.images]


class _Site(http.server.BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def _answer(self, code, location=None, cookie=None, body=b""):
        self.send_response(code)
        if location:
            self.send_header("Location", location)
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/check":
            if "seen=1" in (self.headers.get("Cookie") or ""):
                return self._answer(200, body=b"<p>through the check</p>")
            return self._answer(307, "/check", "seen=1; Path=/")
        if self.path == "/old":
            return self._answer(308, "/moved")
        if self.path == "/moved":
            return self._answer(307, "/new")
        if self.path == "/new":
            return self._answer(200, body=b"<p>new</p>")
        if self.path == "/forever":
            return self._answer(307, "/forever")
        self._answer(404)


def redirects():
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), _Site)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        assert collect.fetch(base + "/check") == (base + "/check", "<p>through the check</p>")
        assert collect.fetch(base + "/old") == (base + "/new", "<p>new</p>")
        try:
            collect.fetch(base + "/forever")
        except Exception:
            pass
        else:
            raise AssertionError("an endless redirect loaded")
    finally:
        server.shutdown()


def slots():
    m = lambda w, h: {"width": w, "height": h, "ratio": w / h}
    fits = lambda w, h, slot: not [p for p in quality.problems({**_clean(), **m(w, h)}, slot)]
    assert fits(1080, 1080, "hero") and fits(1400, 682, "hero") and fits(1920, 1080, "hero") and fits(1290, 1593, "hero")
    assert not fits(1215, 2160, "hero"), "a phone's portrait is too tall for the hero"
    assert not fits(900, 900, "hero"), "too small for the hero"
    assert fits(1920, 1080, "band") and not fits(1080, 1080, "band"), "the band is the old 16:9 hero"
    assert quality.crop_keep(1.4, (1.0, 16 / 9)) == 1.0 and abs(quality.crop_keep(0.5, (1.0, 16 / 9)) - 0.5) < 1e-9


def _clean():
    return {"transparent": 0, "bare": 0, "flat": 0.1, "dead": 0, "colors": 2000, "sharp": 0.04, "detail": 30, "focus": 50,
            "blocky": 1.0, "block_step": 0, "jpeg_quality": 90, "mean": 120}


def pixels():
    photo = _photo()
    assert not quality.problems(quality.metrics(photo)), quality.problems(quality.metrics(photo))
    # Still refused: blurred, enlarged, crushed by compression, a flat panel.
    for name, image in (("blurred 2px", photo.filter(ImageFilter.GaussianBlur(2))),
                        ("enlarged 3x", photo.resize((466, 300), Image.LANCZOS).resize((1400, 900), Image.LANCZOS)),
                        ("saved at quality 15", _jpeg(photo, 15)),
                        ("a flat panel", Image.new("RGB", (1400, 900), (20, 40, 90)))):
        assert quality.problems(quality.metrics(image)), f"{name} passed"
    # A portrait on a soft ground: low detail overall, sharp where the subject is.
    soft = photo.filter(ImageFilter.GaussianBlur(6))
    soft.paste(photo.crop((500, 250, 900, 650)), (500, 250))
    m = quality.metrics(soft)
    assert m["detail"] < quality.DETAIL_MIN <= m["focus"] and not any("blurry" in p for p in quality.problems(m)), m
    # A plain backdrop behind a subject is smooth but carries grain; a fill is dead flat.
    rng = np.random.default_rng(3)
    grain = Image.fromarray(np.clip(rng.normal(128, 1.6, (165, 256)), 0, 255).astype(np.uint8)).resize((1400, 900), Image.BICUBIC)
    wall = np.asarray(grain, dtype=np.float64)[..., None] + 72 + np.linspace(0, 12, 1400)[None, :, None]
    backdrop = Image.fromarray(np.clip(np.repeat(wall, 3, axis=-1), 0, 255).astype(np.uint8))
    backdrop.paste(photo.crop((0, 0, 500, 900)), (900, 0))
    m = quality.metrics(backdrop)
    assert m["flat"] > quality.FLAT_MAX and m["dead"] < quality.DEAD_MIN and not any("flat" in p for p in quality.problems(m)), m
    fill = Image.new("RGB", (1400, 900), (240, 240, 240))
    fill.paste(photo.crop((0, 0, 500, 900)), (900, 0))
    assert any("flat" in p for p in quality.problems(quality.metrics(fill)))


def optional_facts():
    evidence = {"phone": "(281) 837-3644", "address": "2315 W Main St", "text": "", "copy": [], "corpus": "", "facts": {},
                "pages": {"https://x.com/": "We serve the Process, Chemical, and Energy industries. Refining work across "
                                            "Texas and Louisiana. Call (281) 837-3644 or (281) 555-0199."}}
    brand = {"template": "industrial", "phone": "(281) 837-3644", "industries": ["Pharmaceutical", "Refining"],
             "statesServed": ["Texas", "Oklahoma"], "credentials": [{"label": "ISNetworld"}], "languages": ["English", "Spanish"],
             "phones": [{"label": "Main", "number": "(281) 837-3644"}, {"label": "Fax", "number": "(713) 555-1234"}]}
    notes = []
    facts.drop_unproved(brand, evidence, notes)
    assert brand == {"template": "industrial", "phone": "(281) 837-3644", "industries": ["Refining"], "statesServed": ["Texas"]}, brand
    assert len(notes) == 5, notes


def hosts():
    # cpa1099.com sends every visitor to "https://www.cpa1099.com:443/" and links
    # its pages without the port; the listing's address at that domain was once
    # refused as another business's, and the preview parked for want of an email.
    assert collect.site_host("https://www.cpa1099.com:443/") == "cpa1099.com"
    assert collect.site_host("http://CPA1099.com/about-us") == "cpa1099.com"
    assert collect.site_host("https://awww.com/") == "awww.com"
    home = types.SimpleNamespace(url="https://www.cpa1099.com:443/", links=[("mailto:info@cpa1099.com", "Email us")])
    assert compose.email_of("mosherseifert@cpa1099.com", [home], {}) == "mosherseifert@cpa1099.com"
    assert compose.email_of("", [home], {}) == "info@cpa1099.com"
    assert compose.email_of("billing@othercpa.com", [home], {}) == "info@cpa1099.com"


def main():
    bigger()
    lazy()
    redirects()
    hosts()
    slots()
    pixels()
    optional_facts()
    print("selftest_photos: image sizes, lazy pictures, redirects, hosts with a port, the hero's shapes, the pixel rules and optional facts all hold")


if __name__ == "__main__":
    main()
