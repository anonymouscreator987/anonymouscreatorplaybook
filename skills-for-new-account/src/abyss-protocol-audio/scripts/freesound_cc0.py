#!/usr/bin/env python3
"""Search Freesound for REAL recorded sounds that are CC0 (public domain),
download the high-quality previews, and append every file to LICENSES.csv.

Only CC0 results are returned, so no attribution is legally required and
monetized YouTube use is allowed. (Crediting the recordist is still kind.)

Needs a free API key: https://freesound.org/apiv2/apply  ->  export FREESOUND_TOKEN=...
Standard library only.

Usage:
  python3 freesound_cc0.py "metal creak" --min 2 --max 20 --limit 8 --out public/sfx/candidates
  python3 freesound_cc0.py "heartbeat stethoscope" --list        # just print results

Previews are 128-192 kbps (mp3/ogg). That is fine for layered SFX under VO.
For full-quality originals, download them in the browser while logged in
(original-file download needs OAuth2, which this script does not do).
"""
import argparse
import csv
import json
import os
import re
import sys
import urllib.parse
import urllib.request

API = "https://freesound.org/apiv2/search/text/"
FIELDS = "id,name,username,license,duration,avg_rating,num_downloads,previews,url,tags"


def search(query, token, min_d, max_d, limit):
    flt = f'license:"Creative Commons 0" duration:[{min_d} TO {max_d}]'
    qs = urllib.parse.urlencode({
        "query": query, "filter": flt, "fields": FIELDS,
        "sort": "rating_desc", "page_size": limit, "token": token,
    })
    with urllib.request.urlopen(f"{API}?{qs}", timeout=30) as r:
        return json.load(r)["results"]


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:50]


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("query")
    p.add_argument("--min", type=float, default=0.5, help="min duration (s)")
    p.add_argument("--max", type=float, default=30, help="max duration (s)")
    p.add_argument("--limit", type=int, default=8)
    p.add_argument("--out", default="public/sfx/candidates")
    p.add_argument("--ledger", default="LICENSES.csv")
    p.add_argument("--list", action="store_true", help="print only, no download")
    a = p.parse_args()

    token = os.environ.get("FREESOUND_TOKEN")
    if not token:
        sys.exit("Set FREESOUND_TOKEN (free key: https://freesound.org/apiv2/apply)")

    results = search(a.query, token, a.min, a.max, a.limit)
    if not results:
        print("No CC0 results. Try broader words (e.g. 'creak' instead of 'rusty hull creak').")
        return

    os.makedirs(a.out, exist_ok=True)
    new_ledger = not os.path.exists(a.ledger)
    with open(a.ledger, "a", newline="") as f:
        w = csv.writer(f)
        if new_ledger:
            w.writerow(["file", "source", "url", "author", "license", "attribution_required", "notes"])
        for s in results:
            rating = s.get("avg_rating") or 0
            print(f"{s['id']:>8}  {s['duration']:5.1f}s  ★{rating:.1f}  {s['name']}  (by {s['username']})")
            if a.list:
                continue
            prev = s["previews"].get("preview-hq-mp3") or s["previews"].get("preview-hq-ogg")
            ext = os.path.splitext(urllib.parse.urlparse(prev).path)[1] or ".mp3"
            dest = os.path.join(a.out, f"fs{s['id']}-{slug(s['name'])}{ext}")
            urllib.request.urlretrieve(prev, dest)
            w.writerow([dest, "Freesound", s["url"], s["username"], "CC0 1.0", "no", f"query: {a.query}"])
    if not a.list:
        print(f"\nDownloaded to {a.out}/ and logged in {a.ledger}. Audition, keep the best, delete the rest "
              f"(and their ledger rows).")


if __name__ == "__main__":
    main()
