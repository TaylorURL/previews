"""The look a person would give a preview's pictures, asked of a model that sees.

Arithmetic on pixels (quality.py, logo.py) cannot tell a photograph from a
flyer with a photo in it, a watermark, a cartoon, a stock cut-out or a logo
pasted where a photo belongs. This asks Claude, through the `claude` command
the Pi's routines already run under, and reads back a verdict in a fixed JSON
shape.

It is a gate on top of the arithmetic, never instead of it. When the command
is missing, refused or slow, or PREVIEW_VISION=off, every call here returns
None and the build goes on with the arithmetic alone; the run's report says the
look was skipped, so a long silence from it is visible rather than quiet.

    screen_photos(paths)        -> {path: {"ok", "score", "why"}} or None
    judge_logo(paths)           -> {"ok", "problems", "has_name"} or None
    judge_page(paths)           -> {"ok", "problems"} or None
"""

import json
import os
import shutil
import subprocess
import tempfile

from PIL import Image

MODEL = os.environ.get("PREVIEW_VISION_MODEL") or "claude-sonnet-5-5"
TIMEOUT = int(os.environ.get("PREVIEW_VISION_TIMEOUT") or 240)

# What went wrong with the last call, for the run's report.
last_error = None


def available():
    return os.environ.get("PREVIEW_VISION", "on") != "off" and bool(shutil.which("claude"))


def _env():
    env = dict(os.environ)
    # A session that runs this is itself a Claude Code process; the call is a
    # separate one, not a turn of it.
    for key in list(env):
        if key in ("CLAUDECODE", "CLAUDE_CODE_ENTRYPOINT", "CLAUDE_CODE_SSE_PORT") or key.startswith("CLAUDE_CODE_SESSION"):
            env.pop(key)
    return env


def _copy(paths, folder, longest=1100):
    """Each picture as a JPEG the model reads quickly, named by its position."""
    names = []
    for i, path in enumerate(paths, 1):
        name = f"{i:02d}.jpg"
        with Image.open(path) as image:
            image = image.convert("RGBA")
            flat = Image.new("RGB", image.size, (255, 255, 255))
            flat.paste(image, mask=image.getchannel("A"))
            flat.thumbnail((longest, longest))
            flat.save(os.path.join(folder, name), "JPEG", quality=88)
        names.append(name)
    return names


def ask(prompt, paths, schema, longest=1100):
    """One question about some pictures; the structured answer, or None."""
    global last_error
    if not available():
        last_error = "the vision check is switched off or the claude command is missing"
        return None
    with tempfile.TemporaryDirectory(prefix="preview-look-") as folder:
        names = _copy(paths, folder, longest)
        listed = "\n".join(f"{os.path.join(folder, n)}" for n in names)
        command = [
            "claude", "-p", "--model", MODEL, "--tools", "Read", "--allowedTools", "Read",
            "--setting-sources", "", "--no-session-persistence", "--output-format", "json",
            "--json-schema", json.dumps(schema),
            f"{prompt}\n\nRead every one of these files before answering:\n{listed}",
        ]
        try:
            done = subprocess.run(command, cwd=folder, capture_output=True, text=True, timeout=TIMEOUT,
                                  stdin=subprocess.DEVNULL, env=_env())
        except subprocess.TimeoutExpired:
            last_error = f"the vision check took longer than {TIMEOUT}s"
            return None
        except OSError as error:
            last_error = f"the vision check could not start: {error}"
            return None
        try:
            out = json.loads(done.stdout)
        except ValueError:
            last_error = f"the vision check answered nothing readable (exit {done.returncode}): {done.stderr.strip()[-200:]}"
            return None
        answer = out.get("structured_output")
        if out.get("is_error") or not isinstance(answer, dict):
            last_error = f"the vision check failed: {str(out.get('result'))[:200]}"
            return None
        last_error = None
        return {"answer": answer, "names": names}


PHOTO_PROMPT = (
    "These are candidate photographs for a small local business's website, taken from the business's own site. "
    "Judge each as a web designer would before putting it on a professional homepage. Mark ok=false when it is "
    "any of: a logo, badge, icon, seal or award graphic; an illustration, cartoon, clip art or infographic; a "
    "screenshot, flyer, coupon, banner or social post with words on it (words that are part of the scene, like a "
    "sign on a truck, are fine); a picture with a watermark or a stock-site mark; a person or object cut out onto "
    "a plain or transparent ground; a collage; a picture that is blurry, out of focus, noisy, badly compressed, "
    "very dark or washed out; a picture whose subject is cut off awkwardly. ok=true only for a real, sharp, well "
    "lit photograph that would look good on the site. score from 1 (unusable) to 5 (a strong hero photo). why: "
    "a few plain words. Answer for every file, in order, naming it by its file name."
)

