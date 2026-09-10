import { Route, BrowserRouter, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { FavoritesProvider } from "./context/FavoritesContext";
import { FavoritesPage } from "./pages/FavoritesPage";
import { FestivalDetailPage } from "./pages/FestivalDetailPage";
import { FestivalsPage } from "./pages/FestivalsPage";
import { ForumPage } from "./pages/ForumPage";
import { HomePage } from "./pages/HomePage";

export default function App() {
  return (
    <FavoritesProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="festivals" element={<FestivalsPage />} />
            <Route path="festivals/:id" element={<FestivalDetailPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="forum" element={<ForumPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
  );
}
