import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { description, theme, questionId } = await request.json()

    console.log(`[Generate Image API] Request - Theme: ${theme}, QuestionId: ${questionId}, Description: ${description}`)

    if (!description || !theme || !questionId) {
      console.error("[Generate Image API] Missing required parameters")
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Check if we have an API key for image generation
    const apiKey = process.env.OPENAI_API_KEY || process.env.REPLICATE_API_TOKEN

    if (!apiKey) {
      console.warn("[Generate Image API] No AI API key found. Image generation disabled.")
      return NextResponse.json(
        { error: "AI image generation not configured", useLocal: true },
        { status: 503 }
      )
    }

    // Generate image using OpenAI DALL-E (if available)
    if (process.env.OPENAI_API_KEY) {
      console.log("[Generate Image API] Using OpenAI DALL-E for image generation")
      
      const prompt = theme === "Gia đình" 
        ? "A happy Vietnamese family, 3D Pixar style, high quality, colorful, warm atmosphere"
        : `A simple, child-friendly illustration for English learning: ${description}. Style: colorful, educational, suitable for elementary students.`
      
      console.log(`[Generate Image API] Prompt: ${prompt}`)
      
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("[Generate Image API] OpenAI API error:", error)
        return NextResponse.json(
          { error: "Failed to generate image", useLocal: true },
          { status: 500 }
        )
      }

      const data = await response.json()
      const imageUrl = data.data[0]?.url

      if (!imageUrl) {
        console.error("[Generate Image API] No image URL returned from OpenAI")
        return NextResponse.json(
          { error: "No image URL returned", useLocal: true },
          { status: 500 }
        )
      }

      console.log(`[Generate Image API] Successfully generated image: ${imageUrl}`)
      
      return NextResponse.json({
        success: true,
        imageUrl,
        questionId,
        theme,
      })
    }

    // If no supported AI service is configured
    console.warn("[Generate Image API] No supported AI service configured")
    return NextResponse.json(
      { error: "No supported AI service configured", useLocal: true },
      { status: 503 }
    )
  } catch (error) {
    console.error("[Generate Image API] Error generating image:", error)
    return NextResponse.json(
      { error: "Internal server error", useLocal: true },
      { status: 500 }
    )
  }
}
