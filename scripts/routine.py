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
    send SLUG                      send the first letter through
                                   /api/outreach/previews
    sent-today                     how many preview letters went out today
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

SUPABASE = "https://gujgtjqqurildqurpffh.supabase.co"
SEND = "https://www.taylorurl.com/api/outreach/previews"
INDUSTRY = {"plumber": "plumbing", "barber shop": "barber", "real estate agency": "realestate"}


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
    rows = rest("POST", "rpc/preview_candidates", {"p_limit": limit})
    print(json.dumps(rows, indent=2))


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
    start = datetime.now(timezone.utc) - timedelta(hours=20)
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
    elif command == "send" and len(rest_args) == 1:
        send(rest_args[0])
    elif command == "sent-today":
        sent_today()
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
