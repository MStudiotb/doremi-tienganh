import { NextRequest, NextResponse } from "next/server"

// ── Types ──────────────────────────────────────────────────────────────────
type CheckSentenceRequest = {
  userSentence: string
  correctSentence?: string
  mode: "arrange" | "translate" | "describe"
  vietnameseSentence?: string
  theme?: string
  suggestedWords?: string[]
}

type FeedbackResponse = {
  score: number
  isCorrect?: boolean
  feedback: string
  encouragement: string
  suggestions?: string[]
  creativity?: number
  grammar?: number
  vocabulary?: number
  highlights?: string[]
}

// ── Helper functions ───────────────────────────────────────────────────────
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  if (s1 === s2) return 100

  // Levenshtein distance
  const matrix: number[][] = []
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  const distance = matrix[s2.length][s1.length]
  const maxLength = Math.max(s1.length, s2.length)
  const similarity = ((maxLength - distance) / maxLength) * 100

  return Math.round(similarity)
}

function generateEncouragement(score: number): string {
  if (score >= 95) return "Hoàn hảo! Bạn thật xuất sắc! 🌟✨"
  if (score >= 85) return "Tuyệt vời! Bạn làm rất tốt! 🎉"
  if (score >= 75) return "Khá tốt! Bạn đang tiến bộ! 💪"
  if (score >= 60) return "Cố gắng thêm nữa nhé! 📚"
  return "Đừng nản lòng! Hãy thử lại! 💫"
}

function checkGrammar(sentence: string): { hasCapital: boolean; hasPunctuation: boolean; score: number } {
  const hasCapital = /^[A-Z]/.test(sentence.trim())
  const hasPunctuation = /[.!?]$/.test(sentence.trim())
  const score = (hasCapital ? 50 : 0) + (hasPunctuation ? 50 : 0)
  return { hasCapital, hasPunctuation, score }
}

// ── Mode handlers ──────────────────────────────────────────────────────────
function handleArrangeMode(userSentence: string, correctSentence: string): FeedbackResponse {
  const similarity = calculateSimilarity(userSentence, correctSentence)
  const isCorrect = similarity >= 95

  let feedback = ""
  const suggestions: string[] = []

  if (isCorrect) {
    feedback = "Chính xác! Bạn đã sắp xếp đúng hoàn toàn câu. Tuyệt vời!"
  } else if (similarity >= 80) {
    feedback = `Gần đúng rồi! Câu của bạn tương tự ${similarity}% với câu đúng. Câu chuẩn: "${correctSentence}"`
    suggestions.push("Kiểm tra lại thứ tự các từ")
    suggestions.push("Chú ý đến cấu trúc ngữ pháp")
  } else if (similarity >= 60) {
    feedback = `Chưa chính xác lắm. Câu đúng là: "${correctSentence}"`
    suggestions.push("Hãy xem lại cấu trúc câu")
    suggestions.push("Chú ý vị trí của chủ ngữ, động từ và tân ngữ")
  } else {
    feedback = `Câu của bạn khác khá nhiều so với câu đúng. Câu chuẩn: "${correctSentence}"`
    suggestions.push("Hãy bắt đầu với chủ ngữ")
    suggestions.push("Sau đó là động từ, rồi đến các thành phần khác")
  }

  return {
    score: similarity,
    isCorrect,
    feedback,
    encouragement: generateEncouragement(similarity),
    suggestions,
  }
}

function handleTranslateMode(
  userSentence: string,
  correctSentence: string,
  vietnameseSentence?: string
): FeedbackResponse {
  const similarity = calculateSimilarity(userSentence, correctSentence)
  const grammar = checkGrammar(userSentence)
  const isCorrect = similarity >= 90

  let feedback = ""
  const suggestions: string[] = []

  if (isCorrect) {
    feedback = "Xuất sắc! Bạn đã dịch chính xác câu này!"
  } else if (similarity >= 75) {
    feedback = `Dịch khá tốt! Độ chính xác ${similarity}%. Câu chuẩn: "${correctSentence}"`
    if (!grammar.hasCapital) suggestions.push("Nhớ viết hoa chữ cái đầu câu")
    if (!grammar.hasPunctuation) suggestions.push("Đừng quên dấu chấm cuối câu")
    suggestions.push("Kiểm tra lại một số từ vựng")
  } else if (similarity >= 50) {
    feedback = `Bạn đã cố gắng nhưng còn một số lỗi. Câu đúng: "${correctSentence}"`
    suggestions.push("Xem lại cấu trúc thì trong tiếng Anh")
    suggestions.push("Chú ý đến trật tự từ")
    if (!grammar.hasCapital) suggestions.push("Viết hoa chữ cái đầu câu")
  } else {
    feedback = `Câu dịch chưa chính xác. Hãy xem câu đúng và học hỏi: "${correctSentence}"`
    suggestions.push("Hãy phân tích cấu trúc câu tiếng Việt trước")
    suggestions.push("Xác định chủ ngữ, động từ, tân ngữ")
    suggestions.push("Chú ý đến thì của động từ")
  }

  const finalScore = Math.round((similarity * 0.7 + grammar.score * 0.3))

  return {
    score: finalScore,
    isCorrect,
    feedback,
    encouragement: generateEncouragement(finalScore),
    suggestions,
  }
}

