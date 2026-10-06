"""The third letter, filled from what the brand file already holds.

It is one fixed letter: the business's name, town and main service, the
address of its draft, and only those things on the draft that are really
theirs. `{url}` stands for the preview's address and the picture of the site
goes under the first paragraph.
"""

import re
from datetime import datetime


def _month(prior):
    """The month of the first letter this studio sent them, from the prior list."""
    m = re.match(r"([A-Z][a-z]{2}) \d\d:", prior or "")
    if not m:
        return None
    return datetime.strptime(m.group(1), "%b").strftime("%B")


def letter_for(row, brand):
    name = brand["name"]
    town = brand["town"]
    services = [s["title"] for s in brand.get("services") or brand.get("groups") or []]
    month = _month(row.get("prior"))
    opener = f"I wrote to you in {month} about your website." if month else "I'm Trenton with TaylorURL, a small web studio in Baytown."
    p1 = (f"{opener} Since then I put together a first draft of a new website for {name}, "
          f"and it's live so you can click through it:\n{{url}}")

    theirs = ["your logo and colors"]
    if brand.get("rating") and brand.get("reviewCount"):
        theirs.append(f"your {brand['rating']}-star rating from {brand['reviewCount']} Google reviews")
    if brand.get("hours"):
        theirs.append("your hours")
    listed = ", ".join(theirs[:-1]) + f" and {theirs[-1]}" if len(theirs) > 1 else theirs[0]
    p2 = f"It uses {listed}"
    if len(services) >= 2:
        named = ", ".join(services[:3][:-1]) + f" and {services[:3][-1]}"
        p2 += f", and it lists the services you offer, like {named}"
    p2 += ". Your phone number is one tap away on every page."

    p3 = ("It's a draft, so tell me what you'd change: the wording, the photos, the services, anything that isn't "
          "right. Reply with your notes and I'll make the changes.")
    return {"subject": f"A draft website for {name}", "paragraphs": [p1, p2, p3]}
