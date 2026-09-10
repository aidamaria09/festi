import type { Festival, ForumMessage } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request to ${path} failed with ${res.status}`);
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
};
