// Ella Deloria's Dakota Texts Ingestion
// Parses the 1932 text → extracts Story, Person, and Value nodes + edges
// Source: Public domain via Archive.org
// Usage: npm run ingest-deloria

import { readFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../server/db/schema';

const DATABASE_PATH = process.env.DATABASE_URL || './data/laklang.db';
const sqlite = new Database(DATABASE_PATH);
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

const SOURCE_FILE = './data/seed/deloria/dakota-texts.txt';
const SOURCE = 'Ella Deloria, Dakota Texts, 1932 (American Ethnological Society Vol. XIV)';

interface ParsedStory {
  number: number;
  titleEnglish: string;
  synopsis: string;
  category: string;
}

interface ParsedPerson {
  lakotaName: string;
  englishName: string;
  role: string;
  storyNumbers: number[];
}

interface ParsedValue {
  lakota: string;
  english: string;
  description: string;
}

// =============================================================================
// Synopsis Parser
// =============================================================================

function parseSynopses(text: string): ParsedStory[] {
  const stories: ParsedStory[] = [];

  // Find the SYNOPSES section
  const synopsisStart = text.indexOf('SYNOPSES OF TALES');
  if (synopsisStart === -1) {
    console.warn('Could not find SYNOPSES section');
    return stories;
  }

  // Extract ~15K chars of synopses section
  const synopsisSection = text.slice(synopsisStart, synopsisStart + 15000);

  // Match story entries: number + period + title + body
  const storyPattern = /(?:^|\n)\s*(\d+)\.\s+([^\n]+(?:\n(?!\s*\d+\.)(?!\s*[A-Z]{2,})[^\n]+)*)/g;

  let match;
  while ((match = storyPattern.exec(synopsisSection)) !== null) {
    const num = parseInt(match[1]);
    if (num < 1 || num > 64) continue;

    const rawText = match[2].trim();

    // Clean OCR artifacts
    const cleaned = rawText
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[<>{}]/g, '')
      .replace(/\s*\^[A-Za-z]+/g, '')
      .trim();

    if (cleaned.length < 20) continue;

    // Extract title (first sentence or up to first period)
    const firstPeriod = cleaned.indexOf('. ');
    const titleEnglish = firstPeriod > 0 && firstPeriod < 80
      ? cleaned.slice(0, firstPeriod).trim()
      : cleaned.slice(0, Math.min(80, cleaned.length)).trim();

    // Categorize per Deloria's classification
    let category: string;
    if (num <= 28) category = 'traditional myth';
    else if (num <= 39) category = 'novelistic';
    else category = 'true story';

    stories.push({
      number: num,
      titleEnglish,
      synopsis: cleaned,
      category,
    });
  }

  return stories;
}

// =============================================================================
// Character/Person Extraction
// =============================================================================

function extractPersons(stories: ParsedStory[]): ParsedPerson[] {
  const personMap = new Map<string, ParsedPerson>();

  const characters: Array<{ pattern: RegExp; lakota: string; english: string; role: string }> = [
    { pattern: /\bIktomi\b/i, lakota: 'Iktomi', english: 'Iktomi (the Trickster)', role: 'trickster spirit' },
    { pattern: /\bIya\b/i, lakota: 'Iya', english: 'Iya (the Eater)', role: 'mythological being' },
    { pattern: /\bDouble-?[Ff]ace/i, lakota: 'Anukite', english: 'Double-Face', role: 'mythological being' },
    { pattern: /\bStone Boy\b/i, lakota: 'Inyan Hokshila', english: 'Stone Boy', role: 'hero' },
    { pattern: /\bBlood-?[Cc]lot Boy\b/i, lakota: 'We Hokshila', english: 'Blood-Clot Boy', role: 'hero' },
    { pattern: /\bWhite-?[Pp]lume Boy\b/i, lakota: 'Wiyaka Ska Hokshila', english: 'White-Plume Boy', role: 'hero' },
    { pattern: /\bTurtle-?[Mm]occasin Boy\b/i, lakota: 'Kheya Hanpikcheka Hokshila', english: 'Turtle-Moccasin Boy', role: 'hero' },
    { pattern: /\bCoyote\b/i, lakota: 'Mishtunkala', english: 'Coyote', role: 'animal spirit (embodiment of Iktomi)' },
    { pattern: /\bCrazy Bull\b/i, lakota: 'Tatanka Witko', english: 'Crazy Bull', role: 'mythological being' },
    { pattern: /\bWaziya\b/i, lakota: 'Waziya', english: 'Waziya (the Cold)', role: 'spirit being' },
  ];

  // Historical informants
  const informants: ParsedPerson[] = [
    { lakotaName: 'Ella Deloria', englishName: 'Ella Deloria', role: 'linguist, ethnographer, author', storyNumbers: [] },
    { lakotaName: 'Philip Deloria', englishName: 'Rev. Philip Deloria', role: 'informant, cultural advisor', storyNumbers: [] },
  ];

  for (const story of stories) {
    for (const char of characters) {
      if (char.pattern.test(story.synopsis)) {
        const key = char.english;
        if (!personMap.has(key)) {
          personMap.set(key, {
            lakotaName: char.lakota,
            englishName: char.english,
            role: char.role,
            storyNumbers: [],
          });
        }
        personMap.get(key)!.storyNumbers.push(story.number);
      }
    }
  }

  return [...personMap.values(), ...informants];
}

