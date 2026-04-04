import { useState, useEffect } from 'react';
import { fetchCulturalModules, fetchCulturalModule } from '../../lib/api';
import type { CulturalModule as CulturalModuleType } from '../../lib/api';

export function Cultural() {
  const [modules, setModules] = useState<CulturalModuleType[]>([]);
  const [selected, setSelected] = useState<CulturalModuleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCulturalModules()
      .then(setModules)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function openModule(id: string) {
    setLoadingArticle(true);
    try {
      const module = await fetchCulturalModule(id);
      setSelected(module);
    } catch {
      setError('Failed to load article.');
    } finally {
      setLoadingArticle(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  if (selected) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="mb-6 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back to articles
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{selected.title}</h1>
        {selected.category && (
          <span className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded mb-5">
            {selected.category}
          </span>
        )}
        <div className="space-y-4">
          {selected.body.split('\n\n').map((para, i) => (
            <p key={i} className="text-gray-700 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100">
          <span className="text-xs text-gray-400">Community verified content</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Cultural Context</h1>
      <p className="text-gray-600 text-sm mb-6">
        Community-reviewed articles about Lakota culture and tradition.
      </p>

      {modules.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No cultural articles available yet.</p>
      ) : (
        <div className="grid gap-3">
          {modules.map(m => (
            <button
              key={m.id}
              onClick={() => !loadingArticle && openModule(m.id)}
              disabled={loadingArticle}
              className="text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-60"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-gray-900">{m.title}</span>
                {m.category && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded shrink-0">
                    {m.category}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
