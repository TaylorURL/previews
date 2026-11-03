"""The morning run: the businesses the scripted run parked, finished by hand
from where the script left them, then checked, reviewed, landed, proved live
and sent the way the scripted run does it.

    ~/bin/with-credential.py \\
      supabase-service-role-sunday=SUPABASE_SERVICE_ROLE_KEY \\
      taylorurl-cron-secret=CRON_SECRET \\
      google-pagespeed-api-key=PAGESPEED_API_KEY \\
      google-places-api-key=PLACES_API_KEY \\
      -- python3 -m scripts.autobuild.parked [--batch N] [--limit N] [--dry]

Run from a worktree of the previews repository cut from origin/develop, with
ROUTINE_DEADLINE_EPOCH saying when it is stopped.

Only the building needs a model, so only the building has one. For each batch
the run restores what the script made of every business (drafts.py) - or has
the script build it again when it kept nothing, which now and then simply
passes - and files a copy of the business's website beside it. Then one
builder per business, a short `claude -p` of its own started from that draft
and that copy, fixes what the business was parked for, fills in the rest, and
writes the letter. Everything after is this script: the checks every brand
file must pass (one more builder turn for a business that fails them), the
build, the review that looks at every page and fixes what it finds, landing,
the deploy wait, registering, the picture, the preview-first letters and
sending. No turn stays open while a deploy finishes or a clock runs down.

A letter's site is built only while the mailbox is near it (routine.py
backlog): a run that finds enough letters already waiting builds nothing and
says so, and a run stops starting batches once the wait is long enough.

The run's last line is the routine's status for routine-deliver.py:
`ROUTINE-STATUS: ok`, or `ROUTINE-STATUS: attention <why>` when the run broke,
or when it found parked businesses, had room to build and finished none.
"""

import os

os.environ.setdefault("no_proxy", "*")

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

from . import collect, drafts, gate, review, vision
from .__main__ import ROOT
from .build import Parked, build
from .check import all_checks
from .letter import letter_for
from .pipeline import HOUSTON, call, discard, git, land, log, park, routine, send_waiting, wait_live
from .slug import slug_for

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.environ.get("PREVIEW_BUILD_MODEL") or "claude-opus-5-5"
# The depth the builders worked at before this run was split up; Opus 5.5
# would otherwise start a level lower.
EFFORT = os.environ.get("PREVIEW_BUILD_EFFORT") or "high"
BUILD_MINUTES = int(os.environ.get("PREVIEW_BUILD_MINUTES") or 25)
FIX_MINUTES = int(os.environ.get("PREVIEW_FIX_TURN_MINUTES") or 10)
# What a batch needs from its first builder to its last letter: the builders,
# a fixing turn, the build and checks, two looks by the review with its fixes,
# landing, the deploy wait and the letters.
BATCH_MINUTES = int(os.environ.get("PREVIEW_BATCH_MINUTES") or 75)
LETTERS = os.environ.get("PREVIEW_LETTERS") or os.path.expanduser("~/bin/preview-letters.py")
# A trial run (--dry) builds, checks and reviews, and changes nothing anyone else sees.
DRY = False
WRITING_PASS = os.path.expanduser("~/bin/writing-pass.py")
# Keys this process holds that a builder must not: it runs unattended with its
# permissions skipped, and a key it can read is a key it can send with.
SECRETS = ("SUPABASE_SERVICE_ROLE_KEY", "CRON_SECRET", "PAGESPEED_API_KEY", "PLACES_API_KEY", "GOOGLE_PLACES_API_KEY",
           "RESEND_API_KEY", "GITHUB_PERSONAL_ACCESS_TOKEN", "GH_TOKEN", "GITHUB_TOKEN")
EXAMPLES = {"plumbing": "wedgeworthplumbing", "barber": "houranisbarbershop", "realestate": "styledrealestate"}

