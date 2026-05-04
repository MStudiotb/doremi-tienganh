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

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "5000"); // Increased default limit
    const skip = parseInt(searchParams.get("skip") || "0");
    const search = searchParams.get("search")?.toLowerCase().trim();

    // Build query filter
    const filter = search 
      ? {
          $or: [
            { word: { $regex: search, $options: "i" } },
            { meaning: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    // Get total count
    const total = await collection.countDocuments(filter);

    // Get vocabulary sorted by word (A-Z)
    const vocabulary = await collection
      .find(filter)
      .sort({ word: 1 })
      .skip(skip)
      .limit(limit)
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
      total,
      count: vocabulary.length,
      hasMore: skip + vocabulary.length < total,
    });
  } catch (error) {
    console.error("List vocabulary error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tải danh sách từ vựng" },
      { status: 500 }
    );
  }
}
