// Content Routes
// CRUD for vocabulary + cultural content
// Mounted at /api/vocabulary in app.ts
import { Router } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db, vocabularyItems } from '../db';

const router = Router();

// GET / — List approved vocabulary items
// Query params:
//   ?category=greetings   — filter by category
//   ?search=hello         — search lakota or english fields
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;

    // Base query: only approved items are shown to learners
    let query = db
      .select()
      .from(vocabularyItems)
      .where(eq(vocabularyItems.reviewStatus, 'approved'));

    if (category && typeof category === 'string') {
      query = db
        .select()
        .from(vocabularyItems)
        .where(
          sql`${vocabularyItems.reviewStatus} = 'approved' AND ${vocabularyItems.category} = ${category}`
        );
    }

    if (search && typeof search === 'string') {
      const pattern = `%${search}%`;
      query = db
        .select()
        .from(vocabularyItems)
        .where(
          sql`${vocabularyItems.reviewStatus} = 'approved' AND (${vocabularyItems.lakota} LIKE ${pattern} OR ${vocabularyItems.english} LIKE ${pattern})`
        );
    }

    const items = await query;

    res.json({ data: items, count: items.length });
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    res.status(500).json({ error: 'Failed to fetch vocabulary items' });
  }
});

// GET /categories — List distinct categories with counts
router.get('/categories', async (_req, res) => {
  try {
    const results = await db
      .select({
        category: vocabularyItems.category,
        count: sql<number>`count(*)`,
      })
      .from(vocabularyItems)
      .where(eq(vocabularyItems.reviewStatus, 'approved'))
      .groupBy(vocabularyItems.category);

    res.json({ data: results });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /:id — Single vocabulary item with its audio asset
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await db.query.vocabularyItems.findFirst({
      where: eq(vocabularyItems.id, id),
      with: {
        audio: true,
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Vocabulary item not found' });
    }

    // Only show approved items to learners
    if (item.reviewStatus !== 'approved') {
      return res.status(404).json({ error: 'Vocabulary item not found' });
    }

    res.json({ data: item });
  } catch (error) {
    console.error('Error fetching vocabulary item:', error);
    res.status(500).json({ error: 'Failed to fetch vocabulary item' });
  }
});

export default router;
