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
  airportCode: string;
  cityCode: string;
}

export interface ForumMessage {
  id: number;
  name: string;
  message: string;
  createdAt: string;
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

export interface TravelSearchResult<T> {
  configured: boolean;
  offers: T[];
  bookingSearchUrl: string;
}
