// Graph Routes
// Knowledge graph query endpoints — explore, search, stories
import { Router } from 'express';
import { eq, and, or, like, inArray } from 'drizzle-orm';
import {
  db, graphEdges, vocabularyItems, stories, values,
  persons, places, ceremonies, songs,
  type NodeType, type GraphEdge,
} from '../db';
import { getAccessContext, getAllowedAccessLevels } from '../middleware/access';

const router = Router();

// Node table map for dynamic queries
const nodeTableMap = {
  word: vocabularyItems,
  story: stories,
  value: values,
  person: persons,
  place: places,
  ceremony: ceremonies,
  song: songs,
} as const;

// Helper: fetch a node by type + id
async function fetchNode(type: NodeType, id: string) {
  const table = nodeTableMap[type];
  if (!table) return null;
  const rows = await db.select().from(table).where(eq((table as any).id, id));
  return rows[0] ? { ...rows[0], _nodeType: type } : null;
}

// Helper: get display name for a node
function getNodeLabel(node: any, type: NodeType): { lakota: string; english: string } {
  switch (type) {
    case 'word': return { lakota: node.lakota, english: node.english };
    case 'story': return { lakota: node.titleLakota, english: node.titleEnglish };
    case 'value': return { lakota: node.lakota, english: node.english };
    case 'person': return { lakota: node.lakotaName, english: node.englishName };
    case 'place': return { lakota: node.lakotaName, english: node.englishName };
    case 'ceremony': return { lakota: node.lakotaName, english: node.englishName };
    case 'song': return { lakota: node.lakotaTitle, english: node.englishTitle };
    default: return { lakota: '', english: '' };
  }
}

// GET /api/graph/node/:type/:id — single node with edges
router.get('/node/:type/:id', async (req, res) => {
  try {
    const type = req.params.type as NodeType;
    const id = req.params.id;
    const accessLevels = getAllowedAccessLevels(getAccessContext(req));

    const node = await fetchNode(type, id);
    if (!node) return res.status(404).json({ error: 'Node not found' });
    if (!accessLevels.includes(node.accessLevel)) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Fetch edges where this node is source or target
    const [outgoing, incoming] = await Promise.all([
      db.select().from(graphEdges).where(
        and(
          eq(graphEdges.sourceNodeId, id),
          eq(graphEdges.sourceNodeType, type),
          inArray(graphEdges.accessLevel, accessLevels),
        )
      ),
      db.select().from(graphEdges).where(
        and(
          eq(graphEdges.targetNodeId, id),
          eq(graphEdges.targetNodeType, type),
          inArray(graphEdges.accessLevel, accessLevels),
        )
      ),
    ]);

    // Resolve connected nodes
    const resolveEdgeNodes = async (edges: GraphEdge[], direction: 'outgoing' | 'incoming') => {
      return Promise.all(edges.map(async (edge) => {
        const connectedType = direction === 'outgoing' ? edge.targetNodeType : edge.sourceNodeType;
        const connectedId = direction === 'outgoing' ? edge.targetNodeId : edge.sourceNodeId;
        const connectedNode = await fetchNode(connectedType as NodeType, connectedId);
        return {
          edgeId: edge.id,
          relationship: edge.relationshipType,
          nodeType: connectedType,
          nodeId: connectedId,
          label: connectedNode ? getNodeLabel(connectedNode, connectedType as NodeType) : null,
        };
      }));
    };

    const [outgoingResolved, incomingResolved] = await Promise.all([
      resolveEdgeNodes(outgoing, 'outgoing'),
      resolveEdgeNodes(incoming, 'incoming'),
    ]);

    res.json({
      node: { ...node, _nodeType: type },
      outgoing: outgoingResolved,
      incoming: incomingResolved,
    });
  } catch (error) {
    console.error('Error fetching graph node:', error);
    res.status(500).json({ error: 'Failed to fetch node' });
  }
});

