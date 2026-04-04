/**
 * Lakota Language Primer HTML Parser
 * Parses Claude_Lakota_Language_Primer_v1.html into structured JSON seed files.
 *
 * Usage: npm run parse-primer
 *
 * Outputs:
 *   - data/seed/vocabulary-primer.json
 *   - data/seed/pronunciation-guides.json
 *   - data/seed/dialogues.json
 *   - data/seed/cultural-modules.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse, HTMLElement } from 'node-html-parser';

// =============================================================================
// Types
// =============================================================================

interface VocabularyEntry {
  lakota: string;
  english: string;
  part_of_speech: string | null;
  phonetic_guide: string | null;
  ipa: string | null;
  category: string;
  cultural_note: string | null;
  source: string;
  review_status: 'approved';
}

interface PronunciationGuide {
  symbol: string;
  type: 'vowel' | 'consonant' | 'diacritic';
  ipa: string;
  english_approximation: string;
  description: string;
  example_word: string;
  example_meaning: string;
  section_ref: string;
  review_status: 'approved';
}

interface DialogueExample {
  type: 'mini' | 'extended';
  title: string;
  context: string;
  section_ref: string;
  exchanges: { speaker: string; lakota: string }[];
  english_translation: string;
  participants: string[];
  speaker_genders: string[];
  review_status: 'approved';
}

interface CulturalModule {
  title: string;
  body: string;
  category: string;
  section_ref: string;
  review_status: 'approved';
}

// =============================================================================
// Category mapping by section ID
// =============================================================================

const SECTION_CATEGORY_MAP: Record<string, string> = {
  '7-1-sacred-vocabulary': 'sacred',
  '7-2-people-and-kinship-thiw-he-family': 'kinship',
  '7-3-the-natural-world-mak-the-earth': 'nature',
  '7-4-animals-wam-k-a-ka-living-creatures-that-move': 'animals',
  '7-5-plants-trees-and-medicines': 'plants',
  '7-6-daily-living-and-camp-life': 'daily_living',
  '7-7-actions-and-verbs-of-prairie-life': 'actions',
  '7-8-stative-verbs-descriptions': 'descriptions',
  '7-9-numbers-w-yawa': 'numbers',
  '7-10-sound-symbolic-vocabulary': 'sound_symbolic',
  '7-11-extended-numbers-and-counting-w-yawa-iy-ha': 'numbers',
  '7-12-abstract-and-emotional-vocabulary': 'abstract',
  '7-13-descriptive-expressions-and-idioms': 'idioms',
  '7-14-expanded-kinship-terms': 'kinship',
  '7-15-lakota-place-names-pine-ridge-and-surrounding': 'places',
  '8-1-essential-phrases': 'phrases',
  '8-2-commands-bringing-taking-moving': 'phrases',
  '8-3-plural-commands-let-s': 'phrases',
  '8-4-questions-for-daily-life': 'phrases',
  '8-5-expressions-of-relationship': 'phrases',
  '8-6-verb-family-quick-reference': 'phrases',
  '8-7-phrases-for-expressing-time': 'phrases',
  '8-8-phrases-for-expressing-location': 'phrases',
  '8-9-phrases-of-encouragement-and-praise': 'phrases',
  '8-10-phrases-for-meals-and-eating': 'phrases',
  '9-1-song-types-ol-wa': 'ceremonial',
  '9-2-prayer-vocabulary': 'ceremonial',
  '9-3-common-ceremonial-phrases': 'ceremonial',
  '9-4-directional-color-associations-in-ceremony': 'ceremonial',
  '9-5-extended-ceremonial-vocabulary-in-pi-sweat-lodge': 'ceremonial',
  '9-6-extended-ceremonial-vocabulary-ha-bl-heyapi-vision-quest': 'ceremonial',
  '17-1-the-human-body-ta-h': 'body',
  '17-2-health-and-illness-yaz-na-ak-sni': 'health',
  '17-3-emotions-and-inner-states-w-iyokphi-na-w-he-imni': 'emotions',
  '17-4-modern-life-vocabulary': 'modern_life',
  '17-5-colors-extended-descriptions-and-compound-forms': 'colors',
  '17-6-spatial-and-directional-terms': 'spatial',
};

const SOURCE = 'Claude Lakota Language Primer v1';

// =============================================================================
// Helpers
// =============================================================================

/** Strip HTML tags and decode entities */
function cleanText(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .trim();
}

