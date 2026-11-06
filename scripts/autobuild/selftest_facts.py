"""Proves the fact sheet and the written copy keep only what is true, with no model asked.

    python3 -m scripts.autobuild.selftest_facts

What a model returns is stood in for here, so this runs anywhere in a second:
a fact sheet's items are kept only when their quote is on the page they name
and says what they claim; a written line only when every number, name and
claim word in it is in the facts; Google reviews are read from a Places answer
recorded in the shape Place Details (New) documents, four and five stars only,
quoted as written with the author's first name and last initial; and the check
refuses a review, a phone line or a written line that is not proved.
"""

import io
import json
import os

from . import check, facts, write

PAGE = """Title: Gutierrez Landscaping
# Family Owned Landscaping in Lockhart
We are a small, family-owned landscaping company proudly serving the Lockhart community.
Our owner, Efrain, founded the business in 2010 with just a push mower and a vision.
- Mowing Service
Our basic mowing service includes mowing the lawn, edging, weed eating and blowing off hard surfaces.
English: (512) 620-1812
Español: (512) 938-2043
Fax: (512) 555-0101
Free quotes on every job.
"""
URL = "https://gutierrezlandscaping.us/"
ROW = {"name": "Gutierrez Landscaping", "trade": "landscaping", "industry": "outdoor", "town": "Lockhart",
       "address": "273 Old Luling Rd, Lockhart, TX 78644, USA", "phone": "(512) 938-2043", "rating": "5.0",
       "rating_count": 35, "website": URL, "place_id": "ChIJi9xZori48Q8Rc-QcgKDVnak"}

# A Place Details (New) answer as Google documents it, with what the picker must refuse.
PLACES = {
    "id": "ChIJi9xZori48Q8Rc-QcgKDVnak", "rating": 5, "userRatingCount": 35,
    "reviews": [
        {"rating": 5, "publishTime": "2026-10-01T12:00:00Z",
         "text": {"text": "Efrain and his crew have kept our yard looking great for three years. They close the gate.", "languageCode": "en"},
         "originalText": {"text": "Efrain and his crew have kept our yard looking great for three years. They close the gate.", "languageCode": "en"},
         "authorAttribution": {"displayName": "Maria Gonzalez"}},
        {"rating": 3, "publishTime": "2026-09-20T12:00:00Z",
         "text": {"text": "Okay job but they were late twice and missed a corner of the lawn.", "languageCode": "en"},
         "authorAttribution": {"displayName": "Tom Baker"}},
        {"rating": 5, "publishTime": "2026-08-02T12:00:00Z",
         "text": {"text": "Excellent service, very professional and punctual. Recommended one hundred percent.", "languageCode": "en"},
         "originalText": {"text": "Excelente servicio, muy profesionales y puntuales. ¡Recomendados al cien por ciento!", "languageCode": "es"},
         "authorAttribution": {"displayName": "jose luis ramirez"}},
        {"rating": 4, "publishTime": "2026-10-03T12:00:00Z", "text": {"text": "Good"}, "authorAttribution": {"displayName": "Sam"}},
        {"rating": 5, "publishTime": "2025-12-11T12:00:00Z",
         "text": {"text": "They put in new flower beds and fixed two sprinkler heads the same week. They cleaned up everything."},
         "authorAttribution": {"displayName": "Dana"}},
    ],
}


def quotes_and_support():
    assert facts.found_in("family–owned landscaping company proudly serving the  Lockhart", PAGE)
    assert facts.found_in("“Our owner, Efrain, founded the business…with just a push mower”", PAGE)
    assert not facts.found_in("Efrain founded the business in 2009", PAGE)
    said = lambda text: facts.supported(text, PAGE)
    assert said("Family owned since 2010.") == []
    assert said("Efrain started with one push mower in 2010.") == []
    assert said("Open 6AM-9PM, 7 days a week.") == ["6", "9", "7"], said("Open 6AM-9PM, 7 days a week.")
    for line, wrong in [("Founded by Juan in 2009.", {"Juan", "2009"}), ("The best lawn crew in Lockhart.", {"best"}),
                        ("Free estimates, 24/7.", {"24/7"}), ("Trane certified technicians.", {"certified", "Trane"}),
                        ("Licensed and insured.", {"licensed", "insured"}), ("Serving Lockhart with two crews.", {"two"})]:
        assert wrong <= set(said(line)), (line, said(line))


