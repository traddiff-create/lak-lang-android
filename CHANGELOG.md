# Changelog — LakLang Android

All notable changes to LakLang Android will be documented in this file.

---

## [1.0.0] - 2026-04-03 (Initial Release)

### Added
- **Explore tab** — Browse 12,535 Lakota vocabulary items by category
- **Word Detail screen** — Full "hocoka experience": meaning, pronunciation breakdown, cultural context, related words, connected stories and values via knowledge graph
- **Spotlight Search** — Universal search across words, stories, culture, values, people, dialogues
- **Stories tab** — 63 Ella Deloria narratives with linked values and persons
- **Learn tab** — 42 pronunciation guides, 24 cultural modules, 19 dialogues
- **Saved tab** — Bookmark words, stories, and cultural articles
- **Word of the Day** — Random approved word on Explore home
- **Knowledge graph traversal** — 111 edges connecting content across types
- **Earthy Material 3 theme** — Brown/sage/sky palette, light and dark modes
- **Pre-built database** — 5.5MB SQLite bundled in assets, Room ORM
- **Offline-first** — No network calls, no analytics, no tracking

### Technical
- Kotlin 1.9.24, AGP 8.3.0, Compose BOM 2024.06.00
- Room 2.6.1 with `createFromAsset` for pre-packaged DB
- MVVM architecture with AndroidViewModel + StateFlow
- versionCode 1, versionName 1.0

---

## Version History

| Version | Date | Milestone |
|---------|------|-----------|
| 1.0.0 | 2026-04-03 | Initial release — 12,535 words, Spotlight search, knowledge graph |

---

## Roadmap

### [1.1] - Planned
- [ ] Audio pronunciation (pending LLC partnership)
- [ ] Graph explorer visualization
- [ ] Search history and suggestions
- [ ] Play Store release

### [1.2] - Future
- [ ] Spaced repetition study mode
- [ ] Quiz generation from vocabulary
- [ ] Community content contributions
- [ ] Walker/Densmore source ingestion (ceremonies, songs)
