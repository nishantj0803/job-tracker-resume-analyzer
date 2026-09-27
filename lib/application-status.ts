/**
 * Canonical application pipeline.
 *
 * Applications flow:
 *   Applied → Screening → Interview → Offer / Rejected
 *
 * Job postings (admin-created) use a separate lifecycle:
 * draft / active / closed — see Job.status in lib/actions.ts.
 */

export const APPLICATION_STATUSES = [
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_FUNNEL: ApplicationStatus[] = [
  "applied",
  "screening",
  "interview",
  "offer",
];

/** Terminal states that end the pipeline. */
export const TERMINAL_STATUSES: ApplicationStatus[] = ["offer", "rejected"];

/** Any positive human response (past auto-apply). */
export const RESPONDED_STATUSES: ApplicationStatus[] = [
  "screening",
  "interview",
  "offer",
];

const LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export function normalizeApplicationStatus(
  raw: unknown
): ApplicationStatus {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if ((APPLICATION_STATUSES as readonly string[]).includes(s)) {
    return s as ApplicationStatus;
  }
  // Legacy aliases seen in older data
  if (s === "applies" || s === "submitted") return "applied";
  if (s === "phone screen" || s === "screen") return "screening";
  if (s === "interviewing" || s === "onsite") return "interview";
  if (s === "offered" || s === "hired" || s === "accepted") return "offer";
  if (s === "reject" || s === "declined" || s === "ghosted") return "rejected";
  return "applied";
}

export function statusLabel(status: ApplicationStatus): string {
  return LABELS[status];
}
