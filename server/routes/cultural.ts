// Cultural Module Routes
// Mounted at /api/cultural in app.ts
import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, culturalModules } from '../db';

const router = Router();

// GET / — List approved cultural modules
router.get('/', async (_req, res) => {
  try {
    const items = await db
      .select()
      .from(culturalModules)
      .where(eq(culturalModules.reviewStatus, 'approved'));

    res.json({ data: items, count: items.length });
  } catch (error) {
    console.error('Error fetching cultural modules:', error);
    res.status(500).json({ error: 'Failed to fetch cultural modules' });
  }
});

// GET /:id — Single cultural module
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await db.query.culturalModules.findFirst({
      where: eq(culturalModules.id, id),
    });

    if (!item || item.reviewStatus !== 'approved') {
      return res.status(404).json({ error: 'Cultural module not found' });
    }

    res.json({ data: item });
  } catch (error) {
    console.error('Error fetching cultural module:', error);
    res.status(500).json({ error: 'Failed to fetch cultural module' });
  }
});

export default router;
