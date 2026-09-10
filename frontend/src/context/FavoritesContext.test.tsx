import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { FavoritesProvider, useFavorites } from "./FavoritesContext";

function wrapper({ children }: { children: ReactNode }) {
  return <FavoritesProvider>{children}</FavoritesProvider>;
}

describe("FavoritesContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty and toggles a favorite on", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    expect(result.current.isFavorite("tomorrowland")).toBe(false);

    act(() => result.current.toggleFavorite("tomorrowland"));

    expect(result.current.isFavorite("tomorrowland")).toBe(true);
    expect(JSON.parse(localStorage.getItem("festi_favorites")!)).toEqual(["tomorrowland"]);
  });

  it("toggles a favorite back off", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    act(() => result.current.toggleFavorite("boom"));
    act(() => result.current.toggleFavorite("boom"));

    expect(result.current.isFavorite("boom")).toBe(false);
  });

  it("shares state across every consumer under the same provider", () => {
    function Toggler() {
      const { toggleFavorite } = useFavorites();
      return <button onClick={() => toggleFavorite("sziget")}>toggle</button>;
    }
    function Display() {
      const { isFavorite } = useFavorites();
      return <span>{isFavorite("sziget") ? "favorited" : "not favorited"}</span>;
    }

    render(
      <FavoritesProvider>
        <Toggler />
        <Display />
      </FavoritesProvider>
    );

    expect(screen.getByText("not favorited")).toBeInTheDocument();
    act(() => screen.getByText("toggle").click());
    expect(screen.getByText("favorited")).toBeInTheDocument();
  });

  it("throws when used outside a FavoritesProvider", () => {
    expect(() => renderHook(() => useFavorites())).toThrow(/FavoritesProvider/);
  });
});
