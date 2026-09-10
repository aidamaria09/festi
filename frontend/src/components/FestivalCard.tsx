import type { Festival } from "../types";
import "./FestivalCard.css";

interface FestivalCardProps {
  festival: Festival;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function FestivalCard({ festival, isFavorite, onToggleFavorite }: FestivalCardProps) {
  return (
    <div className="festival-card">
      {onToggleFavorite && (
        <button
          className={`fav-btn${isFavorite ? " is-favorite" : ""}`}
          onClick={() => onToggleFavorite(festival.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${festival.name} from favorites` : `Add ${festival.name} to favorites`}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      )}
      <a href={festival.url} target="_blank" rel="noopener noreferrer" className="festival-card-link">
        <img src={festival.image} alt={festival.name} loading="lazy" />
        <div className="festival-info">
          <h4>{festival.name}</h4>
          <p>
            {festival.country} &middot; {festival.genre} &middot; {festival.vibe} &middot; {festival.size}
          </p>
          {festival.description && <p className="festival-description">{festival.description}</p>}
        </div>
      </a>
    </div>
  );
}
