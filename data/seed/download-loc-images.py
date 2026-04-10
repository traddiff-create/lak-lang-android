#!/usr/bin/env python3
"""Download LOC Public Domain Lakota Photographs for LakLang app.

Source: Library of Congress Prints & Photographs API
License: Public Domain — no restrictions
Usage: python3 data/seed/download-loc-images.py
"""

import json
import os
import re
import time
import urllib.request

OUT_DIR = "data/seed/images/loc"
MANIFEST_PATH = os.path.join(OUT_DIR, "manifest.json")
API_BASE = "https://www.loc.gov/pictures/search/?q=lakota+indians&fo=json&c=20&fa=displayed:anywhere&sp={page}"

# Skip violent/inappropriate imagery for educational app
SKIP_PATTERNS = re.compile(
    r"Remains|dead in the snow|Massacre|killed by|corpse",
    re.IGNORECASE,
)

def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "LakLang-Educational-App/1.0"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def download_file(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "LakLang-Educational-App/1.0"})
    with urllib.request.urlopen(req) as resp:
        with open(path, "wb") as f:
            f.write(resp.read())
    return os.path.getsize(path)

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = []
    downloaded = 0
    skipped = 0

    for page in range(1, 6):
        print(f"Fetching page {page}...")
        try:
            data = fetch_json(API_BASE.format(page=page))
        except Exception as e:
            print(f"  Error fetching page {page}: {e}")
            continue

        results = data.get("results", [])
        if not results:
            print(f"  No more results on page {page}")
            break

        for item in results:
            title = item.get("title", "")
            pk = str(item.get("pk", ""))
            img_url = (item.get("image") or {}).get("full", "")
            thumb_url = (item.get("image") or {}).get("thumb", "")
            item_url = (item.get("links") or {}).get("item", "")

            if not img_url or not pk:
                continue

            if SKIP_PATTERNS.search(title):
                print(f"  SKIP (sensitivity): {title[:70]}")
                skipped += 1
                continue

            filename = f"{pk}.jpg"
            filepath = os.path.join(OUT_DIR, filename)

            try:
                size = download_file(img_url, filepath)
                downloaded += 1
                print(f"  [{downloaded}] {filename} ({size // 1024}KB) — {title[:60]}")

                manifest.append({
                    "id": f"LOC-{pk}",
                    "filename": filename,
                    "title": title,
                    "source": "Library of Congress Prints & Photographs Division",
                    "source_url": item_url,
                    "image_url": img_url,
                    "thumb_url": thumb_url,
                    "license": "public_domain",
                    "review_status": "draft",
                    "size_bytes": size,
                    "categories": [],
                })
            except Exception as e:
                print(f"  FAILED: {filename} — {e}")

            time.sleep(0.3)

        time.sleep(1)

    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\nDone! Downloaded {downloaded} images, skipped {skipped}")
    print(f"Manifest: {MANIFEST_PATH}")

if __name__ == "__main__":
    main()
