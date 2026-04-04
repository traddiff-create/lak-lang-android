import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchStory, fetchStories, type StoryDetail, type StoryWithLinked } from '../../lib/api';

export function StoriesList() {
  const [stories, setStories] = useState<StoryDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories()
      .then(setStories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Stories</h2>
      <p className="text-gray-500 mb-6">Oral-first learning through Lakota stories and narratives.</p>

      {stories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">No stories yet</p>
          <p className="text-gray-400 text-sm">
            Stories will appear here once community partners add and approve them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map(story => (
            <Link
              key={story.id}
              to={`/stories/${story.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                {story.category && (
                  <span className="text-xs text-gray-400 uppercase">{story.category}</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                {story.titleLakota}
              </h3>
              <p className="text-sm text-gray-500">{story.titleEnglish}</p>
              <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                {story.body.slice(0, 150)}...
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function StoryView() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StoryWithLinked | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchStory(id)
      .then(setData)
      .catch(() => setError('Story not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-center py-20 text-red-600">{error || 'Story not found'}</div>;
  }

  const { story, linked } = data;
  const hasLinked = Object.values(linked).some(arr => arr.length > 0);

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/stories" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; All Stories
      </Link>

      {/* Header */}
      <div className="mb-6">
        {story.category && (
          <span className="text-xs text-gray-400 uppercase">{story.category}</span>
        )}
        <h1 className="text-3xl font-semibold text-gray-900 mt-1">{story.titleLakota}</h1>
        <p className="text-lg text-gray-500">{story.titleEnglish}</p>
      </div>

      {/* Audio Player */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        {story.audioUrl ? (
          <audio controls className="w-full" src={story.audioUrl}>
            Your browser does not support audio.
          </audio>
        ) : (
          <p className="text-sm text-gray-400 text-center py-2">Recording coming soon</p>
        )}
      </div>

      {/* Story Body */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="prose prose-gray max-w-none">
          {story.body.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-gray-700 mb-4 leading-relaxed">{paragraph}</p>
          ))}
        </div>
        {story.source && (
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
            Source: {story.source}
          </p>
        )}
      </div>

      {/* Linked Content */}
      {hasLinked && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Connected Knowledge</h3>

          {linked.vocabulary.length > 0 && (
            <LinkedSection title="Vocabulary" color="#3b82f6">
              {linked.vocabulary.map((word: any) => (
                <LinkedChip key={word.id} lakota={word.lakota} english={word.english} />
              ))}
            </LinkedSection>
          )}

          {linked.values.length > 0 && (
            <LinkedSection title="Values" color="#10b981">
              {linked.values.map((val: any) => (
                <LinkedChip key={val.id} lakota={val.lakota} english={val.english} />
              ))}
            </LinkedSection>
          )}

          {linked.persons.length > 0 && (
            <LinkedSection title="People" color="#f59e0b">
              {linked.persons.map((p: any) => (
                <LinkedChip key={p.id} lakota={p.lakotaName} english={p.englishName} />
              ))}
            </LinkedSection>
          )}

          {linked.places.length > 0 && (
            <LinkedSection title="Places" color="#92400e">
              {linked.places.map((p: any) => (
                <LinkedChip key={p.id} lakota={p.lakotaName} english={p.englishName} />
              ))}
            </LinkedSection>
          )}

          {linked.ceremonies.length > 0 && (
            <LinkedSection title="Ceremonies" color="#ef4444">
              {linked.ceremonies.map((c: any) => (
                <LinkedChip key={c.id} lakota={c.lakotaName} english={c.englishName} />
              ))}
            </LinkedSection>
          )}

          {linked.songs.length > 0 && (
            <LinkedSection title="Songs" color="#eab308">
              {linked.songs.map((s: any) => (
                <LinkedChip key={s.id} lakota={s.lakotaTitle} english={s.englishTitle} />
              ))}
            </LinkedSection>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6 mb-4">Community verified content</p>
    </div>
  );
}

function LinkedSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium text-gray-500 uppercase">{title}</span>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function LinkedChip({ lakota, english }: { lakota: string; english: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm border border-gray-200">
      <span className="font-medium text-gray-900">{lakota}</span>
      <span className="text-gray-400">-</span>
      <span className="text-gray-500">{english}</span>
    </span>
  );
}
