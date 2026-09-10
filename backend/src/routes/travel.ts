import { Router } from "express";
import { db } from "../db/index.js";
import { toFestival, type FestivalRow } from "../db/festivalRow.js";
import { AmadeusError, searchFlights, searchHotels } from "../lib/amadeus.js";

export const travelRouter = Router();

// Amadeus city codes map cleanly onto the destination city names Skyscanner/Booking expect.
const CITY_NAMES: Record<string, string> = {
  BRU: "Brussels",
  BUD: "Budapest",
  CLJ: "Cluj-Napoca",
  LIS: "Lisbon",
  BCN: "Barcelona",
  PUY: "Pula",
  BEG: "Belgrade",
  GDN: "Gdansk",
  PAR: "Paris",
  AMS: "Amsterdam",
  BSL: "Basel",
  ZAD: "Zadar",
  BER: "Berlin",
  PDV: "Plovdiv",
};

function skyscannerUrl(origin: string, destination: string, departureDate: string, returnDate?: string): string {
  const format = (d: string) => d.slice(2).replace(/-/g, "");
  const path = returnDate
    ? `${origin.toLowerCase()}/${destination.toLowerCase()}/${format(departureDate)}/${format(returnDate)}/`
    : `${origin.toLowerCase()}/${destination.toLowerCase()}/${format(departureDate)}/`;
  return `https://www.skyscanner.net/transport/flights/${path}`;
}

function bookingUrl(cityCode: string, checkIn: string, checkOut: string, adults: number): string {
  const params = new URLSearchParams({
    ss: CITY_NAMES[cityCode] ?? cityCode,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(adults),
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function getFestival(id: string) {
  const row = db.prepare("SELECT * FROM festivals WHERE id = ?").get(id) as FestivalRow | undefined;
  return row ? toFestival(row) : null;
}

travelRouter.get("/flights", async (req, res) => {
  const { festivalId, origin, departureDate, returnDate, adults } = req.query;

  if (typeof festivalId !== "string" || typeof origin !== "string" || typeof departureDate !== "string") {
    res.status(400).json({ error: "festivalId, origin and departureDate are required" });
    return;
  }

  const festival = getFestival(festivalId);
  if (!festival) {
    res.status(404).json({ error: "Festival not found" });
    return;
  }

  const adultsCount = Number(adults) > 0 ? Number(adults) : 1;
  const bookingSearchUrl = skyscannerUrl(
    origin.toUpperCase(),
    festival.airportCode,
    departureDate,
    typeof returnDate === "string" ? returnDate : undefined
  );

  try {
    const { configured, offers } = await searchFlights({
      origin: origin.toUpperCase(),
      destination: festival.airportCode,
      departureDate,
      returnDate: typeof returnDate === "string" ? returnDate : undefined,
      adults: adultsCount,
    });

    res.json({ configured, offers, bookingSearchUrl });
  } catch (err) {
    const status = err instanceof AmadeusError ? err.status : 502;
    res.status(status).json({
      error: err instanceof Error ? err.message : "Flight search failed",
      bookingSearchUrl,
    });
  }
});

travelRouter.get("/hotels", async (req, res) => {
  const { festivalId, checkInDate, checkOutDate, adults } = req.query;

  if (typeof festivalId !== "string" || typeof checkInDate !== "string" || typeof checkOutDate !== "string") {
    res.status(400).json({ error: "festivalId, checkInDate and checkOutDate are required" });
    return;
  }

  const festival = getFestival(festivalId);
  if (!festival) {
    res.status(404).json({ error: "Festival not found" });
    return;
  }

  const adultsCount = Number(adults) > 0 ? Number(adults) : 1;
  const bookingSearchUrl = bookingUrl(festival.cityCode, checkInDate, checkOutDate, adultsCount);

  try {
    const { configured, offers } = await searchHotels({
      cityCode: festival.cityCode,
      checkInDate,
      checkOutDate,
      adults: adultsCount,
    });

    res.json({ configured, offers, bookingSearchUrl });
  } catch (err) {
    const status = err instanceof AmadeusError ? err.status : 502;
    res.status(status).json({
      error: err instanceof Error ? err.message : "Hotel search failed",
      bookingSearchUrl,
    });
  }
});
