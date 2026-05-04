/**
 * API Route for Test Submission and AI Grading
 * Handles submission, AI grading by "Cô Doremi", and Hall of Fame updates
 */

import { NextRequest, NextResponse } from "next/server"
import { getMongoClient } from "@/lib/mongodb"
import { TestSubmission, WeeklyTest, HallOfFameEntry } from "@/lib/mongodb-collections"
import { ObjectId } from "mongodb"

// AI Grading with Anthropic Claude API
async function gradeWithAI(
  testTitle: string,
  questions: any[],
  answers: any[],
  screenshot?: string
): Promise<{ score: number; feedback: string; detailedFeedback: any[] }> {
  try {
    // Use Anthropic Claude API for grading
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicApiKey) {
      console.warn("ANTHROPIC_API_KEY not found, using fallback grading")
      return fallbackGrading(questions, answers)
    }

    // Prepare the grading prompt
    const prompt = `Bạn là Cô Doremi, một giáo viên tiếng Anh tận tâm và chu đáo. Hãy chấm bài thi "${testTitle}" của học sinh với tinh thần khích lệ và xây dựng.

Đề bài và câu trả lời của học sinh:
${questions.map((q, idx) => {
  const userAnswer = answers[idx]
  const selectedOption = userAnswer?.userAnswer !== undefined && userAnswer.userAnswer >= 0 
    ? q.options[userAnswer.userAnswer] 
    : "(Không trả lời)"
  const correctOption = q.options[q.correctAnswer]
  
  return `
Câu ${idx + 1} (${q.points} điểm): ${q.question}
Các lựa chọn: ${q.options.join(" | ")}
Đáp án đúng: ${correctOption}
Câu trả lời của học sinh: ${selectedOption}
Kết quả: ${userAnswer?.isCorrect ? "✓ Đúng" : "✗ Sai"}
`
}).join("\n")}

Yêu cầu:
1. Viết lời phê tổng quan (2-3 câu) với giọng điệu của Cô Doremi - một giáo viên thân thiện, khích lệ học sinh
2. Sử dụng emoji phù hợp (🌟, 💜, 👍, 💪, ✨)
3. Nếu điểm cao (≥8): Khen ngợi nhiệt tình
4. Nếu điểm trung bình (6-7.9): Động viên và chỉ ra hướng cải thiện
5. Nếu điểm thấp (<6): Khích lệ, động viên không nản chí

CHỈ trả về lời phê (không cần JSON, không cần format đặc biệt), khoảng 2-3 câu ngắn gọn.`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error("AI API error:", await response.text())
      return fallbackGrading(questions, answers)
    }

    const data = await response.json()
    const aiFeedback = data.content[0].text

    // Calculate score from answers
    const detailedFeedback = answers.map((ans: any, idx: number) => ({
      questionIndex: ans.questionIndex,
      isCorrect: ans.isCorrect,
      pointsEarned: ans.points,
      feedback: ans.isCorrect
        ? "Chính xác! Bạn đã làm rất tốt câu này."
        : "Câu này cần xem lại. Hãy ôn tập thêm nhé!",
    }))

    const totalScore = answers.reduce((sum: number, ans: any) => sum + (ans.isCorrect ? 1 : 0), 0)
    const score = (totalScore / questions.length) * 10

    return {
      score: Math.round(score * 10) / 10,
      feedback: aiFeedback,
      detailedFeedback,
    }
  } catch (error) {
    console.error("AI grading error:", error)
    return fallbackGrading(questions, answers)
  }
}

