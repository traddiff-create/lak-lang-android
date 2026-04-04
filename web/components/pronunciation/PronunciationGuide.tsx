import { useState, useEffect } from 'react';
import { fetchPronunciationGuides } from '../../lib/api';
import type { PronunciationGuide as PronunciationGuideType } from '../../lib/api';

type GuideType = 'vowel' | 'consonant' | 'diacritic';

export function PronunciationGuide() {
  const [guides, setGuides] = useState<PronunciationGuideType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<GuideType>('vowel');

  useEffect(() => {
    fetchPronunciationGuides()
      .then(setGuides)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  const types: GuideType[] = ['vowel', 'consonant', 'diacritic'];
  const counts = Object.fromEntries(types.map(t => [t, guides.filter(g => g.type === t).length]));
  const filtered = guides.filter(g => g.type === activeType);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Pronunciation Guide</h1>
      <p className="text-gray-600 text-sm mb-6">
        Lakota Language Consortium orthography — sounds and phonetic guides.
      </p>

      <div className="flex gap-2 mb-6">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeType === t
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}s
            {counts[t] > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({counts[t]})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No {activeType} guides available yet.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map(guide => (
            <div
              key={guide.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
            >
              <div className="w-14 text-center text-3xl font-bold text-gray-900 shrink-0">
                {guide.symbol}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-sm text-gray-500">[{guide.ipa}]</span>
                  {guide.englishApproximation && (
                    <span className="text-sm text-gray-600">
                      ≈ &ldquo;{guide.englishApproximation}&rdquo;
                    </span>
                  )}
                </div>
                {guide.description && (
                  <p className="text-sm text-gray-700 mb-2">{guide.description}</p>
                )}
                {guide.exampleWord && (
                  <div className="inline-flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                    <span className="font-medium text-gray-900">{guide.exampleWord}</span>
                    {guide.exampleMeaning && (
                      <span className="text-gray-500">— {guide.exampleMeaning}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
