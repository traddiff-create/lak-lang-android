// Knowledge Graph Ingestion Pipeline
// Parses Markdown files with YAML frontmatter → inserts nodes + edges into database
// Usage: npm run ingest-graph -- <directory>
// All nodes enter as 'draft' — must be approved through reviewer portal

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { like } from 'drizzle-orm';
import * as schema from '../../server/db/schema';

const DATABASE_PATH = process.env.DATABASE_URL || './data/laklang.db';
const sqlite = new Database(DATABASE_PATH);
sqlite.pragma('journal_mode = WAL');
const db = drizzle(sqlite, { schema });

// =============================================================================
// Types
// =============================================================================

interface LinkedRef {
  type: string;
  lakota?: string;
  name?: string;
  relationship: string;
}

interface ParsedNode {
  type: string;
  frontmatter: Record<string, any>;
  body: string;
  linked: LinkedRef[];
  sourcePath: string;
}

// =============================================================================
// YAML Frontmatter Parser (simple, no external dependency)
// =============================================================================

function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const yamlBlock = match[1];
  const body = match[2].trim();
  const frontmatter: Record<string, any> = {};

  let currentKey = '';
  let currentArray: any[] | null = null;
  let currentObject: Record<string, any> | null = null;

  for (const line of yamlBlock.split('\n')) {
    // Array item with nested object (e.g., "  - type: word")
    if (currentArray !== null && /^\s{2,}- \w+:/.test(line)) {
      if (currentObject) currentArray.push(currentObject);
      currentObject = {};
      const itemMatch = line.match(/^\s+- (\w+):\s*(.*)$/);
      if (itemMatch) currentObject[itemMatch[1]] = itemMatch[2].trim();
      continue;
    }

    // Continuation of nested object (e.g., "    lakota: value")
    if (currentObject && /^\s{4,}\w+:/.test(line)) {
      const propMatch = line.match(/^\s+(\w+):\s*(.*)$/);
      if (propMatch) currentObject[propMatch[1]] = propMatch[2].trim();
      continue;
    }

    // Simple array item (e.g., "  - value")
    if (currentArray !== null && /^\s{2,}-\s/.test(line)) {
      if (currentObject) {
        currentArray.push(currentObject);
        currentObject = null;
      }
      const val = line.replace(/^\s+-\s*/, '').trim();
      currentArray.push(val);
      continue;
    }

    // New top-level key
    if (currentObject) {
      currentArray?.push(currentObject);
      currentObject = null;
    }
    if (currentArray !== null) {
      frontmatter[currentKey] = currentArray;
      currentArray = null;
    }

    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value === '' || value === '[]') {
        // Might be start of array on next lines, or empty
        currentArray = [];
      } else if (value === 'null' || value === '~') {
        frontmatter[currentKey] = null;
      } else {
        frontmatter[currentKey] = value;
      }
    }
  }

  if (currentObject) currentArray?.push(currentObject);
  if (currentArray !== null) frontmatter[currentKey] = currentArray;

  return { frontmatter, body };
}

// =============================================================================
// File Scanner
// =============================================================================

function scanDirectory(dirPath: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dirPath)) {
    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);
    if (stat.isFile() && extname(entry) === '.md') {
      files.push(fullPath);
    }
  }
  return files;
}

function parseFile(filePath: string): ParsedNode | null {
  const content = readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter.type) {
    console.warn(`  Skipping ${filePath}: no 'type' in frontmatter`);
    return null;
  }

  const linked: LinkedRef[] = [];
  if (Array.isArray(frontmatter.linked)) {
    for (const item of frontmatter.linked) {
      if (typeof item === 'object' && item.type && item.relationship) {
        linked.push(item as LinkedRef);
      }
    }
  }

  return {
    type: frontmatter.type,
    frontmatter,
    body,
    linked,
    sourcePath: filePath,
  };
}

// =============================================================================
// Node Insertion
// =============================================================================

async function insertNode(parsed: ParsedNode): Promise<string> {
  const id = uuidv4();
  const now = new Date();
  const fm = parsed.frontmatter;
  const accessLevel = fm.accessLevel || 'public';

  switch (parsed.type) {
    case 'story':
      await db.insert(schema.stories).values({
        id,
        titleLakota: fm.title_lakota || fm.titleLakota || 'Untitled',
        titleEnglish: fm.title_english || fm.titleEnglish || 'Untitled',
        body: parsed.body,
        audioUrl: fm.audio_url || fm.audioUrl || null,
        category: fm.category || null,
        source: fm.source || parsed.sourcePath,
        accessLevel,
        reviewStatus: 'draft',
        createdAt: now,
        updatedAt: now,
      });
      break;

    case 'value':
      await db.insert(schema.values).values({
        id,
        lakota: fm.lakota || fm.title_lakota || 'Unknown',
        english: fm.english || fm.title_english || 'Unknown',
        description: parsed.body || fm.description || null,
        source: fm.source || parsed.sourcePath,
        accessLevel,
        reviewStatus: 'draft',
        createdAt: now,
        updatedAt: now,
      });
      break;

    case 'person':
      await db.insert(schema.persons).values({
        id,
        lakotaName: fm.lakota_name || fm.lakotaName || 'Unknown',
        englishName: fm.english_name || fm.englishName || 'Unknown',
        role: fm.role || null,
        biography: parsed.body || null,
        source: fm.source || parsed.sourcePath,
        accessLevel,
        reviewStatus: 'draft',
        createdAt: now,
        updatedAt: now,
      });
      break;

    case 'place':
      await db.insert(schema.places).values({
        id,
        lakotaName: fm.lakota_name || fm.lakotaName || 'Unknown',
        englishName: fm.english_name || fm.englishName || 'Unknown',
        description: parsed.body || null,
        latitude: fm.latitude ? parseFloat(fm.latitude) : null,
        longitude: fm.longitude ? parseFloat(fm.longitude) : null,
        source: fm.source || parsed.sourcePath,
        accessLevel,
        reviewStatus: 'draft',
        createdAt: now,
        updatedAt: now,
      });
      break;

    case 'ceremony':
      await db.insert(schema.ceremonies).values({
        id,
        lakotaName: fm.lakota_name || fm.lakotaName || 'Unknown',
        englishName: fm.english_name || fm.englishName || 'Unknown',
        description: parsed.body || null,
        audioUrl: fm.audio_url || fm.audioUrl || null,
        source: fm.source || parsed.sourcePath,
        accessLevel,
        reviewStatus: 'draft',
        createdAt: now,
        updatedAt: now,
      });
      break;

    case 'song':
      await db.insert(schema.songs).values({
        id,
        lakotaTitle: fm.lakota_title || fm.lakotaTitle || 'Untitled',
        englishTitle: fm.english_title || fm.englishTitle || 'Untitled',
        lyrics: parsed.body || null,
        audioUrl: fm.audio_url || fm.audioUrl || null,
        composer: fm.composer || null,
        source: fm.source || parsed.sourcePath,
        accessLevel,
        reviewStatus: 'draft',
        createdAt: now,
        updatedAt: now,
      });
      break;

    default:
      console.warn(`  Unknown node type: ${parsed.type}`);
      return '';
  }

  return id;
}

