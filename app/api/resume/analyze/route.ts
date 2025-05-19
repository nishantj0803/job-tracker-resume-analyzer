// File: app/api/resume/analyze/route.ts
// Description: Receives resume from frontend, forwards to Python backend using native FormData.

import { type NextRequest, NextResponse } from "next/server";
// FormData from 'form-data' is no longer needed for the outgoing request if using native FormData

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:5001/analyze_resume";

export async function POST(request: NextRequest) {
  console.log("NEXT_API_LOG: /api/resume/analyze POST request received.");
  try {
    const clientFormData = await request.formData(); // This is native FormData
    const file = clientFormData.get("file") as File | null;

    if (!file) {
      console.warn("NEXT_API_LOG: No file found in Next.js API request /api/resume/analyze.");
      return NextResponse.json({ error: "No resume file provided to analyze." }, { status: 400 });
    }
    console.log(`NEXT_API_LOG: File received for analysis: ${file.name}, type: ${file.type}, size: ${file.size}`);

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      console.warn(`NEXT_API_LOG: Invalid file type received for analysis: ${file.type}`);
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOC, or DOCX are accepted for analysis." },
        { status: 400 }
      );
    }
    const MAX_SIZE = 10 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
        console.warn(`NEXT_API_LOG: File for analysis too large: ${file.size} bytes`);
        return NextResponse.json({ error: `File for analysis exceeds ${MAX_SIZE / (1024*1024)}MB limit.` }, { status: 400 });
    }

    // Create a new NATIVE FormData object to send to Python
    // This ensures we are only sending the file and not any other potential fields from clientFormData
    const pythonNativeFormData = new FormData(); 
    pythonNativeFormData.append("resume", file); // Append the File object directly

    console.log(`NEXT_API_LOG: Forwarding file '${file.name}' using NATIVE FormData to Python backend at ${PYTHON_BACKEND_URL}`);
    
    // When using native FormData with fetch, you typically DO NOT set Content-Type manually.
    // Fetch should handle setting the 'multipart/form-data' header with the correct boundary.
    const pythonResponse = await fetch(PYTHON_BACKEND_URL, {
      method: "POST",
      body: pythonNativeFormData, 
      // No 'headers' explicitly set here for Content-Type; fetch will generate it from FormData
    });

    const responseBodyText = await pythonResponse.text(); 

    if (!pythonResponse.ok) {
      console.error(`NEXT_API_ERROR: Python backend error: ${pythonResponse.status} ${pythonResponse.statusText}. Response: ${responseBodyText}`);
      let errorData;
      try {
        errorData = JSON.parse(responseBodyText);
      } catch (e) {
        errorData = { error: `Python service returned a non-JSON error or is unreachable. Status: ${pythonResponse.status}. Response: ${responseBodyText.substring(0, 500)}` };
      }
      return NextResponse.json(
        { error: `Analysis service failed: ${errorData.error || pythonResponse.statusText}` },
        { status: pythonResponse.status } 
      );
    }

    try {
      const analysisResult = JSON.parse(responseBodyText);
      console.log("NEXT_API_LOG: Successfully received and parsed analysis from Python backend.");
      return NextResponse.json(analysisResult);
    } catch (e) {
      console.error("NEXT_API_ERROR: Failed to parse JSON response from Python backend. Raw response:", responseBodyText, "Error:", e);
      return NextResponse.json({ error: "Received malformed analysis data from the processing service." }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("NEXT_API_ERROR: TOP LEVEL CATCH in /api/resume/analyze. Raw Error Object:", error);
    let message = "An unexpected error occurred on the server while preparing the analysis request.";
    let errorDetails: any = { rawError: String(error) };

    if (error instanceof Error) {
      message = error.message;
      errorDetails = { name: error.name, message: error.message, stack: error.stack };
    } else if (typeof error === 'string') {
      message = error;
      errorDetails = { errorString: error };
    }
    
    console.error("NEXT_API_ERROR: Serialized error details for /api/resume/analyze response:", errorDetails);
    return NextResponse.json({ error: message, details: errorDetails }, { status: 500 });
  }
}
