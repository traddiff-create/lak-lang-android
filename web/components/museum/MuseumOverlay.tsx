import type { GraphNode, GraphEdge } from '../../lib/api';

interface MuseumOverlayProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onClose: () => void;
  onNavigate: (node: GraphNode) => void;
}

export function MuseumOverlay({ node, edges, allNodes, onClose, onNavigate }: MuseumOverlayProps) {
  if (!node) return null;

  // Find connected nodes via edges
  const connected = edges
    .filter(e =>
      (e.source.id === node.id && e.source.type === node.type) ||
      (e.target.id === node.id && e.target.type === node.type)
    )
    .map(e => {
      const otherId = e.source.id === node.id && e.source.type === node.type
        ? e.target
        : e.source;
      const otherNode = allNodes.find(n => n.id === otherId.id && n.type === otherId.type);
      return otherNode ? { node: otherNode, relationship: e.relationship } : null;
    })
    .filter(Boolean) as { node: GraphNode; relationship: string }[];

  return (
    <>
      <div
        className={`museum-overlay-backdrop ${node ? 'visible' : ''}`}
        onClick={onClose}
      />
      <div
        className={`museum-overlay ${node ? 'visible' : ''}`}
        onClick={onClose}
      >
        <div
          className="museum-overlay-content"
          onClick={e => e.stopPropagation()}
        >
          <div className="museum-overlay-type" data-type={node.type}>
            {node.type}
          </div>

          <div className="museum-overlay-lakota">
            {node.label.lakota || '—'}
          </div>

          <div className="museum-overlay-english">
            {node.label.english}
          </div>

          {connected.length > 0 && (
            <div className="museum-overlay-connections">
              <div className="museum-overlay-connections-label">
                connected ({connected.length})
              </div>
              {connected.map((c, i) => (
                <button
                  key={i}
                  className="museum-overlay-chip"
                  onClick={() => onNavigate(c.node)}
                  title={c.relationship}
                >
                  {c.node.label.lakota || c.node.label.english}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
