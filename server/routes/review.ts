// Review Routes
// Review workflow endpoints for community partner
// State machine: DRAFT → PENDING_REVIEW → APPROVED | REJECTED
import { Router, Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import {
  db, vocabularyItems, culturalModules, pronunciationGuides,
  stories, values, persons, places, ceremonies, songs, graphEdges,
  type NodeType, type AccessLevel, accessLevelEnum,
} from '../db';

const router = Router();

const REVIEWER_TOKEN = process.env.REVIEWER_TOKEN || 'lakota-review-2026';

function requireReviewer(req: Request, res: Response, next: NextFunction) {
  const token =
    (req.headers['x-reviewer-token'] as string | undefined) ||
    (req.query.token as string | undefined);
  if (token !== REVIEWER_TOKEN) {
    return res.status(401).json({ error: 'Reviewer token required' });
  }
  next();
}

// GET /api/review/pending — all pending items across content types
router.get('/pending', requireReviewer, async (_req, res) => {
  try {
    const [vocab, cultural, pronunciation] = await Promise.all([
      db.select().from(vocabularyItems).where(eq(vocabularyItems.reviewStatus, 'pending_review')),
      db.select().from(culturalModules).where(eq(culturalModules.reviewStatus, 'pending_review')),
      db.select().from(pronunciationGuides).where(eq(pronunciationGuides.reviewStatus, 'pending_review')),
    ]);

    res.json({
      data: { vocabulary: vocab, cultural, pronunciation },
      counts: {
        vocabulary: vocab.length,
        cultural: cultural.length,
        pronunciation: pronunciation.length,
        total: vocab.length + cultural.length + pronunciation.length,
      },
    });
  } catch (error) {
    console.error('Error fetching pending items:', error);
    res.status(500).json({ error: 'Failed to fetch pending items' });
  }
});

// PATCH /api/review/vocabulary/:id — approve or reject a vocabulary item
router.patch('/vocabulary/:id', requireReviewer, async (req, res) => {
  try {
    const id = String(req.params.id);
    const { action, notes, reviewedBy } = req.body as {
      action: 'approve' | 'reject';
      notes?: string;
      reviewedBy?: string;
    };

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'action must be "approve" or "reject"' });
    }

    await db
      .update(vocabularyItems)
      .set({
        reviewStatus: action === 'approve' ? 'approved' : 'rejected',
        reviewNotes: notes ?? null,
        reviewedBy: reviewedBy ?? 'community-partner',
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vocabularyItems.id, id));

    res.json({ success: true, id, action });
  } catch (error) {
    console.error('Error updating vocabulary review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// PATCH /api/review/cultural/:id — approve or reject a cultural module
router.patch('/cultural/:id', requireReviewer, async (req, res) => {
  try {
    const id = String(req.params.id);
    const { action, reviewedBy } = req.body as {
      action: 'approve' | 'reject';
      reviewedBy?: string;
    };

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'action must be "approve" or "reject"' });
    }

    await db
      .update(culturalModules)
      .set({
        reviewStatus: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: reviewedBy ?? 'community-partner',
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(culturalModules.id, id));

    res.json({ success: true, id, action });
  } catch (error) {
    console.error('Error updating cultural review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// PATCH /api/review/pronunciation/:id — approve or reject a pronunciation guide
router.patch('/pronunciation/:id', requireReviewer, async (req, res) => {
  try {
    const id = String(req.params.id);
    const { action, reviewedBy } = req.body as {
      action: 'approve' | 'reject';
      reviewedBy?: string;
    };

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'action must be "approve" or "reject"' });
    }

    await db
      .update(pronunciationGuides)
      .set({
        reviewStatus: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: reviewedBy ?? 'community-partner',
        reviewedAt: new Date(),
      })
      .where(eq(pronunciationGuides.id, id));

    res.json({ success: true, id, action });
  } catch (error) {
    console.error('Error updating pronunciation review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// =============================================================================
// Knowledge Graph — Node & Edge management
// =============================================================================

const graphNodeTableMap: Record<string, any> = {
  story: stories,
  value: values,
  person: persons,
  place: places,
  ceremony: ceremonies,
  song: songs,
};

// GET /api/review/pending — extended to include graph node types
// (original handler above covers vocab/cultural/pronunciation)

// POST /api/review/node — create a graph node (enters as draft)
router.post('/node', requireReviewer, async (req, res) => {
  try {
    const { type, ...data } = req.body as { type: NodeType } & Record<string, any>;
    const table = graphNodeTableMap[type];
    if (!table) {
      return res.status(400).json({ error: `Invalid node type: ${type}. Use: story, value, person, place, ceremony, song` });
    }

    const id = uuidv4();
    const now = new Date();

    await db.insert(table).values({
      id,
      ...data,
      reviewStatus: 'draft',
      accessLevel: data.accessLevel || 'public',
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json({ id, type, reviewStatus: 'draft' });
  } catch (error) {
    console.error('Error creating graph node:', error);
    res.status(500).json({ error: 'Failed to create node' });
  }
});

// PATCH /api/review/node/:type/:id — approve or reject a graph node
router.patch('/node/:type/:id', requireReviewer, async (req, res) => {
  try {
    const type = String(req.params.type);
    const id = String(req.params.id);
    const table = graphNodeTableMap[type];
    if (!table) {
      return res.status(400).json({ error: `Invalid node type: ${type}` });
    }

    const { action, notes, reviewedBy } = req.body as {
      action: 'approve' | 'reject';
      notes?: string;
      reviewedBy?: string;
    };

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'action must be "approve" or "reject"' });
    }

    await db.update(table).set({
      reviewStatus: action === 'approve' ? 'approved' : 'rejected',
      reviewNotes: notes ?? null,
      reviewedBy: reviewedBy ?? 'community-partner',
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(table.id, id));

    res.json({ success: true, id, type, action });
  } catch (error) {
    console.error('Error updating graph node review:', error);
    res.status(500).json({ error: 'Failed to update node review' });
  }
});

// PATCH /api/review/node/:type/:id/access — change access level
router.patch('/node/:type/:id/access', requireReviewer, async (req, res) => {
  try {
    const type = String(req.params.type);
    const id = String(req.params.id);
    const table = graphNodeTableMap[type];
    if (!table) {
      return res.status(400).json({ error: `Invalid node type: ${type}` });
    }

    const { accessLevel } = req.body as { accessLevel: AccessLevel };
    if (!accessLevelEnum.includes(accessLevel)) {
      return res.status(400).json({ error: `Invalid access level. Use: ${accessLevelEnum.join(', ')}` });
    }

    await db.update(table).set({
      accessLevel,
      updatedAt: new Date(),
    }).where(eq(table.id, id));

    res.json({ success: true, id, type, accessLevel });
  } catch (error) {
    console.error('Error updating access level:', error);
    res.status(500).json({ error: 'Failed to update access level' });
  }
});

// POST /api/review/edge — create a relationship between nodes
router.post('/edge', requireReviewer, async (req, res) => {
  try {
    const { sourceNodeId, sourceNodeType, targetNodeId, targetNodeType, relationshipType, metadata, accessLevel } = req.body;

    if (!sourceNodeId || !sourceNodeType || !targetNodeId || !targetNodeType || !relationshipType) {
      return res.status(400).json({ error: 'sourceNodeId, sourceNodeType, targetNodeId, targetNodeType, and relationshipType are required' });
    }

    const id = uuidv4();
    await db.insert(graphEdges).values({
      id,
      sourceNodeId,
      sourceNodeType,
      targetNodeId,
      targetNodeType,
      relationshipType,
      metadata: metadata ? JSON.stringify(metadata) : null,
      accessLevel: accessLevel || 'public',
      createdAt: new Date(),
    });

    res.status(201).json({ id, relationshipType });
  } catch (error) {
    console.error('Error creating graph edge:', error);
    res.status(500).json({ error: 'Failed to create edge' });
  }
});

// DELETE /api/review/edge/:id — remove a relationship
router.delete('/edge/:id', requireReviewer, async (req, res) => {
  try {
    const id = String(req.params.id);
    await db.delete(graphEdges).where(eq(graphEdges.id, id));
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting graph edge:', error);
    res.status(500).json({ error: 'Failed to delete edge' });
  }
});

export default router;
