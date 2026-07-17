import { DOMAINS, TIERS, type Domain, type Fix, type Tier } from "./data";

/* ----------------------------------------------------------------------
   SCORING — ported 1:1 from the original embed (source of truth).
   Same math, same rounding, same stable sort, same tier selection.
   `answers` maps "<domainId>_<questionIndex>" -> selected option index.
   ---------------------------------------------------------------------- */

export type Answers = Record<string, number>;

export interface DomainResult {
  id: string;
  name: string;
  label: string;
  weight: number;
  score: number;
  fix: Fix;
}

export interface Results {
  domains: DomainResult[];
  overall: number;
  tier: Tier;
  lowest: DomainResult[];
}

export function domainScore(d: Domain, answers: Answers): number {
  let sum = 0;
  d.qs.forEach((q, qi) => {
    sum += q.o[answers[d.id + "_" + qi]!]![1];
  });
  return Math.round(sum / d.qs.length);
}

export function computeResults(answers: Answers): Results {
  const ds: DomainResult[] = DOMAINS.map((d) => ({
    id: d.id,
    name: d.name,
    label: d.label,
    weight: d.weight,
    score: domainScore(d, answers),
    fix: d.fix,
  }));
  const overall = Math.round(
    ds.reduce((a, x) => a + x.score * x.weight, 0) / 100,
  );
  const tier = TIERS.filter((t) => overall >= t.min)[0]!;
  const sorted = ds.slice().sort((a, b) => a.score - b.score);
  return { domains: ds, overall, tier, lowest: sorted.slice(0, 2) };
}

export function bandOf(s: number): [name: string, className: string] {
  return s >= 75
    ? ["Green", "b-green"]
    : s >= 50
      ? ["Amber", "b-amber"]
      : ["Red", "b-red"];
}
