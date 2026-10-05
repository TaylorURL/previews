#!/usr/bin/env python3
"""Pick the outreach prospects a template fits best and dress the template as them.

    make-preview.py candidates [--industry plumbing] [--limit 10]
    make-preview.py make <prospect-id> [--slug name]   # writes the row, prints the URL
    make-preview.py make --best [--industry plumbing]  # the top candidate

Reads `outreach_prospects` and writes `preview_sites` on Supabase project
gujgtjqqurildqurpffh with the service-role key, and reads the prospect's Google
listing for its hours and reviews with the Places key:

    ~/.claude/tools/with-credential.py \
      supabase-service-role-sunday=SUPABASE_SERVICE_ROLE_KEY \
      google-places-api-key=GOOGLE_PLACES_API_KEY \
      -- scripts/make-preview.py candidates

Nothing here sends anything. The email that carries the link is a separate,
approved step.
"""

import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request

SUPABASE_URL = "https://gujgtjqqurildqurpffh.supabase.co"
SITE = "https://{industry}.taylorurl.com/{slug}"

# The prospect trades each template is built for.
TRADES = {
    "plumbing": ["plumber"],
    "barber": ["barber shop", "hair salon"],
    "realestate": ["real estate agency"],
}

OPEN_STAGES = ("found", "enriched", "audited", "queued", "unreachable")


def env(name):
    value = os.environ.get(name)
    if not value:
        sys.exit(f"{name} is not set; run this through with-credential.py")
    return value


def supabase(path, method="GET", body=None, prefer=None):
    key = env("SUPABASE_SERVICE_ROLE_KEY")
    headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    if prefer:
        headers["Prefer"] = prefer
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=30) as response:
        text = response.read().decode()
        return json.loads(text) if text else None


def q(value):
    return urllib.parse.quote(value, safe="")


def industry_of(trade):
    for industry, trades in TRADES.items():
        if trade in trades:
            return industry
    return None


def fetch_candidates(industry=None):
    trades = [t for i, ts in TRADES.items() if not industry or i == industry for t in ts]
    trade_list = ",".join(f'"{t}"' for t in trades)
    stages = ",".join(OPEN_STAGES)
    select = (
        "id,name,trade,town,address,phone,website,site_kind,email,audit_score,seo_score,"
        "rating,rating_count,stage,skip_reason,place_id,business_status"
    )
    rows = supabase(
        f"outreach_prospects?select={select}&trade=in.({q(trade_list)})&stage=in.({stages})"
        "&email=not.is.null&contacted_at=is.null&replied_at=is.null&bounced_at=is.null&limit=2000"
    )
    emails = [r["email"].lower() for r in rows]
    suppressed = set()
    for i in range(0, len(emails), 100):
        chunk = ",".join(f'"{e}"' for e in emails[i : i + 100])
        suppressed |= {s["email"].lower() for s in supabase(f"suppression?select=email&email=in.({q(chunk)})")}
    made = {p["prospect_id"] for p in supabase("preview_sites?select=prospect_id&prospect_id=not.is.null")}
    keep = []
    for r in rows:
        if r["email"].lower() in suppressed or r["id"] in made:
            continue
        if r.get("business_status") not in (None, "OPERATIONAL"):
            continue
        if not personal_inbox(r):
            continue
        r["industry"] = industry_of(r["trade"])
        r["score"], r["why"] = score(r)
        keep.append(r)
    return sorted(keep, key=lambda r: -r["score"])


