// Client for the "Sky Scrapper" API (RapidAPI marketplace, provider "Air Scraper"):
// https://rapidapi.com/apiheya/api/sky-scrapper - a Skyscanner-data wrapper with a
// free BASIC tier. Skyscanner itself has no self-serve public API, so this is the
// closest thing to "real Skyscanner prices" available without a business partnership.

export class SkyscannerError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "SkyscannerError";
    this.status = status;
  }
}

export interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  airline: string;
  stops: number;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
}

const HOST = "sky-scrapper.p.rapidapi.com";

function isConfigured(): boolean {
  return Boolean(process.env.RAPIDAPI_KEY);
}

function headers(): Record<string, string> {
  return {
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY ?? "",
    "X-RapidAPI-Host": HOST,
  };
}

async function skyscannerGet<T>(path: string, params: Record<string, string>, fetchImpl: typeof fetch): Promise<T> {
  const query = new URLSearchParams(params).toString();
  const res = await fetchImpl(`https://${HOST}${path}?${query}`, { headers: headers() });

  if (!res.ok) {
    if (res.status === 429) throw new SkyscannerError("Rate limit reached, please try again shortly", 429);
    throw new SkyscannerError(`Sky Scrapper request failed (${res.status})`, res.status);
  }

  return res.json() as Promise<T>;
}

interface AirportSearchResponse {
  data: Array<{
    navigation: {
      relevantFlightParams: { skyId: string; entityId: string };
    };
  }>;
}

async function resolveAirport(
  query: string,
  fetchImpl: typeof fetch
): Promise<{ skyId: string; entityId: string } | null> {
  const response = await skyscannerGet<AirportSearchResponse>(
    "/api/v1/flights/searchAirport",
    { query },
    fetchImpl
  );

  const match =
    response.data.find((item) => item.navigation.relevantFlightParams.skyId === query.toUpperCase()) ??
    response.data[0];

  return match ? match.navigation.relevantFlightParams : null;
}

// CONFIRMED against a live call (2026-09-10): searchFlights does NOT return itineraries
// synchronously. It kicks off an async search session and replies with only
// { data: { context: { sessionId, status: "complete" }, filterStats: null } } - no
// itineraries. There's presumably a second "poll for results" endpoint (common for
// real-time flight scrapers), but it isn't in the docs available without logging into
// a RapidAPI account. Until that's found, `itineraries` here is always undefined, so
// this always resolves to an empty (but crash-free) offers list - see README.
interface FlightSearchResponse {
  data?: {
    itineraries?: Array<{
      id?: string;
      price?: { raw?: number };
      legs?: Array<{
        departure?: string;
        arrival?: string;
        durationInMinutes?: number;
        stopCount?: number;
        carriers?: { marketing?: Array<{ name?: string }> };
      }>;
    }>;
  };
}

export async function searchFlights(
  params: { origin: string; destination: string; departureDate: string; adults: number; returnDate?: string },
  fetchImpl: typeof fetch = fetch
): Promise<{ configured: boolean; offers: FlightOffer[] }> {
  if (!isConfigured()) return { configured: false, offers: [] };

  // Sequential, not Promise.all: free RapidAPI tiers are often capped at ~1 request/second,
  // and firing both lookups at once reliably triggers a 429 on the very first search.
  const origin = await resolveAirport(params.origin, fetchImpl);
  const destination = await resolveAirport(params.destination, fetchImpl);

  if (!origin || !destination) return { configured: true, offers: [] };

  const query: Record<string, string> = {
    originSkyId: origin.skyId,
    destinationSkyId: destination.skyId,
    originEntityId: origin.entityId,
    destinationEntityId: destination.entityId,
    date: params.departureDate,
    adults: String(params.adults),
    currency: "EUR",
  };
  if (params.returnDate) query.returnDate = params.returnDate;

  const response = await skyscannerGet<FlightSearchResponse>("/api/v1/flights/searchFlights", query, fetchImpl);
  const itineraries = response.data?.itineraries ?? [];

  const offers: FlightOffer[] = [];
  for (const itinerary of itineraries.slice(0, 6)) {
    const leg = itinerary.legs?.[0];
    if (!itinerary.id || itinerary.price?.raw == null || !leg?.departure || !leg?.arrival) continue;

    offers.push({
      id: itinerary.id,
      price: itinerary.price.raw,
      currency: "EUR",
      airline: leg.carriers?.marketing?.[0]?.name ?? "Unknown airline",
      stops: leg.stopCount ?? 0,
      departureTime: leg.departure,
      arrivalTime: leg.arrival,
      durationMinutes: leg.durationInMinutes ?? 0,
    });
  }

  return { configured: true, offers };
}
