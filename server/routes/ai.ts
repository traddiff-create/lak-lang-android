// AI Routes
// Claude API — conversation and explanation only
// NEVER used to generate Lakota words, phrases, or translations
import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { and, eq, inArray } from 'drizzle-orm';
import { db, vocabularyItems, stories, values, graphEdges } from '../db';
import { prompts } from '../prompts';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/ai/conversation — Claude-powered conversational practice
// Body: { messages: [{role, content}], category?: string }
router.post('/conversation', async (req, res) => {
  try {
    const { messages, category } = req.body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      category?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Fetch approved vocabulary as context — filter by category if provided
    const vocab = await db
      .select()
      .from(vocabularyItems)
      .where(
        category
          ? and(eq(vocabularyItems.reviewStatus, 'approved'), eq(vocabularyItems.category, category))
          : eq(vocabularyItems.reviewStatus, 'approved')
      )
      .limit(30);

    // Fall back to all approved if category returned nothing
    const contextVocab =
      vocab.length > 0
        ? vocab
        : category
          ? await db
              .select()
              .from(vocabularyItems)
              .where(eq(vocabularyItems.reviewStatus, 'approved'))
              .limit(30)
          : vocab;

    const vocabLines = contextVocab
      .map(v => `${v.lakota} = ${v.english}${v.phoneticGuide ? ` (${v.phoneticGuide})` : ''}`)
      .join('\n');

    // Fetch graph context — stories and values connected to vocabulary
    const vocabIds = contextVocab.map(v => v.id);
    let graphContext = '';
    if (vocabIds.length > 0) {
      const edges = await db.select().from(graphEdges).where(
        and(
          eq(graphEdges.targetNodeType, 'word'),
          eq(graphEdges.sourceNodeType, 'story'),
        )
      );
      const storyIds = [...new Set(edges.filter(e => vocabIds.includes(e.targetNodeId)).map(e => e.sourceNodeId))];
      if (storyIds.length > 0) {
        const storyRows = await db.select().from(stories).where(
          and(eq(stories.reviewStatus, 'approved'), inArray(stories.id, storyIds))
        );
        if (storyRows.length > 0) {
          graphContext = '\n\nStory context for this vocabulary:\n' +
            storyRows.map(s => `- "${s.titleLakota}" (${s.titleEnglish}): ${s.body.slice(0, 200)}`).join('\n');
        }
      }

      const valueEdges = await db.select().from(graphEdges).where(eq(graphEdges.targetNodeType, 'value'));
      const valueIds = [...new Set(valueEdges.filter(e => storyIds.includes(e.sourceNodeId)).map(e => e.targetNodeId))];
      if (valueIds.length > 0) {
        const valueRows = await db.select().from(values).where(
          and(eq(values.reviewStatus, 'approved'), inArray(values.id, valueIds))
        );
        if (valueRows.length > 0) {
          graphContext += '\n\nCultural values connected to these stories:\n' +
            valueRows.map(v => `- ${v.lakota} (${v.english}): ${v.description?.slice(0, 150) || ''}`).join('\n');
        }
      }
    }

    const systemPrompt =
      prompts.conversation() + `\n\nApproved vocabulary for this session:\n${vocabLines}` + graphContext;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'Unexpected response from Claude' });
    }

    res.json({ message: content.text });
  } catch (error) {
    console.error('Error in conversation:', error);
    res.status(500).json({ error: 'Failed to process conversation' });
  }
});

// POST /api/ai/quiz — Generate quiz questions from approved vocabulary
// Body: { category?: string, count?: number }
router.post('/quiz', async (req, res) => {
  try {
    const { category, count = 5 } = req.body as {
      category?: string;
      count?: number;
    };

    const vocab = await db
      .select()
      .from(vocabularyItems)
      .where(
        category
          ? and(eq(vocabularyItems.reviewStatus, 'approved'), eq(vocabularyItems.category, category))
          : eq(vocabularyItems.reviewStatus, 'approved')
      );

    if (vocab.length < 4) {
      return res.status(400).json({
        error: 'Not enough approved vocabulary for this category. Need at least 4 items.',
      });
    }

    const limited = vocab.slice(0, 50);
    const vocabContext = limited
      .map(v =>
        JSON.stringify({
          lakota: v.lakota,
          english: v.english,
          phoneticGuide: v.phoneticGuide ?? null,
          category: v.category ?? null,
        })
      )
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: prompts.quiz(),
      messages: [
        {
          role: 'user',
          content: `Generate ${count} quiz questions from these vocabulary items:\n\n${vocabContext}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'Unexpected response from Claude' });
    }

    let quiz;
    try {
      quiz = JSON.parse(content.text);
    } catch {
      console.error('Claude returned invalid JSON for quiz:', content.text);
      return res.status(500).json({ error: 'Failed to parse quiz from Claude' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

export default router;
