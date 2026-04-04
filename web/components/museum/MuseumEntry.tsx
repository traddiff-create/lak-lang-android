import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchGraphAll, type GraphNode, type GraphEdge } from '../../lib/api';
import { detectSeason } from '../../hooks/useSeasonalContent';
import { CosmosEngine } from './CosmosEngine';
import { MuseumOverlay } from './MuseumOverlay';
import { StarField } from './StarField';
import { getSeasonalDirection, type Direction } from './directions';
import '../../styles/museum.css';

export function MuseumEntry() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());

  const season = detectSeason();
  const seasonalDir = getSeasonalDirection(season);

  useEffect(() => {
    fetchGraphAll()
      .then(data => {
        setNodes(data.nodes);
        setEdges(data.edges);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setVisitedIds(prev => new Set(prev).add(node.type + ':' + node.id));
  }, []);

  const handleDirectionClick = useCallback((dir: Direction) => {
    setActiveDirection(prev => prev === dir.key ? null : dir.key);
  }, []);

  const handleOverlayClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleOverlayNavigate = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  // Keyboard: Escape closes overlay or exits room, R resets view
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedNode) setSelectedNode(null);
        else if (activeDirection) setActiveDirection(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedNode, activeDirection]);

  if (loading) {
    return (
      <div className="museum" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StarField />
        <div style={{ color: 'var(--museum-ink-dim)', fontSize: '0.8rem', letterSpacing: '0.15em', zIndex: 2 }}>
          loading the cosmos...
        </div>
      </div>
    );
  }

  return (
    <div className="museum">
      <StarField />

      <CosmosEngine
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        onDirectionClick={handleDirectionClick}
        activeDirection={activeDirection}
        seasonalDirection={seasonalDir}
        focusedNode={selectedNode}
        visitedIds={visitedIds}
      />

      <MuseumOverlay
        node={selectedNode}
        edges={edges}
        allNodes={nodes}
        onClose={handleOverlayClose}
        onNavigate={handleOverlayNavigate}
      />

      <nav className="museum-nav">
        {activeDirection && (
          <>
            <button onClick={() => setActiveDirection(null)}>overview</button>
            <span className="museum-nav-dot">&middot;</span>
          </>
        )}
        <Link to="/">council fire</Link>
        <span className="museum-nav-dot">&middot;</span>
        <Link to="/traditional">traditional</Link>
      </nav>
    </div>
  );
}
