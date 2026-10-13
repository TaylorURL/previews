#!/usr/bin/env python3
"""The database and mail half of the preview routine.

Everything here talks to Supabase with the service-role key and to the
taylorurl.com send endpoint with the scheduler secret. Neither is read from a
file: run every command under with-credential so both arrive in the
environment and nowhere else.

    ~/.claude/tools/with-credential.py \
      supabase-service-role-sunday=SUPABASE_SERVICE_ROLE_KEY \
      taylorurl-cron-secret=CRON_SECRET \
      -- scripts/routine.py <command> ...

Commands:
    candidates [N]                 every prospect whose third letter (the
                                   preview) is due, oldest due first, as
                                   JSON; N caps the list for a look, and the
                                   routine passes none
    waiting                        how many prospects are due a site now
    skip PROSPECT_ID REASON        record that no site can be built for this
                                   business, so it stops being offered
    register SLUG PROSPECT_ID LETTER_JSON
                                   file the preview and its letter; the
                                   industry and name come from the prospect.
                                   Refused until the review has passed the
                                   site as its brand file stands
                                   (python3 -m scripts.autobuild.review SLUG)
    live SLUG                      exit 0 when SLUG.taylorurl.com serves the
                                   business's own page
    shot SLUG                      capture the live preview at desktop and
                                   phone size, compose one image, store it and
                                   file its address on the preview, so the
                                   letter can show the site
    send SLUG                      send the first letter through
                                   /api/outreach/previews
    sent-today                     how many preview letters went out today,
                                   less any a catch-up held
"""

import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE = "https://gujgtjqqurildqurpffh.supabase.co"
SEND = "https://www.taylorurl.com/api/outreach/previews"
INDUSTRY = {
    "plumber": "plumbing",
    "barber shop": "barber",
    "real estate agency": "realestate",
    "roofing contractor": "roofing",
    "HVAC contractor": "hvac",
    "electrician": "hvac",
    "flooring contractor": "flooring",
    "hair salon": "salon",
    "fitness": "fitness",
    "printing": "printing",
    "auto repair": "autorepair",
    "insurance agency": "professional",
    "accountant": "professional",
    "title company": "professional",
    "law firm": "professional",
    "dentist": "professional",
    "chiropractor": "professional",
    "pool service": "hvac",
    "landscaping": "hvac",
    "painting contractor": "hvac",
    "concrete contractor": "hvac",
    "pest control": "hvac",
    "fencing contractor": "hvac",
    "tree service": "hvac",
    "welding": "hvac",
    "machine shop": "hvac",
    "industrial contractor": "hvac",
    "marine services": "hvac",
    "towing service": "hvac",
    "storage": "hvac",
    "restaurant": "restaurant",
    "youth sports": "recreation",
    "go kart track": "recreation",
}


def templates():
    """The templates this checkout can draw, by the name a brand file uses."""
    folder = os.path.join(HERE, "..", "src", "templates")
    return {name[:-4].lower() for name in os.listdir(folder) if name.endswith(".jsx") and name != "shared.jsx"}


def key():
    value = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not value:
        sys.exit("SUPABASE_SERVICE_ROLE_KEY is not set; run under with-credential.py")
    return value


