import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

describe("GET /api/travel/flights", () => {
  it("requires festivalId, origin and departureDate", async () => {
    const res = await request(app).get("/api/travel/flights");
    expect(res.status).toBe(400);
  });

  it("404s for an unknown festival", async () => {
    const res = await request(app)
      .get("/api/travel/flights")
      .query({ festivalId: "nope", origin: "OTP", departureDate: "2026-08-01" });
    expect(res.status).toBe(404);
  });

  it("returns configured:false with a working deep link when no API key is set", async () => {
    const res = await request(app)
      .get("/api/travel/flights")
      .query({ festivalId: "tomorrowland", origin: "OTP", departureDate: "2026-07-18" });

    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(false);
    expect(res.body.offers).toEqual([]);
    expect(res.body.bookingSearchUrl).toContain("skyscanner.net/transport/flights/otp/bru/");
  });
});

describe("GET /api/travel/hotels", () => {
  it("requires festivalId, checkInDate and checkOutDate", async () => {
    const res = await request(app).get("/api/travel/hotels");
    expect(res.status).toBe(400);
  });

  it("returns a booking.com deep link built from the festival's city", async () => {
    const res = await request(app).get("/api/travel/hotels").query({
      festivalId: "electric-castle",
      checkInDate: "2026-07-15",
      checkOutDate: "2026-07-19",
    });

    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(false);
    expect(res.body.bookingSearchUrl).toContain("booking.com/searchresults.html");
    expect(res.body.bookingSearchUrl).toContain("ss=Cluj-Napoca");
  });
});
