import express from 'express';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { contentRouter, aiRouter, audioRouter, reviewRouter, authRouter, pronunciationRouter, dialoguesRouter, culturalRouter, graphRouter } from './routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Routes
app.use('/api/vocabulary', contentRouter);
app.use('/api/ai', aiRouter);
app.use('/api/audio', audioRouter);
app.use('/api/review', reviewRouter);
app.use('/api/auth', authRouter);
app.use('/api/pronunciation', pronunciationRouter);
app.use('/api/dialogues', dialoguesRouter);
app.use('/api/cultural', culturalRouter);
app.use('/api/graph', graphRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Production: serve Vite build output
const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback — serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
