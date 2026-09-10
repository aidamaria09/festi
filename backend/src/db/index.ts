import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { festivalsSeed } from "./festivals.seed.js";

function resolveDbPath(): string {
  if (process.env.NODE_ENV === "test") return ":memory:";
  return process.env.DB_PATH?.trim() || "./data/festi.sqlite";
}

const dbPath = resolveDbPath();
if (dbPath !== ":memory:") {
  mkdirSync(dirname(dbPath), { recursive: true });
}

export const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS festivals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    genre TEXT NOT NULL,
    vibe TEXT NOT NULL,
    size TEXT NOT NULL,
    month INTEGER NOT NULL,
    url TEXT NOT NULL,
    image TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    description TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS forum_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function seedFestivals(): void {
  const { count } = db.prepare("SELECT COUNT(*) as count FROM festivals").get() as {
    count: number;
  };
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO festivals (id, name, country, genre, vibe, size, month, url, image, lat, lng, description, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const f of festivalsSeed) {
    insert.run(
      f.id,
      f.name,
      f.country,
      f.genre,
      f.vibe,
      f.size,
      f.month,
      f.url,
      f.image,
      f.lat,
      f.lng,
      f.description,
      f.featured ? 1 : 0
    );
  }
}

seedFestivals();
