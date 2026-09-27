import { NextResponse } from "next/server";

/**
 * Deprecated mock endpoint (Update 1 cleanup).
 * The real matcher lives at POST /api/resume/compare-keywords
 * backed by Gemini + explainable scoring. Kept as a 410 so old
 * clients get a clear migration message instead of fake data.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint is deprecated. Use POST /api/resume/compare-keywords with { jobDescription, resumeText }.",
    },
    { status: 410 }
  );
}