/** Parse em-dash separated vocabulary entries:
 *  <p><strong>TERM</strong> — definition (context)</p>
 */
function parseVocabLine(p: HTMLElement): { lakota: string; english: string; culturalNote: string | null } | null {
  const strong = p.querySelector('strong');
  if (!strong) return null;

  const fullText = cleanText(p.innerHTML);
  const lakota = cleanText(strong.innerHTML);

  // Find the em-dash separator — various unicode dashes
  const dashMatch = fullText.match(/\s*[—–-]\s*/);
  if (!dashMatch || dashMatch.index === undefined) return null;

  const afterDash = fullText.substring(dashMatch.index + dashMatch[0].length).trim();
  if (!afterDash) return null;

  // Separate main definition from parenthetical cultural note
  let english = afterDash;
  let culturalNote: string | null = null;

  // Check for parenthetical context at the end
  const parenMatch = afterDash.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (parenMatch) {
    english = parenMatch[1].trim();
    culturalNote = parenMatch[2].trim();
  }

  return { lakota, english, culturalNote };
}

// =============================================================================
// Parse Vocabulary (Sections 7, 8, 9, 17)
// =============================================================================

function parseVocabulary(root: HTMLElement): VocabularyEntry[] {
  const entries: VocabularyEntry[] = [];
  const seen = new Set<string>();

  // Sections we want vocabulary from
  const vocabSectionPrefixes = ['7-', '8-', '9-', '17-'];

  // Get all h3 elements that start vocabulary sections
  const h3s = root.querySelectorAll('h3');

  for (const h3 of h3s) {
    const sectionId = h3.id;
    if (!sectionId) continue;

    // Check if this h3 is in a vocabulary section
    const isVocabSection = vocabSectionPrefixes.some(prefix => sectionId.startsWith(prefix));
    if (!isVocabSection) continue;

    // Skip sections that are dialogues (10.x, 16.x)
    if (sectionId.startsWith('10-') || sectionId.startsWith('16-')) continue;

    const category = SECTION_CATEGORY_MAP[sectionId];
    if (!category) continue;

    // Walk siblings until next h3 or h2
    let sibling = h3.nextElementSibling;
    while (sibling) {
      if (sibling.tagName === 'H2' || sibling.tagName === 'H3') break;

      // Skip h4 sub-headers, back-to-top links, horizontal rules
      if (sibling.tagName === 'H4' || sibling.classList?.contains('back-top') || sibling.tagName === 'HR') {
        sibling = sibling.nextElementSibling;
        continue;
      }

      if (sibling.tagName === 'P') {
        const strong = sibling.querySelector('strong');
        if (strong) {
          const parsed = parseVocabLine(sibling);
          if (parsed) {
            // Deduplicate by lakota text (lowercase)
            const key = parsed.lakota.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              entries.push({
                lakota: parsed.lakota,
                english: parsed.english,
                part_of_speech: null,
                phonetic_guide: null,
                ipa: null,
                category,
                cultural_note: parsed.culturalNote,
                source: SOURCE,
                review_status: 'approved',
              });
            }
          }
        }

        // Also handle italic-only entries (ceremonial phrases, practice sentences)
        const em = sibling.querySelector('em');
        if (em && !strong) {
          // Italic entries like: <em>Lakota text</em> — "English translation"
          const fullText = cleanText(sibling.innerHTML);
          const italicText = cleanText(em.innerHTML);

          // Check for em-dash after italic
          const dashIdx = fullText.indexOf('—', italicText.length);
          if (dashIdx > 0 && italicText.length > 3) {
            const english = fullText.substring(dashIdx + 1).trim().replace(/^[""]|[""]$/g, '');
            const key = italicText.toLowerCase();
            if (!seen.has(key) && english.length > 0) {
              seen.add(key);
              entries.push({
                lakota: italicText,
                english,
                part_of_speech: 'phrase',
                phonetic_guide: null,
                ipa: null,
                category,
                cultural_note: null,
                source: SOURCE,
                review_status: 'approved',
              });
            }
          }
        }
      }

      sibling = sibling.nextElementSibling;
    }
  }

  return entries;
}

