"use server"
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerativeModel } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
let genAI: GoogleGenerativeAI | undefined;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn(
    "GEMINI_API_KEY is not configured. AI functions will be disabled or return an error."
  );
}
const MODEL_NAME = "gemini-1.5-pro"; 
export async function generateChatResponse(prompt: string, previousMessages: any[]): Promise<string> {
  try {
    // For safety, check if API key is available
    if (!API_KEY) {
      return "API key not configured. Please add your Gemini API key to the environment variables."
    }

    // Get the model - update to use the correct model name
    const model = genAI!.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Convert previous messages to the format expected by Gemini
    const history = previousMessages
      .filter((msg) => msg.role !== "system")
      .slice(0, -1) // Exclude the last message (which is the user's current prompt)
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }))

    // Start a chat session
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1000,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    })

    // Generate a response
    const result = await chat.sendMessage(prompt)
    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error("Error generating response:", error)
    return "Sorry, I encountered an error while generating a response. Please try again."
  }
}

export async function analyzeResume(resumeText: string): Promise<any> {
  try {
    if (!API_KEY) {
      return {
        error: "API key not configured. Please add your Gemini API key to the environment variables.",
      }
    }

    // Update to use the correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
    Analyze the following resume and provide detailed feedback:
    
    ${resumeText}
    
    Please provide the analysis in the following JSON format:
    {
      "score": <overall score from 0-100>,
      "contentQuality": <score from 0-100>,
      "atsCompatibility": <score from 0-100>,
      "keywordOptimization": <score from 0-100>,
      "suggestions": [<array of improvement suggestions>],
      "keywords": {
        "present": [<array of keywords present in the resume>],
        "missing": [<array of important keywords missing from the resume>]
      },
      "sections": {
        "summary": {
          "clarity": <score from 0-10>,
          "impact": <score from 0-10>,
          "feedback": "<specific feedback for this section>"
        },
        "experience": {
          "achievementFocus": <score from 0-10>,
          "quantifiableResults": <score from 0-10>,
          "feedback": "<specific feedback for this section>"
        },
        "skills": {
          "relevance": <score from 0-10>,
          "organization": <score from 0-10>,
          "feedback": "<specific feedback for this section>"
        }
      }
    }
    
    Ensure the response is valid JSON.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/)

    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1])
    } else {
      try {
        return JSON.parse(text)
      } catch (e) {
        return {
          error: "Failed to parse AI response",
          rawResponse: text,
        }
      }
    }
  } catch (error) {
    console.error("Error analyzing resume:", error)
    return {
      error: "Sorry, I encountered an error while analyzing the resume. Please try again.",
    }
  }
}

export async function compareKeywords(jobDescription: string, resumeText: string): Promise<any> {
  if (!genAI) {
    console.error("GEMINI_LIB_ERROR: compareKeywords called but genAI is not initialized.");
    return {
      error: "Gemini AI client not initialized. Please check API key configuration.",
    };
  }
  try {
    console.log("GEMINI_LIB_LOG: compareKeywords invoked.");
    const model: GenerativeModel = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
    Compare the following job description with the resume text and identify matching and missing keywords:
    
    Job Description:
    ${jobDescription}
    
    Resume:
    ${resumeText}
    
    Please provide the analysis in the following JSON format:
    {
      "matching": ["<array of keywords that appear in both the job description and resume>"],
      "missing": ["<array of important keywords from the job description that are missing in the resume>"],
      "score": "<percentage match score from 0-100>"
    }
    
    Ensure the response is valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (response.promptFeedback?.blockReason) {
      console.error("GEMINI_LIB_ERROR: compareKeywords response blocked due to:", response.promptFeedback.blockReason, response.promptFeedback.safetyRatings);
      return { error: `AI response for keyword comparison was blocked: ${response.promptFeedback.blockReason}.` };
    }

    if (!response.candidates?.length) {
      console.error("GEMINI_LIB_ERROR: No candidates returned from AI for compareKeywords. Full response:", JSON.stringify(response, null, 2));
      return { error: "AI returned no candidates for keyword comparison." };
    }
    
    const text = response.text();
    console.log("GEMINI_LIB_LOG: Raw text response from AI for compareKeywords:", text.substring(0, 200) + "...");


    // Enhanced JSON parsing
    let parsedResponse;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/s) || text.match(/({[\s\S]*})/s);

    if (jsonMatch && jsonMatch[1]) {
        try {
            parsedResponse = JSON.parse(jsonMatch[1]);
            console.log("GEMINI_LIB_LOG: Successfully parsed JSON from fenced code block in compareKeywords.");
        } catch (e) {
            console.error("GEMINI_LIB_ERROR: Failed to parse JSON from fenced code block in compareKeywords, trying full text. Error:", e);
            // Fall through to try parsing the whole text
        }
    }

    if (!parsedResponse) {
        try {
            parsedResponse = JSON.parse(text);
            console.log("GEMINI_LIB_LOG: Successfully parsed JSON directly from text in compareKeywords.");
        } catch (e) {
            console.error("GEMINI_LIB_ERROR: Failed to parse JSON directly from text in compareKeywords. Raw response:", text, "Error:", e);
            return { error: "Failed to parse AI response for keyword comparison as JSON.", rawResponse: text };
        }
    }
    return parsedResponse;

  } catch (error: unknown) {
    console.error("GEMINI_LIB_ERROR: Error in compareKeywords function:", error);
    let errorDetail = "An unknown error occurred during keyword comparison.";
    if (error instanceof Error) { errorDetail = error.message; }
    else if (typeof error === 'string') { errorDetail = error; }
    // Add more specific error handling if needed for GoogleGenerativeAIError
    return { error: `Sorry, an error occurred while comparing keywords. Details: ${errorDetail}` };
  }
}