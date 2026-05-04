import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

interface ParsedVocabulary {
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
}

// Parse PDF using pdf-parse (simple and reliable)
async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    console.log("📄 Starting PDF parsing with pdf-parse...");
    console.log("📊 Buffer size:", buffer.byteLength, "bytes");
    
    // Use require for CommonJS module
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    
    console.log("✅ PDF parsed successfully");
    console.log("📄 Total pages:", data.numpages);
    console.log("📝 Total text extracted:", data.text.length, "characters");
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("PDF không chứa văn bản có thể đọc được. File có thể là ảnh scan hoặc bị mã hóa.");
    }
    
    return data.text;
  } catch (error) {
    console.error("❌ PDF parsing error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Invalid PDF") || error.message.includes("PDF header")) {
        throw new Error("File PDF không hợp lệ hoặc bị hỏng. Vui lòng thử file khác hoặc chuyển sang định dạng .docx");
      }
      if (error.message.includes("password") || error.message.includes("encrypted")) {
        throw new Error("File PDF được bảo vệ bằng mật khẩu hoặc bị mã hóa. Vui lòng mở khóa file trước khi tải lên.");
      }
      if (error.message.includes("không chứa văn bản")) {
        throw error; // Re-throw our custom message
      }
    }
    
    throw new Error("Không thể đọc file PDF. Vui lòng thử: 1) Chuyển sang file .docx, 2) Xuất lại PDF từ Word, 3) Kiểm tra file có bị hỏng không");
  }
}

// Parse DOCX using mammoth (extract plain text only)
async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    console.log("📄 Starting DOCX parsing with mammoth...");
    console.log("📊 Buffer size:", buffer.byteLength, "bytes");
    
    // Use extractRawText to get plain text without formatting
    const result = await mammoth.extractRawText({ buffer });
    
    console.log("✅ DOCX parsed successfully");
    console.log("📝 Text extracted:", result.value.length, "characters");
    
    if (result.messages && result.messages.length > 0) {
      console.log("⚠️ DOCX parsing warnings:", result.messages);
    }
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error("File Word không chứa văn bản có thể đọc được");
    }
    
    return result.value;
  } catch (error) {
    console.error("❌ DOCX parsing error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    if (error instanceof Error && error.message.includes("không chứa văn bản")) {
      throw error;
    }
    
    throw new Error("Không thể đọc file Word. Vui lòng kiểm tra file có bị hỏng không hoặc thử xuất lại từ Word");
  }
}