def the_sheet():
    raw = {
        "services": [{"title": "Mowing Service", "description": "Our basic mowing service includes mowing the lawn, edging, weed eating and blowing off hard surfaces.",
                      "quote": "Mowing Service", "url": URL},
                     {"title": "Tree Removal", "description": "", "quote": "We remove trees of any size.", "url": URL}],
        "highlights": [{"kind": "family_owned", "text": "Family owned", "number": 0, "url": URL,
                        "quote": "We are a small, family-owned landscaping company"},
                       {"kind": "founded", "text": "Founded in 2010", "number": 2010, "url": URL,
                        "quote": "founded the business in 2010"},
                       {"kind": "founded", "text": "Founded in 2008", "number": 2008, "url": URL,
                        "quote": "founded the business in 2010"},
                       {"kind": "emergency", "text": "24/7 service", "number": 0, "url": URL, "quote": "Free quotes on every job."}],
        "phones": [{"number": "512-620-1812", "label": "English", "quote": "English: (512) 620-1812", "url": URL},
                   {"number": "(512) 938-2043", "label": "Español", "quote": "Español: (512) 938-2043", "url": URL},
                   {"number": "(512) 555-0101", "label": "", "quote": "Fax: (512) 555-0101", "url": URL}],
        "languages": [{"language": "Spanish", "quote": "Español: (512) 938-2043", "url": URL}],
        "testimonials": [], "credentials": [], "industries": [], "states": [], "towns": [], "steps": [],
        "people": [{"name": "Efrain", "role": "Owner", "bio": "", "owner": True, "quote": "Our owner, Efrain", "url": URL}],
        "story": [{"text": "Started with a push mower in 2010", "quote": "founded the business in 2010 with just a push mower", "url": URL},
                  {"text": "A local roofing company out of Kansas City, MO", "quote": "with just a push mower and a vision", "url": URL}],
        "home_leads_with": [{"text": "Family owned landscaping", "quote": "Family Owned Landscaping in Lockhart"}],
        "tone": {"value": "bold", "why": "direct"},
    }
    kept, dropped = facts.verify(raw, {URL: PAGE}, ROW)
    titles = lambda group: [i.get("title") or i.get("text") or i.get("number") or i.get("language") for i in kept[group]]
    assert titles("services") == ["Mowing Service"], (titles("services"), dropped)
    assert titles("highlights") == ["Family owned", "Founded in 2010"], (titles("highlights"), dropped)
    assert titles("phones") == ["(512) 620-1812", "(512) 938-2043"], titles("phones")
    assert titles("languages") == ["Spanish"]
    assert [p["name"] for p in kept["people"]] == ["Efrain"]
    assert titles("story") == ["Started with a push mower in 2010"], (titles("story"), dropped)
    assert all(i["id"] for _, _, i in facts.items(kept))
    assert any("Kansas City" in d and "outside TX" in d for d in dropped), dropped
    return kept


def places():
    seen = {}

    class Answer(io.BytesIO):
        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    def answer(request, timeout=0):
        seen["url"], seen["mask"] = request.full_url, request.get_header("X-goog-fieldmask")
        return Answer(json.dumps(PLACES).encode())

    urlopen, key = facts.urllib.request.urlopen, os.environ.get("PLACES_API_KEY")
    facts.urllib.request.urlopen = answer
    os.environ["PLACES_API_KEY"] = "recorded"
    try:
        reviews, raw = facts.google_reviews(ROW, [])
    finally:
        facts.urllib.request.urlopen = urlopen
        os.environ.pop("PLACES_API_KEY")
        if key:
            os.environ["PLACES_API_KEY"] = key
    assert seen["url"].endswith("/places/ChIJi9xZori48Q8Rc-QcgKDVnak") and "reviews" in seen["mask"]
    assert [r["author"] for r in reviews] == ["Maria G.", "Jose R.", "Dana"], reviews
    assert reviews[1]["text"].startswith("Excelente servicio"), "the review as written, not Google's translation"
    assert all(r["rating"] >= 4 and r["source"] == "Google" for r in reviews)
    assert facts.google_reviews(dict(ROW, place_id=None), []) == ([], None)
    return reviews, raw


