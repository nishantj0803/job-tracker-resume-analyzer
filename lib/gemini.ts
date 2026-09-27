import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type GenerativeModel } from "@google/generative-ai";
import { normalizeMatchResult } from "./match";

const API_KEY = process.env.GEMINI_API_KEY || "";
let genAI: GoogleGenerativeAI | undefined;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn(
    "GEMINI_API_KEY is not configured. AI functions will be disabled or return an error."
  );
}
/** Single model ID so chat / resume / keyword paths behave consistently. */
export const GEMINI_MODEL = "gemini-2.0-flash";

export interface ChatMessage {
  role: string;
  content: string;
}

export async function generateChatResponse(prompt: string, previousMessages: ChatMessage[]): Promise<string> {
  try {
    // For safety, check if API key is available
    if (!API_KEY) {
      return "API key not configured. Please add your Gemini API key to the environment variables."
    }

    // Get the model - update to use the correct model name
    const model = genAI!.getGenerativeModel({ model: GEMINI_MODEL })

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
    const model = genAI!.getGenerativeModel({ model: GEMINI_MODEL })

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

export async function compareKeywords(jobDescription: string, resumeText: string): Promise<Record<string, unknown>> {
  if (!genAI) {
    return {
      error: "Gemini AI client not initialized. Please check API key configuration.",
    };
  }
  try {
    const model: GenerativeModel = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `
    You are a hiring-manager assistant. Compare the JOB DESCRIPTION against the RESUME and produce an EXPLAINABLE match.

    JOB DESCRIPTION:
    ${jobDescription.slice(0, 8000)}

    RESUME:
    ${resumeText.slice(0, 8000)}

    Rules:
    - Extract 5-15 core requirements from the JD (skills, tools, years, domain).
    - "matched" = requirements with clear resume evidence. "missing" = the rest.
    - Score 0-100 weighted: skills 50%, experience overlap 30%, seniority fit 20%.
    - Be strict: keyword stuffing without evidence does not count as matched.
    - Respond with VALID JSON ONLY, no markdown fences, in exactly this shape:
    {
      "score": 78,
      "matched": ["Python", "REST", "SQL"],
      "missing": ["Kubernetes", "AWS Lambda"],
      "experienceOverlap": "4/6 core requirements",
      "experienceMatched": 4,
      "experienceRequired": 6,
      "breakdown": { "skillsMatch": 80, "experienceOverlap": 67, "seniorityFit": 75 },
      "summary": "One or two sentences a recruiter would believe."
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (response.promptFeedback?.blockReason) {
      return { error: `AI response for keyword comparison was blocked: ${response.promptFeedback.blockReason}.` };
    }

    if (!response.candidates?.length) {
      return { error: "AI returned no candidates for keyword comparison." };
    }

    const text = response.text();

    // Enhanced JSON parsing (fenced block, raw object, or full text)
    let parsedResponse: unknown;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/s) || text.match(/({[\s\S]*})/s);

    if (jsonMatch?.[1]) {
      try {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } catch {
        // fall through to full-text parse
      }
    }

    if (!parsedResponse) {
      try {
        parsedResponse = JSON.parse(text);
      } catch {
        return { error: "Failed to parse AI response for keyword comparison as JSON.", rawResponse: text };
      }
    }

    const normalized = normalizeMatchResult(parsedResponse);
    // Keep legacy keys so existing clients don't break.
    return {
      score: normalized.score,
      matching: normalized.matched,
      matched: normalized.matched,
      missing: normalized.missing,
      experienceOverlap: normalized.experienceOverlap,
      breakdown: normalized.breakdown,
      summary: normalized.summary,
    };

  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : typeof error === "string" ? error : "unknown error";
    return { error: `Sorry, an error occurred while comparing keywords. Details: ${detail}` };
  }
}