FREE_MAIL = ("gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "live.com", "att.net", "comcast.net", "msn.com")


def personal_inbox(r):
    """
    An address the business itself reads. A free mailbox passes. A company
    domain has to be the business's own website domain, or share a word with
    its name when it has no website - enrichment sometimes lifts an address
    off a neighbouring business's page, and a preview sent there is a preview
    of somebody else's shop.
    """
    domain = r["email"].split("@")[-1].lower()
    if domain in FREE_MAIL:
        return True
    site = urllib.parse.urlparse(r.get("website") or "").hostname or ""
    if site and r.get("site_kind") != "social":
        return site.lower().removeprefix("www.") == domain
    words = {w for w in re.findall(r"[a-z]{4,}", r["name"].lower())} - {"shop", "realty", "real", "estate", "plumbing", "barber", "barbershop", "team", "agency", "group"}
    return any(w in domain for w in words)


def score(r):
    """
    How much a preview is worth to this business. A busy, well-reviewed shop
    whose site is broken, slow or missing has the most to gain and the most to
    spend; a business with a fast site already has what we would sell it.
    """
    why = []
    rating = float(r.get("rating") or 0)
    count = int(r.get("rating_count") or 0)
    points = 0.0
    if count:
        points += min(count, 400) / 10  # demand: up to 40
        why.append(f"{count} reviews")
    if rating >= 4.5:
        points += 10
        why.append(f"{rating} stars")
    elif rating and rating < 4.0:
        points -= 15
    site_kind = r.get("site_kind")
    audit = r.get("audit_score")
    if not r.get("website") or site_kind == "social":
        points += 35
        why.append("no site of its own")
    elif r.get("stage") == "unreachable":
        points += 30
        why.append("site would not load for Google's test")
    elif audit is not None:
        points += max(0, 90 - audit) * 0.5  # up to 45
        why.append(f"PageSpeed {audit}")
    else:
        points += 10
        why.append("site not measured yet")
    return round(points, 1), ", ".join(why)


def place_details(place_id):
    key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not key or not place_id:
        return {}
    fields = "displayName,nationalPhoneNumber,formattedAddress,addressComponents,rating,userRatingCount,regularOpeningHours,reviews"
    request = urllib.request.Request(
        f"https://places.googleapis.com/v1/places/{place_id}",
        headers={"X-Goog-Api-Key": key, "X-Goog-FieldMask": fields},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read())


def hours_rows(place):
    lines = (place.get("regularOpeningHours") or {}).get("weekdayDescriptions") or []
    rows = []
    for line in lines:
        day, _, time = line.partition(": ")
        rows.append([day[:3], time.replace(" ", " ").replace(":00", "")])
    return rows


def good_reviews(place):
    picked = []
    for review in place.get("reviews") or []:
        text = ((review.get("originalText") or review.get("text") or {}).get("text") or "").strip()
        if review.get("rating", 0) < 5 or len(text) < 60:
            continue
        if len(text) > 320:
            cut = text[:320]
            end = max(cut.rfind(". "), cut.rfind("! "))
            text = cut[: end + 1] if end > 80 else cut.rsplit(" ", 1)[0] + "..."
        text = re.sub(r"\s+", " ", text)
        name = (review.get("authorAttribution") or {}).get("displayName") or "Google reviewer"
        parts = name.split()
        author = f"{parts[0]} {parts[-1][0]}." if len(parts) > 1 else parts[0]
        picked.append({"author": author, "rating": 5, "text": text})
    return picked[:3]


def street(address):
    return (address or "").split(",")[0].strip()


def slugify(name):
    name = re.sub(r"[|(].*$", "", name)
    return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("'", "")).strip("-")[:48].strip("-")


def clean_name(name):
    """Google listing names carry keyword stuffing after a pipe or dash."""
    return re.split(r"\s+[|]\s+|\s+-\s+", name)[0].strip()


def build_business(r, place):
    town = r.get("town")
    for component in place.get("addressComponents") or []:
        if "locality" in component.get("types", []):
            town = component.get("longText") or town
    business = {
        "name": clean_name((place.get("displayName") or {}).get("text") or r["name"]),
        "phone": place.get("nationalPhoneNumber") or r.get("phone"),
        "email": r.get("email"),
        "address": street(place.get("formattedAddress") or r.get("address")),
        "town": town,
        "state": "TX",
        "rating": place.get("rating") or (float(r["rating"]) if r.get("rating") else None),
        "reviewCount": place.get("userRatingCount") or r.get("rating_count"),
        "reviews": good_reviews(place),
        "website": r.get("website"),
    }
    hours = hours_rows(place)
    if hours:
        business["hours"] = hours
    if r["industry"] == "plumbing":
        business["serviceArea"] = [town]
    return {k: v for k, v in business.items() if v not in (None, "", [])} | {"reviews": business["reviews"]}


def make(prospect_id, slug=None):
    rows = supabase(f"outreach_prospects?select=*&id=eq.{prospect_id}")
    if not rows:
        sys.exit(f"no prospect {prospect_id}")
    r = rows[0]
    r["industry"] = industry_of(r["trade"])
    if not r["industry"]:
        sys.exit(f"no template fits the trade {r['trade']!r}")
    place = place_details(r.get("place_id"))
    business = build_business(r, place)
    slug = slug or slugify(business["name"])
    row = {"slug": slug, "industry": r["industry"], "prospect_id": r["id"], "business": business}
    supabase("preview_sites?on_conflict=slug", "POST", row, prefer="resolution=merge-duplicates,return=minimal")
    print(json.dumps({"url": SITE.format(industry=r["industry"], slug=slug), "business": business}, indent=2))


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("candidates")
    c.add_argument("--industry", choices=TRADES)
    c.add_argument("--limit", type=int, default=10)
    c.add_argument("--json", action="store_true")
    m = sub.add_parser("make")
    m.add_argument("prospect_id", nargs="?")
    m.add_argument("--best", action="store_true")
    m.add_argument("--industry", choices=TRADES)
    m.add_argument("--slug")
    args = parser.parse_args()

    if args.cmd == "candidates":
        rows = fetch_candidates(args.industry)[: args.limit]
        if args.json:
            print(json.dumps(rows, indent=2, default=str))
            return
        for r in rows:
            print(f"{r['score']:>6}  {r['industry']:<10} {r['name'][:44]:<44} {r['town'] or '':<14} {r['id']}  ({r['why']})")
        return

    if args.best:
        rows = fetch_candidates(args.industry)
        if not rows:
            sys.exit("no candidates")
        make(rows[0]["id"], args.slug)
    elif args.prospect_id:
        make(args.prospect_id, args.slug)
    else:
        sys.exit("name a prospect id or pass --best")


if __name__ == "__main__":
    main()
