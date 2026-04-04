import { Link } from 'react-router-dom';
import { type Season, detectSeason } from '../../hooks/useSeasonalContent';
import '../../styles/council-fire.css';

interface Props {
  onSeasonSelect: (season: Season) => void;
}

const SEASONS: Array<{
  season: Season;
  lakota: string;
  english: string;
  subtitle: string;
  color: string;
  glow: string;
}> = [
  { season: 'winter', lakota: 'Waniyetu', english: 'Winter', subtitle: 'Listening', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.2)' },
  { season: 'spring', lakota: 'Wetu', english: 'Spring', subtitle: 'Words', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.2)' },
  { season: 'summer', lakota: 'Bloketu', english: 'Summer', subtitle: 'Practice', color: '#10b981', glow: 'rgba(16, 185, 129, 0.2)' },
  { season: 'fall', lakota: 'Ptanyetu', english: 'Fall', subtitle: 'Meaning', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)' },
];

export function CouncilFireEntry({ onSeasonSelect }: Props) {
  const detected = detectSeason();

  return (
    <div className="cf-screen">
      {/* Escape hatch */}
      <Link
        to="/traditional"
        className="cf-escape absolute top-6 right-6 text-2xl"
        title="Traditional view"
      >
        &#8801;
      </Link>

      {/* Title */}
      <div className="cf-fade-in text-center mb-16">
        <h1
          className="text-5xl font-light tracking-wide mb-3 lakota-text"
          style={{ color: 'var(--cf-text)' }}
        >
          Lakota
        </h1>
        <p
          className="text-lg tracking-widest uppercase"
          style={{ color: 'var(--cf-text-dim)' }}
        >
          Language &amp; Culture
        </p>
      </div>

      {/* Season prompt */}
      <p
        className="cf-fade-in text-center mb-10"
        style={{ color: 'var(--cf-text-muted)', animationDelay: '0.5s', opacity: 0 }}
      >
        What season calls to you?
      </p>

      {/* Season cards */}
      <div
        className="cf-fade-in flex flex-wrap justify-center gap-6 px-6 max-w-3xl"
        style={{ animationDelay: '1s', opacity: 0 }}
      >
        {SEASONS.map(s => (
          <button
            key={s.season}
            onClick={() => onSeasonSelect(s.season)}
            className="cf-season-card flex flex-col items-center px-8 py-6 rounded-2xl border"
            style={{
              borderColor: s.season === detected ? s.color : 'rgba(255,255,255,0.08)',
              background: s.season === detected ? s.glow : 'rgba(255,255,255,0.03)',
            }}
          >
            <span className="text-2xl font-light lakota-text mb-1" style={{ color: s.color }}>
              {s.lakota}
            </span>
            <span className="text-sm" style={{ color: 'var(--cf-text-muted)' }}>
              {s.english}
            </span>
            <span className="text-xs mt-2" style={{ color: 'var(--cf-text-dim)' }}>
              {s.subtitle}
            </span>
            {s.season === detected && (
              <span className="text-[10px] mt-2 px-2 py-0.5 rounded-full" style={{ color: s.color, background: s.glow }}>
                current
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <p
        className="cf-fade-in absolute bottom-6 text-xs"
        style={{ color: 'var(--cf-text-dim)', animationDelay: '2s', opacity: 0 }}
      >
        Community-verified content
      </p>
    </div>
  );
}