def rest(method, path, body=None, prefer=None):
    headers = {
        "apikey": key(),
        "Authorization": f"Bearer {key()}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(f"{SUPABASE}/rest/v1/{path}", data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            text = response.read().decode()
            return json.loads(text) if text else None
    except urllib.error.HTTPError as error:
        sys.exit(f"{method} {path}: {error.code} {error.read().decode()[:400]}")


def due():
    # Only businesses a template exists for: the database knows every trade the
    # studio may build for, and this checkout knows which ones it can build yet.
    # The database hands back the whole list, oldest due first, so whatever one
    # run cannot reach is at the head of the next run's list.
    ready = templates()
    rows = rest("POST", "rpc/preview_candidates", {}) or []
    return [row for row in rows if row["industry"] in ready]


def candidates(limit):
    rows = due()
    print(json.dumps(rows if limit is None else rows[:limit], indent=2))


def waiting():
    print(len(due()))


def skip(prospect_id, reason):
    reason = " ".join(reason.split())[:300]
    if not reason:
        sys.exit("say why no site can be built")
    found = rest("GET", f"outreach_prospects?id=eq.{prospect_id}&select=id,name")
    if not found:
        sys.exit(f"no prospect {prospect_id}")
    at = datetime.now(timezone.utc).isoformat()
    rest(
        "PATCH",
        f"outreach_prospects?id=eq.{prospect_id}",
        {"preview_skipped_at": at, "preview_skip_reason": reason},
        prefer="return=minimal",
    )
    print(f"skipped {found[0]['name']}: {reason}")


def reviewed(slug):
    """Whether the review passed this site as its brand file now stands: the
    stamp review.py writes names the brand file it looked at."""
    root = os.path.dirname(HERE)
    try:
        with open(os.path.join(root, ".autobuild", f"{slug}.review.json")) as handle:
            mark = json.load(handle)
        with open(os.path.join(root, "src", "brands", f"{slug}.json"), "rb") as handle:
            now = hashlib.sha256(handle.read()).hexdigest()
    except (OSError, ValueError):
        return False
    return bool(mark.get("ok")) and mark.get("brand") == now


def register(slug, prospect_id, letter_path):
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", slug):
        sys.exit(f"{slug} is not a valid subdomain label")
    # No letter may point at a preview the review has not passed.
    if not reviewed(slug):
        sys.exit(f"the review has not passed {slug} as it stands: run npm run build, then "
                 f"python3 -m scripts.autobuild.review {slug}")
    with open(letter_path) as handle:
        letter = json.load(handle)
    if not letter.get("subject") or len(letter.get("paragraphs") or []) < 2:
        sys.exit("the letter needs a subject and at least two paragraphs")
    if not any("{url}" in p for p in letter["paragraphs"]):
        sys.exit("the letter never gives the preview's address; write {url} where it goes")
    found = rest("GET", f"outreach_prospects?id=eq.{prospect_id}&select=id,name,trade")
    if not found:
        sys.exit(f"no prospect {prospect_id}")
    prospect = found[0]
    industry = INDUSTRY.get(prospect["trade"])
    if not industry:
        sys.exit(f"no template for the trade {prospect['trade']}")
    row = {
        "slug": slug,
        "industry": industry,
        "prospect_id": prospect_id,
        "name": prospect["name"],
        "business": {"source": "src/brands/" + slug + ".json"},
        "letter": letter,
    }
    rest("POST", "preview_sites?on_conflict=slug", row, prefer="resolution=merge-duplicates,return=minimal")
    print(f"registered {slug} for {prospect['name']}")


def live(slug):
    url = f"https://{slug}.taylorurl.com/"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "preview-routine"}), timeout=30) as response:
            page = response.read().decode(errors="replace")
            status = response.status
    except urllib.error.HTTPError as error:
        sys.exit(f"{url} answered {error.code}")
    except urllib.error.URLError as error:
        sys.exit(f"{url} did not answer: {error.reason}")
    if status != 200 or f"__SLUG__ = {json.dumps(slug)}" not in page:
        sys.exit(f"{url} answered {status} without this preview's page")
    print(f"{url} is live")


BUCKET = "preview-shots"
HERE = os.path.dirname(os.path.abspath(__file__))


