import { useState } from 'react';
import {
  fetchPendingReview,
  reviewVocabulary,
  reviewCultural,
  reviewPronunciation,
} from '../../lib/api';
import type { PendingReview, VocabularyItem, CulturalModule, PronunciationGuide } from '../../lib/api';

type Tab = 'vocabulary' | 'cultural' | 'pronunciation';

export function Reviewer() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingReview | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('vocabulary');

  async function login() {
    if (!token.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPendingReview(token.trim());
      setPending(data);
      setAuthed(true);
    } catch {
      setError('Invalid token or failed to load queue.');
    } finally {
      setLoading(false);
    }
  }

  async function reload() {
    try {
      const data = await fetchPendingReview(token.trim());
      setPending(data);
    } catch {
      setError('Failed to refresh queue.');
    }
  }

  async function actVocab(id: string, action: 'approve' | 'reject', notes?: string) {
    await reviewVocabulary(id, action, token, notes);
    await reload();
  }

  async function actCultural(id: string, action: 'approve' | 'reject') {
    await reviewCultural(id, action, token);
    await reload();
  }

  async function actPronunciation(id: string, action: 'approve' | 'reject') {
    await reviewPronunciation(id, action, token);
    await reload();
  }

  // ─── Login ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="max-w-sm mx-auto py-12">
        <h1 className="text-2xl font-semibold mb-1">Reviewer Access</h1>
        <p className="text-gray-600 text-sm mb-8">
          Community partner portal — enter your reviewer token to access the pending queue.
        </p>
        <div className="space-y-3">
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Reviewer token"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={login}
            disabled={loading || !token.trim()}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Access Queue'}
          </button>
        </div>
      </div>
    );
  }

  if (!pending) return null;

  const counts = {
    vocabulary: pending.vocabulary.length,
    cultural: pending.cultural.length,
    pronunciation: pending.pronunciation.length,
  };
  const total = counts.vocabulary + counts.cultural + counts.pronunciation;

  const tabs: Tab[] = ['vocabulary', 'cultural', 'pronunciation'];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Review Queue</h1>
          <p className="text-gray-600 text-sm mt-0.5">
            {total === 0 ? 'All clear — no pending items.' : `${total} item${total !== 1 ? 's' : ''} awaiting review`}
          </p>
        </div>
        <button
          onClick={() => { setAuthed(false); setPending(null); setToken(''); }}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
            {counts[tab] > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({counts[tab]})</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'vocabulary' && (
        <VocabQueue items={pending.vocabulary} onAct={actVocab} />
      )}
      {activeTab === 'cultural' && (
        <CulturalQueue items={pending.cultural} onAct={actCultural} />
      )}
      {activeTab === 'pronunciation' && (
        <PronunciationQueue items={pending.pronunciation} onAct={actPronunciation} />
      )}
    </div>
  );
}

// ─── Vocabulary queue ─────────────────────────────────────────────────────────

function VocabQueue({
  items,
  onAct,
}: {
  items: VocabularyItem[];
  onAct: (id: string, action: 'approve' | 'reject', notes?: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="text-gray-500 text-center py-12">No vocabulary items pending review.</p>;
  }

  async function act(id: string, action: 'approve' | 'reject') {
    setWorking(id);
    try {
      await onAct(id, action, notes[id] || undefined);
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-xl font-bold text-gray-900">{item.lakota}</span>
              <span className="ml-3 text-gray-600">{item.english}</span>
            </div>
            <div className="flex gap-2 shrink-0 text-xs">
              {item.partOfSpeech && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded">{item.partOfSpeech}</span>
              )}
              {item.category && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded">{item.category}</span>
              )}
            </div>
          </div>

          {item.phoneticGuide && (
            <p className="text-sm text-gray-500 mb-1">Phonetic: {item.phoneticGuide}</p>
          )}
          {item.culturalNote && (
            <p className="text-sm text-gray-600 italic mb-3">"{item.culturalNote}"</p>
          )}

          <textarea
            value={notes[item.id] ?? ''}
            onChange={e => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
            placeholder="Reviewer notes (optional)…"
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 mb-3"
          />

          <div className="flex gap-2">
            <button
              onClick={() => act(item.id, 'approve')}
              disabled={working === item.id}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {working === item.id ? '…' : 'Approve'}
            </button>
            <button
              onClick={() => act(item.id, 'reject')}
              disabled={working === item.id}
              className="flex-1 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {working === item.id ? '…' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Cultural queue ──────────────────────────────────────────────────────────

function CulturalQueue({
  items,
  onAct,
}: {
  items: CulturalModule[];
  onAct: (id: string, action: 'approve' | 'reject') => Promise<void>;
}) {
  const [working, setWorking] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="text-gray-500 text-center py-12">No cultural articles pending review.</p>;
  }

  async function act(id: string, action: 'approve' | 'reject') {
    setWorking(id);
    try {
      await onAct(id, action);
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              {item.category && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded mt-1 inline-block">
                  {item.category}
                </span>
              )}
            </div>
            <button
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
            >
              {expanded === item.id ? 'Collapse' : 'Read'}
            </button>
          </div>

          {expanded === item.id && (
            <div className="mb-4 text-sm text-gray-700 space-y-2 border-t border-gray-100 pt-3">
              {item.body.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => act(item.id, 'approve')}
              disabled={working === item.id}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {working === item.id ? '…' : 'Approve'}
            </button>
            <button
              onClick={() => act(item.id, 'reject')}
              disabled={working === item.id}
              className="flex-1 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {working === item.id ? '…' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Pronunciation queue ──────────────────────────────────────────────────────

function PronunciationQueue({
  items,
  onAct,
}: {
  items: PronunciationGuide[];
  onAct: (id: string, action: 'approve' | 'reject') => Promise<void>;
}) {
  const [working, setWorking] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="text-gray-500 text-center py-12">No pronunciation guides pending review.</p>;
  }

  async function act(id: string, action: 'approve' | 'reject') {
    setWorking(id);
    try {
      await onAct(id, action);
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl font-bold text-gray-900 w-12 text-center shrink-0">
              {item.symbol}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-gray-500">[{item.ipa}]</span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded capitalize">
                  {item.type}
                </span>
              </div>
              {item.englishApproximation && (
                <p className="text-sm text-gray-600">≈ "{item.englishApproximation}"</p>
              )}
              {item.description && (
                <p className="text-sm text-gray-700 mt-1">{item.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => act(item.id, 'approve')}
              disabled={working === item.id}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {working === item.id ? '…' : 'Approve'}
            </button>
            <button
              onClick={() => act(item.id, 'reject')}
              disabled={working === item.id}
              className="flex-1 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {working === item.id ? '…' : 'Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