// =============================================================================
// Edge Resolution — match linked refs to existing nodes by name
// =============================================================================

async function resolveLinkedNode(ref: LinkedRef): Promise<{ id: string; type: string } | null> {
  const searchTerm = ref.lakota || ref.name;
  if (!searchTerm) return null;
  const pattern = `%${searchTerm}%`;

  // Search across relevant tables
  const searchTable = async (table: any, _type: string, fields: string[]): Promise<string | null> => {
    for (const field of fields) {
      const rows = await db.select().from(table).where(like((table as any)[field], pattern));
      if (rows.length > 0) return rows[0].id;
    }
    return null;
  };

  switch (ref.type) {
    case 'word': {
      const id = await searchTable(schema.vocabularyItems, 'word', ['lakota', 'english']);
      return id ? { id, type: 'word' } : null;
    }
    case 'value': {
      const id = await searchTable(schema.values, 'value', ['lakota', 'english']);
      return id ? { id, type: 'value' } : null;
    }
    case 'person': {
      const id = await searchTable(schema.persons, 'person', ['lakotaName', 'englishName']);
      return id ? { id, type: 'person' } : null;
    }
    case 'place': {
      const id = await searchTable(schema.places, 'place', ['lakotaName', 'englishName']);
      return id ? { id, type: 'place' } : null;
    }
    case 'ceremony': {
      const id = await searchTable(schema.ceremonies, 'ceremony', ['lakotaName', 'englishName']);
      return id ? { id, type: 'ceremony' } : null;
    }
    case 'song': {
      const id = await searchTable(schema.songs, 'song', ['lakotaTitle', 'englishTitle']);
      return id ? { id, type: 'song' } : null;
    }
    case 'story': {
      const id = await searchTable(schema.stories, 'story', ['titleLakota', 'titleEnglish']);
      return id ? { id, type: 'story' } : null;
    }
    default:
      return null;
  }
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const dirPath = process.argv[2];
  if (!dirPath) {
    console.error('Usage: npm run ingest-graph -- <directory>');
    process.exit(1);
  }

  console.log(`\nIngesting graph nodes from: ${dirPath}\n`);

  const files = scanDirectory(dirPath);
  if (files.length === 0) {
    console.log('No .md files found in directory.');
    return;
  }

  const counts: Record<string, number> = {};
  let edgeCount = 0;
  const nodeMap: { parsed: ParsedNode; id: string }[] = [];

  // Pass 1: Insert all nodes
  for (const filePath of files) {
    const parsed = parseFile(filePath);
    if (!parsed) continue;

    const id = await insertNode(parsed);
    if (id) {
      counts[parsed.type] = (counts[parsed.type] || 0) + 1;
      nodeMap.push({ parsed, id });
      console.log(`  + ${parsed.type}: ${parsed.frontmatter.title_lakota || parsed.frontmatter.lakota || parsed.frontmatter.lakota_name || '(unnamed)'}`);
    }
  }

  // Pass 2: Create edges
  for (const { parsed, id } of nodeMap) {
    for (const ref of parsed.linked) {
      const target = await resolveLinkedNode(ref);
      if (target) {
        await db.insert(schema.graphEdges).values({
          id: uuidv4(),
          sourceNodeId: id,
          sourceNodeType: parsed.type as any,
          targetNodeId: target.id,
          targetNodeType: target.type as any,
          relationshipType: ref.relationship as any,
          accessLevel: parsed.frontmatter.accessLevel || 'public',
          createdAt: new Date(),
        });
        edgeCount++;
        console.log(`  ~ ${parsed.type} --[${ref.relationship}]--> ${ref.type}: ${ref.lakota || ref.name}`);
      } else {
        console.warn(`  ? Could not resolve: ${ref.type} "${ref.lakota || ref.name}"`);
      }
    }
  }

  // Summary
  console.log('\n--- Summary ---');
  for (const [type, count] of Object.entries(counts)) {
    console.log(`  ${type}: ${count} created`);
  }
  console.log(`  edges: ${edgeCount} created`);
  console.log(`  All nodes set to DRAFT — approve via reviewer portal.\n`);
}

main().catch(console.error);