ANSWER = {
    "type": "object",
    "properties": {
        "status": {"type": "string", "enum": ["built", "drop"]},
        "reason": {"type": "string"},
        "letter": {
            "type": "object",
            "properties": {"subject": {"type": "string"}, "paragraphs": {"type": "array", "items": {"type": "string"}}},
            "required": ["subject", "paragraphs"],
        },
        "inventory": {
            "type": "array",
            "items": {"type": "object", "properties": {"item": {"type": "string"}, "where": {"type": "string"}},
                      "required": ["item", "where"]},
        },
        "notes": {"type": "string"},
    },
    "required": ["status"],
}


def deadline():
    return int(os.environ.get("ROUTINE_DEADLINE_EPOCH") or time.time() + 4 * 3600)


def template_file(template):
    """The template's file, matched without case: `hvac` is Hvac.jsx, `autorepair` AutoRepair.jsx."""
    for name in os.listdir(os.path.join(ROOT, "src", "templates")):
        if name.lower() == f"{template}.jsx":
            return name
    return f"{template}.jsx"


def fill(name, values):
    with open(os.path.join(HERE, name)) as handle:
        text = handle.read()
    for key, value in values.items():
        text = text.replace(f"<<{key}>>", str(value))
    return text


def _env():
    env = vision._env()
    for key in SECRETS:
        env.pop(key, None)
    # What a builder prints is read by this script, not by a person.
    env["TETHER"] = "0"
    return env


def ask(prompt, minutes, label):
    """One builder turn; its structured answer and what it cost, or (None, cost, why)."""
    claude = shutil.which("claude") or os.path.expanduser("~/.local/bin/claude")
    command = [claude, "-p", "--model", MODEL, "--effort", EFFORT, "--dangerously-skip-permissions",
               "--setting-sources", "", "--strict-mcp-config", "--output-format", "json",
               "--json-schema", json.dumps(ANSWER)]
    budget = min(minutes * 60, deadline() - time.time() - 60)
    if budget < 120:
        return None, 0.0, "no time left in the run"
    try:
        done = subprocess.run(command, input=prompt, cwd=ROOT, capture_output=True, text=True, timeout=budget,
                              env=_env())
    except subprocess.TimeoutExpired:
        return None, 0.0, f"the builder ran past its {minutes} minutes"
    except OSError as error:
        return None, 0.0, f"the builder could not start: {error}"
    try:
        out = json.loads(done.stdout or "{}")
    except ValueError:
        return None, 0.0, f"the builder answered nothing readable: {(done.stderr or done.stdout)[-200:]}"
    cost = float(out.get("total_cost_usd") or 0)
    log(label, f"builder turn: {out.get('num_turns', '?')} steps, ${cost:.2f}")
    if out.get("is_error") or not out.get("structured_output"):
        return None, cost, f"the builder failed: {str(out.get('result'))[:200]}"
    return out["structured_output"], cost, None


def describe(draft, slug, root):
    """What the script left of this business, in words for its builder."""
    folder = drafts.folder(draft["prospect_id"])
    lines = []
    if os.path.exists(os.path.join(root, "src", "brands", f"{slug}.json")):
        lines.append(f"Its brand file is already written at `src/brands/{slug}.json`: start from it.")
    else:
        lines.append(f"No brand file was written. What the script had made of it when it stopped is in "
                     f"`{folder}/partial.json` (the colors, type and logo fields it settled, and the services and "
                     f"words it found); start your file from that.")
    pictures = os.path.join(root, "public", "brands", slug)
    names = sorted(os.listdir(pictures)) if os.path.isdir(pictures) else []
    if names:
        lines.append(f"`public/brands/{slug}/` already holds: {', '.join(names)}.")
    if draft.get("logo_source"):
        lines.append(f"The logo came from {draft['logo_source']} and passed the gate.")
    elif "logo" not in " ".join(names):
        lines.append("No logo of theirs passed the gate yet.")
    for photo in draft.get("photos") or []:
        lines.append(f"Photo {photo.get('path')}: from {photo.get('source')}" + (f" - the look said: {photo['look']}" if photo.get("look") else ""))
    if draft.get("photos_refused"):
        lines.append("Photos the gate refused: " + "; ".join(draft["photos_refused"][:12]))
    for note in draft.get("notes") or []:
        lines.append(f"Note: {note}")
    return "\n".join(lines)


