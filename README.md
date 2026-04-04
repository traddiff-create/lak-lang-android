# LakLang — Lakota Language & Cultural Preservation

An Android app for learning Lakota through deep cultural connection. Search any word and get the full picture: meaning, pronunciation, cultural context, related words, connected stories and values.

Built for people with real ties to the Lakota language and community — not tourists, not gamification. Every word is a doorway back into the worldview.

## Features

- **12,535 Lakota words** with LLC Standard Orthography
- **Spotlight Search** — universal search across words, stories, culture, values, people, dialogues
- **Word Detail** — meaning, pronunciation breakdown, cultural context, related words, connected stories
- **63 Deloria Stories** — Ella Deloria's Dakota Texts with linked values and persons
- **Knowledge Graph** — 111 edges connecting words, stories, values, and people
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

| Component | Technology |
|-----------|-----------|
| Language | Kotlin 1.9.24 |
| UI | Jetpack Compose + Material 3 |
| Database | Room (pre-built SQLite, 5.5MB) |
| Architecture | MVVM + StateFlow |
| Min SDK | 26 (Android 8.0) |
| Target SDK | 35 (Android 15) |

## Quick Start

```bash
# Open in Android Studio
open -a "Android Studio" /Applications/Apps/LakLangAndroid

# Build debug APK
./gradlew :app:assembleDebug

# Install on connected device/emulator
./gradlew :app:installDebug

# Launch
adb shell am start -n com.traddiff.laklang/.MainActivity
```

## Content Integrity

- **Never generate Lakota content from AI** — all content is sourced and reviewed
- **LLC Standard Orthography** — ą, š, ž, č, ȟ, ġ, ŋ, ʼ must render correctly
- **Review pipeline** — only `approved` + `public` content reaches users
- **"Nation" or "people"** — never "tribe"
- **No TTS for Lakota** — ever
- **Community partner flags restricted content** — removed without question

## Data Source

Content is sourced from the LakLangLM web platform (`/Applications/Apps/LakLangLM/`), a comprehensive knowledge graph and experiential learning system. The pre-built SQLite database (`laklang.db`) is bundled in the app's assets and copied on first launch.

## License

Private. Content includes materials under various academic and public domain licenses. See TERMS_OF_SERVICE.md for details.

---

Built by [Traditionally Different Technology](https://traddiff.com) | Rapid City, SD
