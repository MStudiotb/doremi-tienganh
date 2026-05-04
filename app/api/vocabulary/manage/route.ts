import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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

// POST - Add new vocabulary
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

    const body = await request.json();
    const { word, meaning, phonetic, example, imageUrl, autoFill } = body;

    if (!word || !word.trim()) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp từ vựng" },
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

    let vocabData = {
      word: word.toLowerCase().trim(),
      meaning: meaning?.trim() || "",
      phonetic: phonetic?.trim() || "",
      example: example?.trim() || "",
      imageUrl: imageUrl?.trim() || undefined,
    };

    // Auto-fill with AI if requested and data is missing
    if (autoFill && (!vocabData.meaning || !vocabData.phonetic || !vocabData.example)) {
      console.log(`Auto-filling data for "${vocabData.word}" with AI...`);
      const aiData = await fillMissingDataWithAI(vocabData.word);
      
      vocabData.meaning = vocabData.meaning || aiData.meaning;
      vocabData.phonetic = vocabData.phonetic || aiData.phonetic;
      vocabData.example = vocabData.example || aiData.example;
    }

    // Check if word already exists
    const existing = await collection.findOne({ word: vocabData.word });

    if (existing) {
      // Update existing word
      await collection.updateOne(
        { word: vocabData.word },
        {
          $set: {
            ...vocabData,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Từ vựng đã được cập nhật",
        updated: true,
      });
    } else {
      // Insert new word
      const newVocab: VocabularyDocument = {
        ...vocabData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await collection.insertOne(newVocab);

      return NextResponse.json({
        success: true,
        message: "Từ vựng đã được thêm vào kho",
        inserted: true,
      });
    }
  } catch (error) {
    console.error("Add vocabulary error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi thêm từ vựng" },
      { status: 500 }
    );
  }
}

// DELETE - Remove vocabulary
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp ID từ vựng" },
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

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy từ vựng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Từ vựng đã được xóa",
    });
  } catch (error) {
    console.error("Delete vocabulary error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi xóa từ vựng" },
      { status: 500 }
    );
  }
}
