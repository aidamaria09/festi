import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FestivalCard } from "./FestivalCard";
import type { Festival } from "../types";

const festival: Festival = {
  id: "test-fest",
  name: "<img src=x onerror=alert(1)>",
  country: "Testland",
  genre: "Rock",
  vibe: "Urban",
  size: "Medium",
  month: 6,
  url: "https://example.com",
  image: "https://example.com/img.jpg",
  lat: 0,
  lng: 0,
  description: "A test festival",
  featured: false,
};

describe("FestivalCard", () => {
  it("renders untrusted names as plain text instead of markup", () => {
    render(<FestivalCard festival={festival} />);
    expect(screen.getByText(festival.name)).toBeInTheDocument();
    expect(document.querySelector("img[onerror]")).toBeNull();
  });

  it("calls onToggleFavorite when the favorite button is clicked", async () => {
    const onToggleFavorite = vi.fn();
    render(<FestivalCard festival={festival} isFavorite={false} onToggleFavorite={onToggleFavorite} />);

    screen.getByRole("button").click();

    expect(onToggleFavorite).toHaveBeenCalledWith("test-fest");
  });
});
