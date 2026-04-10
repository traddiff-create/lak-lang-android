# Content Acquisition Status

**Last updated:** 2026-04-10

## Downloaded Content

### Images: LOC Public Domain Lakota Photos
- **Location:** `data/seed/images/loc/`
- **Count:** 71 photographs
- **Size:** 6.3MB
- **License:** Public domain
- **Manifest:** `manifest.json` (categorized)
- **Node mapping:** `image-node-map.json` (33 images mapped to named persons/places)

**Category breakdown:**
| Category | Count | Description |
|----------|-------|-------------|
| person | 37 | Portraits of Lakota leaders, families, individuals |
| place | 26 | Pine Ridge, Little Bighorn, Fort Caspar, camps |
| daily_living | 16 | Beef issue, scouts, councils, community life |
| historical | 14 | Military, battles, treaties |
| ceremony | 7 | Powwow, dances, cultural events |
| ceremonial | 3 | Traditional clothing, Wild West Show regalia |
| uncategorized | 1 | General |

**Named person images (from image-node-map.json):**
| Person | Lakota Name | Images |
|--------|-------------|--------|
| American Horse | Tȟašúŋke Waŋkíyaŋ | 5 |
| Charging Thunder | Wakíŋyaŋ Íŋyaŋke | 4 |
| Two Strike | Nomkahpa | 3 |
| Red Cloud | Maȟpíya Lúta | 2 |
| Iron Shell | Mázaočeti | 2 |
| Crow Dog | Kȟaŋǧí Šúŋka | 2 |
| Short Bull | Tȟatȟáŋka Ptéčela | 2 |
| Sitting Bull | Tȟatȟáŋka Íyotake | 1 |
| Fool Bull | Tȟatȟáŋka Witko | 1 |
| Chief Red Shirt | Ógle Lúta | 1 |
| George Sword | Míla Háŋska | 0 (mapped, no matching image yet) |

### Audio: Internet Archive Song Chants
- **Location:** `data/seed/audio/archive-org/`
- **Files:** 1 MP3 (4.7MB) + cover image
- **Node mapping:** `audio-node-map.json` → song/ceremony nodes, Cosmos Sky direction
- **Integration:** Maps to Story.audioUrl field or future audio_assets table

### Audio: Way of Wakan BHSC Tapes (PENDING)
- **Location:** `data/seed/audio/wayofwakan/`
- **Status:** Site offline — placeholder manifest + contact info
- **Action needed:** Contact David Mathieu (david.mathieu902@gmail.com) or check Wayback Machine

---

## Integration Requirements

### To use images in the Android app:
1. Add `imageUrl: String?` field to Person, Place entities (Room migration)
2. Add `image_url` column to persons, places tables in pre-built SQLite
3. Copy selected images to `app/src/main/assets/images/` or serve from bundled path
4. Update Person detail screen to show portrait when available
5. Update Cosmos node overlay to show thumbnail for mapped nodes

### To use audio in the Android app:
1. Song Chants → Set `audioUrl` on relevant Story or CulturalModule entries
2. Future vocabulary audio → Add audio_assets table to Room schema (mirrors server schema)
3. Way of Wakan tapes (when available) → Segment into vocabulary-aligned clips, create audio_assets entries

### Server-side (web platform):
1. Images: Serve from `data/seed/images/loc/` via Express static route or CDN
2. Audio: `audio_assets` table already exists — insert entries with `audio_type: 'local_file'`
3. Run ingestion: create new `ingest-loc-images.ts` and `ingest-audio.ts` scripts

---

## Content Pipeline

All content follows: `DRAFT → PENDING_REVIEW → APPROVED`

Nothing reaches learners without community partner approval.
