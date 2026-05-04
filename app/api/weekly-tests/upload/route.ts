/**
 * API Route for uploading Word/PDF files and extracting questions using AI
 */

import { NextRequest, NextResponse } from "next/server"
import { getMongoClient } from "@/lib/mongodb"
import mammoth from "mammoth"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const role = formData.get("role") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const week = formData.get("week") as string
    const year = formData.get("year") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const createdBy = formData.get("createdBy") as string

    // Check admin permission
    if (role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      )
    }

    // Extract text from file
    let extractedText = ""
    const buffer = Buffer.from(await file.arrayBuffer())

    if (file.name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer })
      extractedText = result.value
    } else if (file.name.endsWith(".pdf")) {
      // Use require for pdf-parse (CommonJS module)
      const pdfParse = require("pdf-parse")
      const data = await pdfParse(buffer)
      extractedText = data.text
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported file format. Please upload .docx or .pdf" },
        { status: 400 }
      )
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Could not extract text from file" },
        { status: 400 }
      )
    }

    // Use AI to extract 10 multiple choice questions
    const questions = await extractQuestionsWithAI(extractedText)

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Could not extract questions from text" },
        { status: 400 }
      )
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum: number, q: any) => sum + q.points, 0)

    // Save to database
    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const testsCollection = db.collection("weeklyTests")

    const newTest = {
      title,
      description: description || "",
      week: parseInt(week),
      year: parseInt(year),
      questions,
      status: "active",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalPoints,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await testsCollection.insertOne(newTest)

    // Create notifications for all users
    const usersCollection = db.collection("users")
    const users = await usersCollection.find({}).toArray()

    const notificationsCollection = db.collection("notifications")
    const notifications = users.map((user) => ({
      userId: user.email,
      type: "new_test",
      title: "🔔 Bài Thi Tuần Mới!",
      message: `Bài thi "${title}" đã được phát hành. Hãy vào làm bài ngay!`,
      icon: "/chuong.png",
      link: "/weekly-tests",
      isRead: false,
      createdAt: new Date(),
    }))

    if (notifications.length > 0) {
      await notificationsCollection.insertMany(notifications)
    }

    return NextResponse.json({
      success: true,
      testId: result.insertedId.toString(),
      questions,
      message: "Test created successfully from uploaded file",
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process file" },
      { status: 500 }
    )
  }
}

async function extractQuestionsWithAI(text: string) {
  try {
    // Use Anthropic Claude API to extract questions
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY

    if (!anthropicApiKey) {
      console.warn("ANTHROPIC_API_KEY not found, using fallback extraction")
      return extractQuestionsFallback(text)
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `Bạn là một giáo viên tiếng Anh chuyên nghiệp. Hãy phân tích nội dung sau và tạo ra CHÍNH XÁC 10 câu hỏi trắc nghiệm tiếng Anh.

Nội dung:
${text}

Yêu cầu:
- Tạo CHÍNH XÁC 10 câu hỏi trắc nghiệm
- Mỗi câu có 4 đáp án (A, B, C, D)
- Mỗi câu 1 điểm
- Đánh dấu rõ đáp án đúng
- Câu hỏi phải liên quan đến nội dung đã cho
- Độ khó từ cơ bản đến nâng cao

Trả về kết quả theo định dạng JSON SAU ĐÂY (KHÔNG thêm markdown, KHÔNG thêm \`\`\`json):
[
  {
    "question": "Câu hỏi số 1?",
    "options": ["A. Đáp án A", "B. Đáp án B", "C. Đáp án C", "D. Đáp án D"],
    "correctAnswer": 0,
    "points": 1
  }
]

CHỈ trả về JSON array, không thêm bất kỳ text nào khác.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error("AI API error:", await response.text())
      return extractQuestionsFallback(text)
    }

    const data = await response.json()
    const content = data.content[0].text

    // Parse JSON from response
    let questions
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        questions = JSON.parse(content)
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e)
      return extractQuestionsFallback(text)
    }

    // Ensure we have exactly 10 questions
    if (questions.length < 10) {
      // Pad with fallback questions
      const fallbackQuestions = extractQuestionsFallback(text)
      questions = [...questions, ...fallbackQuestions.slice(questions.length)]
    }

    return questions.slice(0, 10)
  } catch (error) {
    console.error("Error extracting questions with AI:", error)
    return extractQuestionsFallback(text)
  }
}

function extractQuestionsFallback(text: string): any[] {
  // Fallback: Create 10 basic questions from the text
  const sentences = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 20)
    .slice(0, 10)

  const questions = []
  for (let i = 0; i < 10; i++) {
    const sentence = sentences[i] || `Sample question ${i + 1}`
    questions.push({
      question: `Question ${i + 1}: What is the main idea of this sentence? "${sentence.trim().substring(0, 100)}..."`,
      options: [
        "A. Option A - First interpretation",
        "B. Option B - Second interpretation",
        "C. Option C - Third interpretation",
        "D. Option D - Fourth interpretation",
      ],
      correctAnswer: 0,
      points: 1,
    })
  }

  return questions
}
