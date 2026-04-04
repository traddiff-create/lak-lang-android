import { useState, useEffect, useCallback, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { fetchGraphAll, fetchGraphSearch, type GraphNode, type NodeType } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

const NODE_COLORS: Record<NodeType, string> = {
  word: '#3b82f6',      // blue
  story: '#8b5cf6',     // purple
  value: '#10b981',     // green
  person: '#f59e0b',    // orange
  place: '#92400e',     // brown
  ceremony: '#ef4444',  // red
  song: '#eab308',      // yellow
};

const NODE_LABELS: Record<NodeType, string> = {
  word: 'Word',
  story: 'Story',
  value: 'Value',
  person: 'Person',
  place: 'Place',
  ceremony: 'Ceremony',
  song: 'Song',
};

interface ForceNode {
  id: string;
  type: NodeType;
  label: { lakota: string; english: string };
  x?: number;
  y?: number;
}

interface ForceLink {
  source: string;
  target: string;
  relationship: string;
}

export function GraphExplorer() {
  const [graphData, setGraphData] = useState<{ nodes: ForceNode[]; links: ForceLink[] }>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<ForceNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GraphNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const graphRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadGraph();
  }, []);

  async function loadGraph() {
    try {
      setLoading(true);
      const data = await fetchGraphAll();
      const nodes = data.nodes.map(n => ({
        id: n.id,
        type: n.type,
        label: n.label,
      }));
      const nodeIds = new Set(nodes.map(n => n.id));
      const links = data.edges
        .filter(e => nodeIds.has(e.source.id) && nodeIds.has(e.target.id))
        .map(e => ({
          source: e.source.id,
          target: e.target.id,
          relationship: e.relationship,
        }));
      setGraphData({ nodes, links });
    } catch (e) {
      setError('Failed to load knowledge graph');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const { results } = await fetchGraphSearch(q);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 500);
      graphRef.current.zoom(3, 500);
    }
  }, []);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const size = node.type === 'story' ? 8 : 6;
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = NODE_COLORS[node.type as NodeType] || '#6b7280';
    ctx.fill();

    // Label
    ctx.font = '4px sans-serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'center';
    ctx.fillText(node.label?.lakota || '', node.x, node.y + size + 5);
  }, []);

  function navigateToNode(node: GraphNode) {
    if (node.type === 'story') {
      navigate(`/stories/${node.id}`);
    } else {
      // Focus in graph
      const graphNode = graphData.nodes.find(n => n.id === node.id);
      if (graphNode) handleNodeClick(graphNode);
    }
    setSearchResults([]);
    setSearchQuery('');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Knowledge Graph</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {searchResults.map(r => (
                <button
                  key={r.id}
                  onClick={() => navigateToNode(r)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: NODE_COLORS[r.type] }}
                  />
                  <span className="text-sm font-medium">{r.label.lakota}</span>
                  <span className="text-xs text-gray-500">{r.label.english}</span>
                  <span className="ml-auto text-xs text-gray-400">{NODE_LABELS[r.type]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Graph Canvas */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden relative">
          {graphData.nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No nodes yet</p>
                <p className="text-sm">Add stories, values, and other content through the reviewer portal to see the knowledge graph.</p>
              </div>
            </div>
          ) : (
            <ForceGraph2D
              ref={graphRef}
              graphData={graphData}
              nodeCanvasObject={paintNode}
              onNodeClick={handleNodeClick}
              linkColor={() => '#d1d5db'}
              linkWidth={1.5}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={0.8}
              cooldownTicks={100}
              enableNodeDrag={true}
            />
          )}
        </div>

        {/* Detail Sidebar */}
        <div className="w-72 bg-white rounded-xl border border-gray-200 p-4 overflow-y-auto">
          {selectedNode ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: NODE_COLORS[selectedNode.type] }}
                />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {NODE_LABELS[selectedNode.type]}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {selectedNode.label.lakota}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedNode.label.english}
              </p>

              {selectedNode.type === 'story' && (
                <button
                  onClick={() => navigate(`/stories/${selectedNode.id}`)}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                >
                  View Story
                </button>
              )}

              {/* Connected edges */}
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Connections</h4>
                {graphData.links
                  .filter(l => {
                    const src = typeof l.source === 'string' ? l.source : (l.source as any).id;
                    const tgt = typeof l.target === 'string' ? l.target : (l.target as any).id;
                    return src === selectedNode.id || tgt === selectedNode.id;
                  })
                  .map((l, i) => {
                    const src = typeof l.source === 'string' ? l.source : (l.source as any).id;
                    const tgt = typeof l.target === 'string' ? l.target : (l.target as any).id;
                    const otherId = src === selectedNode.id ? tgt : src;
                    const other = graphData.nodes.find(n => n.id === otherId);
                    return (
                      <div key={i} className="flex items-center gap-2 py-1.5 text-sm">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: other ? NODE_COLORS[other.type] : '#6b7280' }}
                        />
                        <span className="text-gray-700">{other?.label.lakota || otherId}</span>
                        <span className="ml-auto text-xs text-gray-400">{l.relationship.replace(/_/g, ' ')}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <p className="text-sm">Click a node to see details</p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Legend</h4>
            <div className="space-y-1">
              {(Object.entries(NODE_LABELS) as [NodeType, string][]).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: NODE_COLORS[type] }}
                  />
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
