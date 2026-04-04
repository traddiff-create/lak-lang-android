// Pronunciation Guide Routes
// Mounted at /api/pronunciation in app.ts
import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db, pronunciationGuides } from '../db';

const router = Router();

// GET / — List all approved pronunciation guides
// Query params:
//   ?type=vowel   — filter by type (vowel, consonant, diacritic)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    const items = await db
      .select()
      .from(pronunciationGuides)
      .where(
        type && typeof type === 'string'
          ? and(
              eq(pronunciationGuides.reviewStatus, 'approved'),
              eq(pronunciationGuides.type, type as 'vowel' | 'consonant' | 'diacritic')
            )
          : eq(pronunciationGuides.reviewStatus, 'approved')
      );

    res.json({ data: items, count: items.length });
  } catch (error) {
    console.error('Error fetching pronunciation guides:', error);
    res.status(500).json({ error: 'Failed to fetch pronunciation guides' });
  }
});

// GET /:id — Single pronunciation guide
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await db.query.pronunciationGuides.findFirst({
      where: eq(pronunciationGuides.id, id),
    });

    if (!item || item.reviewStatus !== 'approved') {
      return res.status(404).json({ error: 'Pronunciation guide not found' });
    }

    res.json({ data: item });
  } catch (error) {
    console.error('Error fetching pronunciation guide:', error);
    res.status(500).json({ error: 'Failed to fetch pronunciation guide' });
  }
});

export default router;
