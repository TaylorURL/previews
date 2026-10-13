"""The scripted preview run: every prospect whose third letter is due, built,
checked, reviewed, landed, proved live and - when sending is on - sent. A
business that fails any check is parked with the reason, and the preview
session builds only those.

The review (review.py) looks at every page of each built site and sends an
agent to fix what it finds in the template or the builder, where the fault
comes from, before anything lands; a site it has not passed is never
registered, so its letter never goes.

    ~/.claude/tools/with-credential.py \\
      supabase-service-role-sunday=SUPABASE_SERVICE_ROLE_KEY \\
      taylorurl-cron-secret=CRON_SECRET \\
      -- python3 -m scripts.autobuild.pipeline [--dry] [--send] [--catch-up] [--batch N] [--limit N]

Run from a worktree of the previews repository cut from origin/develop. It
works the due list oldest first, a batch at a time, and stops starting batches
when the deadline is near, so whatever is left heads the next run's list.

--dry builds and checks into the worktree and lands, registers and sends
nothing. --send sends the letters of the sites it proved live, within the
day's ceiling; without it a live site is registered and waits for a run that
sends.

While the outreach catch-up is open (taylorurl-com
lib/outreach/sending/catch-up.js), the letters it holds - sites registered
before it opened whose letter had not gone - go from its opening rather than
from 8:00, outside the day's ceiling, and ahead of anything built. --catch-up
sends those and nothing else and builds nothing, which is how the 7:00 session
sends them before its turn while it holds the lock this script runs under.

A business the studio holds a number for and no address is built for ahead of
the letters' businesses while fewer than forty of their sites wait to be sent,
and its site is sent by text rather than by letter
(taylorurl-com lib/outreach/sending/texts.js): only once texting is switched on
and its start has passed, 9:00 to 17:00 Houston time Monday to Saturday, and
within the text line's own daily cap. Texts spend none of the letters' ceiling.
"""

import os

os.environ.setdefault("no_proxy", "*")

import argparse
import importlib.util
import json
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from .__main__ import ROOT, render
from .build import Parked, build
from .check import all_checks
from .compose import AUTOMATED
from .letter import letter_for
from .slug import slug_for
from . import review, visual

spec = importlib.util.spec_from_file_location("routine", os.path.join(ROOT, "scripts", "routine.py"))
routine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(routine)

HOUSTON = ZoneInfo("America/Chicago")
# The outreach machine's own window (taylorurl-com lib/outreach/sending/schedule.js):
# 8:00 to 17:00 Houston time, Monday to Saturday.
SEND_HOURS = range(8, 17)
# The text line's window (taylorurl-com lib/outreach/sending/texts.js): 9:00 to
# 17:00 Houston time, Monday to Saturday.
TEXT_HOURS = range(9, 17)
SPACING = 20


def log(*parts):
    print(datetime.now(HOUSTON).strftime("%H:%M:%S"), *parts, flush=True)


def git(*args, check=True):
    return subprocess.run(["git", *args], cwd=ROOT, check=check, capture_output=True, text=True, stdin=subprocess.DEVNULL)


def gh(*args):
    """One GitHub call, asked again after a pause when it fails: a branch pushed
    a second ago is not always visible to the pull request API yet."""
    for attempt in range(4):
        done = subprocess.run(["gh", *args], cwd=ROOT, capture_output=True, text=True, stdin=subprocess.DEVNULL)
        if done.returncode == 0:
            return done.stdout.strip()
        log("gh", args[0], args[1], "failed:", done.stderr.strip()[-300:])
        time.sleep(10 * (attempt + 1))
    raise RuntimeError(f"gh {' '.join(args[:2])} failed four times: {done.stderr.strip()[-300:]}")


def deadline():
    return int(os.environ.get("ROUTINE_DEADLINE_EPOCH") or time.time() + 50 * 60)


