import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json(
      { error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables." },
      { status: 503 }
    )
  }

  try {
    const { prompt } = await req.json()

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are NEXORA AI, a helpful personal productivity assistant. You help users organize their tasks, habits, finances, notes, and goals. 
                  
Be concise, practical, and actionable. Format your responses clearly with sections when appropriate. Use markdown formatting for better readability.

User request: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Gemini API error")
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error("No response generated")
    }

    return NextResponse.json({ response: text })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
