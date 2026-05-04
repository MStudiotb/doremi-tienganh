import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdmin } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";
import mammoth from "mammoth";

export const dynamic = "force-dynamic";

// AI-powered content parser using Claude
async function parseContentWithAI(content: string, fileType: string): Promise<any> {
  try {
    const prompt = `Bạn là một trợ lý AI chuyên phân tích nội dung giáo dục tiếng Anh. Hãy phân tích nội dung sau và trích xuất thành các bài học (Units) với cấu trúc JSON.

Nội dung cần phân tích (từ file ${fileType}):
${content}

Hãy trả về JSON với cấu trúc sau:
{
  "lessons": [
    {
      "title": "Tên bài học (ví dụ: Unit 1 - Hello)",
      "part": 1,
      "vocabulary": [
        {
          "word": "từ tiếng Anh",
          "phonetic": "phiên âm (nếu có)",
          "meaning": "nghĩa tiếng Việt"
        }
      ],
      "sentences": [
        "Mẫu câu tiếng Anh 1",
        "Mẫu câu tiếng Anh 2"
      ],
      "skillTags": ["Từ vựng", "Ngữ pháp", "Nghe", "Nói"]
    }
  ]
}

Lưu ý:
- Tự động nhận diện và phân chia thành các Unit/Lesson
- Trích xuất tất cả từ vựng với nghĩa
- Trích xuất các mẫu câu quan trọng
- Nếu không có phiên âm, để trống ""
- Mỗi bài học nên có ít nhất 5-10 từ vựng
- Chỉ trả về JSON, không thêm text giải thích

Trả về JSON:`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI không trả về JSON hợp lệ");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("AI parsing error:", error);
    throw new Error("Lỗi khi phân tích nội dung với AI");
  }
}

// Parse PDF file
async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for pdf-parse (CommonJS module)
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Lỗi khi đọc file PDF");
  }
}

// Parse Word file
async function parseWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Word parsing error:", error);
    throw new Error("Lỗi khi đọc file Word");
  }
}

// Parse text file
function parseText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }

    const userEmail = session.user.email;

    const formData = await request.formData();
    const gradeId = parseInt(formData.get("gradeId") as string);
    const method = formData.get("method") as string;
    const file = formData.get("file") as File | null;
    const jsonContent = formData.get("jsonContent") as string | null;

    if (!gradeId || !method) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    let parsedData: any;

    // Handle JSON input
    if (method === "json") {
      if (jsonContent) {
        parsedData = JSON.parse(jsonContent);
      } else if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const jsonText = buffer.toString("utf-8");
        parsedData = JSON.parse(jsonText);
      } else {
        return NextResponse.json(
          { success: false, message: "No JSON content provided" },
          { status: 400 }
        );
      }
    }
    // Handle file uploads with AI parsing
    else {
      if (!file) {
        return NextResponse.json(
          { success: false, message: "No file provided" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      let extractedText = "";

      // Extract text based on file type
      switch (method) {
        case "pdf":
          extractedText = await parsePDF(buffer);
          break;
        case "docx":
          extractedText = await parseWord(buffer);
          break;
        case "txt":
          extractedText = parseText(buffer);
          break;
        default:
          return NextResponse.json(
            { success: false, message: "Unsupported file type" },
            { status: 400 }
          );
      }

      if (!extractedText.trim()) {
        return NextResponse.json(
          { success: false, message: "Không thể trích xuất nội dung từ file" },
          { status: 400 }
        );
      }

      // Use AI to parse the content
      parsedData = await parseContentWithAI(extractedText, method);
    }

    // Validate parsed data structure
    if (!parsedData.lessons || !Array.isArray(parsedData.lessons)) {
      return NextResponse.json(
        { success: false, message: "Invalid data structure - missing lessons array" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const clientPromise = getMongoClient();
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, message: "Database not configured" },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db("doremi");
    const collection = db.collection("lessons");

    // Get the highest part number for this grade
    const lastLesson = await collection
      .findOne({ grade: gradeId, source: "import" }, { sort: { part: -1 } });
    
    let nextPart = lastLesson ? lastLesson.part + 1 : 1;

    // Insert lessons into database
    const lessonsToInsert = parsedData.lessons.map((lesson: any, index: number) => ({
      grade: gradeId,
      part: lesson.part || nextPart + index,
      title: lesson.title || `Unit ${nextPart + index}`,
      fileName: `grade${gradeId}_part${nextPart + index}.json`,
      namespace: `grade${gradeId}_part${nextPart + index}`,
      vocabulary: lesson.vocabulary || [],
      sentences: lesson.sentences || [],
      skillTags: lesson.skillTags || ["Từ vựng", "Ngữ pháp"],
      source: "import",
      uploadedBy: userEmail,
      uploadedAt: new Date(),
    }));

    const result = await collection.insertMany(lessonsToInsert);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${result.insertedCount} lessons`,
      lessonsCreated: result.insertedCount,
      lessons: lessonsToInsert.map((l: any, i: number) => ({
        id: Object.values(result.insertedIds)[i].toString(),
        title: l.title,
        part: l.part,
      })),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
