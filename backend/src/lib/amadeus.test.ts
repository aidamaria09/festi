import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchFlights } from "./amadeus.js";

const ORIGINAL_ENV = { ...process.env };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("searchFlights", () => {
  beforeEach(() => {
    process.env.AMADEUS_CLIENT_ID = "test-id";
    process.env.AMADEUS_CLIENT_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it("reports not configured when no credentials are set", async () => {
    delete process.env.AMADEUS_CLIENT_ID;
    delete process.env.AMADEUS_CLIENT_SECRET;

    const result = await searchFlights({
      origin: "OTP",
      destination: "BRU",
      departureDate: "2026-07-18",
      adults: 1,
    });

    expect(result).toEqual({ configured: false, offers: [] });
  });

  it("authenticates then simplifies the flight-offers response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ access_token: "token-123", expires_in: 1800 }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: [
            {
              id: "1",
              price: { total: "245.30", currency: "EUR" },
              itineraries: [
                {
                  duration: "PT2H35M",
                  segments: [
                    {
                      departure: { at: "2026-07-18T10:00:00" },
                      arrival: { at: "2026-07-18T12:35:00" },
                      carrierCode: "TO",
                    },
                  ],
                },
              ],
            },
          ],
        })
      );

    const result = await searchFlights(
      { origin: "OTP", destination: "BRU", departureDate: "2026-07-18", adults: 1 },
      fetchMock as unknown as typeof fetch
    );

    expect(result.configured).toBe(true);
    expect(result.offers).toEqual([
      {
        id: "1",
        price: 245.3,
        currency: "EUR",
        airline: "TO",
        stops: 0,
        departureTime: "2026-07-18T10:00:00",
        arrivalTime: "2026-07-18T12:35:00",
        durationMinutes: 155,
      },
    ]);

    const tokenCall = fetchMock.mock.calls[0];
    expect(tokenCall[0]).toContain("/v1/security/oauth2/token");
    const flightCall = fetchMock.mock.calls[1];
    expect(flightCall[0]).toContain("originLocationCode=OTP");
    expect(flightCall[1].headers.Authorization).toBe("Bearer token-123");
  });
});
