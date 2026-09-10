export type Genre = "Rock" | "Techno" | "Pop" | "EDM" | "Indie" | "Jazz" | "Mixed";
export type Vibe = "Urban" | "Nature" | "Beach" | "Castle" | "Mountain";
export type Size = "Intimate" | "Medium" | "Huge";

export interface Festival {
  id: string;
  name: string;
  country: string;
  genre: Genre;
  vibe: Vibe;
  size: Size;
  month: number; // 1-12
  url: string;
  image: string;
  lat: number;
  lng: number;
  description: string;
  featured: boolean;
  airportCode: string; // nearest major IATA airport code, for flight search
  cityCode: string; // Amadeus city code, for hotel search
}

export interface ForumMessage {
  id: number;
  name: string;
  message: string;
  createdAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}
