"""The review every preview gets before its letter can go, and the fixes it sends for.

    python3 -m scripts.autobuild.review [--no-fix] <slug>...

Run from the previews repository after `npm run build`. Exits 1 when any site
still has a fault once the fixes are in.

Every page of each site is photographed whole at desktop and phone size
(shoot.mjs) and shown to a model that sees, which names what the studio would
not send: a logo boxed or fading into its ground, a photo blurred, stretched or
badly cropped, words that cannot be read, anything overlapping, cut off, broken
or empty.

What it finds is sorted by where it comes from. A fault in how a template
draws a page shows for every business on that template, so it is fixed there,
once: an agent is given every finding for that template, with the pictures,
and changes the template, the shared components or the builder so the fault
cannot come back for anyone. Never the one site alone, and never by adding
another check on top. A fault in one business's own material (its photo, its
words) is fixed in the rule that let it through where there is one, and in
that business's brand file where there is not. One agent works one template at
a time, so no two edit the same files, and each is shown the fixes the review
has already landed, so a fault that comes back is traced to why its fix did
not hold rather than patched a second time.

After the fixes the site is built again and every business on a changed
template is drawn again; an agent's change that breaks any of them is taken
back whole. The batch is then photographed and looked at once more, and that
is the last look: a site that passes is stamped (.autobuild/<slug>.review.json,
against its brand file as it stands), and `routine.py register` refuses a site
without a stamp that matches, so no letter can point at a preview the review
has not passed. A site still failing is reported with what is wrong, and waits.

The look and the fixes run through the `claude` command, as the vision check
does. Without it nothing is stamped, so nothing is sent unreviewed.
"""

import os

os.environ.setdefault("no_proxy", "*")

import glob
import hashlib
import json
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from PIL import Image

from . import vision, visual
from .__main__ import ROOT, render

SHOTS = os.path.join(ROOT, ".autobuild", "review")
FIX_MODEL = os.environ.get("PREVIEW_FIX_MODEL") or "claude-opus-5-5"
FIX_MINUTES = int(os.environ.get("PREVIEW_FIX_MINUTES") or 20)
# Pages looked at besides the home page, and sites looked at side by side.
OTHER_PAGES = 6
AT_ONCE = 3

# What the model is told the pictures are; filled per site.
REVIEW_PROMPT = (
    "These are screenshots of a website the studio built for a small local business, to send to its owner as a "
    "preview. They are listed below with what each shows. Review them as the studio's art director would before "
    "the owner sees them, and name every fault. A fault is any of these: the logo sits in a visible box or patch "
    "of another color, shows a halo or rough edge, fades into the color behind it, is squashed, cropped, blurry or "
    "pixelated, or has the business's name set beside a logo that already spells it; a photo is blurry, pixelated, "
    "stretched, badly cropped (heads or the subject cut off), is a logo, graphic, flyer or screenshot standing in "
    "for a photo, carries a watermark, or is the same picture twice on one page; words cannot be read (over a "
    "photo, or too faint against their ground), run out of their box, are cut off, overlap something, or are "
    "placeholder, broken or nonsense text; a heading or list item is plainly not what the section says it is "
    "(a sentence or a menu link listed as a service); anything overlaps, is cut off at the side, is misaligned "
    "against its row, leaves a blank that reads as something missing (half a section or a hero standing empty, an "
    "empty box or band), or looks broken or empty; a button or icon is missing its label or its picture. Columns "
    "side by side that end at different heights, and cards in a row drawn to one height with their links along "
    "the bottom, are how the pages are laid out and are not faults. Ignore the dark strip at the very top that says the page is a preview, the call and booking bar "
    "fixed to the bottom of a phone screen, and anything cut by a screenshot's own edge. Matters of taste are not "
    "faults. For each fault give: picture, the file name it shows in; where, the page and part of the page; what, "
    "one plain sentence; and source: 'template' when it comes from the design or code that draws the page and "
    "would show for any business on this design (spacing, overlap, a part that breaks at phone size, the "
    "design's own colors), or 'business' when it comes from this business's own material (its logo file, its "
    "photos, its words, its colors). An empty list when there is nothing wrong."
)

