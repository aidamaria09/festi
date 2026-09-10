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
  month: number;
  url: string;
  image: string;
  lat: number;
  lng: number;
  description: string;
  featured: boolean;
}

export interface ForumMessage {
  id: number;
  name: string;
  message: string;
  createdAt: string;
}
