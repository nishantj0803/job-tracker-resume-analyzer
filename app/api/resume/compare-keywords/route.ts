// File: app/api/resume/compare-keywords/route.ts
// Description: API route to compare keywords between a job description and resume text.

import { type NextRequest, NextResponse } from "next/server";
import { compareKeywords } from "@/lib/gemini"; // Ensure this path is correct
import { logger, LogCategory, serializeErrorForResponse } from "@/lib/logger";

export async function POST(request: NextRequest) {
  logger.info(LogCategory.API, "/api/resume/compare-keywords POST request received");
  try {
    const { jobDescription, resumeText } = await request.json();

    if (!jobDescription || !resumeText) {
      logger.warn(LogCategory.API, "Missing jobDescription or resumeText");
      return NextResponse.json(
        { error: "Job description and resume text are required." },
        { status: 400 }
      );
    }
    logger.debug(LogCategory.API, "Processing keyword comparison", {
      jobDescriptionPreview: jobDescription.substring(0, 50),
      resumeTextPreview: resumeText.substring(0, 50)
    });


    const result = await compareKeywords(jobDescription, resumeText);

    logger.debug(LogCategory.API, "Result from compareKeywords", { hasError: !!result.error });

    if (result.error) {
        logger.error(LogCategory.API, "Error from compareKeywords function", { error: result.error });
        // It's good to return a 500 if the underlying service call failed,
        // unless it's a specific user input error that Gemini identified.
        return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (error: unknown) {
    logger.error(LogCategory.API, "Error in /api/resume/compare-keywords", { error });
    let message = "Failed to compare keywords due to an unexpected server error.";
    let statusCode = 500;
     if (error instanceof SyntaxError && error.message.includes("JSON")) {
        message = "Invalid JSON payload received. Please check the request body.";
        statusCode = 400;
    } else if (error instanceof Error) {
      message = error.message;
    }
    const serializedError = serializeErrorForResponse(error);
    return NextResponse.json({ error: message, ...serializedError }, { status: statusCode });
  }
}