REVIEW_SCHEMA = {
    "type": "object",
    "properties": {
        "problems": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "picture": {"type": "string"},
                    "where": {"type": "string"},
                    "what": {"type": "string"},
                    "source": {"type": "string", "enum": ["template", "business"]},
                },
                "required": ["picture", "where", "what", "source"],
            },
        }
    },
    "required": ["problems"],
}

FIX_PROMPT = """You are fixing faults the studio's review found on preview websites built with the `{template}` \
template of this repository (a Vite and React site; each business is a brand file in src/brands/<slug>.json drawn \
by src/templates/; the builder that writes brand files from a business's own website is scripts/autobuild/).

The faults, each with the screenshot it was seen in (open them with Read):

{findings}

Fix each where it comes from, so it cannot come back for any business:
- A fault from the design or code (source "template") is fixed in the template, its parts under \
src/templates/, the shared components (src/templates/shared.jsx, src/site.js) or the build's rules \
(scripts/autobuild/compose.py, build.py, images.py, logo.py). Fix the cause for every business on the \
template, not the one site.
- A fault in one business's own material (source "business") is fixed in the builder rule that let it \
through where there is one, so the next business is spared it too, and in that business's brand file, \
src/brands/<slug>.json, where there is not. Never edit another business's brand file, and never edit a picture.
- Do not add a check, a gate, a test or a vision prompt, and do not loosen one: the point is that the fault \
is gone, not that it is caught. Do not touch scripts/routine.py, scripts/autobuild/pipeline.py, \
scripts/autobuild/review.py or scripts/autobuild/letter.py.
- Match the surrounding code: its naming, its comments, its Tailwind idiom. Change as little as the fix needs.

Fixes the review has made before:
{history}
A fault that matches one of these means that fix did not hold: find why, and fix that, rather than adding a \
second fix on top of the first.

Prove each fix: run `npm run build`, then `node scripts/autobuild/shoot.mjs .autobuild/review/check <slug>` for \
the sites named above and Read the new screenshots. `node scripts/autobuild/layout.mjs - <slug>` measures what the \
gate measures (a photo drawn past its pixels or cropped to a sliver, a section left empty, a page wider than the \
screen); a change that adds anything to it is taken back. Use no git command but `git diff` and `git status`; the run \
that called you lands the work. Answer with what you fixed (one plain sentence each, in the project's own terms, \
naming the files) and what you left and why."""

FIX_SCHEMA = {
    "type": "object",
    "properties": {
        "fixed": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"what": {"type": "string"}, "files": {"type": "array", "items": {"type": "string"}}},
                "required": ["what", "files"],
            },
        },
        "left": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"what": {"type": "string"}, "why": {"type": "string"}},
                "required": ["what", "why"],
            },
        },
    },
    "required": ["fixed", "left"],
}

# Paths an agent's change is read from; the build output and the run's own
# pictures are not changes.
WATCHED = ("src", "scripts", "public", "tailwind.config.js", "index.html")
TEXT = (".json", ".js", ".jsx", ".mjs", ".py", ".css", ".html", ".md")


def log(*parts):
    print(datetime.now().strftime("%H:%M:%S"), "review:", *parts, flush=True)


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, stdin=subprocess.DEVNULL)


def template_of(slug):
    with open(os.path.join(ROOT, "src", "brands", f"{slug}.json")) as handle:
        return json.load(handle).get("template")


def shoot(slugs, folder=SHOTS):
    """Every page of each site, photographed: {slug: {page: {"path", "desktop", "phone"}}}."""
    os.makedirs(folder, exist_ok=True)
    done = subprocess.run(["node", "scripts/autobuild/shoot.mjs", folder, *slugs], cwd=ROOT, capture_output=True,
                          text=True, stdin=subprocess.DEVNULL)
    try:
        return json.loads(done.stdout or "{}")
    except ValueError:
        log("the pages could not be photographed:", done.stderr.strip()[-300:])
        return {}


def _strips(path, height, most):
    with Image.open(path) as image:
        image = image.convert("RGB")
        return [image.crop((0, top, image.width, min(image.height, top + height)))
                for top in range(0, min(image.height, height * most), height)]


def _side_by_side(parts, gap=24):
    width = sum(p.width for p in parts) + gap * (len(parts) - 1)
    out = Image.new("RGB", (width, max(p.height for p in parts)), (128, 128, 128))
    x = 0
    for part in parts:
        out.paste(part, (x, 0))
        x += part.width + gap
    return out


