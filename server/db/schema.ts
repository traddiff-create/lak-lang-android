import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// =============================================================================
// Enums (as const for type safety - SQLite stores as text)
// =============================================================================

export const reviewStatusEnum = ['draft', 'pending_review', 'approved', 'rejected'] as const;
export type ReviewStatus = typeof reviewStatusEnum[number];

export const audioTypeEnum = ['external_url', 'local_file', 'none'] as const;
export type AudioType = typeof audioTypeEnum[number];

export const audioSourceEnum = ['firstvoices', 'llc', 'community', 'other'] as const;
export type AudioSource = typeof audioSourceEnum[number] | null;

// Knowledge Graph enums
export const accessLevelEnum = ['public', 'community', 'restricted'] as const;
export type AccessLevel = typeof accessLevelEnum[number];

export const nodeTypeEnum = ['word', 'story', 'value', 'person', 'place', 'ceremony', 'song'] as const;
export type NodeType = typeof nodeTypeEnum[number];

export const relationshipTypeEnum = [
  'appears_in', 'teaches', 'related_to', 'expresses',
  'part_of', 'composed_by', 'located_at', 'performed_at',
] as const;
export type RelationshipType = typeof relationshipTypeEnum[number];

// =============================================================================
// vocabulary_items
// Core table for all Lakota vocabulary entries
// =============================================================================

