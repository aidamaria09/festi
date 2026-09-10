import { useState } from "react";
import { ApiError, api } from "../api/client";
import { suggestedTripDates } from "../lib/dates";
import type { Festival, FlightOffer, HotelOffer } from "../types";
import "./TravelPlanner.css";

type Tab = "flights" | "hotels";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function TravelPlanner({ festival }: { festival: Festival }) {
  const suggested = suggestedTripDates(festival.month);
  const [tab, setTab] = useState<Tab>("flights");
  const [origin, setOrigin] = useState("");
  const [adults, setAdults] = useState(1);
  const [departureDate, setDepartureDate] = useState(suggested.departureDate);
  const [returnDate, setReturnDate] = useState(suggested.returnDate);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingUrl, setBookingUrl] = useState<string | null>(null);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[] | null>(null);
  const [hotelOffers, setHotelOffers] = useState<HotelOffer[] | null>(null);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tab === "flights") {
        if (!origin.trim()) {
          setError("Enter a departure airport code (e.g. OTP, LHR, JFK).");
          setLoading(false);
          return;
        }
        const result = await api.searchFlights({
          festivalId: festival.id,
          origin: origin.trim().toUpperCase(),
          departureDate,
          returnDate,
          adults,
        });
        setBookingUrl(result.bookingSearchUrl);
        setFlightOffers(result.offers);
      } else {
        const result = await api.searchHotels({
          festivalId: festival.id,
          checkInDate: departureDate,
          checkOutDate: returnDate,
          adults,
        });
        setBookingUrl(result.bookingSearchUrl);
        setHotelOffers(result.offers);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        const fallbackUrl = err.body.bookingSearchUrl;
        if (typeof fallbackUrl === "string") setBookingUrl(fallbackUrl);
      } else {
        setError("Something went wrong searching for trip options.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="travel-planner">
      <h3>✈️ Plan your trip</h3>
      <div className="travel-tabs">
        <button
          type="button"
          className={tab === "flights" ? "active" : ""}
          onClick={() => setTab("flights")}
        >
          Flights
        </button>
        <button type="button" className={tab === "hotels" ? "active" : ""} onClick={() => setTab("hotels")}>
          Hotels
        </button>
      </div>

      <form className="travel-form" onSubmit={handleSearch}>
        {tab === "flights" && (
          <label>
            From (airport code)
            <input
              type="text"
              placeholder="e.g. OTP"
              value={origin}
              maxLength={3}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </label>
        )}
        <label>
          {tab === "flights" ? "Depart" : "Check-in"}
          <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
        </label>
        <label>
          {tab === "flights" ? "Return" : "Check-out"}
          <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
        </label>
        <label>
          Travelers
          <input
            type="number"
            min={1}
            max={9}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value) || 1)}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Searching…" : `Search ${tab}`}
        </button>
      </form>

      {error && <p className="travel-error">{error}</p>}

      {tab === "flights" && flightOffers && flightOffers.length > 0 && (
        <ul className="travel-results">
          {flightOffers.map((offer) => (
            <li key={offer.id}>
              <span className="travel-price">
                {offer.price.toFixed(0)} {offer.currency}
              </span>
              <span>{offer.airline}</span>
              <span>{offer.stops === 0 ? "Direct" : `${offer.stops} stop(s)`}</span>
              <span>{formatDuration(offer.durationMinutes)}</span>
              <span>{formatTime(offer.departureTime)}</span>
            </li>
          ))}
        </ul>
      )}
      {tab === "flights" && flightOffers && flightOffers.length === 0 && !error && (
        <p className="travel-note">
          Live prices aren't available for this search right now. Use the search link below to check directly.
        </p>
      )}

      {tab === "hotels" && hotelOffers && hotelOffers.length > 0 && (
        <ul className="travel-results">
          {hotelOffers.map((offer) => (
            <li key={offer.id}>
              <span className="travel-price">
                {offer.price.toFixed(0)} {offer.currency}
              </span>
              <span>{offer.name}</span>
              <span>{offer.ratingStars ? "★".repeat(offer.ratingStars) : ""}</span>
            </li>
          ))}
        </ul>
      )}
      {tab === "hotels" && hotelOffers && hotelOffers.length === 0 && !error && (
        <p className="travel-note">
          Live hotel prices aren't wired up yet. Use the search link below to check on Booking.com.
        </p>
      )}

      {bookingUrl && (
        <a className="btn btn-outline travel-book-link" href={bookingUrl} target="_blank" rel="noopener noreferrer">
          {tab === "flights" ? "Search on Skyscanner ↗" : "Search on Booking.com ↗"}
        </a>
      )}
    </section>
  );
}