// =============================================================================
// Cultural Value Extraction
// =============================================================================

function extractValues(): ParsedValue[] {
  return [
    {
      lakota: 'Ohunkakan',
      english: 'Sacred Stories / Traditional Tales',
      description: 'The Lakota category of traditional narratives meant to entertain and teach, but not taken as literal truth. Told only after sunset. These stories feature mythological characters like Iktomi, Iya, and Double-Face.',
    },
    {
      lakota: 'Woyakapi',
      english: 'True Stories / Historical Accounts',
      description: 'Stories regarded as true accounts of events that actually happened. Distinguished from ohunkakan by the absence of the conventional ending formula and mythological characters.',
    },
    {
      lakota: 'Wichohan',
      english: 'Customs and Proper Behavior',
      description: 'The system of social rules and behavioral expectations in Lakota society, including avoidance relationships, kinship obligations, and ceremonial protocols.',
    },
    {
      lakota: 'Wowahlwala',
      english: 'Respect / Gentleness',
      description: 'A core Lakota value emphasizing gentle, respectful treatment of others, especially elders and relatives.',
    },
    {
      lakota: 'Woohitika',
      english: 'Bravery / Courage',
      description: 'One of the four cardinal Lakota virtues. Demonstrated by heroes like Stone Boy, White-Plume Boy, and Blood-Clot Boy in their encounters with supernatural dangers.',
    },
  ];
}

// =============================================================================
// Main Ingestion
// =============================================================================

