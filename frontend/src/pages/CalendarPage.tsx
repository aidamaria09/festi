import { useEffect, useState } from "react";
import { api } from "../api/client";
import { groupFestivalsByMonth, MONTH_NAMES } from "../lib/calendar";
import type { Festival } from "../types";
import "./CalendarPage.css";

export function CalendarPage() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .getFestivals()
      .then(setFestivals)
      .catch(() => setError(true));
  }, []);

  const months = groupFestivalsByMonth(festivals);

  return (
    <div className="container calendar-page">
      <h2 className="section-title">Festival calendar</h2>
      {error && <p className="status-text error">Could not load festivals from the API.</p>}
      <div className="calendar-grid">
        {months.map((monthFestivals, index) => (
          <div className="month-card" key={MONTH_NAMES[index]}>
            <h3>{MONTH_NAMES[index]}</h3>
            {monthFestivals.length === 0 ? (
              <p className="no-festivals">No festivals added yet</p>
            ) : (
              <ul>
                {monthFestivals.map((festival) => (
                  <li key={festival.id}>
                    🎵{" "}
                    <a href={festival.url} target="_blank" rel="noopener noreferrer">
                      {festival.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
