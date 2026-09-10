const FESTIVAL_DURATION_DAYS = 4;

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The next upcoming date (mid-month) that a festival happening in `month` would fall on. */
export function nextOccurrence(month: number, referenceDate: Date = new Date()): Date {
  const year = referenceDate.getFullYear();
  const candidate = new Date(Date.UTC(year, month - 1, 15));
  if (candidate.getTime() < referenceDate.getTime()) {
    return new Date(Date.UTC(year + 1, month - 1, 15));
  }
  return candidate;
}

export function suggestedTripDates(month: number, referenceDate: Date = new Date()) {
  const start = nextOccurrence(month, referenceDate);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + FESTIVAL_DURATION_DAYS);
  return { departureDate: toIso(start), returnDate: toIso(end) };
}
