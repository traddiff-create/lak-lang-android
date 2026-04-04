# LakLangLM — Philosophy & Scientific Framework

A neutral, rigorous assessment of the Lakota knowledge graph cultural preservation system through the lens of six scientific thinkers: Stephen Hawking, Richard Dawkins, Daniel Dennett, Carl Sagan, Bertrand Russell, and Peter Higgs.

---

## Why This Project Exists

LakLangLM is a web-based knowledge graph that preserves Lakota language and culture as a living, relational system — not a static dictionary. Words, Stories, Values, People, Places, Ceremonies, and Songs are interconnected through typed relationships, mirroring the Lakota worldview where all things are related (Mitakuye Oyasin).

With fewer than 2,000 fluent Lakota speakers alive, this is preservation work against irreversible information loss.

---

## Six Scientific Perspectives

### Carl Sagan — "We are a way for the cosmos to know itself"

Sagan would see this project as exactly what he championed: the preservation of human knowledge against extinction. A language isn't just words — it's an entire cognitive framework for experiencing reality. When Lakota describes kinship (thiyóšpaye) or the interconnectedness of all things (Mitakuye Oyasin), it encodes a way of understanding the universe that English cannot replicate. Losing it would be like losing a telescope pointed at a part of the sky no other instrument covers.

**His concern:** Are we capturing the cosmology? The star knowledge, the seasonal calendars, the ecological observations encoded in the language? That's the science embedded in the culture.

**Our response:** The knowledge graph's node types (Value, Ceremony, Place) are designed to capture exactly this. The `teaches` and `expresses` relationships connect stories to the deeper knowledge they carry. Future ingestion of Walker's *Lakota Belief and Ritual* and Densmore's astronomical/seasonal recordings will address this directly.

---

### Bertrand Russell — Skepticism and verification

Russell would probe the epistemological rigor of the project. Key questions:

- **Source verification:** The content pipeline (draft → pending_review → approved) addresses his demand for justified belief. Nothing reaches learners without community review.
- **Authority claims:** The distinction between ohúŋkakaŋ (stories not meant as literal truth) and wóyakapi (true accounts) — Deloria herself categorized these. Russell would appreciate that the Lakota tradition already has its own epistemic framework built in.
- **What we don't know:** The OCR text has artifacts. The CSD entries are linguistic reconstructions, not direct observations. Russell would want every node's confidence level tracked. The `source` field on every node partially addresses this.

**His verdict:** Methodologically sound, but flag uncertainty explicitly. A "confidence" field on nodes would strengthen the system.

**Our response:** Every node carries a `source` citation and `reviewStatus`. The three-tier access control (public/community/restricted) adds another layer — restricted content isn't shown to unauthorized users, acknowledging that some knowledge has limited appropriate audiences.

---

### Richard Dawkins — Cultural evolution and memes

Dawkins coined "meme" to describe cultural replication. He'd analyze this project as a memetic preservation system — an attempt to prevent the extinction of a cultural gene pool.

- The knowledge graph models the relationships between memes. Stories carry values, values express through ceremonies — the `teaches` and `expresses` edges literally model memetic transmission.
- The 62 Deloria stories are the replicating units — each carries values like Woohitika (bravery) and Wichohan (customs).
- The review pipeline ensures high-fidelity replication. Mutations (errors, misrepresentations) get caught before propagation to learners.

**His concern:** Is the digital medium sufficient for oral traditions? Written/visual representation is a different replication substrate than oral transmission. The audio-first design principle addresses this, but most audio is still "coming soon."

**Our response:** The schema decouples audio from content (`audioAssets` table supports external URLs, local files, or null). The architecture is ready for audio — the bottleneck is licensing and recording, not technology. The Densmore Repatriation Project (lakotasongs.com) and Speak Lakota Podcast are potential sources.

---

### Daniel Dennett — Consciousness, patterns, and intentional systems

Dennett would focus on the pattern-level significance. Languages don't just label the world — they create different "user illusions" (his term) for navigating reality. The Lakota relational worldview (everything connected, no strict subject-object separation) represents a genuinely different cognitive architecture.

