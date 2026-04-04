import type { ContentItem } from '../../../hooks/useSeasonalContent';
import type { Season } from '../../../hooks/useSeasonalContent';

interface Props {
  item: ContentItem;
  accentColor: string;
  season: Season;
  onContinue: () => void;
}

export function SeeStep({ item, accentColor, season, onContinue }: Props) {
  const showEnglish = season !== 'summer'; // Summer = challenge mode, Lakota only

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl">
      {/* Lakota text — large, warm */}
      <h2
        className="cf-fade-in lakota-text font-light mb-4"
        style={{
          color: 'var(--cf-text)',
          fontSize: item.nodeType === 'story' ? '2rem' : '3rem',
        }}
      >
        {item.lakota}
      </h2>

      {/* English — smaller, muted */}
      {showEnglish && (
        <p
          className="cf-fade-in mb-4"
          style={{ color: 'var(--cf-text-muted)', fontSize: '1.25rem', animationDelay: '0.8s', opacity: 0 }}
        >
          {item.english}
        </p>
      )}

      {/* Story body preview */}
      {item.body && (
        <p
          className="cf-fade-in text-sm leading-relaxed max-w-lg mt-4"
          style={{ color: 'var(--cf-text-dim)', animationDelay: '1.2s', opacity: 0 }}
        >
          {item.body.slice(0, 300)}{item.body.length > 300 ? '...' : ''}
        </p>
      )}

      {/* Node type indicator */}
      <div
        className="cf-fade-in flex items-center gap-2 mt-6"
        style={{ animationDelay: '1.5s', opacity: 0 }}
      >
        <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--cf-text-dim)' }}>
          {item.nodeType}
        </span>
      </div>

      {/* Continue */}
      <button
        onClick={onContinue}
        className="cf-fade-in mt-10 px-8 py-3 rounded-full text-sm transition-colors"
        style={{
          color: 'var(--cf-text)',
          border: `1px solid ${accentColor}40`,
          background: `${accentColor}10`,
          animationDelay: '2s',
          opacity: 0,
        }}
      >
        Continue
      </button>
    </div>
  );
}