def pictures(slug, site, folder):
    """The site's pages cut into the pictures the model is shown, with what
    each shows: the whole home page at both sizes, and the top of each other
    page at both sizes side by side."""
    out = []
    home = site.get("home") or {}
    if home.get("desktop"):
        strips = _strips(home["desktop"], 1500, 4)
        for i, strip in enumerate(strips, 1):
            path = os.path.join(folder, f"{slug}-home-desktop-{i}.png")
            strip.save(path)
            out.append((path, f"the home page on a desktop screen, part {i} of {len(strips)}, top to bottom"))
    if home.get("phone"):
        path = os.path.join(folder, f"{slug}-home-phone.png")
        _side_by_side(_strips(home["phone"], 1600, 4)).save(path)
        out.append((path, "the home page on a phone, cut into strips set side by side, read left to right"))
    others = [k for k in site if k not in ("home", "errors") and isinstance(site[k], dict)]
    # The section pages first, then the detail pages under them.
    others.sort(key=lambda k: (k.count("-"), k))
    for key in others[:OTHER_PAGES]:
        page = site[key]
        parts = []
        if page.get("desktop"):
            parts.append(_strips(page["desktop"], 1800, 1)[0])
        if page.get("phone"):
            parts.append(_strips(page["phone"], 1800, 1)[0])
        if not parts:
            continue
        path = os.path.join(folder, f"{slug}-{key}.png")
        _side_by_side(parts).save(path)
        out.append((path, f"the {page['path'].rsplit('/', 1)[-1][:-5]} page ({page['path']}): its top on a desktop "
                          "screen, and beside it its top on a phone"))
    return out


def look(slug, site):
    """What the model finds wrong with one site: a list of findings, or None
    when it could not look."""
    folder = os.path.join(SHOTS, slug)
    os.makedirs(folder, exist_ok=True)
    shown = pictures(slug, site, folder)
    if not shown:
        log(slug, "no page of it could be photographed:", "; ".join(site.get("errors") or [])[:300])
        return None
    listed = "\n".join(f"{i:02d}.jpg: {what}" for i, (_, what) in enumerate(shown, 1))
    got = vision.ask(f"{REVIEW_PROMPT}\n\nThe pictures:\n{listed}", [p for p, _ in shown], REVIEW_SCHEMA, longest=1600)
    if not got:
        return None
    by_name = {f"{i:02d}.jpg": path for i, (path, _) in enumerate(shown, 1)}
    found = []
    for item in got["answer"].get("problems", []):
        name = os.path.basename(str(item.get("picture", "")))
        found.append({
            "slug": slug,
            "picture": by_name.get(name, ""),
            "where": str(item.get("where", ""))[:160],
            "what": str(item.get("what", ""))[:300],
            "source": item.get("source") if item.get("source") in ("template", "business") else "template",
        })
    return found


def look_all(slugs):
    """{slug: findings or None} for every site, a few looked at side by side."""
    shots = shoot(slugs)
    found = {}
    with ThreadPoolExecutor(AT_ONCE) as pool:
        futures = {slug: pool.submit(look, slug, shots.get(slug) or {}) for slug in slugs}
        for slug, future in futures.items():
            try:
                found[slug] = future.result()
            except Exception as error:
                log(slug, "could not be looked at:", type(error).__name__, str(error)[:200])
                found[slug] = None
    return found


def history():
    """The fixes the review has landed before, newest first."""
    done = git("log", "origin/develop", "-n", "60", "--format=%b")
    lines = [line[len("Review fix: "):] for line in done.stdout.splitlines() if line.startswith("Review fix: ")]
    return lines[:30]


def _status():
    """{path: what git says of it} for the paths an agent may change."""
    done = git("status", "--porcelain", "--untracked-files=all", "--", *WATCHED)
    out = {}
    for line in done.stdout.splitlines():
        path = line[3:].split(" -> ")[-1].strip('"')
        out[path] = line[:2]
    return out


def _snapshot(paths):
    """The text of each changed text file as it stands, to put back if need be."""
    kept = {}
    for path in paths:
        full = os.path.join(ROOT, path)
        if path.endswith(TEXT) and os.path.isfile(full):
            with open(full, "rb") as handle:
                kept[path] = handle.read()
    return kept


