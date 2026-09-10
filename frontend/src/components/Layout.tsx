import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/festivals", label: "Festivals" },
  { to: "/calendar", label: "Calendar" },
  { to: "/forum", label: "Forum" },
];

export function Layout() {
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