def copy_of(row):
    """A copy of their website beside the draft: its path in words, or why there is none."""
    folder = drafts.folder(row["id"])
    if not os.path.exists(os.path.join(folder, "site.json")):
        try:
            site = collect.copy(row["website"])
            drafts.keep_copy(row["id"], site, collect.copy_markdown(site))
        except Exception as error:
            return None, f"No copy could be made: their site did not answer ({str(error)[:160]})."
    return os.path.join(folder, "site.json"), f"A copy of their website is at `{os.path.join(folder, 'site.md')}`."


def prepare(row):
    """Puts what is known of one parked business into the checkout: its draft,
    or a fresh scripted build when it has none. Returns the batch item."""
    item = {"row": row, "letter": None, "cost": 0.0}
    name = " ".join(row["name"].split())
    draft = drafts.read(row["id"])
    try:
        with open(os.path.join(drafts.folder(row["id"]), "letter.json")) as handle:
            item["letter"] = json.load(handle)
    except (OSError, ValueError):
        pass
    # A site an earlier run landed and never registered is taken as it is,
    # the way the scripted run takes one, rather than built again under a
    # second name.
    for slug in dict.fromkeys(([draft["slug"]] if draft else []) + [slug_for(row["name"], None, ROOT)]):
        landed = os.path.join(ROOT, "src", "brands", f"{slug}.json")
        if os.path.exists(landed) and brand_name(landed) == name:
            item.update(slug=slug, landed=True, needs_builder=False)
            log("already landed", slug)
            return item
    if draft:
        if os.path.exists(os.path.join(ROOT, "src", "brands", f"{draft['slug']}.json")):
            # Another business took the slug since this one was parked.
            draft = drafts.restore(row["id"], ROOT, slug_for(row["name"], row.get("town"), ROOT))
        else:
            draft = drafts.restore(row["id"], ROOT)
        item.update(slug=draft["slug"], reason=draft["reason"], needs_builder=True)
    else:
        slug = slug_for(row["name"], row.get("town"), ROOT)
        known, evidence = None, None
        try:
            brand, evidence = build(row, ROOT, slug)
            problems = all_checks(brand, evidence, ROOT, slug)
        except Parked as reason:
            problems, known = [str(reason)], getattr(reason, "known", None)
        except Exception as error:
            problems = [f"the build broke: {type(error).__name__}: {str(error)[:160]}"]
        item.update(slug=slug, reason="; ".join(problems), needs_builder=bool(problems))
        drafts.save(row, slug, ROOT, item["reason"] or "built by the script on a second try", known, evidence)
        log("rebuilt by the script", slug, item["reason"] or "and it passed")
    if item["needs_builder"]:
        item["site_json"], item["copy"] = copy_of(row)
    return item


def brand_name(path):
    try:
        with open(path) as handle:
            return json.load(handle).get("name")
    except (OSError, ValueError):
        return None


def business(row):
    return json.dumps({k: v for k, v in row.items() if k not in ("parked_at", "park_reason", "channel")},
                      indent=2, ensure_ascii=False, default=str)


def run_builder(item):
    row, slug = item["row"], item["slug"]
    template = row["industry"]
    prompt = fill("brief.md", {
        "minutes": BUILD_MINUTES,
        "business": business(row),
        "root": ROOT,
        "slug": slug,
        "reason": item["reason"],
        "draft": describe(drafts.read(row["id"]), slug, ROOT),
        "copy": item["copy"],
        "site_json": item["site_json"] or "<no copy of their site was made>",
        "template": template,
        "template_file": template_file(template),
        "example": f"src/brands/{EXAMPLES.get(template, 'sample-' + template)}.json",
        "place_id": row.get("place_id") or "<PLACE_ID>",
    })
    answer, cost, why = ask(prompt, BUILD_MINUTES, slug)
    item["cost"] += cost
    item["answer"], item["why"] = answer, why
    if answer:
        left = [entry for entry in answer.get("inventory") or [] if "left out" in entry.get("where", "").lower()]
        log(slug, f"the builder says {answer.get('status')}: {len(answer.get('inventory') or [])} things from their "
                  f"site placed or weighed, {len(left)} left out", answer.get("reason") or "", (answer.get("notes") or "")[:300])
        with open(os.path.join(drafts.folder(row["id"]), "answer.json"), "w") as handle:
            json.dump(answer, handle, indent=2, ensure_ascii=False)
    else:
        log(slug, "the builder gave no answer:", why)
    if answer and answer.get("letter"):
        item["letter"] = answer["letter"]
    return item


