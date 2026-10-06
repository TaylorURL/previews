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
    candidates [N]                 the next N prospects to build for, as JSON
    register SLUG PROSPECT_ID LETTER_JSON
                                   file the preview and its letter; the
                                   industry and name come from the prospect
    live SLUG                      exit 0 when SLUG.taylorurl.com serves the
                                   business's own page
    shot SLUG                      capture the live preview at desktop and
                                   phone size, compose one image, store it and
                                   file its address on the preview, so the
                                   letter can show the site
    send SLUG                      send the first letter through
                                   /api/outreach/previews
    sent-today                     how many preview letters went out today
"""

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


def candidates(limit):
    # Only businesses a template exists for: the database knows every trade the
    # studio may build for, and this checkout knows which ones it can build yet.
    ready = templates()
    rows = rest("POST", "rpc/preview_candidates", {"p_limit": 1000})
    print(json.dumps([row for row in rows if row["industry"] in ready][:limit], indent=2))


def register(slug, prospect_id, letter_path):
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", slug):
        sys.exit(f"{slug} is not a valid subdomain label")
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


def sent_today():
    # The day is Houston's, so a letter sent at five in the afternoon counts
    # toward that day and not toward the next morning's run.
    from zoneinfo import ZoneInfo

    local = datetime.now(ZoneInfo("America/Chicago"))
    start = local.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)
    rows = rest("GET", f"preview_sites?select=slug&sent_at=gte.{start.isoformat().replace('+00:00', 'Z')}")
    print(len(rows or []))


def main(argv):
    if not argv:
        sys.exit(__doc__)
    command, rest_args = argv[0], argv[1:]
    if command == "candidates":
        candidates(int(rest_args[0]) if rest_args else 10)
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