// Use AI to parse vocabulary from raw text
async function parseVocabularyWithAI(rawText: string): Promise<ParsedVocabulary[]> {
  try {
    console.log("🤖 Starting AI vocabulary extraction...");
    console.log("📝 Text length:", rawText.length, "characters");
    
    const response = await fetch("https://api.9router.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NINEROUTER_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert at extracting vocabulary data from documents. 
Your task is to:
1. Identify English words/phrases with their Vietnamese meanings
2. Extract phonetic notation if available
3. Extract example sentences if available
4. Filter out page numbers, headers, footers, and irrelevant text
5. Return ONLY valid JSON array without markdown formatting

Return format:
[
  {
    "word": "english word",
    "meaning": "nghĩa tiếng Việt",
    "phonetic": "IPA notation or empty string",
    "example": "example sentence or empty string"
  }
]`
          },
          {
            role: "user",
            content: `Extract vocabulary from this text. Return ONLY a JSON array, no markdown, no explanations:

${rawText.slice(0, 15000)}` // Limit to avoid token limits
          }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AI API error:", response.status, errorText);
      throw new Error("AI API request failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content from AI");
    }

    console.log("✅ AI response received");
    console.log("📝 Response preview:", content.slice(0, 200));

    // Clean up response
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const vocabularyList = JSON.parse(cleanContent);

    // Validate and clean data
    const cleanedList = vocabularyList
      .filter((item: any) => item.word && item.word.trim())
      .map((item: any) => ({
        word: item.word.toLowerCase().trim(),
        meaning: item.meaning?.trim() || "",
        phonetic: item.phonetic?.trim() || "",
        example: item.example?.trim() || "",
      }));

    console.log("✅ AI extraction complete:", cleanedList.length, "words found");
    
    return cleanedList;
  } catch (error) {
    console.error("❌ AI parsing error:", error);
    throw new Error("AI không thể phân tách dữ liệu từ văn bản. Vui lòng kiểm tra lại nội dung file.");
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 Starting document parsing request");
    console.log("⏰ Time:", new Date().toISOString());
    console.log("=".repeat(60));
    
    // Check if user is admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("❌ No file provided");
      return NextResponse.json(
        { error: "Vui lòng cung cấp file" },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;
    
    console.log("📁 File info:", {
      name: fileName,
      size: `${(fileSize / 1024).toFixed(2)} KB`,
      type: fileType,
    });

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (fileSize > MAX_FILE_SIZE) {
      console.log("❌ File too large:", fileSize, "bytes");
      return NextResponse.json(
        { error: `File quá lớn (${(fileSize / 1024 / 1024).toFixed(2)}MB). Vui lòng sử dụng file nhỏ hơn 10MB` },
        { status: 400 }
      );
    }

    // Convert File to Buffer (proper multer-style buffer)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("✅ File buffer created:", buffer.byteLength, "bytes");
    console.log("🔍 Buffer validation: isBuffer =", Buffer.isBuffer(buffer));

    let rawText = "";
    let fileFormat = "";

    // Parse based on file type
    const fileNameLower = fileName.toLowerCase();
    if (fileNameLower.endsWith(".pdf")) {
      fileFormat = "PDF";
      console.log("📄 Detected PDF file - using pdf-parse");
      rawText = await parsePDF(buffer);
    } else if (fileNameLower.endsWith(".docx")) {
      fileFormat = "DOCX";
      console.log("📄 Detected DOCX file - using mammoth");
      rawText = await parseDOCX(buffer);
    } else {
      console.log("❌ Unsupported file format:", fileName);
      return NextResponse.json(
        { error: "Định dạng file không được hỗ trợ. Chỉ chấp nhận .pdf hoặc .docx" },
        { status: 400 }
      );
    }

    // Validate extracted text
    console.log("🔍 Validating extracted text...");
    console.log("📊 Text length:", rawText.length, "characters");
    console.log("📊 Text preview (first 300 chars):", rawText.slice(0, 300).replace(/\n/g, " "));

    if (!rawText || rawText.trim().length < 10) {
      console.log("❌ Extracted text too short:", rawText.length, "characters");
      return NextResponse.json(
        { error: "File rỗng hoặc không thể đọc được nội dung. Vui lòng kiểm tra lại file." },
        { status: 400 }
      );
    }

    console.log("✅ Text extraction successful!");
    console.log("📝 Total characters extracted:", rawText.length);

    // Use AI to parse vocabulary
    console.log("🤖 Sending to AI for vocabulary extraction...");
    const vocabularyList = await parseVocabularyWithAI(rawText);

    if (vocabularyList.length === 0) {
      console.log("❌ No vocabulary found in text");
      return NextResponse.json(
        { error: "Không tìm thấy từ vựng nào trong file. Vui lòng kiểm tra định dạng nội dung." },
        { status: 400 }
      );
    }

    const duration = Date.now() - startTime;
    console.log("✅ Parsing successful!");
    console.log("📊 Results:", {
      vocabularyCount: vocabularyList.length,
      duration: `${(duration / 1000).toFixed(2)}s`,
      fileFormat,
    });
    console.log("=".repeat(60) + "\n");

    return NextResponse.json({
      success: true,
      vocabulary: vocabularyList,
      total: vocabularyList.length,
      message: `Đã phân tách được ${vocabularyList.length} từ vựng từ file ${fileFormat}`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("\n" + "❌".repeat(30));
    console.error("💥 DOCUMENT PARSING ERROR");
    console.error("❌".repeat(30));
    console.error("Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${(duration / 1000).toFixed(2)}s`,
    });
    console.error("❌".repeat(30) + "\n");
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi xử lý file" 
      },
      { status: 500 }
    );
  }
}
