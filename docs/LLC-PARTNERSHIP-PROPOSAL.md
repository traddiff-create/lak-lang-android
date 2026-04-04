# Partnership Inquiry — Lakota Language Consortium
*From: Traditionally Different Technology (Rory Stone)*
*To: Lakota Language Consortium*
*Date: March 2026*

---

## Who We Are

Traditionally Different Technology is a small technology company based in Rapid City, South Dakota. We build software with purpose. My name is Rory Stone — I'm a developer, and my wife Nicole runs Dharma Wellness Institute, also here in Rapid City. We live on Lakota land, our neighbors are Lakota people, and the language is disappearing in our lifetime.

We're building something because we can. Not because we were asked to, not because there's a business model — because the tools exist now to preserve a culture in a way that wasn't possible ten years ago, and someone should use them.

---

## What We've Built

**LakLangLM** is an open-source, web-based Lakota language and cultural preservation platform. It's not a dictionary and it's not a lesson app. It's a **knowledge graph** — a living map of how the Lakota language connects to stories, values, people, places, ceremonies, and songs.

### The Knowledge Graph

Everything is connected:
- A **word** appears in a **story**
- A **story** teaches a **value**
- A **ceremony** is performed at a **place**
- A **song** expresses a **value**
- A **person** is related to a **story**

This mirrors the Lakota worldview — Mitakuye Oyasin, all things related. The graph isn't just metadata; it's a structural representation of how Lakota knowledge actually works.

### What's In It Today

| Content | Count | Source |
|---------|-------|--------|
| Vocabulary words | 700+ | Comparative Siouan Dictionary (CC-BY 4.0), LLC seed data |
| Traditional stories | 62 | Ella Deloria's *Dakota Texts* (1932, public domain) |
| Historical/mythological persons | 13 | Iktomi, Iya, Double-Face, Stone Boy, Ella Deloria, etc. |
| Cultural values | 13 | Ohúŋkakaŋ, Wóyakapi, Wóohitika, Mitakuye Oyasin, etc. |
| Places | 1 | Paha Sapa |
| Bibliographic references | 16 | Key Lakota linguistic works cataloged |
| Pronunciation guides | 21+ | LLC Standard Lakota Orthography |
| Graph relationships | 111+ | Story→value, story→person, word→story connections |

### What It Does

- **Graph Explorer** — visual, interactive exploration of how knowledge connects
- **Story View** — audio-first display of narratives with linked vocabulary, values, and people
- **Flashcards** — vocabulary cards that show which stories a word appears in
- **AI Conversation** — Claude as a practice tutor (English-scaffolded, never generates Lakota)
- **Quizzes** — generated from approved vocabulary only
- **Pronunciation Guide** — LLC orthography reference
- **Reviewer Portal** — community partners approve all content before it reaches learners

### What It Does NOT Do

- It does not generate Lakota words, phrases, or translations from AI
- It does not publish content without community review
- It does not claim authority over the language
- It does not compete with Owóksape, NLD, or any LLC product

---

## Why We're Writing

We've cataloged 50+ digitized Lakota sources across Archive.org, the Smithsonian, Library of Congress, American Philosophical Society, and academic databases. We've ingested what's openly licensed. But the highest-quality, most comprehensive Lakota language data in the world is yours — the New Lakota Dictionary.

**42,950 Lakota entries. 13,327 English reversal entries. Native speaker audio. Lemmatization. Inflection paradigms.**

No open dataset comes close. The Comparative Siouan Dictionary gave us 688 words. Deloria gave us stories. But the dictionary — the connective tissue of the entire language — that's LLC's work.

We're not asking to copy NLD or compete with it. We're asking whether there's a way to connect our knowledge graph to your data so that:

1. A learner exploring a story can see the dictionary definition of a word they encounter
2. A word in the graph can link to its full paradigm and audio
3. The graph can be enriched with the semantic depth that 42,950 entries provide

---

## What We'd Propose

We're open to any structure that works for LLC. Some possibilities:

### Option A: API Access
If NLD has or could expose an API, our graph could query it in real-time. LLC retains full control of the data. We'd display results with full attribution.

### Option B: Bulk Data License
A subset of NLD data (headwords + basic definitions + part of speech) licensed for use in the knowledge graph. Audio and full entries remain exclusive to NLD.

### Option C: Deep Link Integration
Our graph links directly to NLD app entries. When a user taps a word, it opens the NLD app (or a web page). No data transfer — just navigation.

### Option D: Something Else
We're builders, not linguists. You know what makes sense for the language and the community. Tell us what would be useful and we'll build it.

---

## What We Bring

- **Open-source platform** — everything we build is available to the community
- **Technical infrastructure** — knowledge graph, ingestion pipelines, review workflows, AI tutoring
- **No commercial interest** — this is preservation work, not a product
- **Rapid City presence** — we're local, we're not going anywhere
- **Respect for your work** — LLC has been doing this for 20+ years. We've been doing it for weeks. We know the difference.

---

## Technical Details (for your team)

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod), Drizzle ORM |
| Graph visualization | react-force-graph-2d |
| AI | Claude API (conversation/quiz only — never generates Lakota) |
| Content pipeline | Markdown+YAML → review → approve → publish |
| Access control | 3-tier: public / community / restricted |
| Source code | GitHub (private, can be shared) |
| Orthography | LLC Standard Lakota Orthography throughout |

---

## Contact

**Rory Stone**
Traditionally Different Technology
Rapid City, South Dakota

---

*This isn't a business proposal. It's one group of people who care about this language reaching out to the group that's done the most to save it.*
