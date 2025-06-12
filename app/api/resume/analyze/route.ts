// File: app/api/resume/analyze/route.ts
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("NEXT_API_LOG: /api/resume/analyze POST request received.");
  
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

    console.log(`NEXT_API_LOG: Forwarding file to Python backend at: ${pythonEndpoint}`);
    
    const pythonResponse = await fetch(pythonEndpoint, {
      method: "POST",
      body: pythonNativeFormData, 
    });

    const responseBodyText = await pythonResponse.text(); 

    if (!pythonResponse.ok) {
      console.error(`NEXT_API_ERROR: Python backend error: ${pythonResponse.status}. Response: ${responseBodyText.substring(0, 500)}`);
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
      console.error("NEXT_API_ERROR: Failed to parse JSON response from Python backend.", e);
      return NextResponse.json({ error: "Received malformed analysis data from the Python service." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("NEXT_API_ERROR: TOP LEVEL CATCH in /api/resume/analyze.", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
