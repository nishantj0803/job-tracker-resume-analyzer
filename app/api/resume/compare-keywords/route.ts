// File: app/api/resume/compare-keywords/route.ts
// Description: API route to compare keywords between a job description and resume text.

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { compareKeywords } from "@/lib/gemini";

const bodySchema = z.object({
  jobDescription: z.string().trim().min(20, "Job description is too short.").max(20000),
  resumeText: z.string().trim().min(20, "Resume text is too short.").max(20000),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload received." },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid request body." },
      { status: 400 }
    );
  }

  try {
    const result = await compareKeywords(
      parsed.data.jobDescription,
      parsed.data.resumeText
    );

    if ("error" in result && result.error) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to compare keywords.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
