# Architecture — LakLang Android

## Overview

MVVM with a pre-built SQLite database bundled as an Android asset. Entirely offline — no network calls, no backend, no APIs.

```
┌─────────────────────────────────────────┐
│              UI Layer                    │
│  Compose Screens + SpotlightOverlay     │
│         ↕ StateFlow                     │
├─────────────────────────────────────────┤
│           ViewModel Layer               │
│  ExploreVM, WordDetailVM, SpotlightVM   │
│         ↕ Suspend/Flow                  │
├─────────────────────────────────────────┤
│            Data Layer                   │
│  Room DAOs → Pre-built SQLite DB        │
│  (laklang.db, 5.5MB, bundled in assets) │
└─────────────────────────────────────────┘
```

## Data Layer

### Pre-built Database

Ships `laklang.db` (5.5MB) in `app/src/main/assets/`. Room's `createFromAsset()` copies it on first launch. Database originates from LakLangLM web platform, built by Drizzle ORM ingestion pipelines.

### Schema (12 tables)

**Content:** vocabulary_items (12,535), stories (63), cultural_modules (24), pronunciation_guides (42), dialogue_examples (19), audio_assets (12,535)

**Knowledge graph:** values (13), persons (11), places (1), ceremonies (0), songs (0), graph_edges (111)

**Local:** bookmarks (user data, created by Room)

### Access Control

All queries filter: `WHERE review_status = 'approved' AND access_level = 'public'`

## ViewModel Layer

| ViewModel | Purpose |
|-----------|---------|
| `ExploreViewModel` | Category browse, Word of the Day |
| `WordDetailViewModel` | Word + graph traversal + pronunciation breakdown |
| `StoriesViewModel` | Story list + detail with connected values/persons |
| `SpotlightViewModel` | Universal search across all 6 content types |
| `SavedViewModel` | Bookmarks across types |
| `LearnViewModel` | Pronunciation, culture, dialogues |

## UI Layer

### Navigation

```
LakLangNavigation (Scaffold + TopAppBar with 🔍 + BottomNav)
├── Explore (categories, Word of the Day)
├── Stories (63 narratives)
├── Learn (pronunciation, culture, dialogues)
└── Saved (bookmarks)

Spotlight overlay (any tab via 🔍)

Detail screens:
├── word/{wordId} → WordDetailScreen
├── story/{storyId} → StoryDetailScreen
└── module/{moduleId} → CulturalModuleDetailScreen
```

### Spotlight Search

Global overlay inspired by Apple Spotlight. Fires 6 parallel Room queries, groups results by type (Words, Stories, Culture, Values, People, Dialogues).

### Graph Traversal (Word Detail)

The star feature. For any word: load word → query graph_edges for connections → find same-category words → match characters to pronunciation_guides → check bookmark state.

## Key Decisions

1. **Pre-built DB over API** — Content is curated. No server needed.
2. **No KMP** — Android-only for now. Simpler than DharmaGit/PoP/BTYBD.
3. **Separate queries over UNION** — Spotlight fires 6 parallel queries for grouped results.
4. **No audio** — Architecture supports it when LLC partnership materializes.
5. **Manual DI** — `LakLangApp` Application class holds database singleton.
