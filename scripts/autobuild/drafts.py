"""What has been made of a parked business so far, kept for the run that finishes it.

    python3 -m scripts.autobuild.drafts show <prospect_id>
    python3 -m scripts.autobuild.drafts restore <prospect_id>

The scripted run parks a business it cannot finish, and its checkout is wiped
before the next run. Without this the morning run would build the business
again from nothing - the logo cut and judged again, every photo fetched and
looked at again - to fix the one thing the script named. So a park keeps its
work here, outside any checkout: the brand file as far as it got, its logo and
photos, and what it found on the way. The morning run restores it into its own
checkout and its builder starts from it, and keeps its own work here the same
way, so a run that stops part way loses nothing.

One folder per prospect, named by its id, under PREVIEW_DRAFTS
(~/work/preview-drafts by default):

    draft.json    who, the slug, why it was parked, when, and what was found
    brand.json    the brand file, when the build got as far as writing one
    partial.json  what the build had made of the brand when it stopped short
    public/       the pictures, as public/brands/<slug>/ holds them
    letter.json   the letter the builder wrote, once one has
    answer.json   the builder's own account of what it did
    site.md       a copy of their website to read (made by the morning run)
    site.json     the same copy as data, for the scripted content check
"""

import os

os.environ.setdefault("no_proxy", "*")

import json
import shutil
import sys
import time
from datetime import datetime, timezone

DRAFTS = os.environ.get("PREVIEW_DRAFTS") or os.path.expanduser("~/work/preview-drafts")
# A draft nobody has finished in this long is of a business the due list has
# moved past; it is cleared rather than kept for ever.
KEEP_DAYS = 45


def folder(prospect_id):
    return os.path.join(DRAFTS, str(prospect_id))


def read(prospect_id):
    """The draft's own record, or None when there is no draft."""
    try:
        with open(os.path.join(folder(prospect_id), "draft.json")) as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return None


def _write_json(path, value):
    with open(path, "w") as handle:
        json.dump(value, handle, indent=2, ensure_ascii=False, default=str)
        handle.write("\n")


def _photos(evidence, known):
    """Each photo on the draft: where it is drawn from, where it came from, and what the look said of it."""
    if evidence.get("photos"):
        looks = evidence.get("photo_looks") or {}
        # The build lists both in the order the photos were placed.
        return [{"path": path, "source": source, "look": looks[path]} for source, path in zip(evidence["photos"], looks)]
    return known.get("photos") or []


def save(row, slug, root, reason, known=None, evidence=None, letter=None):
    """Keeps what the checkout at `root` holds of this business, and why it is
    not finished. Whatever the folder held before - a copy of their site, a
    letter - is kept unless this brings a newer one."""
    target = folder(row["id"])
    staging = target + ".new"
    shutil.rmtree(staging, ignore_errors=True)
    os.makedirs(staging)
    pictures = os.path.join(root, "public", "brands", slug)
    if os.path.isdir(pictures):
        shutil.copytree(pictures, os.path.join(staging, "public"))
    brand = os.path.join(root, "src", "brands", f"{slug}.json")
    if os.path.exists(brand):
        shutil.copy2(brand, os.path.join(staging, "brand.json"))
    elif known:
        _write_json(os.path.join(staging, "partial.json"),
                    {key: known[key] for key in ("brand", "services", "about", "lead") if known.get(key)})
    if letter:
        _write_json(os.path.join(staging, "letter.json"), letter)
    for name in ("site.md", "site.json", "letter.json", "answer.json"):
        old = os.path.join(target, name)
        if os.path.exists(old) and not os.path.exists(os.path.join(staging, name)):
            shutil.copy2(old, os.path.join(staging, name))
    before = read(row["id"]) or {}
    evidence = evidence or {}
    known = known or {}
    _write_json(os.path.join(staging, "draft.json"), {
        "prospect_id": row["id"],
        "name": row["name"],
        "slug": slug,
        "template": row.get("industry"),
        "website": row.get("website"),
        "reason": reason,
        "saved_at": datetime.now(timezone.utc).isoformat(),
        "first_saved_at": before.get("first_saved_at") or datetime.now(timezone.utc).isoformat(),
        "logo_source": evidence.get("logo_source") or known.get("logo_source"),
        "photos": _photos(evidence, known),
        "photos_refused": evidence.get("photos_refused") or known.get("photos_refused") or [],
        "notes": evidence.get("notes") or known.get("notes") or [],
    })
    shutil.rmtree(target, ignore_errors=True)
    os.rename(staging, target)
    return target


def keep_copy(prospect_id, site, markdown):
    """Files a copy of their website with the draft."""
    target = folder(prospect_id)
    os.makedirs(target, exist_ok=True)
    _write_json(os.path.join(target, "site.json"), site)
    with open(os.path.join(target, "site.md"), "w") as handle:
        handle.write(markdown)


def restore(prospect_id, root, slug=None):
    """Puts the draft's brand file and pictures into the checkout at `root`,
    under its own slug or the one given (the paths in its brand file follow),
    and returns its record; None when there is no draft."""
    draft = read(prospect_id)
    if not draft:
        return None
    source, old = folder(prospect_id), draft["slug"]
    slug = draft["slug"] = slug or old
    pictures = os.path.join(root, "public", "brands", slug)
    shutil.rmtree(pictures, ignore_errors=True)
    if os.path.isdir(os.path.join(source, "public")):
        shutil.copytree(os.path.join(source, "public"), pictures)
    brand = os.path.join(root, "src", "brands", f"{slug}.json")
    if os.path.exists(os.path.join(source, "brand.json")):
        with open(os.path.join(source, "brand.json")) as handle:
            text = handle.read()
        with open(brand, "w") as handle:
            handle.write(text.replace(f"/brands/{old}/", f"/brands/{slug}/"))
    elif os.path.exists(brand):
        os.remove(brand)
    return draft


def remove(prospect_id):
    shutil.rmtree(folder(prospect_id), ignore_errors=True)


def prune():
    """Clears drafts older than KEEP_DAYS, and any half-written one."""
    if not os.path.isdir(DRAFTS):
        return
    cutoff = time.time() - KEEP_DAYS * 86400
    for name in os.listdir(DRAFTS):
        path = os.path.join(DRAFTS, name)
        if name.endswith(".new") or os.path.getmtime(path) < cutoff:
            shutil.rmtree(path, ignore_errors=True)


def main(argv):
    if len(argv) != 2 or argv[0] not in ("show", "restore"):
        print(__doc__)
        return 2
    if argv[0] == "show":
        draft = read(argv[1])
        print(json.dumps(draft, indent=2) if draft else f"no draft for {argv[1]}")
        return 0 if draft else 1
    from .__main__ import ROOT
    draft = restore(argv[1], ROOT)
    print(f"restored {draft['slug']} from {folder(argv[1])}" if draft else f"no draft for {argv[1]}")
    return 0 if draft else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
