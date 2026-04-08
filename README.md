# LakLang — Lakota Living Museum

A Lakota language and cultural preservation platform. Monorepo containing a native Android app, React web platform, Express API server, and data pipelines.

Search any word and get the full picture: meaning, pronunciation, cultural context, related words, connected stories and values. Navigate the Seven Sacred Directions to explore Lakota knowledge through a living cosmic museum.

Built for people with real ties to the Lakota language and community — not tourists, not gamification. Every word is a doorway back into the worldview.

## Features

### Cosmos — Seven Sacred Directions
- **Dark starfield canvas** with 12,535+ orbiting nodes across 7 directions
- **Tap a direction** → immersive page with Lakota cosmology description and themed content
- **Pinch-to-zoom, pan** — explore the knowledge graph spatially
- **Seasonal awareness** — current season's direction glows (spring = East/vocabulary)
- **Tap any node** → overlay with Lakota/English + graph connections

### Seven Directions

| Direction | Lakota | Content |
|-----------|--------|---------|
| West | Wiyohpeyata | Stories — 63 Deloria narratives |
| North | Waziyata | Wisdom — 13 cultural values |
| East | Wihinanpata | Knowledge — 12,535 vocabulary items |
| South | Itokaga | Community — people & dialogues |
| Sky | Wankantanhan | Sacred — ceremonies & songs |
| Earth | Maka | Land — places & nature vocabulary |
| Center | Cante | Heart — your bookmarks & cultural articles |

### Core Features
- **Spotlight Search** — universal search across words, stories, culture, values, people, dialogues
- **Word Detail** — meaning, pronunciation breakdown, cultural context, related words, connected stories
- **63 Deloria Stories** — with linked values and persons via knowledge graph
- **42 Pronunciation Guides** — LLC orthography (vowels, consonants, diacritics)
- **24 Cultural Articles** — worldview, language, tradition, history
- **19 Dialogues** — conversational practice with speaker exchanges
- **Bookmarks** — save words, stories, and articles for study
- **Word of the Day** — daily inspiration from the vocabulary

## Content Stats

| Content Type | Count | Source |
|-------------|-------|--------|
| Vocabulary | 12,535 | LLC, Comparative Siouan Dictionary, Deloria |
| Stories | 63 | Ella Deloria's Dakota Texts (1932) |
| Graph Edges | 111 | Story-value-person connections |
| Pronunciation | 42 | LLC Standard Orthography |
| Cultural Modules | 24 | Worldview, language, practice |
| Dialogues | 19 | Conversational examples |
| Values | 13 | Extracted from narratives |
| Persons | 11 | Historical figures |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Android | Kotlin 1.9.24, Jetpack Compose, Material 3, Room |
| Web | React 18, Vite, TypeScript, Tailwind CSS |
| Server | Node.js, Express, Drizzle ORM, SQLite |
| AI | Claude API (tutor only, never generates Lakota) |
| Database | Pre-built SQLite (5.6MB), Room ORM |
| Min SDK | 26 (Android 8.0) / Target SDK 35 |

## Quick Start

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

### Deploy to Samsung
```
/laklang-deploy
```

## Project Structure

```
LakLangAndroid/
├── app/                    Android app (Kotlin/Compose)
│   └── src/main/java/com/traddiff/laklang/
│       ├── ui/cosmos/      Cosmos — 7 sacred directions museum
│       ├── ui/explore/     Vocabulary browser
│       ├── ui/stories/     Deloria narratives
│       ├── ui/learn/       Pronunciation, Culture, Dialogues
│       ├── ui/saved/       Bookmarks
│       ├── ui/detail/      Word detail (star feature)
│       ├── ui/search/      Spotlight search overlay
│       └── ui/navigation/  Bottom tab nav (5 tabs)
├── web/                    React web client
├── server/                 Express API server
├── data/seed/              Ingestion pipelines + seed files
├── docs/                   Documentation
├── SOURCES.md              80+ cataloged Lakota sources
└── DICTIONARY.md           1,300+ compiled entries
```

## Content Integrity

- **Never generate Lakota content from AI** — Claude is tutor only
- **LLC Standard Orthography** — ą, š, ž, č, ȟ, ġ, ŋ, ʼ
- **Review pipeline** — only `approved` + `public` content reaches users
- **"Nation" or "people"** — never "tribe"
- **No TTS for Lakota** — ever
- **Community partner flags restricted content** — removed without question

## License

Private. Content includes materials under various academic and public domain licenses. See TERMS_OF_SERVICE.md for details.

---

Built by [Traditionally Different Technology](https://traddiff.com) | Rapid City, SD
