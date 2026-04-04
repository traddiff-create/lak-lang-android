// System prompts loader
// All Claude system prompts live here as .txt files
// Load at server startup - never write prompts inline in route handlers

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const promptsDir = dirname(fileURLToPath(import.meta.url));

export function loadPrompt(name: string): string {
  const filePath = join(promptsDir, `${name}.txt`);
  return readFileSync(filePath, 'utf-8');
}

export const prompts = {
  conversation: () => loadPrompt('conversation'),
  quiz: () => loadPrompt('quiz'),
};