def run_fixer(item, problems):
    row, slug = item["row"], item["slug"]
    copy_of(row)
    site_md = os.path.join(drafts.folder(row["id"]), "site.md")
    prompt = fill("fix.md", {
        "minutes": FIX_MINUTES,
        "name": row["name"],
        "slug": slug,
        "root": ROOT,
        "problems": "\n".join(f"- {p}" for p in problems),
        "template_file": template_file(row["industry"]),
        "site_md": site_md if os.path.exists(site_md) else "<no copy of their site was made>",
    })
    answer, cost, why = ask(prompt, FIX_MINUTES, f"{slug} fix")
    item["cost"] += cost
    return answer, why


def keep(item, reason):
    """Parks a business with what this run made of it, for the next run."""
    drafts.save(item["row"], item["slug"], ROOT, reason, letter=item.get("letter"))
    if not DRY:
        park(item["row"], reason)
    discard(item["slug"])


def drop(item, reason, report):
    if DRY:
        log(item["slug"], "would be dropped:", reason)
        report["dropped"].append({"slug": item["slug"], "why": reason})
        return
    code, out = call("skip", item["row"]["id"], reason)
    if code:
        # A reason the database refuses (a missing logo is never one) leaves
        # the business parked for the next run instead.
        keep(item, f"the builder gave up, but not for a reason that drops a business: {reason}")
        report["parked"].append({"slug": item["slug"], "why": reason})
        return
    drafts.remove(item["row"]["id"])
    discard(item["slug"])
    report["dropped"].append({"slug": item["slug"], "why": reason})


def npm_build():
    done = subprocess.run(["npm", "run", "build"], cwd=ROOT, capture_output=True, text=True, stdin=subprocess.DEVNULL)
    return done.returncode == 0, done.stderr[-600:]


def checked(items):
    """The checks every brand file passes before it can land, with one fixing
    turn for a business that fails them. Returns the items that passed."""
    built, why = npm_build()
    if not built:
        found = {item["slug"]: [f"the site build failed: {why}"] for item in items}
    else:
        found = gate.examine([item["slug"] for item in items], say=log)
    failing = [item for item in items if found.get(item["slug"])]
    if failing and time.time() < deadline() - (BATCH_MINUTES - BUILD_MINUTES) * 60:
        with ThreadPoolExecutor(max_workers=len(failing)) as pool:
            answers = list(pool.map(lambda item: run_fixer(item, found[item["slug"]]), failing))
        built, why = npm_build()
        again = gate.examine([item["slug"] for item in failing], say=log) if built else \
            {item["slug"]: [f"the site build failed: {why}"] for item in failing}
        for item, (answer, _) in zip(failing, answers):
            found[item["slug"]] = again.get(item["slug"]) or []
            if answer and answer.get("status") == "drop" and found[item["slug"]]:
                item["drop"] = answer.get("reason") or "it could not be fixed without inventing something"
    return found


def letter(item):
    """The builder's letter when it holds together and reads clean; the
    scripted one (letter.py) otherwise."""
    with open(os.path.join(ROOT, "src", "brands", f"{item['slug']}.json")) as handle:
        brand = json.load(handle)
    written = item.get("letter") or {}
    paragraphs = written.get("paragraphs") or []
    good = bool(written.get("subject")) and len(paragraphs) == 3 and "{url}" in paragraphs[0]
    if good and os.path.exists(WRITING_PASS):
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as handle:
            handle.write("\n\n".join(paragraphs))
        done = subprocess.run([sys.executable, WRITING_PASS, "check", handle.name], capture_output=True, text=True,
                              stdin=subprocess.DEVNULL)
        os.remove(handle.name)
        if done.returncode:
            log(item["slug"], "the builder's letter was flagged, so the scripted one goes:", done.stdout.strip()[-200:])
            good = False
    return written if good else letter_for(item["row"], brand)