He'd appreciate the knowledge graph specifically because it models these relationships computationally. The graph isn't just metadata — it's a structural mirror of the Lakota worldview where everything connects to everything else.

**His challenge:** Are we capturing the *generative grammar* of the culture, or just collecting artifacts? Can a learner who absorbs all 688 words and 62 stories actually *think* in Lakota patterns? The conversation module (Claude as tutor) and story-based learning approach this, but Dennett would push for more: pattern exercises, worldview comparison activities, cognitive reframing tasks.

**Our response:** The graph explorer is a first step — visual exploration of how concepts relate mirrors the relational thinking the language encodes. Future work on guided learning paths (story → vocabulary → value → ceremony progressions) will move from artifact collection toward generative understanding.

---

### Stephen Hawking — Information preservation and universal access

Hawking, who understood better than most the importance of communication systems, would evaluate:

- **Information loss:** A language death is an irreversible information loss — like a black hole evaporating. Once the last fluent speaker dies, the information is gone in a way that no reconstruction can fully recover. The urgency is real.
- **Accessibility:** Hawking depended on technology to communicate. He'd champion the web platform over closed apps — universal access, no gatekeeping. The free, open-source approach is correct.
- **Structure:** The knowledge graph is essentially a database of relationships. Hawking would want it formalized — mathematical structure, queryable, machine-readable. The CLDF import from the Comparative Siouan Dictionary moves in this direction.

**His observation:** The graph will become more valuable over time as speakers become fewer. Build it to outlast the current technology stack.

**Our response:** The relational database (SQLite/Drizzle) stores data in a format that will be readable for decades. The ingestion pipeline accepts Markdown — the most durable text format. The SOURCES.md file catalogs 50+ archival sources so future maintainers know where to find more.

---

### Peter Higgs — Patience, persistence, and the unseen

Higgs waited 48 years between his theoretical prediction and the experimental confirmation. He'd see a parallel: the work of cultural preservation is slow, often invisible, and the payoff is generational. You won't see the full impact of this knowledge graph in 2026. You might see it in 2056, when a Lakota student discovers Ella Deloria's stories through the graph explorer and connects them to the values their grandmother talked about.

**His perspective:** The unglamorous infrastructure work (schema design, ingestion pipelines, review workflows) is the particle accelerator. It enables the discovery but isn't the discovery itself. The discovery happens when a community member uses this tool and something clicks — when the graph surfaces a connection they didn't know existed.

**Our response:** This is why we build the infrastructure first, and build it right. The knowledge graph, the review pipeline, the access controls, the source citations — they're all foundation for a system that must last longer than any individual contributor.

---

## Consensus — What All Six Would Agree On

1. **The work is worthwhile.** No empiricist would argue against preserving information.

2. **Rigor matters.** The review pipeline, source attribution, and access controls are not bureaucratic overhead — they're scientific methodology applied to cultural preservation.

3. **Humility is required.** We're technologists building tools. The content authority belongs to the Lakota community. The draft-first, community-review pipeline encodes this correctly.

4. **Audio is the gap.** Every one of them would note that an oral tradition captured primarily as text is incomplete. Prioritize audio.

5. **The graph is the right abstraction.** Relational knowledge modeled as a graph mirrors both scientific thinking (networks, relationships, systems) and the Lakota worldview (Mitakuye Oyasin — all things connected).

---

## Current System State (March 2026)

### Knowledge Graph Contents

| Node Type | Count | Source |
|-----------|-------|--------|
| Words (vocabulary) | 704+ | LLC seed (16), CSD (688), primer (~630 pending review) |
| Stories | 66 | Deloria Dakota Texts (62), examples (4) |
| Persons | 13 | Deloria characters (11), informants (2) |
| Values | 13 | Deloria values (5), example values (4), graph examples (4) |
| Places | 1 | Example (Paha Sapa) |
| Ceremonies | 0 | Awaiting source ingestion |
| Songs | 0 | Awaiting Densmore recordings |
| Cultural Modules | 16+ | Corpus bibliography |
| Pronunciation Guides | 21+ | LLC orthography |
| Graph Edges | 111+ | Story-value, story-person, story-category relationships |

