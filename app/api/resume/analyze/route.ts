// File: app/api/resume/analyze/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { logger, LogCategory, serializeErrorForResponse } from "@/lib/logger";

export async function POST(request: NextRequest) {
  logger.info(LogCategory.API, "/api/resume/analyze POST request received");

  // Use the environment variable for the Python backend
  const pythonEndpoint = process.env.PYTHON_BACKEND_URL || "http://localhost:5001/analyze";

  try {
    const clientFormData = await request.formData();
    const file = clientFormData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No resume file provided." }, { status: 400 });
    }

    const pythonNativeFormData = new FormData();
    pythonNativeFormData.append("file", file); // Use "file" if that's what your backend expects

    logger.info(LogCategory.API, "Forwarding file to Python backend", { endpoint: pythonEndpoint });
    
    const pythonResponse = await fetch(pythonEndpoint, {
      method: "POST",
      body: pythonNativeFormData, 
    });

    const responseBodyText = await pythonResponse.text();

    if (!pythonResponse.ok) {
      logger.error(LogCategory.API, "Python backend error", {
        status: pythonResponse.status,
        responsePreview: responseBodyText.substring(0, 500)
      });
      // Return the HTML error from Vercel if that's what we got
      if (responseBodyText.includes("<!DOCTYPE html>")) {
        return NextResponse.json({ error: "Routing error: The backend call was incorrectly routed to the frontend." }, { status: 500 });
      }
      return NextResponse.json({ error: `Analysis service failed: ${responseBodyText}` }, { status: pythonResponse.status });
    }

    try {
      const analysisResult = JSON.parse(responseBodyText);
      return NextResponse.json(analysisResult);
    } catch (e) {
      logger.error(LogCategory.API, "Failed to parse JSON response from Python backend", { error: e });
      return NextResponse.json({ error: "Received malformed analysis data from the Python service." }, { status: 500 });
    }

  } catch (error: unknown) {
    logger.error(LogCategory.API, "Error in /api/resume/analyze", { error });
    const serializedError = serializeErrorForResponse(error);
    return NextResponse.json({
      error: "Failed to analyze resume",
      ...serializedError
    }, { status: 500 });
  }
}
