import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/festivals", () => {
  it("returns the full seeded list", async () => {
    const res = await request(app).get("/api/festivals");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(15);
    expect(res.body[0]).toHaveProperty("genre");
  });

  it("filters by genre", async () => {
    const res = await request(app).get("/api/festivals?genre=Techno");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    for (const festival of res.body) {
      expect(festival.genre).toBe("Techno");
    }
  });
});

describe("GET /api/festivals/:id", () => {
  it("returns a single festival", async () => {
    const res = await request(app).get("/api/festivals/tomorrowland");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Tomorrowland");
  });

  it("404s for an unknown id", async () => {
    const res = await request(app).get("/api/festivals/does-not-exist");
    expect(res.status).toBe(404);
  });
});