// Fallback grading when AI is not available
function fallbackGrading(questions: any[], answers: any[]) {
  let rawScore = 0
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  
  const detailedFeedback = questions.map((q, idx) => {
    const userAnswer = answers[idx]?.answer || ""
    let isCorrect = false
    let pointsEarned = 0

    if (q.type === "multiple_choice" && q.correctAnswer) {
      isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
      pointsEarned = isCorrect ? q.points : 0
    } else {
      // For essay questions, give partial credit
      pointsEarned = userAnswer.length > 10 ? q.points * 0.7 : 0
      isCorrect = pointsEarned > 0
    }

    rawScore += pointsEarned

    return {
      questionId: q.id,
      isCorrect,
      pointsEarned,
      feedback: isCorrect
        ? "Chính xác! Bạn đã làm rất tốt câu này."
        : "Câu này cần xem lại. Hãy ôn tập thêm nhé!",
    }
  })

  const score = totalPoints > 0 ? (rawScore / totalPoints) * 10 : 0

  return {
    score: Math.round(score * 10) / 10,
    feedback: score >= 8
      ? "🌟 Xuất sắc! Cô rất tự hào về em. Tiếp tục phát huy nhé!"
      : score >= 6
      ? "👍 Khá tốt! Em đã cố gắng rất nhiều. Hãy ôn lại những phần còn thiếu sót nhé!"
      : "💪 Em cần cố gắng thêm! Đừng nản chí, hãy ôn tập kỹ hơn và thử lại nhé!",
    detailedFeedback,
  }
}

// Generate celebration image for Hall of Fame
async function generateCelebrationImage(
  userName: string,
  score: number,
  testTitle: string,
  userAvatar?: string
): Promise<string> {
  // For now, return a placeholder. In production, you could:
  // 1. Use Canvas API to generate image
  // 2. Use external service like Cloudinary
  // 3. Use screenshot service
  
  // Return a data URL or upload to storage
  return `/api/hall-of-fame/image?name=${encodeURIComponent(userName)}&score=${score}&test=${encodeURIComponent(testTitle)}`
}