### Architecture

- **Stack:** React 18 + TypeScript + Vite (frontend), Express + Drizzle ORM + SQLite (backend)
- **Graph model:** Relational (SQLite), not graph database. Sufficient for 5,000+ nodes.
- **Visualization:** react-force-graph-2d (force-directed graph explorer)
- **AI:** Claude as tutor only — never generates Lakota content
- **Access:** 3-tier (public/community/restricted) with reviewer token auth

### Ingestion Pipeline

| Source | Parser | Yield | License |
|--------|--------|-------|---------|
| Comparative Siouan Dictionary | `ingest-csd.ts` | 688 words | CC-BY 4.0 |
| Ella Deloria's Dakota Texts | `ingest-deloria.ts` | 62 stories, 11 persons, 5 values, 109 edges | Public domain |
| Digital Lakota Corpus | `ingest-corpus.ts` | 16 references, 9+ pronunciation guides | Apache 2.0 |
| Manual markdown files | `ingest-graph.ts` | Any node type | N/A |

### Cataloged But Not Yet Ingested

See `SOURCES.md` for the full inventory of 50+ sources across 5 tiers, including:
- James R. Walker's Lakota Myth/Belief/Society trilogy
- Frances Densmore's 340+ song recordings (Library of Congress)
- George Bushotter's 3,500 pages (Smithsonian)
- Ella Deloria's unpublished manuscripts (American Philosophical Society)
- Woksape Tipi community archives (Oglala Lakota College, Mukurtu CMS)

---

## Design Principles

### Content Integrity
- Claude (AI) is used for conversation scaffolding and quiz generation — never as a Lakota language source
- Every content item passes through a review pipeline before reaching learners
- All system prompts explicitly prohibit AI-generated Lakota

### Cultural Respect
- "Nation" or "people" — never "tribe"
- No stereotypical imagery
- Community partner flags content as restricted → removed without question
- The app should feel made *with* the Lakota community, not *about* it

### Data Sovereignty
- Content stays in the system — not used to train external models
- Community-controlled access levels
- Elder involvement as decision-makers, not consultants
- Source attribution on every node

### Oral-First Design
- Audio player prioritized over text in story view
- Audio placeholder ("Recording coming soon") rather than silent failure
- Architecture supports external audio URLs, local files, and null states

---

## Teaching Methods Informing the Design

| Method | Core Principle | How It Maps |
|--------|---------------|-------------|
| **TPRS (Teaching Proficiency through Reading and Storytelling)** | Comprehensible input through stories | Stories as primary learning vehicle |
| **Where Are Your Keys (WAYK)** | Gesture + target language, no English scaffold | Future: audio-first immersion mode |
| **ASLA (Accelerated Second Language Acquisition)** | Concrete nouns/verbs first, abstract later | Flashcards (concrete) → Stories (abstract) → Values (conceptual) |
| **Master-Apprentice Program** | Fluent speaker + learner pairs | Review pipeline = community partner involvement |
| **Mukurtu CMS model** | Community-defined cultural protocols | 3-tier access (public/community/restricted) |

---

## Relevant Tools & Platforms

| Platform | Relationship |
|----------|-------------|
| **Lakota Language Consortium** | Primary content source, orthography standard |
| **FirstVoices** | Architecture reference for audio-first design |
| **Mukurtu CMS** | Model for community-controlled access protocols |
| **Comparative Siouan Dictionary** | 688 words ingested (CC-BY 4.0) |
| **Digital Lakota Corpus** | References + orthographies (Apache 2.0) |
| **Ella Deloria Archive** | 62 stories ingested (public domain) |
| **LakotaBERT** | Potential future integration for morphological analysis |
| **Densmore Repatriation Project** | Potential audio source for Song nodes |

---

*This document reflects the state of LakLangLM as of March 25, 2026. It is a living document — update as the system evolves.*
