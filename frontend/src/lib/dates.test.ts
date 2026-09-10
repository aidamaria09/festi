import { describe, expect, it } from "vitest";
import { nextOccurrence, suggestedTripDates } from "./dates";

describe("nextOccurrence", () => {
  it("returns this year when the month hasn't happened yet", () => {
    const reference = new Date(Date.UTC(2026, 2, 1)); // March 1, 2026
    const result = nextOccurrence(7, reference); // July
    expect(result.getUTCFullYear()).toBe(2026);
    expect(result.getUTCMonth()).toBe(6);
  });

  it("rolls over to next year when the month has already passed", () => {
    const reference = new Date(Date.UTC(2026, 8, 1)); // September 1, 2026
    const result = nextOccurrence(7, reference); // July
    expect(result.getUTCFullYear()).toBe(2027);
    expect(result.getUTCMonth()).toBe(6);
  });
});

describe("suggestedTripDates", () => {
  it("returns a departure and a later return date", () => {
    const reference = new Date(Date.UTC(2026, 0, 1));
    const { departureDate, returnDate } = suggestedTripDates(8, reference);
    expect(departureDate < returnDate).toBe(true);
    expect(departureDate).toBe("2026-08-15");
    expect(returnDate).toBe("2026-08-19");
  });
});
