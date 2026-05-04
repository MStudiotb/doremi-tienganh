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

// AI Integration via 9Router to auto-fill vocabulary data
async function fetchVocabularyFromAI(word: string): Promise<Omit<VocabularyDocument, "createdAt" | "updatedAt">> {
  try {
    // Using 9Router API for AI-powered vocabulary lookup
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

    // Clean up the response - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const vocabData = JSON.parse(cleanContent);

    return {
      word: vocabData.word || word,
      meaning: vocabData.meaning || "Không tìm thấy nghĩa",
      phonetic: vocabData.phonetic || "",
      example: vocabData.example || "",
      imageUrl: undefined,
    };
  } catch (error) {
    console.error("AI fetch error:", error);
    // Fallback to basic data if AI fails
    return {
      word,
      meaning: "Không tìm thấy nghĩa (AI không khả dụng)",
      phonetic: "",
      example: "",
      imageUrl: undefined,
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const word = searchParams.get("word")?.toLowerCase().trim();

    if (!word) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp từ vựng cần tra cứu" },
        { status: 400 }
      );
    }

    const clientPromise = getMongoClient();

    // If MongoDB is not configured, use AI only
    if (!clientPromise) {
      console.log("MongoDB not configured, using AI only");
      const aiData = await fetchVocabularyFromAI(word);
      return NextResponse.json(aiData);
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "doremi_eng");
    const collection = db.collection<VocabularyDocument>("vocabulary");

    // Try to find the word in database
    let vocabData = await collection.findOne({ word });

    if (vocabData) {
      // Word found in database
      return NextResponse.json({
        word: vocabData.word,
        meaning: vocabData.meaning,
        phonetic: vocabData.phonetic,
        example: vocabData.example,
        imageUrl: vocabData.imageUrl,
      });
    }

    // Word not found in database, fetch from AI and save
    console.log(`Word "${word}" not found in DB, fetching from AI...`);
    const aiData = await fetchVocabularyFromAI(word);

    // Save to database for future lookups
    const newVocab: VocabularyDocument = {
      ...aiData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(newVocab);
    console.log(`Saved "${word}" to database`);

    return NextResponse.json({
      word: aiData.word,
      meaning: aiData.meaning,
      phonetic: aiData.phonetic,
      example: aiData.example,
      imageUrl: aiData.imageUrl,
    });
  } catch (error) {
    console.error("Vocabulary search error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tra cứu từ vựng" },
      { status: 500 }
    );
  }
}
