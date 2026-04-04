// Digital Lakota Corpus Ingestion
// Creates reference bibliography + orthography pronunciation guides
// Source: Apache 2.0, gitlab.com/digital-lakota-corpus
// Usage: npm run ingest-corpus

import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../server/db/schema';

const DATABASE_PATH = process.env.DATABASE_URL || './data/laklang.db';
const sqlite = new Database(DATABASE_PATH);
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

// =============================================================================
// Curated Lakota linguistic references
// =============================================================================

function getReferences() {
  return [
    { key: 'nld2008', title: 'New Lakota Dictionary', author: 'Lakota Language Consortium', year: '2008', publisher: 'Lakota Language Consortium', note: '41,000+ entries with example sentences' },
    { key: 'deloria1932', title: 'Dakota Texts', author: 'Ella Deloria', year: '1932', publisher: 'American Ethnological Society', note: '64 traditional narratives with translations' },
    { key: 'riggs1893', title: 'Dakota Grammar, Texts, and Ethnography', author: 'Stephen R. Riggs and James Owen Dorsey', year: '1893', publisher: 'Government Printing Office', note: 'Foundational Dakota/Lakota grammar' },
    { key: 'buechel1970', title: 'A Dictionary of the Teton Dakota Sioux Language', author: 'Eugene Buechel', year: '1970', publisher: 'Red Cloud Indian School', note: '30,000+ entries from Pine Ridge' },
    { key: 'walker1980', title: 'Lakota Belief and Ritual', author: 'James R. Walker', year: '1980', publisher: 'University of Nebraska Press', note: 'Ceremonies and beliefs from Pine Ridge' },
    { key: 'walker1983', title: 'Lakota Myth', author: 'James R. Walker', year: '1983', publisher: 'University of Nebraska Press', note: 'Creation stories and mythology' },
    { key: 'walker1982', title: 'Lakota Society', author: 'James R. Walker', year: '1982', publisher: 'University of Nebraska Press', note: 'Social organization and kinship' },
    { key: 'deloria1941', title: 'Dakota Grammar', author: 'Ella Deloria and Franz Boas', year: '1941', publisher: 'National Academy of Sciences', note: 'Comprehensive Dakota grammar' },
    { key: 'deloria1944', title: 'Speaking of Indians', author: 'Ella Deloria', year: '1944', publisher: 'YMCA Press', note: 'Cultural context and social life' },
    { key: 'densmore1918', title: 'Teton Sioux Music', author: 'Frances Densmore', year: '1918', publisher: 'Bureau of American Ethnology', note: '340+ song recordings with analysis' },
    { key: 'rankin2015', title: 'Comparative Siouan Dictionary', author: 'Robert L. Rankin et al.', year: '2015', publisher: 'Max Planck Institute', note: '1,200+ cognate sets across Siouan languages' },
    { key: 'lakotabert2025', title: 'LakotaBERT: A Transformer-based Model', author: 'Various', year: '2025', publisher: 'arXiv', note: '105K lines Lakota training data' },
    { key: 'blackelk1932', title: 'Black Elk Speaks', author: 'Black Elk (via John G. Neihardt)', year: '1932', publisher: 'William Morrow', note: 'Lakota spiritual traditions and worldview' },
    { key: 'standingbear1928', title: 'My People the Sioux', author: 'Luther Standing Bear', year: '1928', publisher: 'Houghton Mifflin', note: 'First-person account of Lakota life' },
    { key: 'standingbear1933', title: 'Land of the Spotted Eagle', author: 'Luther Standing Bear', year: '1933', publisher: 'Houghton Mifflin', note: 'Lakota philosophy and culture' },
    { key: 'zitkalasa1901', title: 'Old Indian Legends', author: 'Zitkala-Sa (Gertrude Bonnin)', year: '1901', publisher: 'Ginn and Company', note: 'Traditional Sioux stories retold' },
  ];
}

// =============================================================================
// LLC standard orthography
// =============================================================================

