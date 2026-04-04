import { Link } from 'react-router-dom';
import { type Season, useSeasonalContent, type ContentItem } from '../../hooks/useSeasonalContent';
import { useLearningLoop, type Step } from '../../hooks/useLearningLoop';
import { HearStep } from './steps/HearStep';
import { PauseStep } from './steps/PauseStep';
import { SeeStep } from './steps/SeeStep';
import { RepeatStep } from './steps/RepeatStep';
import { ConnectStep } from './steps/ConnectStep';
import '../../styles/council-fire.css';

interface Props {
  season: Season;
  onExit: () => void;
}

const NODE_TYPE_COLORS: Record<string, string> = {
  word: '#3b82f6',
  story: '#8b5cf6',
  value: '#10b981',
  person: '#f59e0b',
  place: '#92400e',
  ceremony: '#ef4444',
  song: '#eab308',
};

export function LearningLoop({ season, onExit }: Props) {
  const { items, loading } = useSeasonalContent(season);
  const loop = useLearningLoop(items, season);

  const accentColor = loop.item ? (NODE_TYPE_COLORS[loop.item.nodeType] || '#8b5cf6') : '#8b5cf6';

  if (loading) {
    return (
      <div className="cf-screen">
        <div className="cf-breathe cf-glow-circle" style={{ background: accentColor }} />
      </div>
    );
  }

  if (!loop.item) {
    return (
      <div className="cf-screen">
        <p style={{ color: 'var(--cf-text-muted)' }}>No content available for this season yet.</p>
        <button onClick={onExit} className="mt-6 px-6 py-2 rounded-lg text-sm" style={{ color: 'var(--cf-text)', border: '1px solid rgba(255,255,255,0.1)' }}>
          Choose another season
        </button>
      </div>
    );
  }

  return (
    <div className="cf-screen">
      {/* Escape hatch */}
      <button
        onClick={onExit}
        className="cf-escape absolute top-6 left-6 text-2xl"
        title="Back to seasons"
      >
        &larr;
      </button>
      <Link
        to="/traditional"
        className="cf-escape absolute top-6 right-6 text-2xl"
        title="Traditional view"
      >
        &#8801;
      </Link>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center w-full px-8">
        {renderStep(loop.step, loop.item, accentColor, season, loop.advanceStep, loop.nextItem, loop.skipStep)}
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-8 flex items-center gap-3">
        {['hear', 'pause', 'see', 'repeat', 'connect'].map((s) => (
          <div
            key={s}
            className={`cf-dot ${loop.step === s ? 'cf-dot-active' : ''}`}
          />
        ))}
        <span className="ml-4 text-xs" style={{ color: 'var(--cf-text-dim)' }}>
          {loop.itemIndex + 1} / {loop.totalItems}
        </span>
      </div>
    </div>
  );
}

function renderStep(
  step: Step,
  item: ContentItem,
  accentColor: string,
  season: Season,
  advanceStep: () => void,
  nextItem: () => void,
  skipStep: () => void,
) {
  switch (step) {
    case 'hear':
      return <HearStep item={item} accentColor={accentColor} />;
    case 'pause':
      return <PauseStep accentColor={accentColor} />;
    case 'see':
      return <SeeStep item={item} accentColor={accentColor} season={season} onContinue={advanceStep} />;
    case 'repeat':
      return <RepeatStep item={item} onContinue={advanceStep} onSkip={skipStep} season={season} />;
    case 'connect':
      return <ConnectStep item={item} accentColor={accentColor} onNext={nextItem} />;
  }
}
