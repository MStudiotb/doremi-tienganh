import { NextRequest, NextResponse } from "next/server"

type ChatRequestBody = {
  question?: string
  currentLevel?: string
}

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}

function getChatCompletionsUrl(apiBase: string) {
  const trimmedBase = apiBase.replace(/\/+$/, "")

  if (trimmedBase.endsWith("/chat/completions")) {
    return trimmedBase
  }

  return `${trimmedBase}/chat/completions`
}

export async function POST(req: NextRequest) {
  let body: ChatRequestBody

  try {
    body = (await req.json()) as ChatRequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const question = body.question?.trim()
  if (!question) {
    return NextResponse.json(
      { error: "Vui long nhap cau hoi." },
      { status: 400 },
    )
  }

  const currentLevel = body.currentLevel || "Cơ bản"
  console.log("🎓 Student level received:", currentLevel)

  const apiBase = process.env.OPENAI_API_BASE
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiBase || !apiKey) {
    return NextResponse.json(
      { error: "Thieu OPENAI_API_BASE hoac OPENAI_API_KEY." },
      { status: 500 },
    )
  }

  // Define teaching approach based on student level
  const levelGuidance: Record<string, string> = {
    "Cơ bản": `Học sinh đang ở cấp độ CƠ BẢN:
- Sử dụng từ vựng đơn giản, câu ngắn và rõ ràng
- Giải thích từng từ mới bằng tiếng Việt
- Dùng nhiều ví dụ cụ thể từ cuộc sống hàng ngày
- Khuyến khích nhiều, tạo động lực học tập
- Tập trung vào phát âm cơ bản và cấu trúc câu đơn giản`,
    
    "Trung cấp": `Học sinh đang ở cấp độ TRUNG CẤP:
- Sử dụng từ vựng phong phú hơn, câu phức tạp vừa phải
- Giới thiệu các cụm từ và thành ngữ phổ biến
- Khuyến khích học sinh tự suy nghĩ và đưa ra câu trả lời
- Giải thích ngữ pháp sâu hơn với nhiều ví dụ thực tế
- Bắt đầu giới thiệu các chủ đề đa dạng hơn`,
    
    "Trung cao cấp": `Học sinh đang ở cấp độ TRUNG CAO CẤP:
- Sử dụng ngôn ngữ tự nhiên, đa dạng về từ vựng
- Giới thiệu các cấu trúc ngữ pháp nâng cao
- Khuyến khích thảo luận và phân tích sâu
- Đưa ra các tình huống thực tế phức tạp hơn
- Tập trung vào việc sử dụng tiếng Anh trong công việc và học tập`,
    
    "Cao cấp": `Học sinh đang ở cấp độ CAO CẤP:
- Sử dụng ngôn ngữ học thuật và chuyên nghiệp
- Thảo luận các chủ đề phức tạp, trừu tượng
- Khuyến khích tư duy phản biện bằng tiếng Anh
- Giới thiệu các sắc thái ngôn ngữ và văn hóa
- Tập trung vào việc hoàn thiện kỹ năng giao tiếp`,
    
    "Thành thạo": `Học sinh đang ở cấp độ THÀNH THẠO:
- Sử dụng ngôn ngữ như người bản ngữ
- Thảo luận mọi chủ đề một cách tự nhiên và sâu sắc
- Giới thiệu các thành ngữ, tiếng lóng và văn hóa đương đại
- Khuyến khích sáng tạo và diễn đạt cá nhân
- Tập trung vào việc tinh chỉnh và hoàn thiện`,
    
    "Master": `Học sinh đang ở cấp độ MASTER:
- Giao tiếp như với người bản ngữ trình độ cao
- Thảo luận các chủ đề chuyên sâu, học thuật
- Phân tích ngôn ngữ ở mức độ tinh tế nhất
- Khuyến khích sử dụng ngôn ngữ một cách nghệ thuật
- Tập trung vào sự hoàn hảo và phong cách cá nhân`,
  }

  const systemPrompt = `Bạn là Cô Doremi - một giáo viên tiếng Anh vui nhộn và nhiệt tình dành cho học sinh Việt Nam! 🎵✨

Tính cách của bạn:
- Luôn vui vẻ, thân thiện và khuyến khích học sinh học tập
- Dùng emoji và ngôn ngữ sinh động để thu hút sự chú ý
- Khen ngợi và động viên học sinh khi họ cố gắng
- Kiên nhẫn giải thích nhiều lần nếu cần

Cách dạy của bạn:
- Giải thích ngữ pháp một cách đơn giản, dễ hiểu với ví dụ thực tế
- Dùng câu chuyện, hình ảnh hoặc trò chơi để minh họa
- Luôn cho ví dụ bằng cả tiếng Anh và tiếng Việt
- Chia nhỏ kiến thức phức tạp thành các phần dễ hiểu
- Khuyến khích học sinh thực hành và không sợ sai

QUAN TRỌNG - Điều chỉnh theo trình độ học sinh:
${levelGuidance[currentLevel] || levelGuidance["Cơ bản"]}

Hãy trả lời bằng tiếng Việt, ngắn gọn nhưng đầy đủ ý nghĩa. Luôn tạo không khí học tập vui vẻ và tích cực! 🌟`

  console.log("🚀 Sending request to 9Router:", getChatCompletionsUrl(apiBase))
  console.log("📦 Request body:", {
    model: "kr/claude-sonnet-4.5",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: question,
      },
    ],
    temperature: 0.7,
    stream: false, // Explicitly disable streaming
  })

  const aiResponse = await fetch(getChatCompletionsUrl(apiBase), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "kr/claude-sonnet-4.5",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.7,
      stream: false, // Explicitly disable streaming
    }),
  })

  console.log("📡 Response status:", aiResponse.status)
  console.log("📡 Response headers:", Object.fromEntries(aiResponse.headers.entries()))

  // Get response text first to debug
  const responseText = await aiResponse.text()
  console.log("📄 Raw response text:", responseText)

  // Try to parse JSON
  let data: ChatCompletionResponse
  try {
    data = JSON.parse(responseText) as ChatCompletionResponse
    console.log("✅ Parsed JSON data:", data)
  } catch (parseError) {
    console.error("❌ JSON parse error:", parseError)
    console.error("❌ Response text that failed to parse:", responseText)
    return NextResponse.json(
      {
        error: `Khong the parse JSON tu 9Router. Response: ${responseText.substring(0, 200)}`,
      },
      { status: 500 },
    )
  }

  if (!aiResponse.ok) {
    console.error("❌ AI Response not OK:", data)
    return NextResponse.json(
      {
        error:
          data.error?.message || "Khong the ket noi AI qua 9Router luc nay.",
      },
      { status: aiResponse.status },
    )
  }

  const answer = data.choices?.[0]?.message?.content?.trim()
  console.log("💬 Final answer:", answer)

  return NextResponse.json({
    answer: answer || "AI chua tra ve noi dung phu hop.",
  })
}