// POST: Submit test and get AI grading
export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { testId, userId, userName, userAvatar, answers, totalScore, screenshot } = body

    // Validate required fields
    if (!testId || !userId || !answers) {
      console.error("Missing required fields:", { testId, userId, hasAnswers: !!answers })
      return NextResponse.json(
        { success: false, error: "Missing required fields: testId, userId, or answers" },
        { status: 400 }
      )
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      console.error("Invalid answers format:", answers)
      return NextResponse.json(
        { success: false, error: "Answers must be a non-empty array" },
        { status: 400 }
      )
    }

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      console.error("MongoDB client not available")
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 503 }
      )
    }

    let client
    try {
      client = await clientPromise
    } catch (dbError) {
      console.error("MongoDB connection error:", dbError)
      return NextResponse.json(
        { success: false, error: "Failed to connect to database" },
        { status: 503 }
      )
    }

    const db = client.db("doremi")

    // Get test details
    const testsCollection = db.collection<WeeklyTest>("weeklyTests")
    let test
    try {
      test = await testsCollection.findOne({ _id: new ObjectId(testId) })
    } catch (testError) {
      console.error("Error fetching test:", testError)
      return NextResponse.json(
        { success: false, error: "Invalid test ID format" },
        { status: 400 }
      )
    }

    if (!test) {
      console.error("Test not found:", testId)
      return NextResponse.json(
        { success: false, error: "Test not found" },
        { status: 404 }
      )
    }

    // Check if already submitted
    const submissionsCollection = db.collection<TestSubmission>("testSubmissions")
    const existingSubmission = await submissionsCollection.findOne({
      testId: testId,
      userId: userId,
    })

    if (existingSubmission) {
      console.log("Duplicate submission attempt:", { testId, userId })
      return NextResponse.json(
        { 
          success: false, 
          error: "Bạn đã nộp bài thi này rồi",
          submissionId: existingSubmission._id?.toString()
        },
        { status: 400 }
      )
    }

    // Grade with AI (pass screenshot for potential future use)
    console.log("Starting AI grading for test:", test.title)
    const gradingResult = await gradeWithAI(test.title, test.questions, answers, screenshot)
    console.log("AI grading completed. Score:", gradingResult.score)

    // Create submission with proper schema
    const submission: TestSubmission = {
      testId: testId,
      userId,
      userName: userName || userId,
      userAvatar: userAvatar || "/placeholder-user.jpg",
      answers: answers.map((ans: any) => ({
        questionId: ans.questionIndex.toString(),
        answer: ans.userAnswer !== undefined ? ans.userAnswer.toString() : "",
        isCorrect: ans.isCorrect,
        pointsEarned: ans.points,
        feedback: ans.isCorrect 
          ? "Chính xác! Bạn đã làm rất tốt câu này."
          : "Câu này cần xem lại. Hãy ôn tập thêm nhé!",
      })),
      totalScore: gradingResult.score,
      rawScore: answers.reduce((sum: number, ans: any) => sum + ans.points, 0),
      status: "graded",
      aiTeacherFeedback: gradingResult.feedback,
      screenshot: screenshot || undefined,
      submittedAt: new Date(),
      gradedAt: new Date(),
      gradedBy: "Cô Doremi (AI)",
    }

    const result = await submissionsCollection.insertOne(submission)
    const submissionId = result.insertedId.toString()
    console.log("Submission saved successfully:", submissionId)

    // Check if this is the highest score for Hall of Fame
    const allSubmissions = await submissionsCollection
      .find({ testId: testId })
      .sort({ totalScore: -1 })
      .limit(1)
      .toArray()

    const isTopScore = allSubmissions.length === 0 || gradingResult.score >= allSubmissions[0].totalScore

    // Update Hall of Fame if top score
    if (isTopScore && gradingResult.score >= 8) {
      const hallOfFameCollection = db.collection<HallOfFameEntry>("hallOfFame")
      
      // Generate celebration image
      const imageUrl = await generateCelebrationImage(userName, gradingResult.score, test.title, userAvatar)

      const hallOfFameEntry: HallOfFameEntry = {
        testId: testId,
        testTitle: test.title,
        week: test.week,
        year: test.year,
        submissionId,
        userId,
        userName,
        userAvatar,
        score: gradingResult.score,
        imageUrl,
        aiTeacherComment: gradingResult.feedback,
        likes: [],
        comments: [],
        featuredAt: new Date(),
        createdAt: new Date(),
      }

      // Remove old entry for this test if exists
      await hallOfFameCollection.deleteMany({ testId: testId })
      await hallOfFameCollection.insertOne(hallOfFameEntry)

      // Notify user about Hall of Fame
      const notificationsCollection = db.collection("notifications")
      await notificationsCollection.insertOne({
        userId,
        type: "hall_of_fame",
        title: "🏆 Chúc Mừng! Bạn Lên Bảng Vàng!",
        message: `Bạn đã đạt điểm cao nhất (${gradingResult.score}/10) trong bài thi "${test.title}"!`,
        icon: "/dau chan.png",
        link: "/hall-of-fame",
        isRead: false,
        createdAt: new Date(),
      })
    }

    // Notify user about grading completion
    const notificationsCollection = db.collection("notifications")
    await notificationsCollection.insertOne({
      userId,
      type: "test_graded",
      title: "✅ Bài Thi Đã Được Chấm",
      message: `Bài thi "${test.title}" của bạn đã được Cô Doremi chấm xong. Điểm: ${gradingResult.score}/10`,
      icon: "/chuong.png",
      link: `/weekly-tests/${testId}/result`,
      isRead: false,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      submissionId,
      score: gradingResult.score,
      feedback: gradingResult.feedback,
      isTopScore,
      message: "Test submitted and graded successfully",
    })
  } catch (error) {
    console.error("Error submitting test:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit test" },
      { status: 500 }
    )
  }
}

// GET: Get submission result
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get("submissionId")
    const testId = searchParams.get("testId")
    const userId = searchParams.get("userId")

    const clientPromise = getMongoClient()
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not available" },
        { status: 503 }
      )
    }

    const client = await clientPromise
    const db = client.db("doremi")
    const submissionsCollection = db.collection<TestSubmission>("testSubmissions")

    let submission
    if (submissionId) {
      submission = await submissionsCollection.findOne({
        _id: new ObjectId(submissionId),
      })
    } else if (testId && userId) {
      submission = await submissionsCollection.findOne({
        testId,
        userId,
      })
    } else {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      )
    }

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error("Error fetching submission:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch submission" },
      { status: 500 }
    )
  }
}
