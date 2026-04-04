import { useMemo } from 'react';

const STAR_COUNT = 150;

export function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: STAR_COUNT }, (_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 4,
    })),
  []);

  return (
    <div className="museum-stars">
      {stars.map((s, i) => (
        <div
          key={i}
          className="museum-star-particle"
          style={{
            left: s.left + '%',
            top: s.top + '%',
            width: s.size + 'px',
            height: s.size + 'px',
            animationDelay: s.delay + 's',
            animationDuration: s.duration + 's',
          }}
        />
      ))}
    </div>
  );
}
