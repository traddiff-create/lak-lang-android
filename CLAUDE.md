# LakLang — Lakota Language & Cultural Preservation

**Location:** `/Applications/Apps/LakLangAndroid/`
**Repo:** `traddiff-create/lak-lang-android`
**Type:** Monorepo (Android + Web + Server + Data) | **Status:** Active
**Owner:** Rory Stone (Traditionally Different Technology)

## Purpose

A living knowledge graph and experiential learning platform for Lakota language and cultural preservation. Monorepo containing the native Android app, React web platform, Express API server, and data pipelines.

Built for Tom (Lakota), Nicole (Yankton Sioux), and Rory.

---

## Quick Reference

| Property | Value |
|----------|-------|
| **Package** | `com.traddiff.laklang` |
| **Android** | Kotlin 1.9.24, Jetpack Compose, Material 3, Room |
| **Web** | React 18, Vite, TypeScript, Tailwind CSS |
| **Server** | Node.js, Express, Drizzle ORM, SQLite |
| **AI** | Claude API (tutor only, never generates Lakota) |
| **Min SDK** | 26 (Android 8.0) |
| **Target SDK** | 35 (Android 15) |

## Monorepo Structure

```
LakLangAndroid/
├── app/                    Android app (Kotlin/Compose)
│   ├── src/main/java/com/traddiff/laklang/
│   │   ├── ui/
│   │   │   ├── cosmos/     ★ Native Cosmos — 7 sacred directions museum
│   │   │   ├── explore/    Vocabulary browser
│   │   │   ├── stories/    Deloria narratives
│   │   │   ├── learn/      Pronunciation, Culture, Dialogues
│   │   │   ├── saved/      Bookmarks
│   │   │   ├── detail/     Word detail (star feature)
│   │   │   ├── search/     Spotlight search overlay
│   │   │   └── navigation/ Bottom tab nav (5 tabs)
│   │   ├── viewmodel/      MVVM ViewModels
│   │   └── data/           Room DB, DAOs, entities
│   └── src/main/assets/    Pre-built laklang.db (5.6MB)
├── web/                    React web client (from LakLangLM)
│   ├── App.tsx             3 modes: Council Fire, Traditional, Museum
│   └── components/         museum/, council-fire/, flashcards/, etc.
├── server/                 Express API server
│   ├── routes/             graph, content, ai, review, etc.
│   └── prompts/            Claude system prompts
├── data/seed/              Ingestion pipelines + seed files
├── docs/                   13 documentation files
├── SOURCES.md              80+ cataloged Lakota sources
├── DICTIONARY.md           1,300+ compiled entries
└── CLAUDE.md               This file
```

## Build

### Android
```bash
./gradlew :app:assembleDebug
./gradlew :app:installDebug
```

### Web (dev server)
```bash
npm install
npm run dev          # Vite (5173) + Express (3000)
```

## Android App — 5 Tabs

| Tab | Route | Content |
|-----|-------|---------|
| **Explore** | `explore` | 12,535 words, categories, Word of the Day |
| **Stories** | `stories` | 63 Deloria narratives |
| **Learn** | `learn` | Pronunciation, Culture, Dialogues |
| **Saved** | `saved` | User bookmarks |
| **Cosmos** | `cosmos` | ★ Seven sacred directions museum |

### Cosmos Tab (Native Compose Canvas)
- 12,535+ nodes orbiting in seven sacred directions
- Compose Canvas rendering with LOD (dots → labels → full text)
- Pan/zoom gestures (detectTransformGestures)
- Tap node → overlay with Lakota/English + graph connections
- Dark cosmos palette (#0B1026 deep indigo)
- Seasonal awareness (spring = East/vocabulary glows)

### Seven Sacred Directions
| Direction | Lakota | Content | Color |
|-----------|--------|---------|-------|
| West | Wiyohpeyata | Stories | Ochre |
| North | Waziyata | Values/Wisdom | Sage |
| East | Wihinanpata | Vocabulary | Turquoise |
| South | Itokaga | Persons/Community | Ember |
| Sky | Wankantanhan | Ceremonies/Songs | Star |
| Earth | Maka | Places | Earth |
| Center | Cante | Hub/Heart | Lavender |

## Data

Pre-built SQLite database (Room):
- 12,535 vocabulary items
- 63 Deloria stories
- 111 knowledge graph edges
- 42 pronunciation guides
- 24 cultural modules
- 19 dialogues
- 13 values, 11 persons, 1 place

All content filtered: `WHERE review_status = 'approved' AND access_level = 'public'`

## Content Integrity

- **Never generate Lakota content from AI** — Claude is tutor only
- Use "Nation" or "people" — never "tribe"
- LLC Standard Orthography: ą, š, ž, č, ȟ, ġ, ŋ, ʼ
- No TTS for Lakota — ever
- Community partner flags restricted → removed without question
- Review pipeline: DRAFT → PENDING_REVIEW → APPROVED | REJECTED

## Deploy Skill

`/laklang-deploy` — builds web, syncs assets, assembles APK, installs on Samsung

## Related

- **ThoughtField** (`/Applications/Apps/ThoughtField/`) — cosmos engine originated here
- **LakLangLM** (`/Applications/Apps/LakLangLM/`) — archived, merged into this repo
