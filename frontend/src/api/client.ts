import type { Festival, ForumMessage, FlightOffer, HotelOffer, TravelSearchResult } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  body: Record<string, unknown>;
  constructor(message: string, body: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error ?? `Request to ${path} failed with ${res.status}`, body);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getFestivals: (filters?: { genre?: string; vibe?: string; size?: string }) => {
    const params = new URLSearchParams();
    if (filters?.genre) params.set("genre", filters.genre);
    if (filters?.vibe) params.set("vibe", filters.vibe);
    if (filters?.size) params.set("size", filters.size);
    const query = params.toString();
    return request<Festival[]>(`/api/festivals${query ? `?${query}` : ""}`);
  },

  getFeaturedFestivals: () => request<Festival[]>("/api/festivals?featured=true"),

  getFestival: (id: string) => request<Festival>(`/api/festivals/${id}`),

  matchQuiz: (answers: { genre: string; vibe: string; size: string }) =>
    request<{ match: Festival; exact: boolean }>("/api/quiz/match", {
      method: "POST",
      body: JSON.stringify(answers),
    }),

  getForumMessages: () => request<ForumMessage[]>("/api/forum"),

  postForumMessage: (name: string, message: string) =>
    request<ForumMessage>("/api/forum", {
      method: "POST",
      body: JSON.stringify({ name, message }),
    }),

  sendContactMessage: (name: string, email: string, message: string) =>
    request<{ success: true }>("/api/contact", {
      method: "POST",
      body: JSON.stringify({ name, email, message }),
    }),

  searchFlights: (params: {
    festivalId: string;
    origin: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
  }) => {
    const query = new URLSearchParams({
      festivalId: params.festivalId,
      origin: params.origin,
      departureDate: params.departureDate,
      adults: String(params.adults),
      ...(params.returnDate ? { returnDate: params.returnDate } : {}),
    });
    return request<TravelSearchResult<FlightOffer>>(`/api/travel/flights?${query.toString()}`);
  },

  searchHotels: (params: { festivalId: string; checkInDate: string; checkOutDate: string; adults: number }) => {
    const query = new URLSearchParams({
      festivalId: params.festivalId,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: String(params.adults),
    });
    return request<TravelSearchResult<HotelOffer>>(`/api/travel/hotels?${query.toString()}`);
  },
};
