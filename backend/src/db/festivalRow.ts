import type { Festival } from "../types.js";

export interface FestivalRow {
  id: string;
  name: string;
  country: string;
  genre: string;
  vibe: string;
  size: string;
  month: number;
  url: string;
  image: string;
  lat: number;
  lng: number;
  description: string;
  featured: number;
  airport_code: string;
  city_code: string;
}

export function toFestival(row: FestivalRow): Festival {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    genre: row.genre,
    vibe: row.vibe,
    size: row.size,
    month: row.month,
    url: row.url,
    image: row.image,
    lat: row.lat,
    lng: row.lng,
    description: row.description,
    featured: Boolean(row.featured),
    airportCode: row.airport_code,
    cityCode: row.city_code,
  } as Festival;
}
