import { useEffect, useState } from "react";
import { api } from "../api/client";
import { FestivalCard } from "../components/FestivalCard";
import { Filters, type FilterState } from "../components/Filters";
import { useFavorites } from "../context/FavoritesContext";
import type { Festival } from "../types";
import "./FestivalsPage.css";

const EMPTY_FILTERS: FilterState = { genre: "", vibe: "", size: "" };

export function FestivalsPage() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    setLoading(true);
    api
      .getFestivals(filters)
      .then(setFestivals)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="container festivals-page">
      <h2 className="section-title">Play and pick your bliss this summer!</h2>
      <Filters value={filters} onChange={setFilters} />

      {loading && <p className="status-text">Loading festivals…</p>}
      {error && <p className="status-text error">Could not load festivals from the API.</p>}
      {!loading && !error && festivals.length === 0 && (
        <p className="status-text">No festivals match these filters yet.</p>
      )}

      <div className="festival-grid">
        {festivals.map((festival) => (
          <FestivalCard
            key={festival.id}
            festival={festival}
            isFavorite={isFavorite(festival.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