def the_check(sheet, reviews, raw):
    evidence = {"phone": ROW["phone"], "text": PAGE, "pages": {URL: PAGE}, "places": raw, "facts": sheet,
                "corpus": facts.corpus(sheet, ROW), "copy": [{"path": "hero.title", "text": "Efrain started with a push mower", "facts": ["o1"]}]}
    good = {"reviews": reviews, "phones": [{"label": "English", "number": "(512) 620-1812"}], "languages": ["English", "Spanish"],
            "hero": {"title": "Efrain started with a push mower"}}
    assert check.written(good, evidence) == [], check.written(good, evidence)
    bad = [
        {"reviews": [dict(reviews[0], text=reviews[0]["text"].replace("three", "five"))]},
        {"reviews": [dict(reviews[0], author="Maria L.")]},
        {"reviews": [{"author": "Ann", "text": "Best crew in town, they mowed even in the rain.", "source": "their site"}]},
        {"phones": [{"label": "Office", "number": "(512) 555-0199"}]},
        {"languages": ["English", "Vietnamese"]},
        {"credentials": [{"label": "TDLR", "detail": "License No. 12345"}]},
    ]
    for brand in bad:
        assert check.written(brand, evidence), brand
    split = dict(evidence, copy=[{"path": "hero.title", "text": "Efrain started with a push mower,", "facts": ["o1"]},
                                 {"path": "hero.titleAccent", "text": "and a vision.", "facts": ["o1"]}])
    assert check.written({"hero": {"title": "Efrain started with a push mower", "titleAccent": "and a vision."}}, split) == []
    lied = dict(evidence, copy=[{"path": "hero.title", "text": "The best lawn crew since 1998", "facts": []}])
    assert check.written({"hero": {"title": "The best lawn crew since 1998"}}, lied)


def the_writer():
    services = [{"title": "Mowing Service"}, {"title": "Leaf Cleanups"}]
    line = lambda path, text: {"path": path, "text": text, "facts": []}
    corpus = PAGE + " Leaf Cleanups"
    assert write.problems_of(line("hero.title", "Mowing Service and Leaf Cleanups"), corpus, "Lockhart", services)
    assert write.problems_of(line("hero.title", "Schedule your mowing online"), corpus, "Lockhart", services)
    assert write.problems_of(line("about.paragraphs.0.0", "We are your one-stop shop for the Lockhart community."), corpus, "Lockhart", services)
    assert write.problems_of(line("about.paragraphs.0.0", "A roofing company out of Kansas City, MO."), corpus, "Lockhart", services, "TX")
    assert write.problems_of(line("hero.title", "Efrain started with a push mower"), corpus, "Lockhart", services, "TX") == []
    assert write.OFFER.search("$100 off your first job") and write.OFFER.search("Pest control from $39 per month")
    assert not write.OFFER.search("If we are 20 minutes late, you get a $20 gift card")
    kept = [dict(line("hero.title", "Over 40 years of pest control, still family owned"), facts=["h1"]),
            dict(line("hero.titleAccent", "still family owned"), facts=["h1"])]
    copy = write._assemble(kept, {}, "Stephen Terry", "Pasadena", {}, [], "")
    assert copy["hero"] == {"title": "Over 40 years of pest control,", "titleAccent": "still family owned"}, copy["hero"]
    kept = [dict(line("hero.title", "We do not compromise on quality,"), facts=["h1"]), dict(line("hero.titleAccent", "speed, or value."), facts=["h1"])]
    assert write._assemble(kept, {}, "ICM", "Dickinson", {}, [], "")["hero"]["title"] == "We do not compromise on quality,"
    kept = [dict(line("hero.title", "Stop guessing about your numbers,"), facts=["h1"])]
    assert write._assemble(kept, {}, "Arnold CPA", "Houston", {}, [], "")["hero"]["title"] == "Stop guessing about your numbers"


if __name__ == "__main__":
    quotes_and_support()
    sheet = the_sheet()
    reviews, raw = places()
    the_check(sheet, reviews, raw)
    the_writer()
    print("selftest_facts: the fact sheet, the copy's checks, the Places reviews and the check all hold")
