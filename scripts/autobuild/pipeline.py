"""The scripted preview run: every prospect whose third letter is due, built,
checked, landed, proved live and - when sending is on - sent, with no model in
the loop. A business that fails any check is parked with the reason, and the
preview session builds only those.

    ~/.claude/tools/with-credential.py \\
      supabase-service-role-sunday=SUPABASE_SERVICE_ROLE_KEY \\
      taylorurl-cron-secret=CRON_SECRET \\
      -- python3 -m scripts.autobuild.pipeline [--dry] [--send] [--batch N] [--limit N]

Run from a worktree of the previews repository cut from origin/develop. It
works the due list oldest first, a batch at a time, and stops starting batches
when the deadline is near, so whatever is left heads the next run's list.

--dry builds and checks into the worktree and lands, registers and sends
nothing. --send sends the letters of the sites it proved live, within the
day's ceiling; without it a live site is registered and waits for a run that
sends.
"""

import os

os.environ.setdefault("no_proxy", "*")

import argparse
import importlib.util
import json
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

spec = importlib.util.spec_from_file_location("routine", os.path.join(ROOT, "scripts", "routine.py"))
routine = importlib.util.module_from_spec(spec)
spec.loader.exec_module(routine)

HOUSTON = ZoneInfo("America/Chicago")
# The outreach machine's own window (taylorurl-com lib/outreach/sending/schedule.js):
# 8:00 to 17:00 Houston time, Monday to Saturday.
SEND_HOURS = range(8, 17)
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


def layout(slugs):
    out = subprocess.run(["node", "scripts/autobuild/layout.mjs", "-", *slugs], cwd=ROOT, capture_output=True, text=True,
                         stdin=subprocess.DEVNULL)
    return json.loads(out.stdout or "{}")


def build_batch(rows):
    """Builds and checks each business; returns the ones that passed and the parked ones."""
    passed, parked = [], []
    for row in rows:
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
        except Parked as reason:
            problems, brand = [str(reason)], None
        except Exception as error:
            problems, brand = [f"the build broke: {type(error).__name__}: {str(error)[:160]}"], None
        item = {"row": row, "slug": slug, "brand": brand, "problems": problems}
        (parked if problems else passed).append(item)
        log("built" if not problems else "parked", slug, "; ".join(problems))
    fresh = [p for p in passed if not p.get("landed")]
    if not fresh:
        return passed, parked
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
    for item in parked:
        discard(item["slug"])
    return passed, parked


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


def land(passed, branch):
    passed = [p for p in passed if not p.get("landed")]
    if not passed:
        release()
        return
    names = [p["row"]["name"] for p in passed]
    git("checkout", "-B", branch, "origin/develop")
    for p in passed:
        git("add", f"src/brands/{p['slug']}.json", f"public/brands/{p['slug']}")
    listed = ", ".join(names[:-1]) + (f" and {names[-1]}" if len(names) > 1 else names[0])
    subject = f"Add preview sites for {listed}"
    if len(subject) > 200:
        subject = f"Add preview sites for {len(names)} businesses"
    git("commit", "-m", subject, "-m", "\n".join(f"- {n}" for n in names))
    git("push", "-u", "origin", branch)
    url = gh("pr", "create", "--base", "develop", "--head", branch, "--title", subject, "--body",
             "Brand files and pictures built by the scripted preview run, each from the business's own website and "
             "Google listing, each past the checks before it was added.")
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


def ceiling():
    """How many first preview letters may go today: the outreach machine's own daily cap."""
    settings = routine.rest("GET", "outreach_settings?select=daily_cap,sending_enabled&limit=1")[0]
    return settings["daily_cap"] if settings["sending_enabled"] else 0


def sent_today():
    local = datetime.now(HOUSTON).replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)
    rows = routine.rest("GET", f"preview_sites?select=slug&sent_at=gte.{local.isoformat().replace('+00:00', 'Z')}")
    return len(rows or [])


def unsent():
    """Registered, live sites whose letter has not gone, oldest first."""
    return routine.rest("GET", "preview_sites?select=slug,prospect_id&sent_at=is.null&prospect_id=not.is.null&order=created_at") or []


def send_waiting(report):
    now = datetime.now(HOUSTON)
    if now.hour not in SEND_HOURS or now.weekday() == 6:
        report["notes"].append("outside sending hours, so no letter went")
        return
    room = ceiling() - sent_today()
    first = True
    for site in unsent():
        if room <= 0 or time.time() > deadline() - 120:
            break
        if not first:
            time.sleep(SPACING)
        first = False
        code, out = call("send", site["slug"])
        log("send", site["slug"], out[-200:])
        if code == 0:
            report["sent"].append(site["slug"])
            room -= 1
        else:
            report["not_sent"].append({"slug": site["slug"], "why": out[-200:]})


def main(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", action="store_true")
    parser.add_argument("--send", action="store_true")
    parser.add_argument("--batch", type=int, default=10)
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args(argv)

    report = {"built": [], "parked": [], "sent": [], "not_sent": [], "not_live": [], "notes": []}
    rows = [r for r in routine.due() if not r.get("parked_at") and r["industry"] in AUTOMATED]
    if args.limit:
        rows = rows[:args.limit]
    log(f"{len(rows)} due for a scripted build")
    stamp = datetime.now(HOUSTON).strftime("%Y%m%d-%H%M")
    n = 0
    # A batch of ten takes about fifteen minutes from its first build to its
    # last registration, the deploy wait included, so none starts later than that.
    reserve = int(os.environ.get("PIPELINE_BATCH_MINUTES") or 15) * 60
    while rows and time.time() < deadline() - reserve:
        batch, rows = rows[:args.batch], rows[args.batch:]
        n += 1
        passed, parked = build_batch(batch)
        report["parked"] += [{"slug": p["slug"], "name": p["row"]["name"], "why": "; ".join(p["problems"])} for p in parked]
        if args.dry:
            report["built"] += [p["slug"] for p in passed]
            continue
        for p in parked:
            park(p["row"], "; ".join(p["problems"]))
        if not passed:
            continue
        land(passed, f"previews-auto-{stamp}-{n}")
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