def park(row, reason):
    routine.rest(
        "PATCH",
        f"outreach_prospects?id=eq.{row['id']}",
        {"preview_parked_at": datetime.now(timezone.utc).isoformat(), "preview_park_reason": reason[:500]},
        prefer="return=minimal",
    )


def discard(slug):
    for path in (os.path.join(ROOT, "src", "brands", f"{slug}.json"), os.path.join(ROOT, "public", "brands", slug)):
        if os.path.isdir(path):
            shutil.rmtree(path)
        elif os.path.exists(path):
            os.remove(path)


SHOTS = os.path.join(ROOT, ".autobuild", "shots")


def layout(slugs):
    """Each built home page opened at desktop and phone size, and looked at:
    {slug: problems}. The pictures it takes stay in .autobuild/shots."""
    os.makedirs(SHOTS, exist_ok=True)
    out = subprocess.run(["node", "scripts/autobuild/layout.mjs", SHOTS, *slugs], cwd=ROOT, capture_output=True, text=True,
                         stdin=subprocess.DEVNULL)
    seen = json.loads(out.stdout or "{}")
    found = {}
    for slug in slugs:
        result = seen.get(slug)
        if result is None:
            found[slug] = [f"the layout check did not open it: {out.stderr.strip()[-200:]}"]
            continue
        # The pages are looked at by the review, every one of them; this is the
        # arithmetic on how the logo sits.
        found[slug] = result["problems"] + visual.look(result, ask_vision=False)
        for note in result.get("notes", []):
            log(slug, note)
    return found


# The time a batch needs after its last build: the site build, the look at
# each page, landing, the deploy wait and the letters.
LAND_MINUTES = 12
# The time the review's second look needs, after its fixes.
REVIEW_MINUTES = 6


def build_batch(rows):
    """Builds, checks and reviews each business; returns the ones that passed,
    the parked ones, the ones not reached before the batch had to land, and
    what the review fixed: {"fixes": [sentences], "changed": [paths]}."""
    passed, parked, unbuilt = [], [], []
    fixed = {"fixes": [], "changed": []}
    for row in rows:
        if time.time() > deadline() - LAND_MINUTES * 60:
            # Left due rather than parked, so the next run takes it first.
            unbuilt.append(row)
            continue
        # A site an earlier run landed and never registered is taken as it is
        # rather than built again under a second name.
        landed = os.path.join(ROOT, "src", "brands", f"{slug_for(row['name'], None, ROOT)}.json")
        if os.path.exists(landed):
            with open(landed) as handle:
                brand = json.load(handle)
            if brand.get("name") == " ".join(row["name"].split()):
                slug = os.path.basename(landed)[:-5]
                passed.append({"row": row, "slug": slug, "brand": brand, "problems": [], "landed": True})
                log("already landed", slug)
                continue
        slug = slug_for(row["name"], row.get("town"), ROOT)
        try:
            brand, evidence = build(row, ROOT, slug)
            problems = all_checks(brand, evidence, ROOT, slug)
            for note in evidence.get("notes", []):
                log(slug, note)
        except Parked as reason:
            problems, brand = [str(reason)], None
        except Exception as error:
            problems, brand = [f"the build broke: {type(error).__name__}: {str(error)[:160]}"], None
        item = {"row": row, "slug": slug, "brand": brand, "problems": problems}
        (parked if problems else passed).append(item)
        log("built" if not problems else "parked", slug, "; ".join(problems))
    fresh = [p for p in passed if not p.get("landed")]
    if not fresh and all(review.passed(p["slug"]) for p in passed):
        return passed, parked, unbuilt, fixed
    drawn = render([p["slug"] for p in fresh])
    for item in list(passed):
        if drawn.get(item["slug"]):
            item["problems"] = drawn[item["slug"]]
            passed.remove(item)
            parked.append(item)
    if passed:
        done = subprocess.run(["npm", "run", "build"], cwd=ROOT, capture_output=True, text=True, stdin=subprocess.DEVNULL)
        if done.returncode != 0:
            raise RuntimeError(f"the site build failed: {done.stderr[-600:]}")
        seen = layout([p["slug"] for p in passed if not p.get("landed")])
        for item in list(passed):
            if seen.get(item["slug"]):
                item["problems"] = seen[item["slug"]]
                passed.remove(item)
                parked.append(item)
    unreviewed = [p["slug"] for p in passed if not review.passed(p["slug"])]
    if unreviewed:
        verdict = review.run(unreviewed, deadline=deadline() - (LAND_MINUTES + REVIEW_MINUTES) * 60)
        fixed = {"fixes": verdict["fixes"], "changed": verdict["changed"]}
        for line in verdict["fixes"]:
            log("review fixed", line)
        for item in list(passed):
            if verdict["problems"].get(item["slug"]):
                item["problems"] = verdict["problems"][item["slug"]]
                passed.remove(item)
                parked.append(item)
    for item in parked:
        if not item.get("landed"):
            discard(item["slug"])
    return passed, parked, unbuilt, fixed


