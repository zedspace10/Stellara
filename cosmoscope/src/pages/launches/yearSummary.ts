import type { Launch } from "./types";

export interface YearSummary {
  year: number;
  total: number;
  success: number;
  failure: number;
  crewed: number;
  topProvider: string | null;
  topProviderCount: number;
}

export function computeYearSummary(previous: Launch[]): YearSummary {
  const year = new Date().getFullYear();
  const thisYear = previous.filter(l => l.netDate.getFullYear() === year);

  const counts: Record<string, number> = {};
  let success = 0, failure = 0, crewed = 0;
  for (const l of thisYear) {
    if (l.status === "Success") success++;
    else if (l.status === "Failure" || l.status === "Partial Failure") failure++;
    if (l.missionType?.toLowerCase().includes("human") || l.missionType?.toLowerCase().includes("crew")) {
      crewed++;
    }
    counts[l.providerName] = (counts[l.providerName] ?? 0) + 1;
  }
  let topProvider: string | null = null;
  let topProviderCount = 0;
  for (const [name, n] of Object.entries(counts)) {
    if (n > topProviderCount) { topProvider = name; topProviderCount = n; }
  }
  return { year, total: thisYear.length, success, failure, crewed, topProvider, topProviderCount };
}