def _changed_by(before_status, before_text):
    """The paths the agent changed: new to git's list, or changed in text since."""
    after = _status()
    changed = [p for p in after if p not in before_status]
    for path in before_status:
        full = os.path.join(ROOT, path)
        if path in before_text:
            now = open(full, "rb").read() if os.path.isfile(full) else None
            if now != before_text[path]:
                changed.append(path)
    return sorted(set(changed))


def _take_back(changed, before_status, before_text):
    for path in changed:
        full = os.path.join(ROOT, path)
        if path in before_text:
            with open(full, "wb") as handle:
                handle.write(before_text[path])
        elif path in before_status:
            continue
        elif git("ls-files", "--error-unmatch", path).returncode == 0:
            git("checkout", "HEAD", "--", path)
        elif os.path.exists(full):
            os.remove(full)


def _env():
    return vision._env()


def dispatch(template, findings, budget):
    """One agent on one template's findings. Returns its answer and the paths
    it changed, or (None, []) when it could not run."""
    listed = "\n".join(
        f"{i}. {f['slug']} ({'its own material' if f['source'] == 'business' else 'the template'}), "
        f"{f['where']}: {f['what']}" + (f" [screenshot: {f['picture']}]" if f["picture"] else "")
        for i, f in enumerate(findings, 1))
    past = "\n".join(f"- {line}" for line in history()) or "- none yet"
    prompt = FIX_PROMPT.format(template=template, findings=listed, history=past)
    before_status = _status()
    before_text = _snapshot(before_status)
    command = [
        "claude", "-p", "--model", FIX_MODEL, "--permission-mode", "acceptEdits",
        "--tools", "Read,Edit,Write,Glob,Grep,Bash",
        "--allowedTools", "Read", "Edit", "Write", "Glob", "Grep", "Bash(npm run build)",
        "Bash(node scripts/autobuild/shoot.mjs:*)", "Bash(git diff:*)", "Bash(git status:*)",
        "--setting-sources", "", "--no-session-persistence", "--output-format", "json",
        "--json-schema", json.dumps(FIX_SCHEMA), prompt,
    ]
    try:
        done = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=max(60, budget),
                              stdin=subprocess.DEVNULL, env=_env())
        out = json.loads(done.stdout or "{}")
        answer = out.get("structured_output") if not out.get("is_error") else None
    except subprocess.TimeoutExpired:
        log(template, "the fixing agent ran out of time")
        answer = None
    except (OSError, ValueError) as error:
        log(template, "the fixing agent could not run:", str(error)[:200])
        answer = None
    changed = _changed_by(before_status, before_text)
    if answer is None:
        _take_back(changed, before_status, before_text)
        return None, []
    return answer, (changed, before_status, before_text)


def _build():
    done = subprocess.run(["npm", "run", "build"], cwd=ROOT, capture_output=True, text=True, stdin=subprocess.DEVNULL)
    return done.returncode == 0, done.stderr[-400:]


def _drawn(template):
    """Every business on a template, drawn by the server build: {slug: problems}."""
    slugs = []
    for path in glob.glob(os.path.join(ROOT, "src", "brands", "*.json")):
        try:
            with open(path) as handle:
                if json.load(handle).get("template") == template:
                    slugs.append(os.path.basename(path)[:-5])
        except ValueError:
            continue
    return {slug: problems for slug, problems in render(sorted(slugs)).items() if problems}


def _measured(slugs):
    """What the layout check measures wrong on each site's home page, the gate's
    own measure without its look: {slug: [problems]}."""
    if not slugs:
        return {}
    out = subprocess.run(["node", "scripts/autobuild/layout.mjs", "-", *slugs], cwd=ROOT, capture_output=True, text=True,
                         stdin=subprocess.DEVNULL)
    try:
        seen = json.loads(out.stdout or "{}")
    except ValueError:
        seen = {}
    return {slug: sorted(seen[slug]["problems"] + visual.look(seen[slug], ask_vision=False)) for slug in slugs if slug in seen}


