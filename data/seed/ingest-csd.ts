// Comparative Siouan Dictionary Ingestion
// Parses 1,204 CSV files → extracts Lakota (la-) entries → creates Word nodes
// Source: Rankin et al. 2015, CC-BY 4.0
// Usage: npm run ingest-csd

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
// drizzle-orm used via schema imports
import * as schema from '../../server/db/schema';

const DATABASE_PATH = process.env.DATABASE_URL || './data/laklang.db';
const sqlite = new Database(DATABASE_PATH);
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

const CSD_DIR = './data/seed/csd';
const SOURCE = 'Comparative Siouan Dictionary, Rankin et al. 2015 (CC-BY 4.0)';

interface CsdRow {
  id: string;
  languageId: string;
  parameterId: string;
  parameterName: string; // English meaning
  value: string;         // Lakota word
  source: string;
  comment: string;
}

// Simple CSV parser (handles quoted fields with commas)
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function extractLakotaRows(): CsdRow[] {
  const files = readdirSync(CSD_DIR).filter(f => f.endsWith('.csv'));
  const rows: CsdRow[] = [];

  for (const file of files) {
    const content = readFileSync(join(CSD_DIR, file), 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]);
      if (fields.length < 8) continue;

      const [id, languageId, , , , parameterId, parameterName, value, source, comment] = fields;

      if (languageId === 'la') {
        rows.push({
          id,
          languageId,
          parameterId,
          parameterName: parameterName || '',
          value: value || '',
          source: source || '',
          comment: comment || '',
        });
      }
    }
  }

  return rows;
}

// Group by Parameter_ID — each is one semantic concept with potentially multiple Lakota forms
function groupByConcept(rows: CsdRow[]): Map<string, CsdRow[]> {
  const groups = new Map<string, CsdRow[]>();
  for (const row of rows) {
    const existing = groups.get(row.parameterId) || [];
    existing.push(row);
    groups.set(row.parameterId, existing);
  }
  return groups;
}

// Clean up CSD value format: remove prefix markers, handle comma-separated forms
function cleanLakotaValue(value: string): string {
  // Remove leading quotes and hyphens used in CSD notation
  let cleaned = value.replace(/^["']/, '').replace(/["']$/, '');
  // If comma-separated forms, take the first meaningful one
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',').map(p => p.trim());
    // Prefer the part without a dash prefix (standalone form)
    const standalone = parts.find(p => !p.startsWith('-'));
    cleaned = standalone || parts[0];
  }
  // Remove leading dash (bound morpheme marker)
  cleaned = cleaned.replace(/^-/, '');
  return cleaned.trim();
}

// Clean English meaning: remove numbering like "(1)", "(2)"
function cleanEnglish(meaning: string): string {
  return meaning.replace(/\s*\(\d+\)\s*/g, '').trim();
}

async function main() {
  console.log('\nIngesting Comparative Siouan Dictionary...\n');

  // Extract all Lakota rows
  const rows = extractLakotaRows();
  console.log(`  Found ${rows.length} Lakota entries across CSV files`);

  // Group by concept
  const concepts = groupByConcept(rows);
  console.log(`  Grouped into ${concepts.size} unique concepts`);

  // Load existing vocabulary for deduplication
  const existing = await db.select().from(schema.vocabularyItems);
  const existingLakota = new Set(existing.map(v => v.lakota.toLowerCase()));
  console.log(`  Existing vocabulary: ${existing.length} items`);

  let created = 0;
  let skipped = 0;
  let duplicates = 0;

  const now = new Date();

  for (const [parameterId, conceptRows] of concepts) {
    // Take primary form (first row for this concept)
    const primary = conceptRows[0];
    const lakota = cleanLakotaValue(primary.value);
    const english = cleanEnglish(primary.parameterName);

    // Skip empty or very short values
    if (!lakota || lakota.length < 2 || !english) {
      skipped++;
      continue;
    }

    // Deduplicate
    if (existingLakota.has(lakota.toLowerCase())) {
      duplicates++;
      continue;
    }

    // Build cultural note from additional forms
    let culturalNote: string | null = null;
    if (conceptRows.length > 1) {
      const additionalForms = conceptRows.slice(1)
        .map(r => cleanLakotaValue(r.value))
        .filter(v => v && v !== lakota);
      if (additionalForms.length > 0) {
        culturalNote = `Additional forms: ${additionalForms.join(', ')}`;
      }
    }

    const id = uuidv4();
    await db.insert(schema.vocabularyItems).values({
      id,
      lakota,
      english,
      partOfSpeech: null,
      phoneticGuide: null,
      ipa: null,
      category: null,
      culturalNote,
      source: `${SOURCE} [cognate set ${parameterId}]`,
      accessLevel: 'public',
      reviewStatus: 'draft',
      createdAt: now,
      updatedAt: now,
    });

    // Also create an audio placeholder
    await db.insert(schema.audioAssets).values({
      id: uuidv4(),
      vocabularyId: id,
      audioType: 'none',
      verified: false,
      createdAt: now,
    });

    existingLakota.add(lakota.toLowerCase());
    created++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`  Created: ${created} Word nodes`);
  console.log(`  Duplicates skipped: ${duplicates}`);
  console.log(`  Invalid/empty skipped: ${skipped}`);
  console.log(`  All set to DRAFT — approve via reviewer portal.\n`);
}

main().catch(console.error);
