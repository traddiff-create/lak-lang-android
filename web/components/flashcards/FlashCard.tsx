import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { VocabularyItem } from '../../lib/api';

interface FlashCardProps {
  item: VocabularyItem;
}

export function FlashCard({ item }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="perspective-1000 w-full max-w-md mx-auto cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '280px',
        }}
      >
        {/* Front — Lakota */}
        <div
          className="absolute inset-0 rounded-2xl bg-white border border-gray-200 shadow-sm p-8 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-4">
            Lakota
          </span>
          <h2 className="lakota-text text-3xl font-bold text-gray-900 text-center mb-3">
            {item.lakota}
          </h2>
          {item.phoneticGuide && (
            <p className="text-sm text-gray-500 mb-2">
              /{item.phoneticGuide}/
            </p>
          )}
          {item.ipa && (
            <p className="text-xs text-gray-400 font-mono">[{item.ipa}]</p>
          )}
          <AudioIndicator item={item} />
          <p className="mt-6 text-xs text-gray-400">tap to flip</p>
        </div>

        {/* Back — English + details */}
        <div
          className="absolute inset-0 rounded-2xl bg-white border border-gray-200 shadow-sm p-8 flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-4">
            English
          </span>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {item.english}
          </h2>
          {item.partOfSpeech && (
            <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 mb-3">
              {item.partOfSpeech}
            </span>
          )}
          {item.culturalNote && (
            <p className="text-sm text-gray-600 text-center mt-2 leading-relaxed max-w-xs">
              {item.culturalNote}
            </p>
          )}
          <StoryConnections wordId={item.id} />
          {item.reviewStatus === 'approved' && (
            <span className="mt-4 text-xs text-emerald-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Community verified
            </span>
          )}
          <p className="mt-4 text-xs text-gray-400">tap to flip</p>
        </div>
      </div>
    </div>
  );
}

function AudioIndicator({ item }: { item: VocabularyItem }) {
  const hasAudio =
    item.audio && item.audio.audioType !== 'none' && item.audio.audioUrl;

  if (hasAudio) {
    return (
      <button
        className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
        onClick={(e) => {
          e.stopPropagation();
          // Audio playback will be implemented when licensing is confirmed
        }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
        Play audio
      </button>
    );
  }

  return (
    <span className="mt-3 text-xs text-gray-400 italic">
      Recording coming soon
    </span>
  );
}

function StoryConnections({ wordId }: { wordId: string }) {
  const [connections, setConnections] = useState<Array<{ nodeId: string; label: { lakota: string; english: string } }>>([]);

  useEffect(() => {
    fetch(`/api/graph/node/word/${wordId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const storyLinks = [
          ...data.incoming.filter((e: any) => e.nodeType === 'story'),
          ...data.outgoing.filter((e: any) => e.nodeType === 'story'),
        ];
        setConnections(storyLinks);
      })
      .catch(() => {});
  }, [wordId]);

  if (connections.length === 0) return null;

  return (
    <div className="mt-3 text-center" onClick={e => e.stopPropagation()}>
      <span className="text-xs text-gray-400">Appears in:</span>
      <div className="flex flex-wrap gap-1 justify-center mt-1">
        {connections.map(c => (
          <Link
            key={c.nodeId}
            to={`/stories/${c.nodeId}`}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs hover:bg-purple-100"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {c.label?.lakota || 'Story'}
          </Link>
        ))}
      </div>
    </div>
  );
}
