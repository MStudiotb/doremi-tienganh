import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

interface VocabularyDocument {
  _id?: string;
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
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

    // Get all vocabulary sorted by word
    const vocabulary = await collection
      .find({})
      .sort({ word: 1 })
      .limit(1000) // Limit to prevent overload
      .toArray();

    return NextResponse.json({
      vocabulary: vocabulary.map(v => ({
        _id: v._id?.toString(),
        word: v.word,
        meaning: v.meaning,
        phonetic: v.phonetic,
        example: v.example,
        imageUrl: v.imageUrl,
      })),
      total: vocabulary.length,
    });
  } catch (error) {
    console.error("List vocabulary error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tải danh sách từ vựng" },
      { status: 500 }
    );
  }
}
