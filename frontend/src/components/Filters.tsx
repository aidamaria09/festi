import { genreOptions, sizeOptions, vibeOptions } from "../data/content";
import "./Filters.css";

export interface FilterState {
  genre: string;
  vibe: string;
  size: string;
}

interface FiltersProps {
  value: FilterState;
  onChange: (value: FilterState) => void;
}

export function Filters({ value, onChange }: FiltersProps) {
  return (
    <div className="filters">
      <select
        value={value.genre}
        onChange={(e) => onChange({ ...value, genre: e.target.value })}
        aria-label="Filter by genre"
      >
        <option value="">Genre</option>
        {genreOptions.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <select
        value={value.vibe}
        onChange={(e) => onChange({ ...value, vibe: e.target.value })}
        aria-label="Filter by vibe"
      >
        <option value="">Vibe</option>
        {vibeOptions.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
      <select
        value={value.size}
        onChange={(e) => onChange({ ...value, size: e.target.value })}
        aria-label="Filter by size"
      >
        <option value="">Size</option>
        {sizeOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
