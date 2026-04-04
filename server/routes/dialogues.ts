// Dialogue Routes
// Mounted at /api/dialogues in app.ts
import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, dialogueExamples } from '../db';

const router = Router();

// GET / — List all approved dialogues
// Query params:
//   ?type=mini       — filter by type (mini, extended)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    let items;
    if (type && typeof type === 'string') {
      items = await db
        .select()
        .from(dialogueExamples)
        .where(eq(dialogueExamples.type, type as 'mini' | 'extended'));
    } else {
      items = await db
        .select()
        .from(dialogueExamples);
    }

    // Parse JSON fields for response
    const parsed = items.map(item => ({
      ...item,
      lakotaText: JSON.parse(item.lakotaText),
      participants: item.participants ? JSON.parse(item.participants) : [],
      speakerGenders: item.speakerGenders ? JSON.parse(item.speakerGenders) : [],
    }));

    res.json({ data: parsed, count: parsed.length });
  } catch (error) {
    console.error('Error fetching dialogues:', error);
    res.status(500).json({ error: 'Failed to fetch dialogues' });
  }
});

// GET /:id — Single dialogue
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await db.query.dialogueExamples.findFirst({
      where: eq(dialogueExamples.id, id),
    });

    if (!item) {
      return res.status(404).json({ error: 'Dialogue not found' });
    }

    const parsed = {
      ...item,
      lakotaText: JSON.parse(item.lakotaText),
      participants: item.participants ? JSON.parse(item.participants) : [],
      speakerGenders: item.speakerGenders ? JSON.parse(item.speakerGenders) : [],
    };

    res.json({ data: parsed });
  } catch (error) {
    console.error('Error fetching dialogue:', error);
    res.status(500).json({ error: 'Failed to fetch dialogue' });
  }
});

export default router;
