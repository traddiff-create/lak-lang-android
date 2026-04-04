# LakLangLM — Technical Documentation

*Complete technical reference for the Lakota Language & Cultural Preservation Platform*
*Last updated: March 25, 2026*

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                      │
│                                                          │
│  Council Fire ─── / (default entry)                      │
│  ├── CouncilFireEntry (seasonal selector)                │
│  └── LearningLoop (5-step: hear→pause→see→repeat→connect)│
│                                                          │
│  Traditional ─── /traditional                            │
│  ├── Flashcards    /flashcards                           │
│  ├── Stories       /stories, /stories/:id                │
│  ├── Graph         /graph                                │
│  ├── Quiz          /quiz                                 │
│  ├── Conversation  /conversation                         │
│  ├── Pronunciation /pronunciation                        │
│  ├── Culture       /culture                              │
│  └── Reviewer      /reviewer (token-protected)           │
│                                                          │
│  React 18 + TypeScript + Vite + Tailwind CSS             │
│  react-force-graph-2d (graph visualization)              │
├──────────────────────┬──────────────────────────────────┤
│                      │ HTTP /api/*                        │
├──────────────────────┴──────────────────────────────────┤
│                    SERVER (Express)                       │
│                                                          │
│  Routes:                                                 │
│  ├── /api/vocabulary     Content (approved-only)         │
│  ├── /api/graph          Knowledge graph queries         │
│  ├── /api/ai             Claude conversation + quiz      │
│  ├── /api/review         Review pipeline + graph CRUD    │
│  ├── /api/pronunciation  Pronunciation guides            │
│  ├── /api/cultural       Cultural modules                │
│  ├── /api/dialogues      Dialogue examples               │
│  └── /api/health         Health check                    │
│                                                          │
│  Middleware:                                             │
│  └── access.ts           3-tier access control           │
│                                                          │
│  Node.js + Express + TypeScript                          │
├──────────────────────────────────────────────────────────┤
│                    DATABASE (SQLite)                      │
│                                                          │
│  12 tables via Drizzle ORM                               │
│  File: data/laklang.db                                   │
│  WAL mode for concurrent access                          │
└──────────────────────────────────────────────────────────┘
```

---

## Database Schema

### 12 Tables

**Original content tables:**

| Table | Columns | Records |
|-------|---------|---------|
| `vocabulary_items` | id, lakota, english, partOfSpeech, phoneticGuide, ipa, category, culturalNote, source, accessLevel, reviewStatus, reviewNotes, reviewedBy, reviewedAt, createdAt, updatedAt | 1,300+ |
| `audio_assets` | id, vocabularyId, audioType (external_url/local_file/none), audioSource, audioUrl, license, attribution, verified, createdAt | 1,300+ |
| `cultural_modules` | id, title, body (markdown), category, accessLevel, reviewStatus, reviewedBy, reviewedAt, createdAt, updatedAt | 24+ |
| `pronunciation_guides` | id, symbol, type (vowel/consonant/diacritic), ipa, englishApproximation, description, exampleWord, exampleMeaning, sectionRef, accessLevel, reviewStatus, createdAt | 30+ |
| `dialogue_examples` | id, type (mini/extended), title, context, lakotaText (JSON), englishTranslation, numExchanges, participants (JSON), speakerGenders (JSON), accessLevel, reviewStatus, createdAt | 19 |

**Knowledge graph tables:**

| Table | Columns | Records |
|-------|---------|---------|
| `stories` | id, titleLakota, titleEnglish, body (markdown), audioUrl, category, source, accessLevel, reviewStatus, reviewNotes, reviewedBy, reviewedAt, createdAt, updatedAt | 66 |
| `values` | id, lakota, english, description, source, accessLevel, reviewStatus, reviewNotes, reviewedBy, reviewedAt, createdAt, updatedAt | 13 |
| `persons` | id, lakotaName, englishName, role, biography, source, accessLevel, reviewStatus, reviewNotes, reviewedBy, reviewedAt, createdAt, updatedAt | 13 |
| `places` | id, lakotaName, englishName, description, latitude, longitude, source, accessLevel, reviewStatus, reviewNotes, reviewedBy, reviewedAt, createdAt, updatedAt | 1 |
| `ceremonies` | id, lakotaName, englishName, description, audioUrl, source, accessLevel, reviewStatus, reviewNotes, reviewedBy, reviewedAt, createdAt, updatedAt | 0 |
| `songs` | id, lakotaTitle, englishTitle, lyrics, audioUrl, composer, source, accessLevel, reviewStatus, reviewNotes, reviewedBy, reviewedAt, createdAt, updatedAt | 0 |
| `graph_edges` | id, sourceNodeId, sourceNodeType, targetNodeId, targetNodeType, relationshipType, metadata (JSON), accessLevel, createdAt | 111+ |

### Enums

```typescript
reviewStatusEnum = ['draft', 'pending_review', 'approved', 'rejected']
accessLevelEnum = ['public', 'community', 'restricted']
nodeTypeEnum = ['word', 'story', 'value', 'person', 'place', 'ceremony', 'song']
relationshipTypeEnum = ['appears_in', 'teaches', 'related_to', 'expresses', 'part_of', 'composed_by', 'located_at', 'performed_at']
audioTypeEnum = ['external_url', 'local_file', 'none']
audioSourceEnum = ['firstvoices', 'llc', 'community', 'other']
```

---

## API Reference

### Vocabulary (`/api/vocabulary`)
```
GET  /                  ?category=greetings&search=hello  → VocabularyItem[]
GET  /categories        → { category, count }[]
GET  /:id               → VocabularyItem (with audio)
```

### Knowledge Graph (`/api/graph`)
```
GET  /all               → { nodes: GraphNode[], edges: GraphEdge[] }
GET  /node/:type/:id    → { node, outgoing[], incoming[] }
GET  /explore           ?nodeId=X&nodeType=Y&depth=2  → { nodes[], edges[] }
GET  /search            ?q=term  → { results: GraphNode[], total }
GET  /stories           ?category=traditional  → { data: StoryDetail[] }
GET  /stories/:id       → { story, linked: { vocabulary[], values[], persons[], places[], ceremonies[], songs[] } }
```

### AI (`/api/ai`)
```
POST /conversation      { messages: Message[], category?: string }  → { message: string }
POST /quiz              { category?: string, count?: number }  → QuizQuestion[]
```
- Claude model: claude-sonnet-4-6
- System prompts in `/server/prompts/*.txt` — never inline
- Conversation includes graph context (linked stories, values) automatically
- Quiz generates MC + fill-in-the-blank from approved vocabulary only

### Review (`/api/review`) — Token-protected
```
Header: x-reviewer-token: <token>  (or ?token=<token>)
Default token: lakota-review-2026

GET    /pending                        → all pending items across types
PATCH  /vocabulary/:id                 { action: approve|reject, notes?, reviewedBy? }
PATCH  /cultural/:id                   { action: approve|reject }
PATCH  /pronunciation/:id              { action: approve|reject }
POST   /node                           { type, ...fields }  → creates draft node
PATCH  /node/:type/:id                 { action: approve|reject, notes?, reviewedBy? }
PATCH  /node/:type/:id/access          { accessLevel: public|community|restricted }
POST   /edge                           { sourceNodeId, sourceNodeType, targetNodeId, targetNodeType, relationshipType }
DELETE /edge/:id                        → removes relationship
```

### Other
```
GET  /api/pronunciation     ?type=vowel|consonant|diacritic
GET  /api/cultural          → CulturalModule[]
GET  /api/cultural/:id      → CulturalModule
GET  /api/dialogues         ?type=mini|extended
GET  /api/health            → { status: "ok" }
```

---

## Council Fire — Experiential Learning Mode

### 5-Step Learning Loop State Machine

```
  ┌─────┐   timer   ┌───────┐   timer   ┌─────┐   user    ┌────────┐   user    ┌─────────┐
  │HEAR │──────────→│ PAUSE │──────────→│ SEE │─────────→│REPEAT  │─────────→│ CONNECT │
  └─────┘           └───────┘           └─────┘          └────────┘          └─────────┘
     ↑                                                                            │
     └────────────────────── nextItem() ──────────────────────────────────────────┘
```

### Timing by Season (milliseconds)

| Step | Winter (Stories) | Spring (Words) | Summer (Practice) | Fall (Meaning) |
|------|-----------------|----------------|-------------------|----------------|
| Hear | 5000 | 3000 | 2500 | 4000 |
| Pause | 4000 | 2000 | 1500 | 3000 |
| See | user-triggered | user-triggered | user-triggered | user-triggered |
| Repeat | user-triggered | user-triggered | user-triggered | user-triggered |
| Connect | user-triggered | user-triggered | user-triggered | user-triggered |

### Content Sources by Season

| Season | Lakota Name | Content | API Call |
|--------|------------|---------|----------|
| Winter | Waniyetu | Stories (63) | `fetchStories()` |
| Spring | Wetu | Vocabulary (634+) | `fetchVocabulary()` |
| Summer | Bloketu | Vocabulary + mic required | `fetchVocabulary()` |
| Fall | Ptanyetu | Values, persons, places, ceremonies | `fetchGraphAll()` filtered |

### Step Components

| File | Step | Behavior |
|------|------|----------|
| `HearStep.tsx` | 1. Hear | Plays audio (if available), shows pulsing glow circle in node-type color |
| `PauseStep.tsx` | 2. Pause | Circle dims, silence |
| `SeeStep.tsx` | 3. See | Lakota fades in large, English below (Summer = Lakota only) |
| `RepeatStep.tsx` | 4. Repeat | Microphone capture via MediaRecorder API, 5s recording |
| `ConnectStep.tsx` | 5. Connect | Fetches graph connections, renders as colored chips |

### Audio Handling
- If `audioUrl` exists → `new Audio(audioUrl).play()`
- If no audio → visual glow placeholder (intentional, not broken)
- Never TTS for Lakota — content integrity rule
- Microphone: `navigator.mediaDevices.getUserMedia({ audio: true })` → `MediaRecorder`
- Records locally only — no server upload

---

## Ingestion Pipelines

### Available Scripts

| Script | Command | Input | Output |
|--------|---------|-------|--------|
| Seed importer | `npm run seed` | JSON files in `data/seed/` | Vocabulary, pronunciation, dialogues, cultural modules |
| Primer parser | `npm run parse-primer` | HTML primer file | ~630 vocab, 33 pronunciation, 19 dialogues |
| Graph ingester | `npm run ingest-graph -- <dir>` | Markdown+YAML files | Any node type + edges |
| CSD ingester | `npm run ingest-csd` | CSV files in `data/seed/csd/` | 688 vocabulary words |
| Deloria ingester | `npm run ingest-deloria` | OCR text in `data/seed/deloria/` | 62 stories, 11 persons, 5 values, 109 edges |
| Corpus ingester | `npm run ingest-corpus` | Curated reference data | 16 cultural modules, 9+ pronunciation guides |

### Markdown Ingestion Format (ingest-graph)

```yaml
---
type: story|value|person|place|ceremony|song
title_lakota: Lakota Title
title_english: English Title
category: teaching|creation|historical
accessLevel: public|community|restricted
source: Citation string
linked:
  - type: word
    lakota: search term
    relationship: appears_in
  - type: value
    name: search term
    relationship: teaches
---

Body content in markdown...
```

All ingested content enters as `draft`. Must be approved via reviewer portal.

---

## Access Control

### 3-Tier System

| Level | Who sees it | Use case |
|-------|------------|----------|
| `public` | Everyone | General vocabulary, published stories |
| `community` | Everyone (for now, future: authenticated community members) | Cultural details, kinship terms |
| `restricted` | Reviewers only | Sacred/ceremonial content, community-flagged items |

### Implementation
- Middleware: `server/middleware/access.ts`
- `getAccessContext(req)` — checks `x-reviewer-token` header or `?token=` query
- `getAllowedAccessLevels(context)` — returns allowed levels for filtering
- All content endpoints filter by both `reviewStatus = 'approved'` AND `accessLevel IN (allowed)`

---

## Content Integrity

### Rules (non-negotiable)
1. Claude never generates Lakota words, phrases, or translations
2. Every content item must pass review (draft → approved) before reaching learners
3. System prompts stored in `/server/prompts/*.txt` — never inline strings
4. All prompts include: "You do not generate Lakota words or phrases from your own knowledge"
5. Audio is source-agnostic — architecture supports any source without code changes
6. LLC Standard Lakota Orthography (SLO) used throughout: ą, š, ž, č, ȟ, ġ, ŋ, ʼ
7. "Nation" or "people" — never "tribe"

### Review Pipeline
```
DRAFT → PENDING_REVIEW → APPROVED (visible to learners)
                       → REJECTED (with reviewer notes)
REJECTED → DRAFT (after edits, re-submit)
```

---

## Knowledge Graph — Relationship Types

| Type | Meaning | Example |
|------|---------|---------|
| `appears_in` | Word appears in a story | wičháša → Deloria #12 |
| `teaches` | Story teaches a value | Iktomi story → Humility |
| `related_to` | Character appears in story | Stone Boy → Deloria #8 |
| `expresses` | Story expresses a genre/category | Deloria #1 → Ohúŋkakaŋ |
| `part_of` | Element is part of larger whole | — |
| `composed_by` | Song composed by person | — |
| `located_at` | Ceremony at a place | — |
| `performed_at` | Event at a location | — |

---

## Data Sources — Ingested

| Source | License | Volume | Parser |
|--------|---------|--------|--------|
| Lakota Language Consortium (seed) | Educational use | 16 items | `import.ts` |
| Claude Lakota Primer v1 | Generated scaffold | ~630 items | `parse-primer.ts` |
| Comparative Siouan Dictionary | CC-BY 4.0 | 688 words from 1,916 entries | `ingest-csd.ts` |
| Ella Deloria, Dakota Texts (1932) | Public domain | 62 stories, 11 persons, 5 values | `ingest-deloria.ts` |
| Digital Lakota Corpus | Apache 2.0 | 16 references, 9 pronunciation guides | `ingest-corpus.ts` |

See `SOURCES.md` for the full inventory of 50+ cataloged but not-yet-ingested sources.

---

## Development

### Prerequisites
- Node.js 20+
- npm

### Setup
```bash
npm install
npm run db:push          # Create/update SQLite schema
npm run seed             # Import seed data
npm run ingest-csd       # Import CSD vocabulary
npm run ingest-deloria   # Import Deloria stories
npm run ingest-corpus    # Import corpus references
npm run dev              # Start client (5173) + server (3000)
```

### Scripts
```bash
npm run dev              # Concurrent client + server
npm run dev:client       # Vite dev server only
npm run dev:server       # Express server only (tsx watch)
npm run build            # TypeScript + Vite production build
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to DB (dev)
npm run db:studio        # Drizzle Studio (web IDE)
npm run seed             # Import seed JSON
npm run parse-primer     # Parse HTML primer
npm run ingest-graph     # Markdown → graph nodes
npm run ingest-csd       # CSD CSV → vocabulary
npm run ingest-deloria   # Deloria text → stories
npm run ingest-corpus    # Corpus → references + pronunciation
```

### Environment Variables
```
ANTHROPIC_API_KEY=       # Required for /api/ai routes
DATABASE_URL=            # PostgreSQL for prod (omit for SQLite dev)
REVIEWER_TOKEN=          # Default: lakota-review-2026
```

### Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.3.1 | Frontend framework |
| express | 4.21.0 | Backend server |
| drizzle-orm | 0.45.1 | Database ORM |
| better-sqlite3 | 11.0.0 | SQLite driver |
| @anthropic-ai/sdk | 0.78.0 | Claude API |
| react-force-graph-2d | latest | Graph visualization |
| react-router-dom | 6.28.0 | Client routing |
| tailwindcss | 3.4.15 | CSS framework |
| typescript | 5.6.0 | Type safety |
| vite | 5.4.0 | Build tool |

---

## File Map (key files)

```
server/db/schema.ts              ← All 12 table definitions + types
server/routes/graph.ts           ← Knowledge graph API
server/routes/review.ts          ← Review pipeline + graph CRUD
server/routes/ai.ts              ← Claude conversation + quiz
server/middleware/access.ts      ← 3-tier access control
server/prompts/*.txt             ← Claude system prompts

client/App.tsx                   ← Routes + layout (Council Fire / Traditional)
client/lib/api.ts                ← All API types + fetch functions
client/hooks/useLearningLoop.ts  ← 5-step state machine
client/hooks/useSeasonalContent.ts ← Content by season
client/components/council-fire/  ← Immersive learning mode
client/components/graph-explorer/ ← Force-directed graph
client/components/story-view/    ← Audio-first stories
client/styles/council-fire.css   ← Dark theme + animations

data/seed/ingest-*.ts            ← Ingestion pipelines
data/seed/csd/                   ← 1,204 CSD CSV files
data/seed/deloria/               ← Dakota Texts OCR
SOURCES.md                       ← 50+ archive inventory
docs/PHILOSOPHY.md               ← Scientific framework
docs/MARKET-RESEARCH.md          ← LLC/TLC competitive analysis
docs/LLC-PARTNERSHIP-PROPOSAL.md ← Partnership inquiry
docs/outreach/                   ← Sent emails + follow-up plans
```

---

*Built by Traditionally Different Technology, Rapid City, SD*
*Preserving a culture because we can.*