def release():
    """Puts develop on main when it holds anything main does not."""
    git("fetch", "origin")
    if not git("log", "--oneline", "origin/main..origin/develop").stdout.strip():
        return
    today = datetime.now(HOUSTON).strftime("%Y-%m-%d %H:%M")
    url = gh("pr", "create", "--base", "main", "--head", "develop", "--title", f"Release {today} previews", "--body",
             "Puts the preview sites landed on develop live.")
    gh("pr", "merge", url, "--merge")
    git("fetch", "origin")


def land(passed, branch, fixed=None):
    """Lands the new sites and whatever the review fixed, in one pull request."""
    fixed = fixed or {"fixes": [], "changed": []}
    passed = [p for p in passed if not p.get("landed")]
    if not passed and not fixed["changed"]:
        release()
        return
    names = [p["row"]["name"] for p in passed]
    git("checkout", "-B", branch, "origin/develop")
    for p in passed:
        git("add", f"src/brands/{p['slug']}.json", f"public/brands/{p['slug']}")
    for path in fixed["changed"]:
        # A brand file the review touched for a site it then parked went with
        # the site, so there is nothing of it left to add.
        if os.path.exists(os.path.join(ROOT, path)) or git("ls-files", "--", path).stdout.strip():
            git("add", "--all", "--", path)
    if names:
        listed = ", ".join(names[:-1]) + (f" and {names[-1]}" if len(names) > 1 else names[0])
        subject = f"Add preview sites for {listed}"
        if len(subject) > 200:
            subject = f"Add preview sites for {len(names)} businesses"
    else:
        subject = "Fix what the preview review found"
    # Each fix is named on a line of its own, which is how the review reads
    # back what it has fixed before.
    body = "\n".join([f"- {n}" for n in names] + [f"Review fix: {line}" for line in fixed["fixes"]])
    git("commit", "-m", subject, "-m", body or subject)
    git("push", "-u", "origin", branch)
    url = gh("pr", "create", "--base", "develop", "--head", branch, "--title", subject, "--body",
             "Brand files and pictures built by the scripted preview run, each from the business's own website and "
             "Google listing, each past the checks and the review before it was added."
             + ("\n\nThe review fixed:\n" + "\n".join(f"- {line}" for line in fixed["fixes"]) if fixed["fixes"] else ""))
    # The merge is asked of GitHub alone: gh's own branch cleanup tries to
    # check out develop here, which the primary checkout already holds.
    gh("pr", "merge", url, "--squash")
    git("push", "origin", "--delete", branch, check=False)
    git("checkout", "--detach", "origin/develop", check=False)
    git("branch", "-D", branch, check=False)
    release()


def wait_live(slugs, minutes=10):
    waiting, live = set(slugs), []
    end = time.time() + minutes * 60
    while waiting and time.time() < end:
        for slug in list(waiting):
            if subprocess.run([sys.executable, "scripts/routine.py", "live", slug], cwd=ROOT, capture_output=True,
                              stdin=subprocess.DEVNULL).returncode == 0:
                waiting.discard(slug)
                live.append(slug)
        if waiting:
            time.sleep(30)
    return live, sorted(waiting)


