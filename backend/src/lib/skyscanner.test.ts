import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchFlights } from "./skyscanner.js";

const ORIGINAL_ENV = { ...process.env };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function airportResponse(skyId: string, entityId: string) {
  return jsonResponse({
    data: [{ navigation: { relevantFlightParams: { skyId, entityId } } }],
  });
}

describe("searchFlights", () => {
  beforeEach(() => {
    process.env.RAPIDAPI_KEY = "test-key";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it("reports not configured when no RAPIDAPI_KEY is set", async () => {
    delete process.env.RAPIDAPI_KEY;

    const result = await searchFlights({
      origin: "OTP",
      destination: "BRU",
      departureDate: "2026-07-18",
      adults: 1,
    });

    expect(result).toEqual({ configured: false, offers: [] });
  });

  it("resolves both airports then simplifies the flight-search response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(airportResponse("OTP", "1001"))
      .mockResolvedValueOnce(airportResponse("BRU", "2002"))
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            itineraries: [
              {
                id: "itin-1",
                price: { raw: 245.3 },
                legs: [
                  {
                    departure: "2026-07-18T10:00:00",
                    arrival: "2026-07-18T12:35:00",
                    durationInMinutes: 155,
                    stopCount: 0,
                    carriers: { marketing: [{ name: "Wizz Air" }] },
                  },
                ],
              },
            ],
          },
        })
      );

    const result = await searchFlights(
      { origin: "OTP", destination: "BRU", departureDate: "2026-07-18", adults: 1 },
      fetchMock as unknown as typeof fetch
    );

    expect(result.configured).toBe(true);
    expect(result.offers).toEqual([
      {
        id: "itin-1",
        price: 245.3,
        currency: "EUR",
        airline: "Wizz Air",
        stops: 0,
        departureTime: "2026-07-18T10:00:00",
        arrivalTime: "2026-07-18T12:35:00",
        durationMinutes: 155,
      },
    ]);

    expect(fetchMock.mock.calls[2][0]).toContain("originSkyId=OTP");
    expect(fetchMock.mock.calls[2][0]).toContain("destinationEntityId=2002");
  });

  it("skips malformed itineraries instead of throwing", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(airportResponse("OTP", "1001"))
      .mockResolvedValueOnce(airportResponse("BRU", "2002"))
      .mockResolvedValueOnce(
        jsonResponse({ data: { itineraries: [{ id: "broken", price: null, legs: [] }] } })
      );

    const result = await searchFlights(
      { origin: "OTP", destination: "BRU", departureDate: "2026-07-18", adults: 1 },
      fetchMock as unknown as typeof fetch
    );

    expect(result).toEqual({ configured: true, offers: [] });
  });
});
