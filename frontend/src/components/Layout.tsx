import { NavLink, Outlet } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import "./Layout.css";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/festivals", label: "Festivals" },
  { to: "/forum", label: "Forum" },
];

export function Layout() {
  const { favorites } = useFavorites();

  return (
    <div className="page-hero-bg">
      <header className="site-header">
        <img src="/logo.png" alt="FESTI logo" className="site-logo" />
        <h1>FESTI</h1>
      </header>
      <nav className="site-nav">
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/favorites">
              🤍 Favorites{favorites.length > 0 && <span className="nav-badge">{favorites.length}</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>
          Created by <strong>Aida Staicu</strong> &amp; <strong>Alessia Tecu</strong> · FESTI
        </p>
      </footer>
    </div>
  );
}
