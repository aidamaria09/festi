import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useFavorites } from "./useFavorites";

describe("useFavorites", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty and toggles a favorite on", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.isFavorite("tomorrowland")).toBe(false);

    act(() => result.current.toggleFavorite("tomorrowland"));

    expect(result.current.isFavorite("tomorrowland")).toBe(true);
    expect(JSON.parse(localStorage.getItem("festi_favorites")!)).toEqual(["tomorrowland"]);
  });

  it("toggles a favorite back off", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggleFavorite("boom"));
    act(() => result.current.toggleFavorite("boom"));

    expect(result.current.isFavorite("boom")).toBe(false);
  });
});