def fix(findings, deadline):
    """Sends an agent for each template's findings, one after another, keeping
    a change only when the site still builds, every business on that template
    still draws, and the layout check measures nothing new on the sites it was
    fixing. Returns the fixes kept and the paths they changed."""
    by_template = {}
    for f in findings:
        by_template.setdefault(template_of(f["slug"]), []).append(f)
    kept, paths = [], []
    for template, items in by_template.items():
        budget = min(FIX_MINUTES * 60, deadline - time.time())
        if budget < 5 * 60:
            log("no time left to fix", template)
            break
        before = _drawn(template)
        sites = sorted({f["slug"] for f in items})
        measured = _measured(sites)
        log(f"sending an agent for {len(items)} finding(s) on {template}")
        answer, change = dispatch(template, items, budget)
        if answer is None or not change or not change[0]:
            continue
        changed, before_status, before_text = change
        built, why = _build()
        after = _drawn(template) if built else {}
        broke = {s: p for s, p in after.items() if p != before.get(s)}
        if built and not broke:
            # A fix that trades one fault for another is no fix: a photo drawn
            # past its pixels to close a gap is taken back like a broken build.
            now = _measured(sites)
            broke = {s: new for s in sites if (new := [p for p in now.get(s, []) if p not in measured.get(s, [])])}
        if not built or broke:
            log(template, "the fix was taken back:", why if not built else json.dumps(broke)[:300])
            _take_back(changed, before_status, before_text)
            _build()
            continue
        for item in answer.get("fixed", []):
            kept.append(f"{template}: {item['what']}")
        for item in answer.get("left", []):
            log(template, "left:", item["what"], "-", item["why"])
        paths += changed
    return kept, sorted(set(paths))


def brand_hash(slug):
    with open(os.path.join(ROOT, "src", "brands", f"{slug}.json"), "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def stamp_path(slug):
    return os.path.join(ROOT, ".autobuild", f"{slug}.review.json")


def stamp(slug):
    os.makedirs(os.path.dirname(stamp_path(slug)), exist_ok=True)
    with open(stamp_path(slug), "w") as handle:
        json.dump({"ok": True, "brand": brand_hash(slug), "at": datetime.now(timezone.utc).isoformat()}, handle)


def passed(slug):
    """Whether the review passed this site as its brand file now stands."""
    try:
        with open(stamp_path(slug)) as handle:
            mark = json.load(handle)
        return bool(mark.get("ok")) and mark.get("brand") == brand_hash(slug)
    except (OSError, ValueError):
        return False


def run(slugs, fix_faults=True, deadline=None):
    """Looks at every page of each site, fixes what it finds where it comes
    from, and looks once more. Returns {"problems": {slug: [sentences]},
    "fixes": [sentences], "changed": [paths]}; a site missing from problems
    passed and is stamped."""
    deadline = deadline or time.time() + 60 * 60
    for slug in slugs:
        if os.path.exists(stamp_path(slug)):
            os.remove(stamp_path(slug))
    found = look_all(slugs)
    fixes, changed = [], []
    faults = [f for slug in slugs for f in (found.get(slug) or [])]
    if faults and fix_faults and vision.available():
        fixes, changed = fix(faults, deadline)
        if changed:
            built, why = _build()
            if not built:
                return {"problems": {s: [f"the site no longer builds: {why}"] for s in slugs}, "fixes": [], "changed": []}
            again = [s for s in slugs if found.get(s)]
            found.update(look_all(again))
    problems = {}
    for slug in slugs:
        seen = found.get(slug)
        if seen is None:
            problems[slug] = [f"the review could not look at it: {vision.last_error or 'no answer'}"]
        elif seen:
            problems[slug] = [f"the review: {f['where']}: {f['what']}" for f in seen]
        else:
            stamp(slug)
    return {"problems": problems, "fixes": fixes, "changed": changed}


def main(argv):
    fix_faults = "--no-fix" not in argv
    slugs = [a for a in argv if not a.startswith("-")]
    if not slugs:
        print(__doc__)
        return 2
    if not os.path.isdir(os.path.join(ROOT, "dist", "b")):
        print("dist/ is missing: run npm run build first")
        return 1
    result = run(slugs, fix_faults)
    for line in result["fixes"]:
        print(f"FIXED {line}")
    for path in result["changed"]:
        print(f"CHANGED {path}")
    for slug in slugs:
        problems = result["problems"].get(slug)
        print(("WAIT " if problems else "PASS ") + slug)
        for p in problems or []:
            print(f"     - {p}")
    return 1 if result["problems"] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