// =============================================================================
// Parse Pronunciation Guides (Section 1)
// =============================================================================

function parsePronunciation(root: HTMLElement): PronunciationGuide[] {
  const guides: PronunciationGuide[] = [];

  // Find all tables in section 1
  const section1 = root.querySelector('#1-orthography-and-pronunciation');
  if (!section1) {
    console.warn('Could not find Section 1');
    return guides;
  }

  // Walk from section 1 to section 2
  let el = section1.nextElementSibling;
  let currentSubsection = '1-1-vowel-system';
  let currentH4 = '';

  while (el) {
    if (el.tagName === 'H2' && el.id !== '1-orthography-and-pronunciation') break;

    if (el.tagName === 'H3' && el.id) {
      currentSubsection = el.id;
    }

    if (el.tagName === 'H4') {
      currentH4 = cleanText(el.innerHTML);
    }

    // Parse tables
    if (el.tagName === 'DIV' && el.classList?.contains('table-wrap')) {
      const table = el.querySelector('table');
      if (table) {
        const headers = table.querySelectorAll('thead th').map(th => cleanText(th.innerHTML).toLowerCase());
        const rows = table.querySelectorAll('tbody tr');

        for (const row of rows) {
          const cells = row.querySelectorAll('td');
          if (cells.length < 3) continue;

          const cellTexts = cells.map(td => cleanText(td.innerHTML));

          // Determine type based on subsection
          let type: 'vowel' | 'consonant' | 'diacritic' = 'consonant';
          if (currentSubsection.includes('vowel')) type = 'vowel';
          if (currentSubsection.includes('diacritical')) type = 'diacritic';

          const symbol = cellTexts[0];
          const ipa = cellTexts[1]?.replace(/^\/|\/$/g, '') || '';

          // Different table formats have different column orders
          let description = '';
          let exampleWord = '';
          let exampleMeaning = '';
          let englishApprox = '';

          if (headers.includes('description')) {
            // Vowel table format: Letter | IPA | Description | Example | English Approximation
            description = cellTexts[2] || '';
            exampleWord = cellTexts[3] || '';
            englishApprox = cellTexts[4] || '';
          } else if (headers.includes('english approximation')) {
            // Consonant format: Letter | IPA | Example | English Approximation
            exampleWord = cellTexts[2] || '';
            englishApprox = cellTexts[3] || '';
            description = currentH4;
          } else if (headers.includes('like english...')) {
            exampleWord = cellTexts[2] || '';
            englishApprox = cellTexts[3] || '';
            description = currentH4;
          } else if (headers.includes('notes')) {
            exampleWord = cellTexts[2] || '';
            englishApprox = cellTexts[3] || '';
            description = currentH4;
          } else if (headers.includes('french approximation')) {
            // Nasal vowel format: Letter | IPA | Example | French Approximation
            exampleWord = cellTexts[2] || '';
            englishApprox = cellTexts[3] || '';
            description = 'Nasal vowel';
            type = 'vowel';
          } else {
            // Fallback
            exampleWord = cellTexts[2] || '';
            englishApprox = cellTexts[3] || '';
            description = currentH4;
          }

          // Extract example meaning from parenthetical if present
          const exampleMatch = exampleWord.match(/^(.+?)\s*\((.+)\)/);
          if (exampleMatch) {
            exampleWord = exampleMatch[1].trim();
            exampleMeaning = exampleMatch[2].trim();
          }

          guides.push({
            symbol,
            type,
            ipa,
            english_approximation: englishApprox,
            description: description || currentH4,
            example_word: exampleWord,
            example_meaning: exampleMeaning,
            section_ref: currentSubsection,
            review_status: 'approved',
          });
        }
      }
    }

    el = el.nextElementSibling;
  }

  return guides;
}