// GET /api/graph/explore?nodeId=X&nodeType=Y&depth=2 — BFS subgraph
router.get('/explore', async (req, res) => {
  try {
    const { nodeId, nodeType, depth: depthStr } = req.query;
    const depth = Math.min(parseInt(depthStr as string) || 2, 3); // cap at 3
    const accessLevels = getAllowedAccessLevels(getAccessContext(req));

    if (!nodeId || !nodeType) {
      return res.status(400).json({ error: 'nodeId and nodeType required' });
    }

    const visited = new Set<string>();
    const allNodes: any[] = [];
    const allEdges: GraphEdge[] = [];
    let frontier = [{ id: nodeId as string, type: nodeType as NodeType }];

    for (let d = 0; d <= depth && frontier.length > 0; d++) {
      const nextFrontier: { id: string; type: NodeType }[] = [];

      for (const { id, type } of frontier) {
        const key = `${type}:${id}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const node = await fetchNode(type, id);
        if (!node || !accessLevels.includes(node.accessLevel)) continue;
        if (node.reviewStatus !== 'approved') continue;

        allNodes.push({ ...node, _nodeType: type, _depth: d });

        if (d < depth) {
          const [outgoing, incoming] = await Promise.all([
            db.select().from(graphEdges).where(
              and(
                eq(graphEdges.sourceNodeId, id),
                eq(graphEdges.sourceNodeType, type),
                inArray(graphEdges.accessLevel, accessLevels),
              )
            ),
            db.select().from(graphEdges).where(
              and(
                eq(graphEdges.targetNodeId, id),
                eq(graphEdges.targetNodeType, type),
                inArray(graphEdges.accessLevel, accessLevels),
              )
            ),
          ]);

          for (const edge of [...outgoing, ...incoming]) {
            allEdges.push(edge);
            const connectedId = edge.sourceNodeId === id ? edge.targetNodeId : edge.sourceNodeId;
            const connectedType = edge.sourceNodeId === id ? edge.targetNodeType : edge.sourceNodeType;
            if (!visited.has(`${connectedType}:${connectedId}`)) {
              nextFrontier.push({ id: connectedId, type: connectedType as NodeType });
            }
          }
        }
      }

      frontier = nextFrontier;
    }

    // Deduplicate edges
    const edgeIds = new Set<string>();
    const uniqueEdges = allEdges.filter(e => {
      if (edgeIds.has(e.id)) return false;
      edgeIds.add(e.id);
      return true;
    });

    res.json({
      nodes: allNodes.map(n => ({
        id: n.id,
        type: n._nodeType,
        label: getNodeLabel(n, n._nodeType),
        depth: n._depth,
        accessLevel: n.accessLevel,
      })),
      edges: uniqueEdges.map(e => ({
        id: e.id,
        source: { id: e.sourceNodeId, type: e.sourceNodeType },
        target: { id: e.targetNodeId, type: e.targetNodeType },
        relationship: e.relationshipType,
      })),
    });
  } catch (error) {
    console.error('Error exploring graph:', error);
    res.status(500).json({ error: 'Failed to explore graph' });
  }
});

// GET /api/graph/search?q=term — full-text search across all node types
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const accessLevels = getAllowedAccessLevels(getAccessContext(req));
    const pattern = `%${q}%`;

    const [wordResults, storyResults, valueResults, personResults, placeResults, ceremonyResults, songResults] = await Promise.all([
      db.select().from(vocabularyItems).where(
        and(
          eq(vocabularyItems.reviewStatus, 'approved'),
          inArray(vocabularyItems.accessLevel, accessLevels),
          or(like(vocabularyItems.lakota, pattern), like(vocabularyItems.english, pattern)),
        )
      ),
      db.select().from(stories).where(
        and(
          eq(stories.reviewStatus, 'approved'),
          inArray(stories.accessLevel, accessLevels),
          or(like(stories.titleLakota, pattern), like(stories.titleEnglish, pattern)),
        )
      ),
      db.select().from(values).where(
        and(
          eq(values.reviewStatus, 'approved'),
          inArray(values.accessLevel, accessLevels),
          or(like(values.lakota, pattern), like(values.english, pattern)),
        )
      ),
      db.select().from(persons).where(
        and(
          eq(persons.reviewStatus, 'approved'),
          inArray(persons.accessLevel, accessLevels),
          or(like(persons.lakotaName, pattern), like(persons.englishName, pattern)),
        )
      ),
      db.select().from(places).where(
        and(
          eq(places.reviewStatus, 'approved'),
          inArray(places.accessLevel, accessLevels),
          or(like(places.lakotaName, pattern), like(places.englishName, pattern)),
        )
      ),
      db.select().from(ceremonies).where(
        and(
          eq(ceremonies.reviewStatus, 'approved'),
          inArray(ceremonies.accessLevel, accessLevels),
          or(like(ceremonies.lakotaName, pattern), like(ceremonies.englishName, pattern)),
        )
      ),
      db.select().from(songs).where(
        and(
          eq(songs.reviewStatus, 'approved'),
          inArray(songs.accessLevel, accessLevels),
          or(like(songs.lakotaTitle, pattern), like(songs.englishTitle, pattern)),
        )
      ),
    ]);

    const results = [
      ...wordResults.map(n => ({ id: n.id, type: 'word' as const, label: getNodeLabel(n, 'word') })),
      ...storyResults.map(n => ({ id: n.id, type: 'story' as const, label: getNodeLabel(n, 'story') })),
      ...valueResults.map(n => ({ id: n.id, type: 'value' as const, label: getNodeLabel(n, 'value') })),
      ...personResults.map(n => ({ id: n.id, type: 'person' as const, label: getNodeLabel(n, 'person') })),
      ...placeResults.map(n => ({ id: n.id, type: 'place' as const, label: getNodeLabel(n, 'place') })),
      ...ceremonyResults.map(n => ({ id: n.id, type: 'ceremony' as const, label: getNodeLabel(n, 'ceremony') })),
      ...songResults.map(n => ({ id: n.id, type: 'song' as const, label: getNodeLabel(n, 'song') })),
    ];

    res.json({ results, total: results.length });
  } catch (error) {
    console.error('Error searching graph:', error);
    res.status(500).json({ error: 'Failed to search graph' });
  }
});

// GET /api/graph/stories — list approved stories
router.get('/stories', async (req, res) => {
  try {
    const accessLevels = getAllowedAccessLevels(getAccessContext(req));
    const category = req.query.category as string | undefined;

    let query = db.select().from(stories).where(
      and(
        eq(stories.reviewStatus, 'approved'),
        inArray(stories.accessLevel, accessLevels),
        category ? eq(stories.category, category) : undefined,
      )
    );

    const results = await query;
    res.json({ data: results });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// GET /api/graph/stories/:id — story + all linked nodes
router.get('/stories/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const accessLevels = getAllowedAccessLevels(getAccessContext(req));

    const storyRows = await db.select().from(stories).where(eq(stories.id, id));
    const story = storyRows[0];
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (!accessLevels.includes(story.accessLevel)) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Fetch all outgoing edges from this story
    const edges = await db.select().from(graphEdges).where(
      and(
        eq(graphEdges.sourceNodeId, id),
        eq(graphEdges.sourceNodeType, 'story'),
        inArray(graphEdges.accessLevel, accessLevels),
      )
    );

    // Group edges by target type and resolve nodes
    const linked: Record<string, any[]> = {
      vocabulary: [],
      values: [],
      persons: [],
      places: [],
      ceremonies: [],
      songs: [],
    };

    const typeToKey: Record<string, string> = {
      word: 'vocabulary',
      value: 'values',
      person: 'persons',
      place: 'places',
      ceremony: 'ceremonies',
      song: 'songs',
    };

    await Promise.all(edges.map(async (edge) => {
      const node = await fetchNode(edge.targetNodeType as NodeType, edge.targetNodeId);
      if (node && node.reviewStatus === 'approved') {
        const key = typeToKey[edge.targetNodeType] || edge.targetNodeType;
        if (linked[key]) {
          linked[key].push({
            ...node,
            _relationship: edge.relationshipType,
          });
        }
      }
    }));

    res.json({ story, linked });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

// GET /api/graph/all — all approved nodes for graph visualization
router.get('/all', async (req, res) => {
  try {
    const accessLevels = getAllowedAccessLevels(getAccessContext(req));

    const [wordNodes, storyNodes, valueNodes, personNodes, placeNodes, ceremonyNodes, songNodes, edges] = await Promise.all([
      db.select().from(vocabularyItems).where(and(eq(vocabularyItems.reviewStatus, 'approved'), inArray(vocabularyItems.accessLevel, accessLevels))),
      db.select().from(stories).where(and(eq(stories.reviewStatus, 'approved'), inArray(stories.accessLevel, accessLevels))),
      db.select().from(values).where(and(eq(values.reviewStatus, 'approved'), inArray(values.accessLevel, accessLevels))),
      db.select().from(persons).where(and(eq(persons.reviewStatus, 'approved'), inArray(persons.accessLevel, accessLevels))),
      db.select().from(places).where(and(eq(places.reviewStatus, 'approved'), inArray(places.accessLevel, accessLevels))),
      db.select().from(ceremonies).where(and(eq(ceremonies.reviewStatus, 'approved'), inArray(ceremonies.accessLevel, accessLevels))),
      db.select().from(songs).where(and(eq(songs.reviewStatus, 'approved'), inArray(songs.accessLevel, accessLevels))),
      db.select().from(graphEdges).where(inArray(graphEdges.accessLevel, accessLevels)),
    ]);

    const nodes = [
      ...wordNodes.map(n => ({ id: n.id, type: 'word' as const, label: getNodeLabel(n, 'word') })),
      ...storyNodes.map(n => ({ id: n.id, type: 'story' as const, label: getNodeLabel(n, 'story') })),
      ...valueNodes.map(n => ({ id: n.id, type: 'value' as const, label: getNodeLabel(n, 'value') })),
      ...personNodes.map(n => ({ id: n.id, type: 'person' as const, label: getNodeLabel(n, 'person') })),
      ...placeNodes.map(n => ({ id: n.id, type: 'place' as const, label: getNodeLabel(n, 'place') })),
      ...ceremonyNodes.map(n => ({ id: n.id, type: 'ceremony' as const, label: getNodeLabel(n, 'ceremony') })),
      ...songNodes.map(n => ({ id: n.id, type: 'song' as const, label: getNodeLabel(n, 'song') })),
    ];

    res.json({
      nodes,
      edges: edges.map(e => ({
        id: e.id,
        source: { id: e.sourceNodeId, type: e.sourceNodeType },
        target: { id: e.targetNodeId, type: e.targetNodeType },
        relationship: e.relationshipType,
      })),
    });
  } catch (error) {
    console.error('Error fetching full graph:', error);
    res.status(500).json({ error: 'Failed to fetch graph' });
  }
});

export default router;