def compose(desktop_path, phone_path, out_path):
    """One picture of the site: the desktop page, with the phone page standing
    in front of its lower right corner, the way a person would show it off."""
    from PIL import Image, ImageDraw, ImageFilter

    width, height, pad = 1200, 760, 40
    canvas = Image.new("RGB", (width, height), (238, 240, 243))

    desktop = Image.open(desktop_path).convert("RGB")
    desk_w = width - pad * 2 - 140
    desktop = desktop.resize((desk_w, round(desktop.height * desk_w / desktop.width)), Image.LANCZOS)
    frame = Image.new("RGB", (desktop.width, desktop.height + 28), (255, 255, 255))
    bar = ImageDraw.Draw(frame)
    for i, colour in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
        bar.ellipse((14 + i * 18, 9, 24 + i * 18, 19), fill=colour)
    frame.paste(desktop, (0, 28))
    shadow = Image.new("RGBA", (frame.width + 60, frame.height + 60), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((30, 36, frame.width + 30, frame.height + 36), 14, fill=(0, 0, 0, 60))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    canvas.paste(shadow, (pad - 30, pad - 30), shadow)
    mask = Image.new("L", frame.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, frame.width - 1, frame.height - 1), 10, fill=255)
    canvas.paste(frame, (pad, pad), mask)

    phone = Image.open(phone_path).convert("RGB")
    phone_h = height - pad * 2 - 40
    phone = phone.resize((round(phone.width * phone_h / phone.height), phone_h), Image.LANCZOS)
    bezel = 9
    body = Image.new("RGB", (phone.width + bezel * 2, phone.height + bezel * 2), (17, 17, 20))
    screen_mask = Image.new("L", phone.size, 0)
    ImageDraw.Draw(screen_mask).rounded_rectangle((0, 0, phone.width - 1, phone.height - 1), 26, fill=255)
    body.paste(phone, (bezel, bezel), screen_mask)
    body_mask = Image.new("L", body.size, 0)
    ImageDraw.Draw(body_mask).rounded_rectangle((0, 0, body.width - 1, body.height - 1), 34, fill=255)
    x, y = width - pad - body.width, height - pad - body.height + 10
    shadow = Image.new("RGBA", (body.width + 80, body.height + 80), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((40, 48, body.width + 40, body.height + 48), 34, fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    canvas.paste(shadow, (x - 40, y - 40), shadow)
    canvas.paste(body, (x, y), body_mask)

    canvas.save(out_path, "JPEG", quality=84, optimize=True, progressive=True)


def shot(slug):
    found = rest("GET", f"preview_sites?slug=eq.{slug}&select=id")
    if not found:
        sys.exit(f"{slug} is not registered; register it before taking its picture")
    with tempfile.TemporaryDirectory() as work:
        subprocess.run(["node", os.path.join(HERE, "shot.mjs"), slug, work], check=True)
        out = os.path.join(work, f"{slug}.jpg")
        compose(os.path.join(work, f"{slug}-desktop.png"), os.path.join(work, f"{slug}-phone.png"), out)
        with open(out, "rb") as handle:
            data = handle.read()
    request = urllib.request.Request(
        f"{SUPABASE}/storage/v1/object/{BUCKET}/{slug}.jpg",
        data=data,
        method="POST",
        headers={
            "apikey": key(),
            "Authorization": f"Bearer {key()}",
            "Content-Type": "image/jpeg",
            "x-upsert": "true",
            "Cache-Control": "max-age=31536000",
        },
    )
    try:
        urllib.request.urlopen(request, timeout=60).read()
    except urllib.error.HTTPError as error:
        sys.exit(f"storing the picture of {slug}: {error.code} {error.read().decode()[:300]}")
    # The version keeps a re-taken picture from being served out of a mail
    # client's cache under the old one.
    url = f"{SUPABASE}/storage/v1/object/public/{BUCKET}/{slug}.jpg?v={int(time.time())}"
    rest("PATCH", f"preview_sites?slug=eq.{slug}", {"shot_url": url}, prefer="return=minimal")
    print(f"{slug}: {url} ({len(data) // 1024} KB)")


def send(slug):
    secret = os.environ.get("CRON_SECRET")
    if not secret:
        sys.exit("CRON_SECRET is not set; run under with-credential.py")
    request = urllib.request.Request(
        SEND,
        data=json.dumps({"slug": slug}).encode(),
        method="POST",
        headers={"Authorization": f"Bearer {secret}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            answer = json.loads(response.read().decode())
    except urllib.error.HTTPError as error:
        sys.exit(f"send {slug}: {error.code} {error.read().decode()[:400]}")
    print(json.dumps(answer))
    if answer.get("error") or not answer.get("changed"):
        sys.exit(1)


def instant(value):
    """A timestamp the database wrote, as an aware datetime, or None."""
    return datetime.fromisoformat(value.replace("Z", "+00:00")) if value else None


def catch_up(settings, now=None):
    """The outreach catch-up as the settings hold it: when it opened and
    whether it is open now, or (None, False) when none is set.

    It is the one set in taylorurl-com lib/outreach/sending/catch-up.js, read
    from the same four columns. While it is open the letters it holds - sites
    registered before it opened whose letter had not gone - go from its
    opening rather than from 8:00, and outside the day's cap.
    """
    now = now or datetime.now(timezone.utc)
    since, opened, until = (instant(settings.get(name)) for name in
                            ("catch_up_held_since", "catch_up_from", "catch_up_until"))
    if not (since and opened and until) or since >= opened:
        return None, False
    return opened, opened <= now < until


def sent_today_count():
    """Preview letters that went today, less the ones a catch-up held.

    The day is Houston's, so a letter sent at five in the afternoon counts
    toward that day and not toward the next morning's run. A catch-up's held
    letters are left out on the day it opened, so the backlog does not spend
    the cap the day's own letters are paced by.
    """
    from zoneinfo import ZoneInfo

    houston = ZoneInfo("America/Chicago")
    local = datetime.now(houston)
    start = local.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)
    rows = rest("GET", "preview_sites?select=slug,created_at,sent_at"
                       f"&sent_at=gte.{start.isoformat().replace('+00:00', 'Z')}") or []
    settings = rest("GET", "outreach_settings?select=catch_up_held_since,catch_up_from,catch_up_until&limit=1")
    opened, _ = catch_up(settings[0] if settings else {})
    if opened and opened.astimezone(houston).date() == local.date():
        rows = [row for row in rows
                if not (instant(row["created_at"]) < opened <= instant(row["sent_at"]))]
    return len(rows)


def sent_today():
    print(sent_today_count())


def main(argv):
    if not argv:
        sys.exit(__doc__)
    command, rest_args = argv[0], argv[1:]
    if command == "candidates":
        candidates(int(rest_args[0]) if rest_args else None)
    elif command == "waiting":
        waiting()
    elif command == "skip" and len(rest_args) >= 2:
        skip(rest_args[0], " ".join(rest_args[1:]))
    elif command == "register" and len(rest_args) == 3:
        register(*rest_args)
    elif command == "live" and len(rest_args) == 1:
        live(rest_args[0])
    elif command == "shot" and len(rest_args) == 1:
        shot(rest_args[0])
    elif command == "send" and len(rest_args) == 1:
        send(rest_args[0])
    elif command == "sent-today":
        sent_today()
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
