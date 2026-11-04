"""Proves land() leaves the checkout holding the sites it just landed.

    python3 -m scripts.autobuild.selftest_land

Everything after landing reads the files that landed - the letter is written
from the brand file, and routine.py's register refuses a site whose brand file
no longer hashes to the one the review stamped - so a checkout left on the
commit the run started from has lost the very sites it is about to register.
On 4 November the morning run died there: FileNotFoundError on
src/brands/75degreeachouston.json, with the site landed, live and never
registered.

This builds a throwaway repository with its own bare origin, puts one new site
into the checkout the way a run's build does, and lands it with gh and the
release stood in for. Twice: once with the merge going through, once with it
never reaching develop, since the site has to survive both.
"""

import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile

from . import pipeline

BRAND = json.dumps({"name": "Test Co", "slug": "testco"}, indent=2)


def sh(*args, cwd):
    done = subprocess.run(args, cwd=cwd, capture_output=True, text=True, stdin=subprocess.DEVNULL)
    if done.returncode:
        raise SystemExit(f"{' '.join(args)} failed in {cwd}: {done.stderr.strip()}")
    return done.stdout.strip()


def scratch():
    """A bare origin with develop on it, and a checkout detached on it holding
    one site a run has just built."""
    work = tempfile.mkdtemp(prefix="selftest-land-")
    bare, tree = os.path.join(work, "origin.git"), os.path.join(work, "tree")
    sh("git", "init", "-q", "--bare", "-b", "develop", bare, cwd=work)
    os.makedirs(tree)
    sh("git", "init", "-q", "-b", "develop", ".", cwd=tree)
    sh("git", "config", "user.email", "selftest@example.com", cwd=tree)
    sh("git", "config", "user.name", "Selftest", cwd=tree)
    os.makedirs(os.path.join(tree, "src", "brands"))
    with open(os.path.join(tree, "src", "brands", "base.json"), "w") as handle:
        handle.write("{}\n")
    sh("git", "add", "-A", cwd=tree)
    sh("git", "commit", "-qm", "first", cwd=tree)
    sh("git", "remote", "add", "origin", bare, cwd=tree)
    sh("git", "push", "-q", "-u", "origin", "develop", cwd=tree)
    sh("git", "checkout", "-q", "--detach", "origin/develop", cwd=tree)
    with open(os.path.join(tree, "src", "brands", "testco.json"), "w") as handle:
        handle.write(BRAND)
    os.makedirs(os.path.join(tree, "public", "brands", "testco"))
    with open(os.path.join(tree, "public", "brands", "testco", "logo.webp"), "w") as handle:
        handle.write("x")
    return work, bare, tree


def land(merge, branch, seen):
    work, bare, tree = scratch()
    pipeline.ROOT = tree
    pipeline.release = lambda: None

    def gh(*args):
        if args[:2] == ("pr", "create"):
            seen["branch"] = sh("git", "rev-parse", branch, cwd=tree)
            return "https://example.invalid/pr/1"
        if args[:2] == ("pr", "merge") and merge:
            # What GitHub's squash merge comes to, as far as this test cares:
            # develop holds the branch's files afterwards.
            sh("git", "update-ref", "refs/heads/develop", seen["branch"], cwd=bare)
        return ""

    pipeline.gh = gh
    pipeline.land([{"row": {"name": "Test Co"}, "slug": "testco"}], branch, {"fixes": [], "changed": []})
    return work, bare, tree


def check(label, merge, branch, expect):
    seen = {}
    work, bare, tree = land(merge, branch, seen)
    brand = os.path.join(tree, "src", "brands", "testco.json")
    assert os.path.exists(brand), f"{label}: the brand file is not in the checkout"
    assert open(brand).read() == BRAND, f"{label}: the brand file is not the one the run built"
    assert os.path.exists(os.path.join(tree, "public", "brands", "testco", "logo.webp")), \
        f"{label}: the site's pictures are not in the checkout"
    # The register's own check (routine.py reviewed): the brand file still
    # hashes to what the review stamped.
    assert hashlib.sha256(open(brand, "rb").read()).hexdigest() == \
        hashlib.sha256(BRAND.encode()).hexdigest(), f"{label}: the brand file would fail the review stamp"
    head = sh("git", "rev-parse", "HEAD", cwd=tree)
    want = sh("git", "rev-parse", "develop", cwd=bare) if expect == "develop" else seen["branch"]
    assert head == want, f"{label}: HEAD is {head}, not {expect} ({want})"
    print(f"{label}: the site is in the checkout and HEAD is {expect}")
    shutil.rmtree(work, ignore_errors=True)


def main():
    check("the merge went through", True, "selftest-land-1", "develop")
    check("the merge never reached develop", False, "selftest-land-2", "the branch it built")
    print("land: both cases pass")
    return 0


if __name__ == "__main__":
    sys.exit(main())
