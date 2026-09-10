import { Router } from "express";
import { db } from "../db/index.js";
import type { ForumMessage } from "../types.js";

export const forumRouter = Router();

const NAME_MAX = 60;
const MESSAGE_MAX = 500;

interface ForumRow {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

function toForumMessage(row: ForumRow): ForumMessage {
  return { id: row.id, name: row.name, message: row.message, createdAt: row.created_at };
}

forumRouter.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM forum_messages ORDER BY created_at DESC")
    .all() as unknown as ForumRow[];
  res.json(rows.map(toForumMessage));
});

forumRouter.post("/", (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!name || !message) {
    res.status(400).json({ error: "name and message are required" });
    return;
  }
  if (name.length > NAME_MAX || message.length > MESSAGE_MAX) {
    res.status(400).json({ error: `name must be under ${NAME_MAX} chars, message under ${MESSAGE_MAX}` });
    return;
  }

  const info = db
    .prepare("INSERT INTO forum_messages (name, message) VALUES (?, ?)")
    .run(name, message);

  const row = db
    .prepare("SELECT * FROM forum_messages WHERE id = ?")
    .get(info.lastInsertRowid) as unknown as ForumRow;

  res.status(201).json(toForumMessage(row));
});
