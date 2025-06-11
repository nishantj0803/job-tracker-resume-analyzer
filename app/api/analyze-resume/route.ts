// app/api/analyze-resume/route.ts
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("API_LOG: /api/analyze-resume POST request received");
  try {
    // Get the file from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.warn("API_LOG: No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`API_LOG: Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Forward the file to the Python service
    const pythonServiceUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:5001/analyze_resume"
    console.log(`API_LOG: Using Python service URL: ${pythonServiceUrl}`);
    
    // Create a new FormData object to send to the Python service
    const pythonFormData = new FormData()
    pythonFormData.append("file", file)
    
    // Call the Python service
    console.log("API_LOG: Sending request to Python service...");
    const pythonResponse = await fetch(pythonServiceUrl, {
      method: "POST",
      body: pythonFormData,
    })
    
    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text()
      console.error("API_ERROR: Python service error:", {
        status: pythonResponse.status,
        statusText: pythonResponse.statusText,
        error: errorText
      });
      return NextResponse.json(
        { error: "Failed to analyze resume", details: errorText },
        { status: pythonResponse.status }
      )
    }
    
    // Return the analysis results
    const analysisResult = await pythonResponse.json()
    console.log("API_LOG: Successfully received analysis result from Python service");
    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("API_ERROR: Error analyzing resume:", error)
    return NextResponse.json({ 
      error: "Failed to analyze resume", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}