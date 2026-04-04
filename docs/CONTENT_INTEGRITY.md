# Content Integrity — LakLang

## Core Principles

1. **Never invent Lakota content.** No AI-generated Lakota words, phrases, grammar, or cultural claims. All content is sourced from verified academic and community materials.

2. **LLC Standard Orthography.** Display special characters correctly: ą, š, ž, č, ȟ, ġ, ŋ, and glottal stop (ʼ, Unicode U+02BC). Never substitute or simplify.

3. **Review pipeline.** Content flows: DRAFT → PENDING_REVIEW → APPROVED | REJECTED. Only `approved` content with `public` access level reaches users.

4. **No TTS for Lakota.** Ever. Text-to-speech systems cannot correctly pronounce Lakota. Audio must come from native speakers only.

5. **"Nation" or "people"** — never "tribe." This applies to all text in the app, documentation, and store listings.

6. **Community partner authority.** If a community partner flags content as restricted, it is removed without question.

## Content Sources

| Source | License | Content |
|--------|---------|---------|
| Lakota Language Consortium | Reference | 16 verified seed words |
| Comparative Siouan Dictionary | CC-BY 4.0 | 688 words |
| Ella Deloria's Dakota Texts | Public domain (1932) | 62 stories, persons, values |
| Digital Lakota Corpus | Apache 2.0 | Pronunciation references |

## Three-Tier Access Control

| Level | Who sees it | Examples |
|-------|-------------|---------|
| `public` | Everyone | General vocabulary, pronunciation, public stories |
| `community` | Authenticated community members | Cultural practices, restricted vocabulary |
| `restricted` | Nobody (removed from display) | Content flagged by community partners |

The app currently shows only `public` content.

## Database Update Process

Content originates in the LakLangLM web platform, passes through the review pipeline, and is exported as a pre-built SQLite database. The Android app bundles this database in its assets. No content is generated or modified by the Android app itself.

## Attribution

All sourced content retains its citation in the `source` field. Academic sources are credited. Community contributions will be attributed per contributor preference.