def call(*args):
    done = subprocess.run([sys.executable, "scripts/routine.py", *args], cwd=ROOT, capture_output=True, text=True,
                          stdin=subprocess.DEVNULL)
    return done.returncode, (done.stdout + done.stderr).strip()


def settings():
    return routine.rest(
        "GET",
        "outreach_settings?select=daily_cap,sending_enabled,catch_up_held_since,catch_up_from,catch_up_until,"
        "texting_enabled,texting_starts_at,text_daily_cap&limit=1",
    )[0]


def ceiling(row):
    """How many first preview letters may go today: the outreach machine's own daily cap."""
    return row["daily_cap"] if row["sending_enabled"] else 0


def unsent():
    """Registered, live sites whose letter or text has not gone, oldest first.
    A business the text line has refused is left out: its number cannot take
    the text, and asking again would only be refused again."""
    rows = routine.rest(
        "GET",
        "preview_sites?select=slug,prospect_id,created_at,channel,outreach_prospects(preview_skipped_at)"
        "&sent_at=is.null&prospect_id=not.is.null&order=created_at",
    ) or []
    return [row for row in rows
            if row["channel"] != "text" or not (row.get("outreach_prospects") or {}).get("preview_skipped_at")]


def catching_up():
    return routine.catch_up(settings())[1]


def send_waiting(report, held_only=False):
    """Sends the registered sites whose letter or text has not gone: the
    letters, then the texts. held_only sends a catch-up's held letters alone."""
    row = settings()
    if not row["sending_enabled"]:
        report["notes"].append("sending is switched off, so no letter or text went")
        return
    sites = unsent()
    send_letters(report, row, [site for site in sites if site["channel"] != "text"], held_only)
    if not held_only:
        send_texts(report, row, [site for site in sites if site["channel"] == "text"])


def send_texts(report, row, sites):
    """Sends the first text of each site filed to go by text.

    Only while the text line is open: texting switched on, its start passed,
    inside its hours and within its daily cap, which follow-ups spend too. The
    endpoint holds the same line and answers 503 when it is shut, so this only
    keeps the run from asking when the answer is already known.
    """
    if not sites:
        return
    now = datetime.now(HOUSTON)
    starts = routine.instant(row.get("texting_starts_at"))
    if not row.get("texting_enabled") or not starts or starts > now:
        report["notes"].append(f"{len(sites)} text previews wait for the text line to open")
        return
    if now.weekday() == 6 or now.hour not in TEXT_HOURS:
        report["notes"].append("outside texting hours, so no text went")
        return
    room = (row.get("text_daily_cap") or 0) - routine.texts_sent_today()
    for site in sites:
        if room <= 0 or time.time() > deadline() - 120:
            break
        code, out = call("send", site["slug"])
        log("text", site["slug"], out[-200:])
        if code == 0:
            report["sent"].append(site["slug"])
            room -= 1
            continue
        report["not_sent"].append({"slug": site["slug"], "why": out[-200:]})
        # A 503 is the line itself shut, which no later site would find open.
        if re.search(r": 503 ", out):
            break


