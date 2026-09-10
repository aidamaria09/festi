import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { TravelPlanner } from "../components/TravelPlanner";
import { useFavorites } from "../hooks/useFavorites";
import type { Festival } from "../types";
import "./FestivalDetailPage.css";

export function FestivalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [festival, setFestival] = useState<Festival | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (!id) return;
    api
      .getFestival(id)
      .then(setFestival)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="container detail-page">
        <p>We couldn't find that festival.</p>
        <Link to="/festivals">← Back to festivals</Link>
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="container detail-page">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="container detail-page">
      <Link to="/festivals" className="back-link">
        ← Back to festivals
      </Link>

      <div className="detail-hero">
        <img src={festival.image} alt={festival.name} />
        <div className="detail-info">
          <h2>{festival.name}</h2>
          <p className="detail-meta">
            {festival.country} &middot; {festival.genre} &middot; {festival.vibe} &middot; {festival.size}
          </p>
          <p>{festival.description}</p>
          <div className="detail-actions">
            <a href={festival.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Official site ↗
            </a>
            <button
              className="btn btn-outline"
              onClick={() => toggleFavorite(festival.id)}
              aria-pressed={isFavorite(festival.id)}
            >
              {isFavorite(festival.id) ? "❤️ Favorited" : "🤍 Add to favorites"}
            </button>
          </div>
        </div>
      </div>

      <TravelPlanner festival={festival} />
    </div>
  );
}
