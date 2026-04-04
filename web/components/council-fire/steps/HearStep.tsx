import { useEffect, useRef } from 'react';
import type { ContentItem } from '../../../hooks/useSeasonalContent';

interface Props {
  item: ContentItem;
  accentColor: string;
}

export function HearStep({ item, accentColor }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {});
      return () => { audio.pause(); audio.src = ''; };
    }
  }, [item.audioUrl]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Pulsing glow circle — no text, just listening */}
      <div
        className="cf-breathe cf-glow-circle mb-8"
        style={{ background: accentColor }}
      />
      <p className="text-sm" style={{ color: 'var(--cf-text-dim)' }}>
        {item.audioUrl ? 'Listen...' : 'Hear...'}
      </p>
    </div>
  );
}
