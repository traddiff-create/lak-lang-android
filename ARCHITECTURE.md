# Architecture — LakLang

## Overview

Monorepo containing Android app (Kotlin/Compose), React web client, Express API server, and data pipelines. The Android app follows MVVM with a pre-built SQLite database bundled as an asset.

```
┌─────────────────────────────────────────┐
│              UI Layer                    │
│  Compose Screens + Cosmos Canvas        │
│  + SpotlightOverlay                     │
│         ↕ StateFlow                     │
├─────────────────────────────────────────┤
│           ViewModel Layer               │
│  ExploreVM, CosmosVM, SpotlightVM,     │
│  WordDetailVM, StoriesVM, SavedVM       │
│         ↕ Suspend/Flow                  │
├─────────────────────────────────────────┤
│            Data Layer                   │
│  Room DAOs → Pre-built SQLite DB        │
│  (laklang.db, 5.6MB, bundled in assets) │
└─────────────────────────────────────────┘
```

## Android App

### Pre-built Database

Ships `laklang.db` in `app/src/main/assets/`. Room's `createFromAsset()` copies it on first launch. Database originates from data pipelines in `data/seed/`.

### Schema (12+ tables)

**Content:** vocabulary_items (12,535), stories (63), cultural_modules (24), pronunciation_guides (42), dialogue_examples (19), audio_assets (12,535)

**Knowledge graph:** values (13), persons (11), places (1), ceremonies (0), songs (0), graph_edges (111)

**Local:** bookmarks (user data, created by Room)

### Navigation (5 tabs)

```
LakLangNavigation (Scaffold + TopAppBar with 🔍 + BottomNav)
├── Explore       — categories, Word of the Day
├── Stories       — 63 Deloria narratives
├── Learn         — pronunciation, culture, dialogues
├── Saved         — bookmarks
└── Cosmos        — Seven Sacred Directions museum

Spotlight overlay (any tab via 🔍)

Detail screens:
├── word/{wordId}              → WordDetailScreen
├── story/{storyId}            → StoryDetailScreen
├── module/{moduleId}          → CulturalModuleDetailScreen
└── cosmos/{directionKey}      → DirectionScreen (immersive page)
```

### Cosmos Architecture

The Cosmos tab renders 12,535+ nodes on a Compose Canvas:

- **CosmosCanvas** — Canvas with star field, direction labels, orbital nodes
- **CosmosNode** — Data class with orbital parameters (rx, ry, angle, speed, tilt)
- **DirectionData** — 7 directions mapped to content types and canvas positions
- **CosmosViewModel** — Loads all nodes, manages direction/node selection, graph edges
- **DirectionScreen** — Immersive full-page per direction with cosmology text + themed content
- **LOD rendering** — Dots at zoom-out, labels at mid-zoom, full text at zoom-in
- **Seasonal awareness** — Spring = East, Summer = South, Fall = Sky, Winter = West

### Key ViewModels

| ViewModel | Purpose |
|-----------|---------|
| `ExploreViewModel` | Category browse, Word of the Day |
| `CosmosViewModel` | All nodes + edges, direction/node selection |
| `DirectionViewModel` | Load themed content per direction |
| `SpotlightViewModel` | Universal search (6 parallel queries, 300ms debounce) |
| `WordDetailViewModel` | Word + graph traversal + pronunciation breakdown |
| `StoriesViewModel` | Story list + detail with connected values/persons |
| `SavedViewModel` | Bookmarks across types |

### Access Control

All queries filter: `WHERE review_status = 'approved' AND access_level = 'public'`

## Web Platform

React 18 + Vite + TypeScript. Three UX modes:
- **Council Fire** — immersive audio-first learning with seasonal structure
- **Traditional** — module-based tools (flashcards, quizzes, graph explorer)
- **Museum** — web version of the Seven Directions cosmos

## Server

Express + Drizzle ORM + SQLite. REST API for vocabulary, graph, AI tutor (Claude), review pipeline.

## Key Design Decisions

1. **Pre-built DB over API** — Content is curated. 5.6MB is small for mobile.
2. **Cosmos Canvas over WebView** — Native Compose Canvas for 60fps orbital animation.
3. **Separate search queries over UNION** — Spotlight fires 6 parallel queries for grouped results.
4. **No audio yet** — Architecture supports it when LLC partnership materializes.
5. **Direction pages over canvas drill-in** — Immersive full-page per direction, not filtered canvas.
6. **Monorepo** — Android, web, server, data all in one repo for shared database and content.
