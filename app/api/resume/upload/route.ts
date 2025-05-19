// File: app/api/resume/upload/route.ts
// Description: Handles resume file upload, generates a file ID. (Further Enhanced Error Logging)

import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  console.log("API_LOG: /api/resume/upload POST request received.");
  try {
    const formData = await request.formData();
    console.log("API_LOG: formData received.");
    const file = formData.get("file") as File | null;

    if (!file) {
      console.warn("API_LOG: No file found in formData.");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    console.log(`API_LOG: File received: ${file.name}, type: ${file.type}, size: ${file.size}`);

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      console.warn(`API_LOG: Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, DOC, or DOCX" },
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      console.warn(`API_LOG: File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    let fileId;
    try {
      fileId = uuidv4();
      console.log(`API_LOG: Generated fileId: ${fileId}`);
    } catch (uuidError: unknown) { // Catch specific error
      console.error("API_ERROR: Failed to generate UUID:", uuidError);
      let message = "Failed to process file identifier";
      if (uuidError instanceof Error) message = uuidError.message;
      return NextResponse.json({ error: "Failed to process file identifier", detail: message }, { status: 500 });
    }
    
    const fileName = `${fileId}-${file.name.replace(/\s+/g, "_")}`;
    console.log(`API_LOG: Generated internal fileName: ${fileName}`);

    let buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log(`API_LOG: File converted to buffer, size: ${buffer.length}`);
    } catch (bufferError: unknown) { // Catch specific error
      console.error("API_ERROR: Failed to convert file to buffer:", bufferError);
      let message = "Failed to read file content";
      if (bufferError instanceof Error) message = bufferError.message;
      return NextResponse.json({ error: "Failed to read file content", detail: message }, { status: 500 });
    }

    console.log("API_LOG: File processing successful in /api/resume/upload. Returning fileId.");
    return NextResponse.json({
      success: true,
      fileId,
      fileName,
      message: "File uploaded successfully (simulated storage). This route does not perform analysis.",
    });

  } catch (error: unknown) {
    console.error("API_ERROR: TOP LEVEL CATCH in /api/resume/upload. Raw Error Object:", error);
    let message = "An unexpected error occurred during file upload.";
    let errorDetails: any = { rawError: String(error) }; // Basic string representation

    if (error instanceof Error) {
      message = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack, // Stack trace can be very helpful
      };
    } else if (typeof error === 'string') {
      message = error;
      errorDetails = { errorString: error };
    } else if (typeof error === 'object' && error !== null) {
      // Attempt to serialize non-Error objects, but be cautious
      try {
        errorDetails = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error).concat(['message', 'name', 'stack'])));
      } catch (serializationError) {
        console.error("API_ERROR: Could not serialize error object:", serializationError);
        errorDetails.serializationFailed = true;
      }
    }
    
    console.error("API_ERROR: Serialized error details for response:", errorDetails);
    return NextResponse.json({ error: message, details: errorDetails }, { status: 500 });
  }
}
