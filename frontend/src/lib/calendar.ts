import type { Festival } from "../types";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function groupFestivalsByMonth(festivals: Festival[]): Festival[][] {
  const buckets: Festival[][] = Array.from({ length: 12 }, () => []);
  for (const festival of festivals) {
    const index = festival.month - 1;
    if (index >= 0 && index < 12) {
      buckets[index].push(festival);
    }
  }
  return buckets.map((month) => [...month].sort((a, b) => a.name.localeCompare(b.name)));
}
