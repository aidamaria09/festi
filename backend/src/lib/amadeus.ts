export class AmadeusError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AmadeusError";
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

export interface HotelOffer {
  id: string;
  name: string;
  price: number;
  currency: string;
  ratingStars: number | null;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

function isConfigured(): boolean {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

function baseUrl(): string {
  return process.env.AMADEUS_BASE_URL?.trim() || "https://test.api.amadeus.com";
}

async function getAccessToken(fetchImpl: typeof fetch): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const res = await fetchImpl(`${baseUrl()}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID ?? "",
      client_secret: process.env.AMADEUS_CLIENT_SECRET ?? "",
    }),
  });

  if (!res.ok) {
    throw new AmadeusError("Could not authenticate with Amadeus", res.status);
  }

  const body = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return cachedToken.token;
}

async function amadeusGet<T>(
  path: string,
  params: Record<string, string>,
  fetchImpl: typeof fetch
): Promise<T> {
  const token = await getAccessToken(fetchImpl);
  const query = new URLSearchParams(params).toString();
  const res = await fetchImpl(`${baseUrl()}${path}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new AmadeusError("Amadeus rate limit reached, please try again shortly", 429);
    }
    throw new AmadeusError(`Amadeus request failed (${res.status})`, res.status);
  }

  return res.json() as Promise<T>;
}

interface FlightOffersResponse {
  data: Array<{
    id: string;
    price: { total: string; currency: string };
    itineraries: Array<{
      duration: string;
      segments: Array<{
        departure: { at: string };
        arrival: { at: string };
        carrierCode: string;
      }>;
    }>;
  }>;
}

function parseIsoDurationMinutes(iso: string): number {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  const hours = Number(match?.[1] ?? 0);
  const minutes = Number(match?.[2] ?? 0);
  return hours * 60 + minutes;
}

export async function searchFlights(
  params: { origin: string; destination: string; departureDate: string; adults: number; returnDate?: string },
  fetchImpl: typeof fetch = fetch
): Promise<{ configured: boolean; offers: FlightOffer[] }> {
  if (!isConfigured()) return { configured: false, offers: [] };

  const query: Record<string, string> = {
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departureDate,
    adults: String(params.adults),
    max: "6",
    currencyCode: "EUR",
  };
  if (params.returnDate) query.returnDate = params.returnDate;

  const response = await amadeusGet<FlightOffersResponse>("/v2/shopping/flight-offers", query, fetchImpl);

  const offers = response.data.map((offer) => {
    const firstItinerary = offer.itineraries[0];
    const firstSegment = firstItinerary.segments[0];
    const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];

    return {
      id: offer.id,
      price: Number(offer.price.total),
      currency: offer.price.currency,
      airline: firstSegment.carrierCode,
      stops: firstItinerary.segments.length - 1,
      departureTime: firstSegment.departure.at,
      arrivalTime: lastSegment.arrival.at,
      durationMinutes: parseIsoDurationMinutes(firstItinerary.duration),
    };
  });

  return { configured: true, offers };
}

interface HotelListResponse {
  data: Array<{ hotelId: string }>;
}

interface HotelOffersResponse {
  data: Array<{
    hotel: { hotelId: string; name: string; rating?: string };
    offers: Array<{ price: { total: string; currency: string } }>;
  }>;
  warnings?: unknown[];
}

export async function searchHotels(
  params: { cityCode: string; checkInDate: string; checkOutDate: string; adults: number },
  fetchImpl: typeof fetch = fetch
): Promise<{ configured: boolean; offers: HotelOffer[] }> {
  if (!isConfigured()) return { configured: false, offers: [] };

  const list = await amadeusGet<HotelListResponse>(
    "/v1/reference-data/locations/hotels/by-city",
    { cityCode: params.cityCode },
    fetchImpl
  );

  const hotelIds = list.data.slice(0, 20).map((h) => h.hotelId);
  if (hotelIds.length === 0) return { configured: true, offers: [] };

  const offersResponse = await amadeusGet<HotelOffersResponse>(
    "/v3/shopping/hotel-offers",
    {
      hotelIds: hotelIds.join(","),
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: String(params.adults),
      currency: "EUR",
    },
    fetchImpl
  );

  const offers = offersResponse.data
    .filter((entry) => entry.offers.length > 0)
    .slice(0, 8)
    .map((entry) => ({
      id: entry.hotel.hotelId,
      name: entry.hotel.name,
      price: Number(entry.offers[0].price.total),
      currency: entry.offers[0].price.currency,
      ratingStars: entry.hotel.rating ? Number(entry.hotel.rating) : null,
    }));

  return { configured: true, offers };
}
