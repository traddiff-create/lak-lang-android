/**
 * Seed Import Script
 * Imports verified vocabulary + primer content into the database
 *
 * Usage: npm run seed
 *
 * Sources:
 *   - data/seed/vocabulary.json (15 original verified items)
 *   - data/seed/vocabulary-primer.json (~630 primer items)
 *   - data/seed/pronunciation-guides.json (~33 pronunciation guides)
 *   - data/seed/dialogues.json (~19 dialogues)
 *   - data/seed/cultural-modules.json (~8 cultural modules)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import {
  vocabularyItems,
  audioAssets,
  culturalModules,
  pronunciationGuides,
  dialogueExamples,
  type ReviewStatus,
} from '../../server/db/schema';

// Types for seed data
interface SeedVocabularyItem {
  lakota: string;
  english: string;
  part_of_speech: string | null;
  phonetic_guide: string | null;
  ipa: string | null;
  category: string;
  cultural_note: string | null;
  source: string;
  review_status: ReviewStatus;
}

interface SeedPronunciationGuide {
  symbol: string;
  type: 'vowel' | 'consonant' | 'diacritic';
  ipa: string;
  english_approximation: string;
  description: string;
  example_word: string;
  example_meaning: string;
  section_ref: string;
  review_status: ReviewStatus;
}

interface SeedDialogue {
  type: 'mini' | 'extended';
  title: string;
  context: string;
  section_ref: string;
  exchanges: { speaker: string; lakota: string }[];
  english_translation: string;
  participants: string[];
  speaker_genders: string[];
  review_status: ReviewStatus;
}

interface SeedCulturalModule {
  title: string;
  body: string;
  category: string;
  section_ref: string;
  review_status: ReviewStatus;
}

function loadJson<T>(filename: string): T[] {
  const path = join(import.meta.dirname, filename);
  if (!existsSync(path)) {
    console.log(`  Skipping ${filename} (not found)`);
    return [];
  }
  return JSON.parse(readFileSync(path, 'utf-8'));
}

async function seed() {
  console.log('Starting seed import...\n');

  // Connect to database
  const DATABASE_PATH = process.env.DATABASE_URL || './data/laklang.db';
  const sqlite = new Database(DATABASE_PATH);
  sqlite.pragma('journal_mode = WAL');
  const db = drizzle(sqlite);

  const now = new Date();
  const reviewedBy = 'primer-import';

  // Track totals
  let vocabCount = 0;
  let audioCount = 0;
  let pronCount = 0;
  let dialogueCount = 0;
  let culturalCount = 0;
  const categories = new Map<string, number>();

  // Track existing lakota terms to deduplicate
  const existingLakota = new Set<string>();

  // =========================================================================
  // 1. Import original vocabulary.json (15 items)
  // =========================================================================
  console.log('--- Importing original vocabulary (vocabulary.json) ---');
  const originalVocab = loadJson<SeedVocabularyItem>('vocabulary.json');

  for (const item of originalVocab) {
    const key = item.lakota.toLowerCase();
    if (existingLakota.has(key)) continue;
    existingLakota.add(key);

    const id = uuidv4();

    await db.insert(vocabularyItems).values({
      id,
      lakota: item.lakota,
      english: item.english,
      partOfSpeech: item.part_of_speech,
      phoneticGuide: item.phonetic_guide,
      ipa: item.ipa,
      category: item.category,
      culturalNote: item.cultural_note,
      source: item.source,
      reviewStatus: item.review_status,
      reviewedBy: 'seed-import',
      reviewedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(audioAssets).values({
      id: uuidv4(),
      vocabularyId: id,
      audioType: 'none',
      audioSource: null,
      audioUrl: null,
      license: null,
      attribution: null,
      verified: false,
      createdAt: now,
    });

    categories.set(item.category, (categories.get(item.category) || 0) + 1);
    vocabCount++;
    audioCount++;
  }
  console.log(`  Imported ${originalVocab.length} original vocabulary items`);

  // =========================================================================
  // 2. Import primer vocabulary (vocabulary-primer.json)
  // =========================================================================
  console.log('\n--- Importing primer vocabulary (vocabulary-primer.json) ---');
  const primerVocab = loadJson<SeedVocabularyItem>('vocabulary-primer.json');
  let primerSkipped = 0;

  for (const item of primerVocab) {
    const key = item.lakota.toLowerCase();
    if (existingLakota.has(key)) {
      primerSkipped++;
      continue;
    }
    existingLakota.add(key);

    const id = uuidv4();

    await db.insert(vocabularyItems).values({
      id,
      lakota: item.lakota,
      english: item.english,
      partOfSpeech: item.part_of_speech,
      phoneticGuide: item.phonetic_guide,
      ipa: item.ipa,
      category: item.category,
      culturalNote: item.cultural_note,
      source: item.source,
      reviewStatus: item.review_status,
      reviewedBy: reviewedBy,
      reviewedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(audioAssets).values({
      id: uuidv4(),
      vocabularyId: id,
      audioType: 'none',
      audioSource: null,
      audioUrl: null,
      license: null,
      attribution: null,
      verified: false,
      createdAt: now,
    });

    categories.set(item.category, (categories.get(item.category) || 0) + 1);
    vocabCount++;
    audioCount++;
  }
  console.log(`  Imported ${primerVocab.length - primerSkipped} primer vocabulary items (${primerSkipped} duplicates skipped)`);

  // =========================================================================
  // 3. Import pronunciation guides
  // =========================================================================
  console.log('\n--- Importing pronunciation guides ---');
  const pronGuides = loadJson<SeedPronunciationGuide>('pronunciation-guides.json');

  for (const guide of pronGuides) {
    await db.insert(pronunciationGuides).values({
      id: uuidv4(),
      symbol: guide.symbol,
      type: guide.type,
      ipa: guide.ipa,
      englishApproximation: guide.english_approximation,
      description: guide.description,
      exampleWord: guide.example_word,
      exampleMeaning: guide.example_meaning,
      sectionRef: guide.section_ref,
      reviewStatus: guide.review_status,
      reviewedBy: reviewedBy,
      reviewedAt: now,
      createdAt: now,
    });
    pronCount++;
  }
  console.log(`  Imported ${pronCount} pronunciation guides`);

  // =========================================================================
  // 4. Import dialogues
  // =========================================================================
  console.log('\n--- Importing dialogues ---');
  const dialogues = loadJson<SeedDialogue>('dialogues.json');

  for (const dialogue of dialogues) {
    await db.insert(dialogueExamples).values({
      id: uuidv4(),
      type: dialogue.type,
      title: dialogue.title,
      context: dialogue.context || null,
      sectionRef: dialogue.section_ref,
      lakotaText: JSON.stringify(dialogue.exchanges),
      englishTranslation: dialogue.english_translation,
      numExchanges: dialogue.exchanges.length,
      participants: JSON.stringify(dialogue.participants),
      speakerGenders: JSON.stringify(dialogue.speaker_genders),
      reviewStatus: dialogue.review_status,
      reviewedBy: reviewedBy,
      reviewedAt: now,
      createdAt: now,
    });
    dialogueCount++;
  }
  console.log(`  Imported ${dialogueCount} dialogues`);

  // =========================================================================
  // 5. Import cultural modules
  // =========================================================================
  console.log('\n--- Importing cultural modules ---');
  const culturalMods = loadJson<SeedCulturalModule>('cultural-modules.json');

  for (const mod of culturalMods) {
    await db.insert(culturalModules).values({
      id: uuidv4(),
      title: mod.title,
      body: mod.body,
      category: mod.category,
      reviewStatus: mod.review_status,
      reviewedBy: reviewedBy,
      reviewedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    culturalCount++;
  }
  console.log(`  Imported ${culturalCount} cultural modules`);

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n=== Import Summary ===');
  console.log(`  vocabulary_items: ${vocabCount}`);
  console.log(`  audio_assets: ${audioCount}`);
  console.log(`  pronunciation_guides: ${pronCount}`);
  console.log(`  dialogue_examples: ${dialogueCount}`);
  console.log(`  cultural_modules: ${culturalCount}`);

  console.log('\n  Vocabulary by category:');
  for (const [category, count] of [...categories.entries()].sort()) {
    console.log(`    ${category}: ${count}`);
  }

  // Verify counts in database
  const dbVocab = sqlite.prepare('SELECT COUNT(*) as count FROM vocabulary_items').get() as { count: number };
  const dbAudio = sqlite.prepare('SELECT COUNT(*) as count FROM audio_assets').get() as { count: number };
  const dbPron = sqlite.prepare('SELECT COUNT(*) as count FROM pronunciation_guides').get() as { count: number };
  const dbDialogue = sqlite.prepare('SELECT COUNT(*) as count FROM dialogue_examples').get() as { count: number };
  const dbCultural = sqlite.prepare('SELECT COUNT(*) as count FROM cultural_modules').get() as { count: number };

  console.log('\n=== Database Verification ===');
  console.log(`  vocabulary_items: ${dbVocab.count} records`);
  console.log(`  audio_assets: ${dbAudio.count} records`);
  console.log(`  pronunciation_guides: ${dbPron.count} records`);
  console.log(`  dialogue_examples: ${dbDialogue.count} records`);
  console.log(`  cultural_modules: ${dbCultural.count} records`);

  sqlite.close();
  console.log('\nSeed import complete!');
}

seed().catch((error) => {
  console.error('Seed import failed:', error);
  process.exit(1);
});
