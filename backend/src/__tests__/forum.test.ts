import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("POST /api/forum", () => {
  it("rejects an empty message", async () => {
    const res = await request(app).post("/api/forum").send({ name: "Aida", message: "" });
    expect(res.status).toBe(400);
  });

  it("stores and returns a new message", async () => {
    const res = await request(app)
      .post("/api/forum")
      .send({ name: "Aida", message: "Can't wait for Sziget!" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Aida");
    expect(res.body.message).toBe("Can't wait for Sziget!");

    const list = await request(app).get("/api/forum");
    expect(list.body.some((m: { id: number }) => m.id === res.body.id)).toBe(true);
  });
});

describe("POST /api/quiz/match", () => {
  it("returns an exact match when one exists", async () => {
    const res = await request(app)
      .post("/api/quiz/match")
      .send({ genre: "EDM", vibe: "Castle", size: "Medium" });

    expect(res.status).toBe(200);
    expect(res.body.exact).toBe(true);
    expect(res.body.match.id).toBe("electric-castle");
  });
});
