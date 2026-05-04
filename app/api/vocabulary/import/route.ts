import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

interface VocabularyDocument {
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// AI Integration to auto-fill missing vocabulary data
async function fillMissingDataWithAI(word: string): Promise<Omit<VocabularyDocument, "createdAt" | "updatedAt">> {
  try {
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
            content: "You are a helpful English-Vietnamese dictionary assistant. Provide accurate translations, phonetics, and example sentences. Return ONLY valid JSON without any markdown formatting or code blocks."
          },
          {
            role: "user",
            content: `Provide information for the English word "${word}" in the following JSON format:
{
  "word": "${word}",
  "meaning": "Vietnamese translation",
  "phonetic": "IPA phonetic notation",
  "example": "An example sentence in English using this word"
}

Important: Return ONLY the JSON object, no markdown, no code blocks, no additional text.`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error("AI API request failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content from AI");
    }

    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const vocabData = JSON.parse(cleanContent);

    return {
      word: vocabData.word || word,
      meaning: vocabData.meaning || "",
      phonetic: vocabData.phonetic || "",
      example: vocabData.example || "",
      imageUrl: undefined,
    };
  } catch (error) {
    console.error("AI fill error:", error);
    return {
      word,
      meaning: "",
      phonetic: "",
      example: "",
      imageUrl: undefined,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const autoFill = formData.get("autoFill") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp file" },
        { status: 400 }
      );
    }

    let vocabularyList: Partial<VocabularyDocument>[] = [];

    // Check if file is PDF or DOCX - use parse-document endpoint
    if (file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx')) {
      console.log("📄 Detected PDF/DOCX file, using parse-document endpoint...");
      
      // Create new FormData for parse-document endpoint
      const parseFormData = new FormData();
      parseFormData.append("file", file);
      
      // Call parse-document endpoint
      const parseResponse = await fetch(`${request.nextUrl.origin}/api/vocabulary/parse-document`, {
        method: "POST",
        headers: {
          Authorization: authHeader || "",
        },
        body: parseFormData,
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        return NextResponse.json(
          { error: errorData.error || "Không thể phân tách file PDF/DOCX" },
          { status: parseResponse.status }
        );
      }

      const parseData = await parseResponse.json();
      vocabularyList = parseData.vocabulary || [];
      
      console.log(`✅ Parsed ${vocabularyList.length} words from PDF/DOCX`);
    }
    // Check if file is JSON
    else if (file.name.endsWith('.json')) {
      const text = await file.text();
      try {
        const jsonData = JSON.parse(text);
        
        // Handle both array and single object
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        vocabularyList = dataArray.map((item: any) => ({
          word: item.word?.toLowerCase().trim() || "",
          meaning: item.meaning?.trim() || "",
          phonetic: item.phonetic?.trim() || "",
          example: item.example?.trim() || "",
          imageUrl: item.imageUrl?.trim() || undefined,
        })).filter((v: any) => v.word);
        
      } catch (error) {
        return NextResponse.json(
          { error: "File JSON không hợp lệ" },
          { status: 400 }
        );
      }
    } else {
      // Parse CSV
      const text = await file.text();
      const lines = text.split("\n").filter((line: string) => line.trim());

      if (lines.length === 0) {
        return NextResponse.json(
          { error: "File rỗng hoặc không hợp lệ" },
          { status: 400 }
        );
      }

      const header = lines[0].toLowerCase();
      const hasHeader = header.includes("word") || header.includes("từ");

      for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
        
        if (parts.length === 0 || !parts[0]) continue;

        const vocab: Partial<VocabularyDocument> = {
          word: parts[0].toLowerCase(),
          meaning: parts[1] || "",
          phonetic: parts[2] || "",
          example: parts[3] || "",
          imageUrl: parts[4] || undefined,
        };

        vocabularyList.push(vocab);
      }
    }

    if (vocabularyList.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy từ vựng hợp lệ trong file" },
        { status: 400 }
      );
    }

    const clientPromise = getMongoClient();

    if (!clientPromise) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "doremi_eng");
    const collection = db.collection<VocabularyDocument>("vocabulary");

    let imported = 0;
    let updated = 0;
    let aiFilledCount = 0;

    for (const vocab of vocabularyList) {
      if (!vocab.word) continue;

      // Check if word already exists
      const existing = await collection.findOne({ word: vocab.word });

      // Auto-fill missing data with AI if enabled
      if (autoFill && (!vocab.meaning || !vocab.phonetic || !vocab.example)) {
        console.log(`Auto-filling data for "${vocab.word}" with AI...`);
        const aiData = await fillMissingDataWithAI(vocab.word);
        
        vocab.meaning = vocab.meaning || aiData.meaning;
        vocab.phonetic = vocab.phonetic || aiData.phonetic;
        vocab.example = vocab.example || aiData.example;
        
        aiFilledCount++;
      }

      const vocabDoc: VocabularyDocument = {
        word: vocab.word,
        meaning: vocab.meaning || "",
        phonetic: vocab.phonetic || "",
        example: vocab.example || "",
        imageUrl: vocab.imageUrl,
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (existing) {
        // Update existing word
        await collection.updateOne(
          { word: vocab.word },
          { $set: vocabDoc }
        );
        updated++;
      } else {
        // Insert new word
        await collection.insertOne(vocabDoc);
        imported++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import thành công: ${imported} từ mới, ${updated} từ cập nhật${autoFill ? `, ${aiFilledCount} từ được AI tự động điền` : ""}`,
      imported,
      updated,
      aiFilledCount: autoFill ? aiFilledCount : 0,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi import từ vựng" },
      { status: 500 }
    );
  }
}
