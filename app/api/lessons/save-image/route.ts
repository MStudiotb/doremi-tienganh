import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const { imageUrl, theme, questionId } = await request.json()

    console.log(`[Save Image API] Request - Theme: ${theme}, QuestionId: ${questionId}, ImageUrl: ${imageUrl}`)

    if (!imageUrl || !theme || !questionId) {
      console.error("[Save Image API] Missing required parameters")
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Normalize theme to create folder name
    const themeSlug = theme
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/\s+/g, "-")

    console.log(`[Save Image API] Theme slug: ${themeSlug}`)

    // Create directory path
    const lessonsDir = path.join(process.cwd(), "public", "lessons", themeSlug)
    console.log(`[Save Image API] Target directory: ${lessonsDir}`)

    // Ensure directory exists
    if (!fs.existsSync(lessonsDir)) {
      console.log(`[Save Image API] Creating directory: ${lessonsDir}`)
      fs.mkdirSync(lessonsDir, { recursive: true })
    }

    // Download the image
    console.log(`[Save Image API] Downloading image from: ${imageUrl}`)
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      console.error(`[Save Image API] Failed to download image. Status: ${imageResponse.status}`)
      throw new Error("Failed to download image")
    }

    const arrayBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`[Save Image API] Downloaded image size: ${buffer.length} bytes`)

    // Determine file extension from content type or default to png
    const contentType = imageResponse.headers.get("content-type")
    let extension = ".png"
    if (contentType?.includes("jpeg") || contentType?.includes("jpg")) {
      extension = ".jpg"
    } else if (contentType?.includes("webp")) {
      extension = ".webp"
    }
    console.log(`[Save Image API] Content type: ${contentType}, Extension: ${extension}`)

    // Create filename using questionId
    const filename = `${questionId}${extension}`
    const filepath = path.join(lessonsDir, filename)
    console.log(`[Save Image API] Saving to: ${filepath}`)

    // Save the file
    fs.writeFileSync(filepath, buffer)
    console.log(`[Save Image API] File saved successfully`)

    // Verify file was written
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath)
      console.log(`[Save Image API] File verified. Size: ${stats.size} bytes`)
    }

    // Return the public URL
    const publicUrl = `/lessons/${themeSlug}/${filename}`
    console.log(`[Save Image API] Public URL: ${publicUrl}`)

    return NextResponse.json({
      success: true,
      localPath: publicUrl,
      filename,
      theme: themeSlug,
    })
  } catch (error) {
    console.error("[Save Image API] Error saving image:", error)
    return NextResponse.json(
      { error: "Failed to save image locally" },
      { status: 500 }
    )
  }
}