def send_letters(report, row, sites, held_only):
    """Sends the registered sites whose letter has not gone.

    A catch-up's held letters go first and outside the ceiling, from the
    catch-up's opening. The rest go inside the window and within what the
    ceiling has left, which the held letters do not spend. held_only sends the
    held letters alone.
    """
    now = datetime.now(HOUSTON)
    opened, active = routine.catch_up(row)
    # The catch-up moves the opening forward for its held letters alone; the
    # day's own keep the normal hours.
    own_open = now.weekday() != 6 and now.hour in SEND_HOURS
    held_open = active and now.weekday() != 6 and now.hour < SEND_HOURS.stop
    if not (own_open or held_open):
        report["notes"].append("outside sending hours, so no letter went")
        return
    room = ceiling(row) - routine.sent_today_count()
    held = [site for site in sites if held_open and routine.instant(site["created_at"]) < opened]
    own = [site for site in sites if site not in held] if own_open and not held_only else []
    first = True
    for site in held + own:
        back = site in held
        if (not back and room <= 0) or time.time() > deadline() - 120:
            break
        if not first:
            time.sleep(SPACING)
        first = False
        code, out = call("send", site["slug"])
        log("send", site["slug"], out[-200:])
        if code == 0:
            report["sent"].append(site["slug"])
            if not back:
                room -= 1
        else:
            report["not_sent"].append({"slug": site["slug"], "why": out[-200:]})
            # A 502 is the send job failing outright, which is the mail path
            # refusing rather than anything about this letter. In a catch-up the
            # site's endpoint closes the catch-up on that refusal, and nothing
            # more is offered to the mailbox from this run.
            if active and re.search(r": 502 ", out):
                report["notes"].append("the mail server refused a letter during the catch-up, so no further letter went")
                break


def main(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    parser.add_argument("--send", action="store_true")
    parser.add_argument("--catch-up", action="store_true")
    parser.add_argument("--batch", type=int, default=4)
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args(argv)

    report = {"built": [], "parked": [], "sent": [], "not_sent": [], "not_live": [], "notes": []}
    if args.catch_up:
        if not args.dry and catching_up():
            send_waiting(report, held_only=True)
        print("<pipeline_report>" + json.dumps(report) + "</pipeline_report>")
        return
    # An open catch-up's held letters go before anything is built, since a
    # build batch takes a quarter of an hour and the backlog is already late.
    if args.send and not args.dry and catching_up():
        send_waiting(report, held_only=True)
    rows = [r for r in routine.due() if not r.get("parked_at") and r["industry"] in AUTOMATED]
    if args.limit:
        rows = rows[:args.limit]
    log(f"{len(rows)} due for a scripted build")
    stamp = datetime.now(HOUSTON).strftime("%Y%m%d-%H%M")
    n = 0
    # A batch of four takes about forty minutes from its first build to its
    # last registration when the review sends for a fix, the deploy wait
    # included, so none starts later than that.
    reserve = int(os.environ.get("PIPELINE_BATCH_MINUTES") or 40) * 60
    while rows and time.time() < deadline() - reserve:
        batch, rows = rows[:args.batch], rows[args.batch:]
        n += 1
        passed, parked, unbuilt, fixed = build_batch(batch)
        rows = unbuilt + rows
        report["parked"] += [{"slug": p["slug"], "name": p["row"]["name"], "why": "; ".join(p["problems"])} for p in parked]
        if args.dry:
            report["built"] += [p["slug"] for p in passed]
            continue
        for p in parked:
            park(p["row"], "; ".join(p["problems"]))
        if not passed and not fixed["changed"]:
            continue
        land(passed, f"previews-auto-{stamp}-{n}", fixed)
        live, missing = wait_live([p["slug"] for p in passed])
        report["not_live"] += missing
        for p in passed:
            if p["slug"] not in live:
                continue
            path = os.path.join(ROOT, ".autobuild", f"{p['slug']}.letter.json")
            with open(path, "w") as handle:
                json.dump(letter_for(p["row"], p["brand"]), handle)
            code, out = call("register", p["slug"], p["row"]["id"], path)
            if code:
                report["notes"].append(f"{p['slug']} could not be registered: {out[-160:]}")
                continue
            if call("shot", p["slug"])[0] and call("shot", p["slug"])[0]:
                report["notes"].append(f"{p['slug']} has no picture of its site")
            report["built"].append(p["slug"])
        if args.send:
            send_waiting(report)
    if args.send and not args.dry:
        send_waiting(report)
    report["left"] = len(rows)
    print("<pipeline_report>" + json.dumps(report) + "</pipeline_report>")


if __name__ == "__main__":
    main(sys.argv[1:])
