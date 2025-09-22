import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve(process.cwd(), 'dev.db');
if (!fs.existsSync(dbPath)) {
  // noop: schema will be created if prisma migration already ran; otherwise fail gracefully
}

const db = new Database(dbPath);

// Ensure minimal schema exists to allow discovery without Prisma generate
db.exec(`CREATE TABLE IF NOT EXISTS JobPost (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote INTEGER,
  description TEXT NOT NULL DEFAULT '',
  requirements TEXT,
  seniority TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  salary TEXT,
  raw TEXT NOT NULL DEFAULT '{}',
  discoveredAt DATETIME NOT NULL,
  status TEXT NOT NULL
);`);

export function upsertJobPost(post: {
  source: string;
  url: string;
  title: string;
  company: string;
  location?: string;
}) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO JobPost (id, source, url, title, company, location, description, requirements, seniority, tags, salary, raw, discoveredAt, status)
     VALUES (lower(hex(randomblob(16))), @source, @url, @title, @company, @location, '', NULL, NULL, '[]', NULL, '{}', @now, 'new')
     ON CONFLICT(url) DO UPDATE SET title=excluded.title, location=excluded.location`
  ).run({ ...post, now });
}


