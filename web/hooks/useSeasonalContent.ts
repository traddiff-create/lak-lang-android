import { useState, useEffect } from 'react';
import { fetchVocabulary, fetchStories, fetchGraphAll } from '../lib/api';

export type Season = 'winter' | 'spring' | 'summer' | 'fall';

export interface ContentItem {
  id: string;
  nodeType: 'word' | 'story' | 'value' | 'person' | 'place' | 'ceremony' | 'song';
  lakota: string;
  english: string;
  body?: string;
  audioUrl?: string | null;
  category?: string | null;
}

export function detectSeason(): Season {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export function useSeasonalContent(season: Season) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent(season).then(setItems).finally(() => setLoading(false));
  }, [season]);

  return { items, loading };
}

async function loadContent(season: Season): Promise<ContentItem[]> {
  switch (season) {
    case 'winter': {
      const stories = await fetchStories();
      return shuffle(stories.map(s => ({
        id: s.id,
        nodeType: 'story' as const,
        lakota: s.titleLakota,
        english: s.titleEnglish,
        body: s.body,
        audioUrl: s.audioUrl,
        category: s.category,
      })));
    }

    case 'spring': {
      const vocab = await fetchVocabulary();
      return shuffle(vocab.map(v => ({
        id: v.id,
        nodeType: 'word' as const,
        lakota: v.lakota,
        english: v.english,
        audioUrl: v.audio?.audioUrl || null,
        category: v.category,
      })));
    }

    case 'summer': {
      const vocab = await fetchVocabulary();
      return shuffle(vocab.map(v => ({
        id: v.id,
        nodeType: 'word' as const,
        lakota: v.lakota,
        english: v.english,
        audioUrl: v.audio?.audioUrl || null,
        category: v.category,
      })));
    }

    case 'fall': {
      const graph = await fetchGraphAll();
      const nonWords = graph.nodes.filter(n => n.type !== 'word');
      return shuffle(nonWords.map(n => ({
        id: n.id,
        nodeType: n.type,
        lakota: n.label.lakota,
        english: n.label.english,
        audioUrl: null,
      })));
    }
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
