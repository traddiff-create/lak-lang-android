// Williamson English-Dakota Dictionary Ingestion (1902, public domain)
// Parses OCR text → creates Word nodes (English→Dakota/Lakota pairs)
// Note: This is primarily Santee dialect with Teton (Lakota) noted
// Usage: npm run ingest-williamson

import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../server/db/schema';

const DATABASE_PATH = process.env.DATABASE_URL || './data/laklang.db';
const sqlite = new Database(DATABASE_PATH);
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

const SOURCE_FILE = './data/seed/williamson/english-dakota-dictionary.txt';
const SOURCE = 'John P. Williamson, An English-Dakota Dictionary, 1902 (public domain)';

interface DictEntry {
  english: string;
  dakota: string;
  partOfSpeech: string | null;
}

// Part-of-speech abbreviations used in the dictionary
const POS_MAP: Record<string, string> = {
  'n': 'noun', 'vt': 'verb (transitive)', 'vi': 'verb (intransitive)',
  'v': 'verb', 'a': 'adjective', 'adv': 'adverb', 'pa': 'participle',
  'prep': 'preposition', 'conj': 'conjunction', 'interj': 'interjection',
  'pron': 'pronoun', 'prefix': 'prefix', 'imp': 'imperative',
};

function parseEntries(text: string): DictEntry[] {
  const entries: DictEntry[] = [];
  const lines = text.split('\n');

  // Find where dictionary entries begin (after "English-Dakota Dictionary" header)
  let started = false;
  let startLine = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('English-Dakota Dictionary')) {
      started = true;
      startLine = i + 1;
      break;
    }
  }
  if (!started) return entries;

  // Parse entries: pattern is "english_word, pos. dakota_word(s)"
  // Some entries span multiple lines
  const entryPattern = /^([a-z][a-z'\- ]*),\s*((?:n|vt|vi|v|a|adv|pa|prep|conj|interj|pron|prefix|imp)\.)?\s*(.+)/i;

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip noise
    if (!line) continue;
    if (line.startsWith('Digitized by')) continue;
    if (line.length < 4) continue;
    if (/^[A-Z]{2,}$/.test(line)) continue; // Section headers like "A", "B"
    if (line.startsWith('English-Dakota')) continue;

    const match = line.match(entryPattern);
    if (match) {
      const english = match[1].trim().toLowerCase();
      const posAbbr = match[2] ? match[2].replace('.', '').trim() : null;
      let dakota = match[3].trim();

      // Clean up Dakota text
      dakota = dakota.replace(/\s*;.*$/, ''); // Take first definition before semicolons
      dakota = dakota.replace(/\.$/, ''); // Remove trailing period
      dakota = dakota.replace(/\s+/g, ' ').trim();

      // Skip entries that are too short or look like OCR noise
      if (dakota.length < 2 || english.length < 2) continue;
      if (/^[0-9]/.test(dakota)) continue;
      if (dakota.includes('Digitized')) continue;

      entries.push({
        english,
        dakota,
        partOfSpeech: posAbbr ? (POS_MAP[posAbbr] || posAbbr) : null,
      });
    }
  }

  return entries;
}

async function main() {
  console.log('\nIngesting Williamson English-Dakota Dictionary (1902)...\n');

  const text = readFileSync(SOURCE_FILE, 'utf-8');
  console.log(`  Source: ${text.split('\n').length} lines`);

  const entries = parseEntries(text);
  console.log(`  Parsed ${entries.length} dictionary entries`);

  // Load existing for dedup
  const existing = await db.select().from(schema.vocabularyItems);
  const existingLakota = new Set(existing.map(v => v.lakota.toLowerCase()));
  const existingEnglish = new Set(existing.map(v => v.english.toLowerCase()));

  const now = new Date();
  let created = 0;
  let duplicates = 0;

  for (const entry of entries) {
    // Deduplicate by Dakota word or English word
    if (existingLakota.has(entry.dakota.toLowerCase()) || existingEnglish.has(entry.english.toLowerCase())) {
      duplicates++;
      continue;
    }

    const id = uuidv4();
    await db.insert(schema.vocabularyItems).values({
      id,
      lakota: entry.dakota, // Note: primarily Santee dialect, some Teton
      english: entry.english,
      partOfSpeech: entry.partOfSpeech,
      phoneticGuide: null,
      ipa: null,
      category: null,
      culturalNote: 'Santee dialect (Williamson 1902). Teton/Lakota forms may differ.',
      source: SOURCE,
      accessLevel: 'public',
      reviewStatus: 'approved', // Published academic source, 1902 public domain
      createdAt: now,
      updatedAt: now,
    });

    await db.insert(schema.audioAssets).values({
      id: uuidv4(),
      vocabularyId: id,
      audioType: 'none',
      verified: false,
      createdAt: now,
    });

    existingLakota.add(entry.dakota.toLowerCase());
    existingEnglish.add(entry.english.toLowerCase());
    created++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`  Created: ${created} Word nodes`);
  console.log(`  Duplicates skipped: ${duplicates}`);
  console.log(`  Source: Williamson 1902 (public domain, Santee dialect with Teton notes)`);
  console.log(`  Status: APPROVED (published academic source)\n`);
}

main().catch(console.error);