function getOrthography() {
  return [
    { symbol: 'a', ipa: 'a', type: 'vowel', description: 'Open central unrounded vowel', approx: 'father' },
    { symbol: 'e', ipa: 'e', type: 'vowel', description: 'Close-mid front unrounded vowel', approx: 'hey (without glide)' },
    { symbol: 'i', ipa: 'i', type: 'vowel', description: 'Close front unrounded vowel', approx: 'see' },
    { symbol: 'o', ipa: 'o', type: 'vowel', description: 'Close-mid back rounded vowel', approx: 'go (without glide)' },
    { symbol: 'u', ipa: 'u', type: 'vowel', description: 'Close back rounded vowel', approx: 'moon' },
    { symbol: 'ą', ipa: 'a\u0303', type: 'vowel', description: 'Nasal a', approx: 'French an' },
    { symbol: 'ų', ipa: 'u\u0303', type: 'vowel', description: 'Nasal u', approx: 'French un' },
    { symbol: 'č', ipa: 'tʃ', type: 'consonant', description: 'Voiceless postalveolar affricate', approx: 'church' },
    { symbol: 'čh', ipa: 'tʃʰ', type: 'consonant', description: 'Aspirated postalveolar affricate', approx: 'church (aspirated)' },
    { symbol: 'š', ipa: 'ʃ', type: 'consonant', description: 'Voiceless postalveolar fricative', approx: 'shoe' },
    { symbol: 'ž', ipa: 'ʒ', type: 'consonant', description: 'Voiced postalveolar fricative', approx: 'measure' },
    { symbol: 'ȟ', ipa: 'x', type: 'consonant', description: 'Voiceless velar fricative', approx: 'German Bach' },
    { symbol: 'ġ', ipa: 'ɣ', type: 'consonant', description: 'Voiced velar fricative', approx: 'Spanish lago' },
    { symbol: 'ŋ', ipa: 'ŋ', type: 'consonant', description: 'Velar nasal', approx: 'sing' },
    { symbol: 'kh', ipa: 'kʰ', type: 'consonant', description: 'Aspirated velar stop', approx: 'key' },
    { symbol: 'ph', ipa: 'pʰ', type: 'consonant', description: 'Aspirated bilabial stop', approx: 'pin' },
    { symbol: 'th', ipa: 'tʰ', type: 'consonant', description: 'Aspirated alveolar stop', approx: 'tin' },
    { symbol: "k'", ipa: 'kʼ', type: 'consonant', description: 'Ejective velar stop', approx: 'No English equivalent' },
    { symbol: "p'", ipa: 'pʼ', type: 'consonant', description: 'Ejective bilabial stop', approx: 'No English equivalent' },
    { symbol: "t'", ipa: 'tʼ', type: 'consonant', description: 'Ejective alveolar stop', approx: 'No English equivalent' },
    { symbol: "'", ipa: 'ʔ', type: 'diacritic', description: 'Glottal stop', approx: 'uh-oh (catch between syllables)' },
  ];
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log('\nIngesting Digital Lakota Corpus data...\n');
  const now = new Date();

  // 1. References as cultural modules
  const refs = getReferences();
  let refCount = 0;
  for (const ref of refs) {
    const body = [
      `**Author:** ${ref.author}`,
      `**Year:** ${ref.year}`,
      `**Publisher:** ${ref.publisher}`,
      ref.note ? `**Notes:** ${ref.note}` : '',
      `**Citation Key:** ${ref.key}`,
    ].filter(Boolean).join('\n\n');

    await db.insert(schema.culturalModules).values({
      id: uuidv4(),
      title: `${ref.title} (${ref.year})`,
      body,
      category: 'bibliography',
      accessLevel: 'public',
      reviewStatus: 'draft',
      reviewedBy: null,
      reviewedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    refCount++;
    console.log(`  + ref: ${ref.author} — ${ref.title}`);
  }

  // 2. Orthography as pronunciation guides
  const ortho = getOrthography();
  const existing = await db.select().from(schema.pronunciationGuides);
  const existingSymbols = new Set(existing.map(g => g.symbol.toLowerCase()));
  let orthoCount = 0;

  for (const item of ortho) {
    if (existingSymbols.has(item.symbol.toLowerCase())) continue;
    await db.insert(schema.pronunciationGuides).values({
      id: uuidv4(),
      symbol: item.symbol,
      type: item.type as any,
      ipa: item.ipa,
      englishApproximation: item.approx,
      description: item.description,
      exampleWord: null,
      exampleMeaning: null,
      sectionRef: 'llc-orthography',
      accessLevel: 'public',
      reviewStatus: 'draft',
      createdAt: now,
    });
    orthoCount++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`  References: ${refCount} cultural modules`);
  console.log(`  Pronunciation: ${orthoCount} guides (${ortho.length - orthoCount} duplicates skipped)`);
  console.log(`  All set to DRAFT.\n`);
}

main().catch(console.error);
