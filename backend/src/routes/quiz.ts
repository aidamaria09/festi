import { Router } from "express";
import { db } from "../db/index.js";
import { toFestival, type FestivalRow } from "../db/festivalRow.js";

export const quizRouter = Router();

quizRouter.post("/match", (req, res) => {
  const { genre, vibe, size } = req.body ?? {};

  if (typeof genre !== "string" || typeof vibe !== "string" || typeof size !== "string") {
    res.status(400).json({ error: "genre, vibe and size are required" });
    return;
  }

  const exact = db
    .prepare("SELECT * FROM festivals WHERE genre = ? AND vibe = ? AND size = ?")
    .get(genre, vibe, size) as FestivalRow | undefined;

  if (exact) {
    res.json({ match: toFestival(exact), exact: true });
    return;
  }

  const byGenre = db.prepare("SELECT * FROM festivals WHERE genre = ?").all(genre) as unknown as FestivalRow[];
  const pool = byGenre.length > 0 ? byGenre : (db.prepare("SELECT * FROM festivals").all() as unknown as FestivalRow[]);
  const fallback = pool[Math.floor(Math.random() * pool.length)];

  res.json({ match: toFestival(fallback), exact: false });
});
