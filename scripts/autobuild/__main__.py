"""python3 -m scripts.autobuild one <candidates.json> [index...]

Builds the named candidates into this checkout and prints what each check said.
"""
import os

# On a Mac, urllib reads the system proxy settings through the Network
# framework, and a process that has done so crashes in the child of its next
# fork. Saying there is no proxy keeps urllib off that framework entirely, so
# the builds below can start node and git safely. It must be set before the
# first request.
os.environ.setdefault("no_proxy", "*")

import json
import subprocess
import sys

from .build import Parked, build
from .check import all_checks
from .slug import slug_for

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def ssr():
    out = os.path.join(ROOT, ".autobuild", "ssr")
    # Vite has been seen to die on a signal under memory pressure; once more is enough.
    for attempt in range(3):
        done = subprocess.run(["npx", "vite", "build", "--ssr", "src/entry-server.jsx", "--outDir", out, "--logLevel", "error"],
                              cwd=ROOT, capture_output=True, text=True, stdin=subprocess.DEVNULL)
        if done.returncode == 0:
            break
        print(f"server build exit {done.returncode}: {done.stderr[-800:]}", file=sys.stderr)
    else:
        raise RuntimeError("the server build failed three times")
    return out


def render(slugs):
    if not slugs:
        return {}
    out = subprocess.run(["node", "scripts/autobuild/render.mjs", ssr(), *slugs], cwd=ROOT, capture_output=True, text=True)
    return json.loads(out.stdout or "{}")


def build_many(rows):
    built, parked = [], []
    for row in rows:
        slug = slug_for(row["name"], row.get("town"), ROOT)
        try:
            brand, evidence = build(row, ROOT, slug)
            problems = all_checks(brand, evidence, ROOT, slug)
        except Parked as reason:
            problems = [str(reason)]
            brand = None
        except Exception as error:
            problems = [f"the build broke: {type(error).__name__}: {str(error)[:160]}"]
            brand = None
        (parked if problems else built).append({"row": row, "slug": slug, "problems": problems})
    drawn = render([b["slug"] for b in built])
    for item in list(built):
        if drawn.get(item["slug"]):
            item["problems"] = drawn[item["slug"]]
            built.remove(item)
            parked.append(item)
    return built, parked


if __name__ == "__main__":
    rows = json.load(open(sys.argv[2]))
    pick = [rows[int(i)] for i in sys.argv[3:]] or rows
    built, parked = build_many(pick)
    for item in built:
        print("BUILT ", item["slug"], item["row"]["name"])
    for item in parked:
        print("PARKED", item["slug"], item["row"]["name"], "|", "; ".join(item["problems"]))