def first_letters(slugs, report):
    """The preview-first letters for a batch, written before any is sent (send
    refuses a site still owed them)."""
    if not slugs or not os.path.exists(LETTERS):
        return
    budget = max(60, min(900, deadline() - time.time() - 300))
    done = subprocess.run([sys.executable, LETTERS, "--budget", str(budget), "--slug", ",".join(slugs)],
                          capture_output=True, text=True, stdin=subprocess.DEVNULL)
    found = re.search(r"<letters_report>(.*?)</letters_report>", done.stdout, re.S)
    if found:
        log("preview-first letters:", found.group(1)[:300])
    elif done.returncode:
        report["notes"].append(f"the preview-first letters did not run: {(done.stderr or done.stdout)[-200:]}")


def run_batch(rows, n, stamp, report):
    # One after another: the script's build keeps the photos already shown in
    # this run, so no two businesses take the same stock picture.
    items = [prepare(row) for row in rows]
    try:
        finish(items, n, stamp, report)
    finally:
        report["cost_usd"] += sum(item["cost"] for item in items)


def finish(items, n, stamp, report):
    building = [item for item in items if item.get("needs_builder")]
    if building:
        with ThreadPoolExecutor(max_workers=len(building)) as pool:
            list(pool.map(run_builder, building))
    ready = []
    for item in items:
        if not item.get("needs_builder"):
            ready.append(item)
            continue
        answer = item.get("answer")
        if not answer:
            keep(item, item.get("why") or "the builder did not answer")
            report["parked"].append({"slug": item["slug"], "why": item.get("why")})
        elif answer.get("status") == "drop":
            drop(item, answer.get("reason") or "no real facts to build a site from", report)
        else:
            drafts.save(item["row"], item["slug"], ROOT, "built by hand, not yet checked", letter=item["letter"])
            ready.append(item)
    # A site an earlier run landed goes through the same checks: it was landed
    # before some of them existed.
    if ready:
        found = checked(ready)
        for item in list(ready):
            if item.get("drop"):
                drop(item, item["drop"], report)
            elif found.get(item["slug"]):
                why = "; ".join(found[item["slug"]])
                keep(item, why)
                report["parked"].append({"slug": item["slug"], "why": why})
            else:
                continue
            ready.remove(item)
    fixes, changed, problems = [], [], {}
    looking = [item for item in ready if not review.passed(item["slug"])]
    if looking:
        verdict = review.run([item["slug"] for item in looking], deadline=deadline() - 20 * 60)
        fixes += verdict["fixes"]
        changed += verdict["changed"]
        problems = verdict["problems"]
    failing = [item for item in looking if problems.get(item["slug"])]
    if failing and time.time() < deadline() - 30 * 60:
        # What the review still finds after its own fixes is fixed in each
        # business's own material, checked again, and looked at once more.
        log("fixing what the review found on", ", ".join(item["slug"] for item in failing))
        with ThreadPoolExecutor(max_workers=len(failing)) as pool:
            list(pool.map(lambda item: run_fixer(item, problems[item["slug"]]), failing))
        built, why = npm_build()
        found = gate.examine([item["slug"] for item in failing], say=log) if built else \
            {item["slug"]: [f"the site build failed: {why}"] for item in failing}
        problems = {slug: p for slug, p in found.items() if p}
        again = [item["slug"] for item in failing if item["slug"] not in problems]
        if again:
            verdict = review.run(again, deadline=deadline() - 20 * 60)
            fixes += verdict["fixes"]
            changed += verdict["changed"]
            problems.update(verdict["problems"])
    for item in failing:
        if problems.get(item["slug"]):
            why = "; ".join(problems[item["slug"]])
            keep(item, why)
            report["parked"].append({"slug": item["slug"], "why": why})
            ready.remove(item)
    for item in ready:
        # A landed site whose own files a fix changed lands again with them.
        if item.get("landed") and git("status", "--porcelain", "--", f"src/brands/{item['slug']}.json",
                                      f"public/brands/{item['slug']}").stdout.strip():
            item["landed"] = False
    if DRY:
        for item in ready:
            log("ready to land", item["slug"], json.dumps(letter(item))[:600])
            report["built"].append(item["slug"])
        return
    if not ready and not changed:
        return
    land(ready, f"previews-morning-{stamp}-{n}", {"fixes": fixes, "changed": sorted(set(changed))})
    live, missing = wait_live([item["slug"] for item in ready])
    report["not_live"] += missing
    registered = []
    for item in ready:
        if item["slug"] not in live:
            continue
        path = os.path.join(ROOT, ".autobuild", f"{item['slug']}.letter.json")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as handle:
            json.dump(letter(item), handle)
        code, out = call("register", item["slug"], item["row"]["id"], path)
        if code:
            report["notes"].append(f"{item['slug']} could not be registered: {out[-160:]}")
            continue
        if call("shot", item["slug"])[0] and call("shot", item["slug"])[0]:
            report["notes"].append(f"{item['slug']} has no picture of its site")
        drafts.remove(item["row"]["id"])
        registered.append(item["slug"])
        report["built"].append(item["slug"])
    first_letters(registered, report)
    send_waiting(report)


