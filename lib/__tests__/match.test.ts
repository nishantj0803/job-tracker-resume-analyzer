import { describe, expect, it } from "vitest";
import { computePipelineMetrics, normalizeMatchResult } from "../match";

describe("computePipelineMetrics", () => {
  it("returns zeros for no applications", () => {
    const m = computePipelineMetrics([]);
    expect(m.total).toBe(0);
    expect(m.responseRate).toBe(0);
    expect(m.funnel.find((f) => f.stage === "applied")?.count).toBe(0);
  });

  it("builds a cumulative funnel Applied → Screening → Interview → Offer", () => {
    const m = computePipelineMetrics([
      "applied",
      "applied",
      "screening",
      "interview",
      "offer",
      "rejected",
    ]);
    expect(m.total).toBe(6);
    // applied is cumulative (everyone)
    expect(m.funnel[0]).toMatchObject({ stage: "applied", count: 6 });
    // screening reached by screening+interview+offer = 3
    expect(m.funnel[1]).toMatchObject({ stage: "screening", count: 3 });
    // interview reached by interview+offer = 2
    expect(m.funnel[2]).toMatchObject({ stage: "interview", count: 2 });
    expect(m.funnel[3]).toMatchObject({ stage: "offer", count: 1 });
    expect(m.responseRate).toBe(50); // 3/6 responded
    expect(m.interviewRate).toBe(33); // 2/6
    expect(m.offerRate).toBe(17); // 1/6 rounded
  });

  it("normalizes legacy aliases", () => {
    const m = computePipelineMetrics(["Interviewing", "OFFERED", "ghosted"]);
    expect(m.total).toBe(3);
    expect(m.offerRate).toBe(33);
  });

  it("handles conversionFromPrevious safely on empty previous stage", () => {
    const m = computePipelineMetrics(["applied"]);
    expect(m.funnel[1].conversionFromPrevious).toBe(0);
  });
});

describe("normalizeMatchResult", () => {
  it("normalizes the legacy { matching, missing, score } shape", () => {
    const m = normalizeMatchResult({
      matching: ["Python", "SQL"],
      missing: ["Kubernetes"],
      score: 78,
    });
    expect(m.score).toBe(78);
    expect(m.matched).toEqual(["Python", "SQL"]);
    expect(m.missing).toEqual(["Kubernetes"]);
    expect(m.experienceOverlap).toBe("2/3 core requirements");
    expect(m.summary).toContain("Strong");
  });

  it("clamps out-of-range scores and breakdowns", () => {
    const m = normalizeMatchResult({
      score: 240,
      matched: [],
      missing: [],
      breakdown: { skillsMatch: -5, experienceOverlap: 999, seniorityFit: 50 },
    });
    expect(m.score).toBe(100);
    expect(m.breakdown.skillsMatch).toBe(0);
    expect(m.breakdown.experienceOverlap).toBe(100);
  });

  it("prefers explicit experienceOverlap strings", () => {
    const m = normalizeMatchResult({
      score: 60,
      matched: ["React"],
      missing: ["AWS"],
      experienceOverlap: "4/6 core requirements",
    });
    expect(m.experienceOverlap).toBe("4/6 core requirements");
  });
});