PHOTO_SCHEMA = {
    "type": "object",
    "properties": {
        "images": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "file": {"type": "string"},
                    "ok": {"type": "boolean"},
                    "score": {"type": "integer", "minimum": 1, "maximum": 5},
                    "why": {"type": "string"},
                },
                "required": ["file", "ok", "score", "why"],
            },
        }
    },
    "required": ["images"],
}


def screen_photos(paths):
    if not paths:
        return {}
    got = ask(PHOTO_PROMPT, paths, PHOTO_SCHEMA)
    if not got:
        return None
    by_name = {os.path.basename(str(item.get("file", ""))): item for item in got["answer"].get("images", [])}
    out = {}
    for path, name in zip(paths, got["names"]):
        item = by_name.get(name)
        if item is None:
            # A picture the answer skipped is not taken on trust.
            out[path] = {"ok": False, "score": 1, "why": "the vision check gave no verdict for it"}
        else:
            out[path] = {"ok": bool(item.get("ok")), "score": int(item.get("score") or 1), "why": str(item.get("why", ""))[:120]}
    return out


VERDICT_SCHEMA = {
    "type": "object",
    "properties": {"ok": {"type": "boolean"}, "problems": {"type": "array", "items": {"type": "string"}}},
    "required": ["ok", "problems"],
}

LOGO_PROMPT = (
    "This is a business's logo drawn on the header color it will sit on, first at the size the website's header "
    "draws it, then at twice that size. Judge it as a web designer placing it in a site header. Say ok=false only "
    "when one of these is true: the logo's own background shows as a visible box, rectangle or patch of a "
    "different color from the ground around it; there is a halo, white fringe or jagged edge around its shapes; "
    "the main mark or the name is blurry or pixelated, or so close in color to the ground that it fades into "
    "it; any part of it is blurry or pixelated at twice the size; it looks cropped or cut off; it is not "
    "a logo at all (a photo, a badge from another company, a placeholder). Fine print inside a logo, such as a "
    "tagline, a slogan, a trademark sign or a license number, is meant to be small at header size: it fails only "
    "when it is blurry or pixelated at twice the size, never for being small or thin. A logo whose own background "
    "is the same color as the ground around it is not in a box. problems: a few plain words for each, empty when ok. "
    "has_name: true only when the business's name is written out in the logo large enough to read in the first "
    "picture; false when the logo is a symbol, a picture or initials alone, or when its name is too small to read "
    "there (the site then sets the name in type beside it)."
)

LOGO_SCHEMA = {
    "type": "object",
    "properties": {
        "ok": {"type": "boolean"},
        "problems": {"type": "array", "items": {"type": "string"}},
        "has_name": {"type": "boolean"},
    },
    "required": ["ok", "problems", "has_name"],
}


def judge_logo(paths):
    got = ask(LOGO_PROMPT, paths, LOGO_SCHEMA, longest=1400)
    if not got:
        return None
    answer = got["answer"]
    return {"ok": bool(answer.get("ok")), "problems": [str(p)[:140] for p in answer.get("problems", [])][:4],
            "has_name": answer.get("has_name") is not False}


PAGE_PROMPT = (
    "These are screenshots of a website built for a small local business: the top of the home page on a desktop "
    "screen, the rest of the home page on a desktop screen, and the top of the home page on a phone. Judge it as "
    "the studio that built it would before sending it to the owner. Say ok=false when any of these is true: the "
    "logo sits in a visible box of a different color from the header, has a halo or rough edge, is blurry or "
    "pixelated, fades into the header, or is squashed or cropped (how large the words inside a logo are drawn "
    "was settled when the logo was judged, so small words in it are not a fault here); a photo is blurry, pixelated, stretched, badly cropped (heads or the subject cut off), a logo or "
    "graphic or flyer standing in for a photo, carries a "
    "watermark, or is the same picture shown twice; text sits over a photo where it cannot be read; anything "
    "overlaps, is cut off, or looks broken or empty. Ignore the dark strip at the very top that says the page is "
    "a preview. Each screenshot ends where the screen or the picture ends, so something cut at a screenshot's "
    "bottom edge is not a fault, and the call and booking bar fixed to the bottom of the phone screen is part of "
    "the design, so content passing under it is not a fault either. Matters of taste are not faults: a short "
    "section, cards of uneven length, a hero set on the brand's color with no photo, or a layout you would "
    "arrange differently pass. problems: one short plain "
    "sentence each naming what and where, empty when ok."
)


def judge_page(paths):
    got = ask(PAGE_PROMPT, paths, VERDICT_SCHEMA, longest=1600)
    if not got:
        return None
    return {"ok": bool(got["answer"].get("ok")), "problems": [str(p)[:200] for p in got["answer"].get("problems", [])][:6]}