export const vocabularyItems = sqliteTable('vocabulary_items', {
  id: text('id').primaryKey(), // UUID as text for SQLite
  lakota: text('lakota').notNull(), // LLC orthography - ą, š, ž, č, ȟ, ġ, ŋ, ʼ
  english: text('english').notNull(),
  partOfSpeech: text('part_of_speech'), // noun, verb, etc.
  phoneticGuide: text('phonetic_guide'), // simplified phonetic for display
  ipa: text('ipa'), // IPA transcription
  category: text('category'), // greetings, family, nature, etc.
  culturalNote: text('cultural_note'), // optional cultural context inline
  source: text('source'), // citation for verified content

  // Access control - public/community/restricted
  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),

  // Review workflow - nothing reaches learners without approval
  reviewStatus: text('review_status', { enum: reviewStatusEnum }).notNull().default('draft'),
  reviewNotes: text('review_notes'), // reviewer feedback
  reviewedBy: text('reviewed_by'), // partner identifier
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// =============================================================================
// audio_assets
// Decoupled audio for vocabulary - supports external_url, local_file, or none
// Licensing is TBD - do not hardcode sources
// =============================================================================

export const audioAssets = sqliteTable('audio_assets', {
  id: text('id').primaryKey(), // UUID as text
  vocabularyId: text('vocabulary_id').references(() => vocabularyItems.id, { onDelete: 'cascade' }),

  // Source-agnostic audio system
  audioType: text('audio_type', { enum: audioTypeEnum }).notNull().default('none'),
  audioSource: text('audio_source', { enum: audioSourceEnum }), // firstvoices, llc, community, other, or null
  audioUrl: text('audio_url'), // external URL or local path

  // Licensing (populated when confirmed)
  license: text('license'), // licensing terms
  attribution: text('attribution'), // required attribution string
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false), // has licensing been confirmed?

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// =============================================================================
// cultural_modules
// Reviewed articles about Lakota culture and context
// =============================================================================

export const culturalModules = sqliteTable('cultural_modules', {
  id: text('id').primaryKey(), // UUID as text
  title: text('title').notNull(),
  body: text('body').notNull(), // markdown content
  category: text('category'),

  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),

  // Review workflow - same as vocabulary
  reviewStatus: text('review_status', { enum: reviewStatusEnum }).notNull().default('draft'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// =============================================================================
// pronunciation_guides
// Phonetic guides for Lakota orthography (vowels, consonants, diacritics)
// =============================================================================

export const pronunciationGuideTypeEnum = ['vowel', 'consonant', 'diacritic'] as const;
export type PronunciationGuideType = typeof pronunciationGuideTypeEnum[number];

export const pronunciationGuides = sqliteTable('pronunciation_guides', {
  id: text('id').primaryKey(),
  symbol: text('symbol').notNull(),
  type: text('type', { enum: pronunciationGuideTypeEnum }).notNull(),
  ipa: text('ipa').notNull(),
  englishApproximation: text('english_approximation'),
  description: text('description'),
  exampleWord: text('example_word'),
  exampleMeaning: text('example_meaning'),
  sectionRef: text('section_ref'),

  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),

  reviewStatus: text('review_status', { enum: reviewStatusEnum }).notNull().default('draft'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// =============================================================================
// dialogue_examples
// Mini and extended dialogues for conversational practice
// =============================================================================

export const dialogueTypeEnum = ['mini', 'extended'] as const;
export type DialogueType = typeof dialogueTypeEnum[number];

export const dialogueExamples = sqliteTable('dialogue_examples', {
  id: text('id').primaryKey(),
  type: text('type', { enum: dialogueTypeEnum }).notNull(),
  title: text('title').notNull(),
  context: text('context'),
  sectionRef: text('section_ref'),

  // Dialogue content stored as JSON text
  lakotaText: text('lakota_text').notNull(), // JSON array of {speaker, lakota}
  englishTranslation: text('english_translation').notNull(),
  numExchanges: integer('num_exchanges').notNull(),
  participants: text('participants'), // JSON array of participant names
  speakerGenders: text('speaker_genders'), // JSON array of genders

  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),

  reviewStatus: text('review_status', { enum: reviewStatusEnum }).notNull().default('draft'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),

  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// =============================================================================
// Knowledge Graph — Node Tables
// =============================================================================

// Stories — narrative units (teaching stories, creation stories, historical)
export const stories = sqliteTable('stories', {
  id: text('id').primaryKey(),
  titleLakota: text('title_lakota').notNull(),
  titleEnglish: text('title_english').notNull(),
  body: text('body').notNull(), // markdown
  audioUrl: text('audio_url'),
  category: text('category'), // creation, historical, teaching, etc.
  source: text('source'),

  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),
  reviewStatus: text('review_status', { enum: reviewStatusEnum }).notNull().default('draft'),
  reviewNotes: text('review_notes'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Values — cultural values & concepts (kinship, reciprocity, respect)
export const values = sqliteTable('values', {
  id: text('id').primaryKey(),
  lakota: text('lakota').notNull(),
  english: text('english').notNull(),
  description: text('description'),
  source: text('source'),

  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),
  reviewStatus: text('review_status', { enum: reviewStatusEnum }).notNull().default('draft'),
  reviewNotes: text('review_notes'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Persons — historical figures, storytellers, community members
export const persons = sqliteTable('persons', {
  id: text('id').primaryKey(),
  lakotaName: text('lakota_name').notNull(),
  englishName: text('english_name').notNull(),
  role: text('role'), // chief, storyteller, healer, etc.
  biography: text('biography'), // markdown
  source: text('source'),

  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),
  reviewStatus: text('review_status', { enum: reviewStatusEnum }).notNull().default('draft'),
  reviewNotes: text('review_notes'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Places — sacred sites, communities, geographical locations
export const places = sqliteTable('places', {
  id: text('id').primaryKey(),
  lakotaName: text('lakota_name').notNull(),
  englishName: text('english_name').notNull(),
  description: text('description'), // markdown
  latitude: real('latitude'),
  longitude: real('longitude'),
  source: text('source'),

  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),
  reviewStatus: text('review_status', { enum: reviewStatusEnum }).notNull().default('draft'),
  reviewNotes: text('review_notes'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Ceremonies — ceremonial practices
export const ceremonies = sqliteTable('ceremonies', {
  id: text('id').primaryKey(),
  lakotaName: text('lakota_name').notNull(),
  englishName: text('english_name').notNull(),
  description: text('description'), // markdown
  audioUrl: text('audio_url'),
  source: text('source'),

  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),
  reviewStatus: text('review_status', { enum: reviewStatusEnum }).notNull().default('draft'),
  reviewNotes: text('review_notes'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Songs — traditional and contemporary songs
export const songs = sqliteTable('songs', {
  id: text('id').primaryKey(),
  lakotaTitle: text('lakota_title').notNull(),
  englishTitle: text('english_title').notNull(),
  lyrics: text('lyrics'), // markdown
  audioUrl: text('audio_url'),
  composer: text('composer'),
  source: text('source'),

  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),
  reviewStatus: text('review_status', { enum: reviewStatusEnum }).notNull().default('draft'),
  reviewNotes: text('review_notes'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// =============================================================================
// Knowledge Graph — Edge Table
// Connects any node to any other node with a typed relationship
// =============================================================================

export const graphEdges = sqliteTable('graph_edges', {
  id: text('id').primaryKey(),

  sourceNodeId: text('source_node_id').notNull(),
  sourceNodeType: text('source_node_type', { enum: nodeTypeEnum }).notNull(),
  targetNodeId: text('target_node_id').notNull(),
  targetNodeType: text('target_node_type', { enum: nodeTypeEnum }).notNull(),

  relationshipType: text('relationship_type', { enum: relationshipTypeEnum }).notNull(),
  metadata: text('metadata'), // JSON for weight, confidence, notes

  accessLevel: text('access_level', { enum: accessLevelEnum }).notNull().default('public'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// =============================================================================
// Relations
// =============================================================================

export const vocabularyItemsRelations = relations(vocabularyItems, ({ one }) => ({
  audio: one(audioAssets, {
    fields: [vocabularyItems.id],
    references: [audioAssets.vocabularyId],
  }),
}));

export const audioAssetsRelations = relations(audioAssets, ({ one }) => ({
  vocabulary: one(vocabularyItems, {
    fields: [audioAssets.vocabularyId],
    references: [vocabularyItems.id],
  }),
}));

// =============================================================================
// Type exports for use in application code
// =============================================================================

export type VocabularyItem = typeof vocabularyItems.$inferSelect;
export type NewVocabularyItem = typeof vocabularyItems.$inferInsert;

export type AudioAsset = typeof audioAssets.$inferSelect;
export type NewAudioAsset = typeof audioAssets.$inferInsert;

export type CulturalModule = typeof culturalModules.$inferSelect;
export type NewCulturalModule = typeof culturalModules.$inferInsert;

export type PronunciationGuide = typeof pronunciationGuides.$inferSelect;
export type NewPronunciationGuide = typeof pronunciationGuides.$inferInsert;

export type DialogueExample = typeof dialogueExamples.$inferSelect;
export type NewDialogueExample = typeof dialogueExamples.$inferInsert;

export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;

export type Value = typeof values.$inferSelect;
export type NewValue = typeof values.$inferInsert;

export type Person = typeof persons.$inferSelect;
export type NewPerson = typeof persons.$inferInsert;

export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;

export type Ceremony = typeof ceremonies.$inferSelect;
export type NewCeremony = typeof ceremonies.$inferInsert;

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;

export type GraphEdge = typeof graphEdges.$inferSelect;
export type NewGraphEdge = typeof graphEdges.$inferInsert;
