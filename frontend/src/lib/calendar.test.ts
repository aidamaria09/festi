import { describe, expect, it } from "vitest";
import { groupFestivalsByMonth, MONTH_NAMES } from "./calendar";
import type { Festival } from "../types";

function makeFestival(overrides: Partial<Festival>): Festival {
  return {
    id: "x",
    name: "X",
    country: "Nowhere",
    genre: "Rock",
    vibe: "Urban",
    size: "Medium",
    month: 1,
    url: "https://example.com",
    image: "https://example.com/img.jpg",
    lat: 0,
    lng: 0,
    description: "",
    featured: false,
    airportCode: "XXX",
    cityCode: "XXX",
    ...overrides,
  };
}

describe("groupFestivalsByMonth", () => {
  it("returns 12 buckets", () => {
    expect(groupFestivalsByMonth([])).toHaveLength(12);
    expect(MONTH_NAMES).toHaveLength(12);
  });

  it("places each festival in its month bucket, sorted by name", () => {
    const festivals = [
      makeFestival({ name: "Zeta", month: 7 }),
      makeFestival({ name: "Alpha", month: 7 }),
      makeFestival({ name: "Beach Bash", month: 3 }),
    ];

    const buckets = groupFestivalsByMonth(festivals);

    expect(buckets[6].map((f) => f.name)).toEqual(["Alpha", "Zeta"]);
    expect(buckets[2].map((f) => f.name)).toEqual(["Beach Bash"]);
    expect(buckets[0]).toEqual([]);
  });
});
