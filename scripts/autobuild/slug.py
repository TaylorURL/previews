"""The subdomain a business is given."""
import os
import re

DROP = {"llc", "inc", "co", "company", "services", "pllc", "pc", "corp", "ltd", "the"}


def slug_for(name, town, root):
    words = re.findall(r"[a-z0-9]+", name.lower().replace("&", " and "))
    kept = [w for w in words if w not in DROP] or words
    kept = [w for i, w in enumerate(kept) if w != "and" or (0 < i < len(kept) - 1 and len(kept[i - 1]) == 1 and len(kept[i + 1]) == 1)]
    while len(kept) > 1 and kept[-1] in ("and", "of", "at"):
        kept.pop()
    slug = "".join(kept)[:40]
    taken = lambda s: os.path.exists(os.path.join(root, "src", "brands", f"{s}.json"))
    if taken(slug) and town:
        slug = (slug + re.sub(r"[^a-z0-9]", "", town.lower()))[:50]
    return slug
