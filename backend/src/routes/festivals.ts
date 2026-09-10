import { Router } from "express";
import { db } from "../db/index.js";
import type { Festival } from "../types.js";

export const festivalsRouter = Router();

interface FestivalRow {
  id: string;
  name: string;
  country: string;
  genre: string;
  vibe: string;
  size: string;
  month: number;
  url: string;
  image: string;
  lat: number;
  lng: number;
  description: string;
  featured: number;
}

function toFestival(row: FestivalRow): Festival {
  return { ...row, featured: Boolean(row.featured) } as Festival;
}

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
