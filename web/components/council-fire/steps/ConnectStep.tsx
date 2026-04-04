import { useState, useEffect } from 'react';
import { fetchGraphExplore, type GraphNode, type NodeType } from '../../../lib/api';
import type { ContentItem } from '../../../hooks/useSeasonalContent';

interface Props {
  item: ContentItem;
  accentColor: string;
  onNext: () => void;
}

const NODE_COLORS: Record<string, string> = {
  word: '#3b82f6',
  story: '#8b5cf6',
  value: '#10b981',
  person: '#f59e0b',
  place: '#92400e',
  ceremony: '#ef4444',
  song: '#eab308',
};

const NODE_LABELS: Record<string, string> = {
  word: 'Word',
  story: 'Story',
  value: 'Value',
  person: 'Person',
  place: 'Place',
  ceremony: 'Ceremony',
  song: 'Song',
};

export function ConnectStep({ item, accentColor, onNext }: Props) {
  const [connections, setConnections] = useState<GraphNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraphExplore(item.id, item.nodeType as NodeType, 1)
      .then(data => {
        // Filter out the current item itself
        setConnections(data.nodes.filter(n => n.id !== item.id));
      })
      .catch(() => setConnections([]))
      .finally(() => setLoading(false));
  }, [item.id, item.nodeType]);

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-3xl">
      {/* Current item */}
      <h2
        className="lakota-text font-light mb-2"
        style={{ color: 'var(--cf-text)', fontSize: '2rem' }}
      >
        {item.lakota}
      </h2>
      <p className="text-sm mb-8" style={{ color: 'var(--cf-text-muted)' }}>
        {item.english}
      </p>

      {/* Connections */}
      {loading ? (
        <div className="cf-breathe cf-glow-circle" style={{ background: accentColor, width: 60, height: 60 }} />
      ) : connections.length > 0 ? (
        <div className="cf-fade-in">
          <p className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--cf-text-dim)' }}>
            Connected
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {connections.slice(0, 8).map((node, i) => (
              <div
                key={node.id}
                className="cf-chip cf-fade-in flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: `${NODE_COLORS[node.type] || '#6b7280'}15`,
                  border: `1px solid ${NODE_COLORS[node.type] || '#6b7280'}30`,
                  animationDelay: `${i * 0.15}s`,
                  opacity: 0,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: NODE_COLORS[node.type] || '#6b7280' }}
                />
                <span className="text-sm font-light" style={{ color: 'var(--cf-text)' }}>
                  {node.label.lakota}
                </span>
                <span className="text-xs" style={{ color: 'var(--cf-text-dim)' }}>
                  {NODE_LABELS[node.type] || node.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'var(--cf-text-dim)' }}>
          No connections yet
        </p>
      )}

      {/* Next */}
      <button
        onClick={onNext}
        className="cf-fade-in mt-10 px-8 py-3 rounded-full text-sm transition-colors"
        style={{
          color: 'var(--cf-text)',
          border: `1px solid ${accentColor}40`,
          background: `${accentColor}10`,
          animationDelay: '1s',
          opacity: 0,
        }}
      >
        Next
      </button>
    </div>
  );
}
