# LakLang — Lakota Language & Cultural Preservation (Android)

**Location:** `/Applications/Apps/LakLangAndroid/`
**Type:** Android App | **Status:** Active — Phase 1
**Owner:** Rory Stone (Traditionally Different Technology)

## Purpose

Android app for Lakota language learning. Core UX: search a word, get the full depth — meaning, pronunciation, cultural context, related words, connected stories and values. Built for Tom (Lakota), Nicole (Yankton Sioux), and Rory.

Data sourced from LakLangLM web platform (`/Applications/Apps/LakLangLM/`).

## Quick Reference

| Property | Value |
|----------|-------|
| **Package** | `com.traddiff.laklang` |
| **Language** | Kotlin 1.9.24 |
| **UI** | Jetpack Compose + Material 3 |
| **Database** | Room (pre-built SQLite from LakLangLM) |
| **Min SDK** | 26 (Android 8.0) |
| **Target SDK** | 35 (Android 15) |
| **Version** | 1.0 (versionCode 1) |

## Build

```bash
cd /Applications/Apps/LakLangAndroid
./gradlew :app:assembleDebug
./gradlew :app:installDebug
```

## Architecture

- **MVVM** with AndroidViewModel + StateFlow
- **Manual DI** in LakLangApp Application class
- **Room** reads pre-built `laklang.db` (5.5MB, bundled in assets)
- **4 tabs:** Explore, Stories, Learn, Saved
- **Detail screens:** Word Detail (star feature), Story Detail, Cultural Module Detail

## Data

Pre-built SQLite database copied from LakLangLM on first launch:
- 12,535 vocabulary items
- 63 Deloria stories
- 111 knowledge graph edges
- 42 pronunciation guides
- 24 cultural modules
- 19 dialogues
- 13 values, 11 persons, 1 place

All content filtered: `WHERE review_status = 'approved' AND access_level = 'public'`

## Content Integrity

- Never generate Lakota content from AI
- Use "Nation" or "people" — never "tribe"
- LLC Standard Orthography: ą, š, ž, č, ȟ, ġ, ŋ, ʼ
- No TTS for Lakota — ever
