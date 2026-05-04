import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const clientPromise = getMongoClient();
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: "Database not configured" },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db("doremi_learning");

    // Get all lessons from database
    const lessonsCollection = db.collection("lessons");
    const allLessons = await lessonsCollection.find({}).toArray();

    // Get user progress from localStorage (client will send this)
    // For now, we'll return all lessons and let client filter by progress
    const incompleteLessons = allLessons.map((lesson) => ({
      _id: lesson._id.toString(),
      title: lesson.title || "Untitled Lesson",
      grade: lesson.grade || "Unknown",
      unit: lesson.unit || "Unknown",
      description: lesson.description || "",
      // Progress will be fetched from localStorage on client side
    }));

    return NextResponse.json({
      success: true,
      lessons: incompleteLessons,
    });
  } catch (error) {
    console.error("Error fetching incomplete lessons:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
