import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Database path - SQLite for dev, PostgreSQL for prod (via DATABASE_URL)
const DATABASE_PATH = process.env.DATABASE_URL || './data/laklang.db';

// Create SQLite connection
const sqlite = new Database(DATABASE_PATH);

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL');

// Create Drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Export schema types and tables
export * from './schema';
