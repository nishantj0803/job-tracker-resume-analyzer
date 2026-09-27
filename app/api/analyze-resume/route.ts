// app/api/analyze-resume/route.ts
// Legacy alias — the canonical endpoint is POST /api/resume/analyze.
// Both proxy to the Python NLP service at PYTHON_BACKEND_URL.
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 413 }
      );
    }

    const pythonServiceUrl =
      process.env.PYTHON_BACKEND_URL || "http://localhost:5001/analyze";

    const pythonFormData = new FormData();
    pythonFormData.append("file", file);

    const pythonResponse = await fetch(pythonServiceUrl, {
      method: "POST",
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      return NextResponse.json(
        { error: "Failed to analyze resume", details: errorText.slice(0, 500) },
        { status: pythonResponse.status }
      );
    }

    const analysisResult = await pythonResponse.json();
    return NextResponse.json(analysisResult);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to analyze resume",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
