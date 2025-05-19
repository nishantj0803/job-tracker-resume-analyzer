// File: app/api/resume/compare-keywords/route.ts
// Description: API route to compare keywords between a job description and resume text.

import { type NextRequest, NextResponse } from "next/server";
import { compareKeywords } from "@/lib/gemini"; // Ensure this path is correct

export async function POST(request: NextRequest) {
  console.log("API_ROUTE_LOG: /api/resume/compare-keywords POST request received.");
  try {
    const { jobDescription, resumeText } = await request.json();

    if (!jobDescription || !resumeText) {
      console.warn("API_ROUTE_WARN: Missing jobDescription or resumeText in /api/resume/compare-keywords.");
      return NextResponse.json(
        { error: "Job description and resume text are required." },
        { status: 400 }
      );
    }
    console.log("API_ROUTE_LOG: jobDescription (first 50 chars):", jobDescription.substring(0,50) + "...");
    console.log("API_ROUTE_LOG: resumeText (first 50 chars):", resumeText.substring(0,50) + "...");


    const result = await compareKeywords(jobDescription, resumeText);
    
    console.log("API_ROUTE_LOG: Result from compareKeywords Gemini function:", result);

    if (result.error) {
        console.error("API_ROUTE_ERROR: Error received from compareKeywords Gemini function:", result.error);
        // It's good to return a 500 if the underlying service call failed,
        // unless it's a specific user input error that Gemini identified.
        return NextResponse.json(result, { status: 500 }); 
    }

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("API_ROUTE_ERROR: TOP LEVEL CATCH in /api/resume/compare-keywords. Raw Error:", error);
    let message = "Failed to compare keywords due to an unexpected server error.";
     if (error instanceof SyntaxError && error.message.includes("JSON")) {
        message = "Invalid JSON payload received. Please check the request body.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