def status(report, found):
    if report.get("broke"):
        return "attention The morning preview run broke before it finished. The details are in its log."
    if found and not report["paused"] and not report["built"] and not report["dropped"]:
        return "attention The morning preview run finished none of the previews the script set aside."
    return "ok"


def main(argv):
    global DRY
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=int, default=5)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--prospect", action="append", default=[], help="these parked businesses alone, by id")
    parser.add_argument("--dry", action="store_true",
                        help="build, check and review the first batch, whatever is waiting, and land, register, send, "
                             "park and drop nothing; set PREVIEW_DRAFTS to keep its drafts apart")
    args = parser.parse_args(argv)
    DRY = args.dry

    report = {"found": 0, "built": [], "dropped": [], "parked": [], "sent": [], "not_sent": [], "not_live": [],
              "notes": [], "paused": False, "cost_usd": 0.0}
    drafts.prune()
    rows = [r for r in routine.due() if r.get("parked_at") and (not args.prospect or r["id"] in args.prospect)]
    if args.limit:
        rows = rows[:args.limit]
    report["found"] = len(rows)
    log(f"{len(rows)} parked businesses due a site")
    stamp = datetime.now(HOUSTON).strftime("%Y%m%d-%H%M")
    n = 0
    try:
        while rows and time.time() < deadline() - BATCH_MINUTES * 60:
            held = routine.backlog() if not DRY else {"full": False}
            if held["full"]:
                report["paused"] = n == 0
                report["held"] = (f"{held['waiting']} letters wait for the mailbox, which sent at most "
                                  f"{held['best_day']} in a day this week, so nothing more was built")
                report["notes"].append(report["held"])
                break
            batch, rows = rows[:args.batch], rows[args.batch:]
            n += 1
            log(f"batch {n}:", ", ".join(r["name"] for r in batch))
            run_batch(batch, n, stamp, report)
            if DRY:
                break
    except Exception as error:
        report["broke"] = f"{type(error).__name__}: {str(error)[:300]}"
        log("the run broke:", report["broke"])
    if not args.dry:
        send_waiting(report)
    report["left"] = len(rows)
    report["cost_usd"] = round(report["cost_usd"], 2)
    print("<parked_report>" + json.dumps(report) + "</parked_report>")
    if report["paused"]:
        print(f"Built nothing: {report['held']}.")
    else:
        print(f"Of {report['found']} parked businesses, {len(report['built'])} were "
              f"{'ready to land (a trial lands nothing)' if DRY else 'built and registered'}, "
              f"{len(report['dropped'])} were dropped and {len(report['parked'])} stay parked; "
              f"the builders' turns came to ${report['cost_usd']:.2f} at API prices.")
    print("ROUTINE-STATUS: " + status(report, report["found"]))


if __name__ == "__main__":
    main(sys.argv[1:])