function handleDescribeMode(
  userSentence: string,
  theme: string,
  suggestedWords: string[]
): FeedbackResponse {
  const wordCount = userSentence.trim().split(/\s+/).length
  const grammar = checkGrammar(userSentence)
  
  // Check vocabulary usage
  const usedSuggestedWords = suggestedWords.filter((word) =>
    userSentence.toLowerCase().includes(word.toLowerCase())
  )
  const vocabScore = Math.min(100, (usedSuggestedWords.length / suggestedWords.length) * 100 + 30)

  // Creativity score based on length and variety
  const creativityScore = Math.min(100, wordCount * 12)

  // Overall score
  const overallScore = Math.round(
    creativityScore * 0.4 + grammar.score * 0.3 + vocabScore * 0.3
  )

  let feedback = ""
  const highlights: string[] = []

  if (overallScore >= 80) {
    feedback = "Tuyệt vời! Câu mô tả của bạn rất hay, sáng tạo và đúng ngữ pháp!"
  } else if (overallScore >= 60) {
    feedback = "Khá tốt! Câu của bạn có ý nghĩa nhưng có thể cải thiện thêm về từ vựng và chi tiết."
  } else {
    feedback = "Cố gắng thêm! Hãy viết câu dài hơn, sử dụng nhiều từ vựng hơn và chú ý ngữ pháp."
  }

  // Generate highlights
  if (grammar.hasCapital) {
    highlights.push("✓ Viết hoa đầu câu đúng")
  } else {
    highlights.push("✗ Cần viết hoa chữ cái đầu câu")
  }

  if (grammar.hasPunctuation) {
    highlights.push("✓ Có dấu câu cuối câu")
  } else {
    highlights.push("✗ Cần thêm dấu chấm cuối câu")
  }

  if (usedSuggestedWords.length > 0) {
    highlights.push(`✓ Sử dụng ${usedSuggestedWords.length}/${suggestedWords.length} từ gợi ý: ${usedSuggestedWords.join(", ")}`)
  } else {
    highlights.push("✗ Chưa sử dụng từ gợi ý nào")
  }

  if (wordCount >= 8) {
    highlights.push(`✓ Câu có độ dài tốt (${wordCount} từ)`)
  } else {
    highlights.push(`✗ Câu hơi ngắn (${wordCount} từ), nên viết dài hơn`)
  }

  return {
    score: overallScore,
    creativity: creativityScore,
    grammar: grammar.score,
    vocabulary: Math.round(vocabScore),
    feedback,
    encouragement: generateEncouragement(overallScore),
    highlights,
  }
}

// ── Main API handler ───────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckSentenceRequest

    const { userSentence, correctSentence, mode, vietnameseSentence, theme, suggestedWords } = body

    if (!userSentence || !mode) {
      return NextResponse.json(
        { error: "Missing required fields: userSentence and mode" },
        { status: 400 }
      )
    }

    let response: FeedbackResponse

    switch (mode) {
      case "arrange":
        if (!correctSentence) {
          return NextResponse.json(
            { error: "correctSentence is required for arrange mode" },
            { status: 400 }
          )
        }
        response = handleArrangeMode(userSentence, correctSentence)
        break

      case "translate":
        if (!correctSentence) {
          return NextResponse.json(
            { error: "correctSentence is required for translate mode" },
            { status: 400 }
          )
        }
        response = handleTranslateMode(userSentence, correctSentence, vietnameseSentence)
        break

      case "describe":
        if (!theme || !suggestedWords) {
          return NextResponse.json(
            { error: "theme and suggestedWords are required for describe mode" },
            { status: 400 }
          )
        }
        response = handleDescribeMode(userSentence, theme, suggestedWords)
        break

      default:
        return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in check-sentence API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