// =============================================================================
// Parse Dialogues (Sections 10, 16)
// =============================================================================

function parseDialogues(root: HTMLElement): DialogueExample[] {
  const dialogues: DialogueExample[] = [];
  const dialogueSections = ['10-', '16-'];

  const h3s = root.querySelectorAll('h3');

  for (const h3 of h3s) {
    const sectionId = h3.id;
    if (!sectionId) continue;

    const isDialogue = dialogueSections.some(prefix => sectionId.startsWith(prefix));
    if (!isDialogue) continue;

    const title = cleanText(h3.innerHTML);
    const type: 'mini' | 'extended' = sectionId.startsWith('16-') ? 'extended' : 'mini';

    const exchanges: { speaker: string; lakota: string }[] = [];
    const participants = new Set<string>();
    const genders = new Set<string>();
    let translation = '';
    let context = '';

    // Walk siblings
    let sibling = h3.nextElementSibling;
    let foundFirstExchange = false;

    while (sibling) {
      if (sibling.tagName === 'H2' || sibling.tagName === 'H3') break;
      if (sibling.classList?.contains('back-top') || sibling.tagName === 'HR') {
        sibling = sibling.nextElementSibling;
        continue;
      }

      if (sibling.tagName === 'P') {
        const text = cleanText(sibling.innerHTML);
        const strong = sibling.querySelector('strong');
        const em = sibling.querySelector('em');

        if (strong && !em) {
          const strongText = cleanText(strong.innerHTML);

          // Check if this is a dialogue line: "Speaker:" format
          const speakerMatch = strongText.match(/^(.+?):$/);
          if (speakerMatch) {
            foundFirstExchange = true;
            let speaker = speakerMatch[1].trim();

            // Extract gender markers
            if (speaker.includes('♂')) {
              genders.add('male');
              speaker = speaker.replace(/\s*\(♂\)\s*/, '').trim();
            }
            if (speaker.includes('♀')) {
              genders.add('female');
              speaker = speaker.replace(/\s*\(♀\)\s*/, '').trim();
            }

            participants.add(speaker);
            const lakotaText = text.substring(text.indexOf(':') + 1).trim();
            exchanges.push({ speaker, lakota: lakotaText });
          } else if (!foundFirstExchange) {
            // Context paragraph before dialogue
            context += (context ? ' ' : '') + text;
          }
        } else if (em && !strong) {
          // Translation paragraph (in italics)
          translation = cleanText(em.innerHTML);
        } else if (!foundFirstExchange && text.length > 0) {
          context += (context ? ' ' : '') + text;
        }
      }

      sibling = sibling.nextElementSibling;
    }

    if (exchanges.length > 0) {
      dialogues.push({
        type,
        title,
        context,
        section_ref: sectionId,
        exchanges,
        english_translation: translation,
        participants: Array.from(participants),
        speaker_genders: Array.from(genders),
        review_status: 'approved',
      });
    }
  }

  return dialogues;
}

// =============================================================================
// Parse Cultural Modules (Section 18)
// =============================================================================

