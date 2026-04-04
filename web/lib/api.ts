// API client for Lakota Language Learning backend
// Vite proxies /api to Express server (see vite.config.ts)

// =============================================================================
// Types
// =============================================================================

export interface VocabularyItem {
  id: string;
  lakota: string;
  english: string;
  partOfSpeech: string | null;
  phoneticGuide: string | null;
  ipa: string | null;
  category: string | null;
  culturalNote: string | null;
  source: string | null;
  reviewStatus: string;
  audio?: AudioAsset | null;
}

export interface AudioAsset {
  id: string;
  vocabularyId: string;
  audioType: 'external_url' | 'local_file' | 'none';
  audioSource: string | null;
  audioUrl: string | null;
  license: string | null;
  attribution: string | null;
  verified: boolean;
}

export interface CategoryCount {
  category: string | null;
  count: number;
}

export interface PronunciationGuide {
  id: string;
  symbol: string;
  type: 'vowel' | 'consonant' | 'diacritic';
  ipa: string;
  englishApproximation: string | null;
  description: string | null;
  exampleWord: string | null;
  exampleMeaning: string | null;
  sectionRef: string | null;
  reviewStatus: string;
}

export interface CulturalModule {
  id: string;
  title: string;
  body: string;
  category: string | null;
  reviewStatus: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MCQuestion {
  id: string;
  type: 'multiple_choice';
  prompt: string;
  lakota: string;
  options: string[];
  correctIndex: number; // always 0 from Claude; UI shuffles display order
}

export interface FBQuestion {
  id: string;
  type: 'fill_blank';
  prompt: string;
  answer: string;
  hint: string;
}

export type QuizQuestion = MCQuestion | FBQuestion;

export interface QuizResponse {
  questions: QuizQuestion[];
}

export interface PendingReview {
  vocabulary: VocabularyItem[];
  cultural: CulturalModule[];
  pronunciation: PronunciationGuide[];
}

// =============================================================================
// Vocabulary
// =============================================================================

export async function fetchVocabulary(params?: {
  category?: string;
  search?: string;
}): Promise<VocabularyItem[]> {
  const url = new URL('/api/vocabulary', window.location.origin);
  if (params?.category) url.searchParams.set('category', params.category);
  if (params?.search) url.searchParams.set('search', params.search);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch vocabulary');
  const json = await res.json();
  return json.data;
}

export async function fetchCategories(): Promise<CategoryCount[]> {
  const res = await fetch('/api/vocabulary/categories');
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = await res.json();
  return json.data;
}

export async function fetchVocabularyItem(id: string): Promise<VocabularyItem> {
  const res = await fetch(`/api/vocabulary/${id}`);
  if (!res.ok) throw new Error('Vocabulary item not found');
  const json = await res.json();
  return json.data;
}

// =============================================================================
// Pronunciation
// =============================================================================

export async function fetchPronunciationGuides(): Promise<PronunciationGuide[]> {
  const res = await fetch('/api/pronunciation');
  if (!res.ok) throw new Error('Failed to fetch pronunciation guides');
  const json = await res.json();
  return json.data;
}

// =============================================================================
// Cultural
// =============================================================================

export async function fetchCulturalModules(): Promise<CulturalModule[]> {
  const res = await fetch('/api/cultural');
  if (!res.ok) throw new Error('Failed to fetch cultural modules');
  const json = await res.json();
  return json.data;
}

export async function fetchCulturalModule(id: string): Promise<CulturalModule> {
  const res = await fetch(`/api/cultural/${id}`);
  if (!res.ok) throw new Error('Cultural module not found');
  const json = await res.json();
  return json.data;
}

// =============================================================================
// AI — Conversation & Quiz
// =============================================================================

export async function sendConversationMessage(
  messages: ConversationMessage[],
  category?: string
): Promise<{ message: string }> {
  const res = await fetch('/api/ai/conversation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, category }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error || 'Failed to send message');
  }
  return res.json();
}

export async function generateQuiz(params?: {
  category?: string;
  count?: number;
}): Promise<QuizResponse> {
  const res = await fetch('/api/ai/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: params?.category, count: params?.count }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error || 'Failed to generate quiz');
  }
  return res.json();
}

// =============================================================================
// Review (community partner)
// =============================================================================

export async function fetchPendingReview(token: string): Promise<PendingReview> {
  const res = await fetch('/api/review/pending', {
    headers: { 'x-reviewer-token': token },
  });
  if (!res.ok) throw new Error('Unauthorized or failed to fetch pending review');
  const json = await res.json();
  return json.data;
}

export async function reviewVocabulary(
  id: string,
  action: 'approve' | 'reject',
  token: string,
  notes?: string
): Promise<void> {
  const res = await fetch(`/api/review/vocabulary/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-reviewer-token': token },
    body: JSON.stringify({ action, notes }),
  });
  if (!res.ok) throw new Error('Failed to update review');
}

export async function reviewCultural(
  id: string,
  action: 'approve' | 'reject',
  token: string
): Promise<void> {
  const res = await fetch(`/api/review/cultural/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-reviewer-token': token },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error('Failed to update review');
}

export async function reviewPronunciation(
  id: string,
  action: 'approve' | 'reject',
  token: string
): Promise<void> {
  const res = await fetch(`/api/review/pronunciation/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-reviewer-token': token },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error('Failed to update review');
}

// =============================================================================
// Knowledge Graph
// =============================================================================

export type NodeType = 'word' | 'story' | 'value' | 'person' | 'place' | 'ceremony' | 'song';

export interface GraphNodeLabel {
  lakota: string;
  english: string;
}

export interface GraphNode {
  id: string;
  type: NodeType;
  label: GraphNodeLabel;
  depth?: number;
  accessLevel?: string;
}

export interface GraphEdge {
  id: string;
  source: { id: string; type: string };
  target: { id: string; type: string };
  relationship: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface StoryDetail {
  id: string;
  titleLakota: string;
  titleEnglish: string;
  body: string;
  audioUrl: string | null;
  category: string | null;
  source: string | null;
  accessLevel: string;
  reviewStatus: string;
}

export interface StoryWithLinked {
  story: StoryDetail;
  linked: {
    vocabulary: any[];
    values: any[];
    persons: any[];
    places: any[];
    ceremonies: any[];
    songs: any[];
  };
}

export async function fetchGraphAll(): Promise<GraphData> {
  const res = await fetch('/api/graph/all');
  if (!res.ok) throw new Error('Failed to fetch graph');
  return res.json();
}

export async function fetchGraphExplore(nodeId: string, nodeType: NodeType, depth = 2): Promise<GraphData> {
  const res = await fetch(`/api/graph/explore?nodeId=${nodeId}&nodeType=${nodeType}&depth=${depth}`);
  if (!res.ok) throw new Error('Failed to explore graph');
  return res.json();
}

export async function fetchGraphSearch(q: string): Promise<{ results: GraphNode[]; total: number }> {
  const res = await fetch(`/api/graph/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to search graph');
  return res.json();
}

export async function fetchStories(category?: string): Promise<StoryDetail[]> {
  const url = new URL('/api/graph/stories', window.location.origin);
  if (category) url.searchParams.set('category', category);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch stories');
  const json = await res.json();
  return json.data;
}

export async function fetchStory(id: string): Promise<StoryWithLinked> {
  const res = await fetch(`/api/graph/stories/${id}`);
  if (!res.ok) throw new Error('Story not found');
  return res.json();
}
