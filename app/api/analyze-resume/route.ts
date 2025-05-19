// app/api/analyze-resume/route.ts
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the file from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Forward the file to the Python service
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:5000"
    
    // Create a new FormData object to send to the Python service
    const pythonFormData = new FormData()
    pythonFormData.append("file", file)
    
    // Call the Python service
    const pythonResponse = await fetch(`${pythonServiceUrl}/analyze`, {
      method: "POST",
      body: pythonFormData,
    })
    
    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text()
      console.error("Python service error:", errorText)
      return NextResponse.json(
        { error: "Failed to analyze resume", details: errorText },
        { status: pythonResponse.status }
      )
    }
    
    // Return the analysis results
    const analysisResult = await pythonResponse.json()
    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error("Error analyzing resume:", error)
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 })
  }
}