function parseCulturalModules(root: HTMLElement): CulturalModule[] {
  const modules: CulturalModule[] = [];

  const h3s = root.querySelectorAll('h3');

  for (const h3 of h3s) {
    const sectionId = h3.id;
    if (!sectionId || !sectionId.startsWith('18-')) continue;

    // Skip the grammar quick reference — it's not a cultural article
    if (sectionId === '18-9-quick-reference-essential-grammar-at-a-glance') continue;

    const title = cleanText(h3.innerHTML);
    let bodyParts: string[] = [];

    let sibling = h3.nextElementSibling;
    while (sibling) {
      if (sibling.tagName === 'H2' || sibling.tagName === 'H3') break;
      if (sibling.classList?.contains('back-top') || sibling.tagName === 'HR') {
        sibling = sibling.nextElementSibling;
        continue;
      }

      if (sibling.tagName === 'P') {
        const text = cleanText(sibling.innerHTML);
        if (text.length > 0) {
          // Check for inline Lakota examples (em tags)
          const em = sibling.querySelector('em');
          const strong = sibling.querySelector('strong');

          if (em && strong) {
            // This is a mixed paragraph with Lakota examples
            bodyParts.push(text);
          } else if (em) {
            // Lakota example line
            bodyParts.push(`> ${text}`);
          } else {
            bodyParts.push(text);
          }
        }
      }

      sibling = sibling.nextElementSibling;
    }

    if (bodyParts.length > 0) {
      // Determine cultural category
      let category = 'worldview';
      if (sectionId.includes('animacy')) category = 'worldview';
      if (sectionId.includes('circle')) category = 'worldview';
      if (sectionId.includes('evidential')) category = 'language';
      if (sectionId.includes('relationship')) category = 'social_structure';
      if (sectionId.includes('naming')) category = 'tradition';
      if (sectionId.includes('resistance')) category = 'history';
      if (sectionId.includes('proverbs')) category = 'wisdom';
      if (sectionId.includes('daily-practice')) category = 'practice';

      modules.push({
        title,
        body: bodyParts.join('\n\n'),
        category,
        section_ref: sectionId,
        review_status: 'approved',
      });
    }
  }

  return modules;
}

// =============================================================================
// Main
// =============================================================================

function main() {
  console.log('Parsing Lakota Language Primer HTML...\n');

  const primerPath = join(import.meta.dirname, 'Claude_Lakota_Language_Primer_v1.html');
  const html = readFileSync(primerPath, 'utf-8');
  const root = parse(html);

  // 1. Parse vocabulary
  console.log('Parsing vocabulary...');
  const vocabulary = parseVocabulary(root);
  console.log(`  Found ${vocabulary.length} vocabulary entries`);

  // Print category breakdown
  const catCounts = new Map<string, number>();
  for (const v of vocabulary) {
    catCounts.set(v.category, (catCounts.get(v.category) || 0) + 1);
  }
  for (const [cat, count] of [...catCounts.entries()].sort()) {
    console.log(`    ${cat}: ${count}`);
  }

  // 2. Parse pronunciation guides
  console.log('\nParsing pronunciation guides...');
  const pronunciation = parsePronunciation(root);
  console.log(`  Found ${pronunciation.length} pronunciation guides`);

  // 3. Parse dialogues
  console.log('\nParsing dialogues...');
  const dialogues = parseDialogues(root);
  console.log(`  Found ${dialogues.length} dialogues`);
  for (const d of dialogues) {
    console.log(`    ${d.section_ref}: ${d.title} (${d.exchanges.length} exchanges)`);
  }

  // 4. Parse cultural modules
  console.log('\nParsing cultural modules...');
  const cultural = parseCulturalModules(root);
  console.log(`  Found ${cultural.length} cultural modules`);
  for (const c of cultural) {
    console.log(`    ${c.section_ref}: ${c.title}`);
  }

  // Write output files
  const outDir = import.meta.dirname;

  writeFileSync(
    join(outDir, 'vocabulary-primer.json'),
    JSON.stringify(vocabulary, null, 2),
    'utf-8',
  );
  console.log(`\nWrote vocabulary-primer.json`);

  writeFileSync(
    join(outDir, 'pronunciation-guides.json'),
    JSON.stringify(pronunciation, null, 2),
    'utf-8',
  );
  console.log('Wrote pronunciation-guides.json');

  writeFileSync(
    join(outDir, 'dialogues.json'),
    JSON.stringify(dialogues, null, 2),
    'utf-8',
  );
  console.log('Wrote dialogues.json');

  writeFileSync(
    join(outDir, 'cultural-modules.json'),
    JSON.stringify(cultural, null, 2),
    'utf-8',
  );
  console.log('Wrote cultural-modules.json');

  console.log('\nDone!');
}

main();
