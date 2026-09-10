import { Router } from "express";
import { db } from "../db/index.js";
import { toFestival, type FestivalRow } from "../db/festivalRow.js";

export const festivalsRouter = Router();

festivalsRouter.get("/", (req, res) => {
  const { genre, vibe, size, featured } = req.query;

  const clauses: string[] = [];
  const params: string[] = [];

  if (typeof genre === "string" && genre) {
    clauses.push("genre = ?");
    params.push(genre);
  }
  if (typeof vibe === "string" && vibe) {
    clauses.push("vibe = ?");
    params.push(vibe);
  }
  if (typeof size === "string" && size) {
    clauses.push("size = ?");
    params.push(size);
  }
  if (featured === "true") {
    clauses.push("featured = 1");
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db.prepare(`SELECT * FROM festivals ${where} ORDER BY name`).all(...params) as unknown as FestivalRow[];

  res.json(rows.map(toFestival));
});

festivalsRouter.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM festivals WHERE id = ?").get(req.params.id) as
    | FestivalRow
    | undefined;

  if (!row) {
    res.status(404).json({ error: "Festival not found" });
    return;
  }

  res.json(toFestival(row));
});
