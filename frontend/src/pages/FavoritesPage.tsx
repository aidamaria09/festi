import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { FestivalCard } from "../components/FestivalCard";
import { useFavorites } from "../context/FavoritesContext";
import type { Festival } from "../types";
import "./FavoritesPage.css";

export function FavoritesPage() {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [allFestivals, setAllFestivals] = useState<Festival[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .getFestivals()
      .then(setAllFestivals)
      .catch(() => setError(true));
  }, []);

  const favoriteFestivals = allFestivals?.filter((f) => favorites.includes(f.id)) ?? [];

  return (
    <div className="container favorites-page">
      <h2 className="section-title">🤍 My Favorites</h2>

      {error && <p className="status-text error">Could not load festivals from the API.</p>}

      {!error && allFestivals && favoriteFestivals.length === 0 && (
        <div className="favorites-empty">
          <p>You haven't favorited any festivals yet.</p>
          <Link to="/festivals" className="btn btn-primary">
            Browse festivals
          </Link>
        </div>
      )}

      {favoriteFestivals.length > 0 && (
        <div className="festival-grid">
          {favoriteFestivals.map((festival) => (
            <FestivalCard
              key={festival.id}
              festival={festival}
              isFavorite={isFavorite(festival.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