async function main() {
  console.log('\nIngesting Ella Deloria\'s Dakota Texts...\n');

  const text = readFileSync(SOURCE_FILE, 'utf-8');
  console.log(`  Source file: ${text.length} characters, ${text.split('\n').length} lines`);

  // Parse synopses
  const stories = parseSynopses(text);
  console.log(`  Parsed ${stories.length} story synopses`);

  // Extract persons and values
  const persons = extractPersons(stories);
  const valuesData = extractValues();
  console.log(`  Extracted ${persons.length} persons, ${valuesData.length} cultural values`);

  const now = new Date();
  const storyIdMap = new Map<number, string>();
  const personIdMap = new Map<string, string>();
  const valueIdMap = new Map<string, string>();

  // Insert Value nodes
  for (const val of valuesData) {
    const id = uuidv4();
    await db.insert(schema.values).values({
      id,
      lakota: val.lakota,
      english: val.english,
      description: val.description,
      source: SOURCE,
      accessLevel: 'public',
      reviewStatus: 'draft',
      createdAt: now,
      updatedAt: now,
    });
    valueIdMap.set(val.english, id);
    console.log(`  + value: ${val.lakota} (${val.english})`);
  }

  // Insert Person nodes
  for (const person of persons) {
    const id = uuidv4();
    await db.insert(schema.persons).values({
      id,
      lakotaName: person.lakotaName,
      englishName: person.englishName,
      role: person.role,
      biography: null,
      source: SOURCE,
      accessLevel: 'public',
      reviewStatus: 'draft',
      createdAt: now,
      updatedAt: now,
    });
    personIdMap.set(person.englishName, id);
    console.log(`  + person: ${person.lakotaName} (${person.englishName})`);
  }

  // Insert Story nodes
  for (const story of stories) {
    const id = uuidv4();
    const titleLakota = `Deloria #${story.number}`;

    await db.insert(schema.stories).values({
      id,
      titleLakota,
      titleEnglish: story.titleEnglish,
      body: story.synopsis,
      audioUrl: null,
      category: story.category,
      source: SOURCE,
      accessLevel: 'public',
      reviewStatus: 'draft',
      createdAt: now,
      updatedAt: now,
    });
    storyIdMap.set(story.number, id);
    console.log(`  + story #${story.number}: ${story.titleEnglish.slice(0, 60)}`);
  }

  // Create edges
  let edgeCount = 0;

  // Story -> expresses -> Value (category linkage)
  for (const story of stories) {
    const storyId = storyIdMap.get(story.number);
    if (!storyId) continue;

    if (story.category === 'traditional myth') {
      const valueId = valueIdMap.get('Sacred Stories / Traditional Tales');
      if (valueId) {
        await db.insert(schema.graphEdges).values({
          id: uuidv4(), sourceNodeId: storyId, sourceNodeType: 'story',
          targetNodeId: valueId, targetNodeType: 'value',
          relationshipType: 'expresses', accessLevel: 'public', createdAt: now,
        });
        edgeCount++;
      }
    } else if (story.category === 'true story') {
      const valueId = valueIdMap.get('True Stories / Historical Accounts');
      if (valueId) {
        await db.insert(schema.graphEdges).values({
          id: uuidv4(), sourceNodeId: storyId, sourceNodeType: 'story',
          targetNodeId: valueId, targetNodeType: 'value',
          relationshipType: 'expresses', accessLevel: 'public', createdAt: now,
        });
        edgeCount++;
      }
    }

    // Bravery stories
    if (/hero|brave|warrior|rescue|fight|kill|overcome|save/i.test(story.synopsis)) {
      const valueId = valueIdMap.get('Bravery / Courage');
      if (valueId) {
        await db.insert(schema.graphEdges).values({
          id: uuidv4(), sourceNodeId: storyId, sourceNodeType: 'story',
          targetNodeId: valueId, targetNodeType: 'value',
          relationshipType: 'teaches', accessLevel: 'public', createdAt: now,
        });
        edgeCount++;
      }
    }

    // Custom/behavior stories
    if (/avoidance|rule|custom|proper|mother-in-law|kinship/i.test(story.synopsis)) {
      const valueId = valueIdMap.get('Customs and Proper Behavior');
      if (valueId) {
        await db.insert(schema.graphEdges).values({
          id: uuidv4(), sourceNodeId: storyId, sourceNodeType: 'story',
          targetNodeId: valueId, targetNodeType: 'value',
          relationshipType: 'teaches', accessLevel: 'public', createdAt: now,
        });
        edgeCount++;
      }
    }
  }

  // Story -> related_to -> Person (characters in stories)
  for (const person of persons) {
    const personId = personIdMap.get(person.englishName);
    if (!personId) continue;

    for (const storyNum of person.storyNumbers) {
      const storyId = storyIdMap.get(storyNum);
      if (!storyId) continue;

      await db.insert(schema.graphEdges).values({
        id: uuidv4(), sourceNodeId: storyId, sourceNodeType: 'story',
        targetNodeId: personId, targetNodeType: 'person',
        relationshipType: 'related_to', accessLevel: 'public', createdAt: now,
      });
      edgeCount++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`  Stories: ${stories.length} created`);
  console.log(`  Persons: ${persons.length} created`);
  console.log(`  Values: ${valuesData.length} created`);
  console.log(`  Edges: ${edgeCount} created`);
  console.log(`  All set to DRAFT — approve via reviewer portal.\n`);
}

main().catch(console.error);
