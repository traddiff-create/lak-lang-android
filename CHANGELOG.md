# Changelog — LakLang

All notable changes to LakLang will be documented in this file.

---

## [1.1.0] - 2026-04-04 (Cosmos & Seven Directions)

### Added
- **Cosmos tab** — dark starfield canvas with 12,535+ orbiting nodes across 7 sacred directions
- **Seven Direction immersive pages** — tap any direction for full-screen experience with Lakota cosmology description and themed content
- **Direction descriptions** — curated text for West (stories), North (wisdom), East (knowledge), South (community), Sky (sacred), Earth (nature), Center (heart)
- **Seasonal awareness** — current season's direction glows brighter
- **LOD rendering** — dots at zoom-out, labels at mid-zoom, full text at zoom-in
- **Pan/zoom gestures** — explore the knowledge cosmos spatially
- **Node overlay** — tap any node for Lakota/English + graph connections
- **Monorepo structure** — merged LakLangLM web platform into this repo

### Changed
- 4-tab nav → 5-tab nav (added Cosmos)
- CLAUDE.md rewritten for monorepo structure
- Deploy skill: `/laklang-deploy` for Samsung builds

---

## [1.0.0] - 2026-04-03 (Initial Release)

### Added
- **Explore tab** — Browse 12,535 Lakota vocabulary items by category
- **Word Detail screen** — Full "hocoka experience": meaning, pronunciation breakdown, cultural context, related words, connected stories and values via knowledge graph
- **Spotlight Search** — Universal search across words, stories, culture, values, people, dialogues (Apple Spotlight-style overlay)
- **Stories tab** — 63 Ella Deloria narratives with linked values and persons
- **Learn tab** — 42 pronunciation guides, 24 cultural modules, 19 dialogues
- **Saved tab** — Bookmark words, stories, and cultural articles
- **Word of the Day** — Random approved word on Explore home
- **Knowledge graph traversal** — 111 edges connecting content across types
- **Earthy Material 3 theme** — Brown/sage/sky palette, light and dark modes
- **Pre-built database** — 5.5MB SQLite bundled in assets, Room ORM
- **Offline-first** — No network calls, no analytics, no tracking
- **13 documentation files** — README, CHANGELOG, ARCHITECTURE, docs/, legal, store listing

### Technical
- Kotlin 1.9.24, AGP 8.3.0, Compose BOM 2024.06.00
- Room 2.6.1 with `createFromAsset` for pre-packaged DB
- MVVM architecture with AndroidViewModel + StateFlow
- versionCode 1, versionName 1.0

---

## Version History

| Version | Date | Milestone |
|---------|------|-----------|
| 1.1.0 | 2026-04-04 | Cosmos tab, Seven Directions immersive pages, monorepo |
| 1.0.0 | 2026-04-03 | Initial release — 12,535 words, Spotlight search, knowledge graph |

---

## Roadmap

### [1.2] - Planned
- [ ] Audio pronunciation (pending LLC partnership)
- [ ] Graph explorer visualization improvements
- [ ] Search history and suggestions
- [ ] Play Store release

### [1.3] - Future
- [ ] Spaced repetition study mode
- [ ] Quiz generation from vocabulary
- [ ] Community content contributions
- [ ] Walker/Densmore source ingestion (ceremonies, songs)
