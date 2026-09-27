import {
  APPLICATION_FUNNEL,
  normalizeApplicationStatus,
  type ApplicationStatus,
} from "./application-status";

/**
 * Pure, unit-testable helpers for analytics + explainable resume matching.
 * Kept free of Next.js / Mongo imports so vitest can run them in isolation.
 */

export interface FunnelStage {
  stage: ApplicationStatus | "rejected";
  count: number;
  /** Share of total applications that reached this stage. */
  reachRate: number;
  /** Share that progressed from the previous funnel stage. */
  conversionFromPrevious: number | null;
}

export interface PipelineMetrics {
  total: number;
  responded: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  funnel: FunnelStage[];
}

export function computePipelineMetrics(
  rawStatuses: unknown[]
): PipelineMetrics {
  const normalized = rawStatuses.map(normalizeApplicationStatus);
  const total = normalized.length;

  const countOf = (s: string) =>
    normalized.filter((x) => x === s).length;

  const responded = normalized.filter((s) =>
    ["screening", "interview", "offer"].includes(s)
  ).length;
  const interviews = normalized.filter((s) =>
    ["interview", "offer"].includes(s)
  ).length;
  const offers = countOf("offer");

  const pct = (n: number) =>
    total > 0 ? Math.round((n / total) * 100) : 0;

  // Funnel is cumulative: everyone starts at applied; reaching
  // screening implies applied, reaching interview implies screening, etc.
  // Rank: applied(0) < screening(1) < interview(2) < offer(3). Rejected
  // is terminal and shown separately.
  const rank: Record<string, number> = {
    applied: 0,
    screening: 1,
    interview: 2,
    offer: 3,
    rejected: -1,
  };
  const reached = (stage: ApplicationStatus) =>
    normalized.filter(
      (s) => s !== "rejected" && (rank[s] ?? 0) >= (rank[stage] ?? 0)
    ).length;

  const funnelCounts: Record<string, number> = {
    applied: total,
    screening: reached("screening"),
    interview: reached("interview"),
    offer: offers,
  };

  const funnel: FunnelStage[] = APPLICATION_FUNNEL.map((stage, i) => {
    const count = funnelCounts[stage] ?? 0;
    const prev =
      i === 0 ? null : (funnelCounts[APPLICATION_FUNNEL[i - 1]] ?? 0);
    return {
      stage,
      count,
      reachRate: pct(count),
      conversionFromPrevious:
        prev === null ? null : prev > 0 ? Math.round((count / prev) * 100) : 0,
    };
  });

  // Rejected is terminal — appended outside the forward funnel.
  funnel.push({
    stage: "rejected",
    count: countOf("rejected"),
    reachRate: pct(countOf("rejected")),
    conversionFromPrevious: null,
  });

  return {
    total,
    responded,
    responseRate: pct(responded),
    interviewRate: pct(interviews),
    offerRate: pct(offers),
    funnel,
  };
}

// ---------------------------------------------------------------------------
// Explainable match-score parsing / normalization
// ---------------------------------------------------------------------------

export interface MatchBreakdown {
  skillsMatch: number;
  experienceOverlap: number;
  seniorityFit: number;
}

export interface ExplainedMatch {
  score: number;
  matched: string[];
  missing: string[];
  /** e.g. "4/6 core requirements" */
  experienceOverlap: string;
  breakdown: MatchBreakdown;
  summary: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function toStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) =>
      typeof x === "string" ? x.trim() : x?.skill ? String(x.skill) : ""
    )
    .filter(Boolean)
    .slice(0, 50);
}

/**
 * Normalize raw Gemini JSON into a defensible ExplainedMatch.
 * Accepts both the new structured shape and the legacy
 * { matching, missing, score } shape.
 */
export function normalizeMatchResult(raw: unknown): ExplainedMatch {
  const r = (raw ?? {}) as Record<string, unknown>;
  const matched = toStringList(r["matched"] ?? r["matching"]);
  const missing = toStringList(r["missing"]);

  const rawScore = Number(r["score"] ?? 0);
  const score = Number.isFinite(rawScore) ? clamp(rawScore) : 0;

  const b = (r["breakdown"] ?? {}) as Record<string, unknown>;
  const breakdown: MatchBreakdown = {
    skillsMatch: clamp(Number(b["skillsMatch"] ?? score)),
    experienceOverlap: clamp(Number(b["experienceOverlap"] ?? score)),
    seniorityFit: clamp(Number(b["seniorityFit"] ?? score)),
  };

  const expRaw = r["experienceOverlap"];
  const experienceOverlap =
    typeof expRaw === "string" && expRaw.trim() !== ""
      ? expRaw.trim()
      : typeof r["experienceMatched"] === "number" &&
          typeof r["experienceRequired"] === "number"
        ? `${r["experienceMatched"]}/${r["experienceRequired"]} core requirements`
        : matched.length + missing.length > 0
          ? `${matched.length}/${matched.length + missing.length} core requirements`
          : "0/0 core requirements";

  const summary =
    typeof r["summary"] === "string" && r["summary"].trim() !== ""
      ? r["summary"].trim()
      : score >= 75
        ? "Strong alignment — tailor the missing keywords into relevant bullets."
        : score >= 50
          ? "Partial alignment — closing the missing-skill gap would lift this."
          : "Weak alignment — significant gaps vs. this job description.";

  return { score, matched, missing, experienceOverlap, breakdown, summary };
}

/** Legacy shape for backwards-compatible API consumers. */
export function toLegacyMatchShape(m: ExplainedMatch) {
  return {
    matching: m.matched,
    missing: m.missing,
    score: m.score,
    matched: m.matched,
    experienceOverlap: m.experienceOverlap,
    breakdown: m.breakdown,
    summary: m.summary,
  };
}
