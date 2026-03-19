import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { logger, LogCategory, serializeErrorForResponse } from "@/lib/logger"

// Initialize the Gemini API with your API key
const API_KEY = process.env.GEMINI_API_KEY || ""
const genAI = new GoogleGenerativeAI(API_KEY)

export async function POST(request: NextRequest) {
  try {
    // For safety, check if API key is available
    if (!API_KEY) {
      logger.error(LogCategory.API, "Missing Gemini API key")
      return NextResponse.json(
        { error: "API key not configured. Please add your Gemini API key to the environment variables." },
        { status: 500 },
      )
    }

    // Get the messages from the request
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      logger.error(LogCategory.API, "Invalid request format: messages array is missing or not an array")
      return NextResponse.json({ error: "Invalid request format. Messages array is required." }, { status: 400 })
    }

    logger.info(LogCategory.API, "Processing chat request", { messageCount: messages.length })

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Extract the system message if it exists
    const systemMessages = messages.filter((msg) => msg.role === "system")
    const systemPrompt =
      systemMessages.length > 0
        ? systemMessages.map((msg) => msg.content).join("\n")
        : "You are a helpful AI career assistant that provides advice on job searching, resume writing, and interview preparation."

    // Get the last user message
    const lastUserMessage = messages.filter((msg) => msg.role === "user").pop()

    if (!lastUserMessage) {
      logger.error(LogCategory.API, "No user message found in the conversation")
      return NextResponse.json({ error: "No user message found in the conversation." }, { status: 400 })
    }

    // Create a simplified prompt for the model
    const prompt = `${systemPrompt}\n\nUser: ${lastUserMessage.content}`

    // Generate content with a simple prompt instead of chat history
    // This is more reliable and avoids potential issues with chat format
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    logger.info(LogCategory.API, "Generated chat response successfully")
    return NextResponse.json({ response: text })
  } catch (error) {
    logger.error(LogCategory.API, "Error in chat API", { error })
    const serializedError = serializeErrorForResponse(error)
    return NextResponse.json(
      {
        error: "Failed to generate response",
        ...serializedError,
      },
      { status: 500 },
    )
  }
}
