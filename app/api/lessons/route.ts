import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/**
 * GET /api/lessons
 * Lấy danh sách bài học từ MongoDB, phân loại theo grade
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");

    const clientPromise = getMongoClient();
    
    if (!clientPromise) {
      // Fallback: Trả về dữ liệu mẫu nếu không có MongoDB
      return NextResponse.json({
        success: false,
        message: "MongoDB not configured",
        lessons: []
      });
    }

    const client = await clientPromise;
    const db = client.db("doremi");
    const collection = db.collection("lessons");

    // Query filter
    const filter: any = { source: "import" };
    if (grade) {
      filter.grade = parseInt(grade);
    }

    // Lấy lessons và sắp xếp theo grade, part
    const lessons = await collection
      .find(filter)
      .sort({ grade: 1, part: 1 })
      .toArray();

    // Nhóm theo grade
    const lessonsByGrade: Record<number, any[]> = {};
    
    lessons.forEach((lesson) => {
      const gradeNum = lesson.grade;
      if (!lessonsByGrade[gradeNum]) {
        lessonsByGrade[gradeNum] = [];
      }
      lessonsByGrade[gradeNum].push({
        id: lesson._id.toString(),
        grade: lesson.grade,
        part: lesson.part,
        title: lesson.title,
        fileName: lesson.fileName,
        namespace: lesson.namespace,
        vocabulary: lesson.vocabulary || [],
        sentences: lesson.sentences || [],
        skillTags: lesson.skillTags || [],
      });
    });

    return NextResponse.json({
      success: true,
      total: lessons.length,
      lessonsByGrade,
      lessons: lessons.map((lesson) => ({
        id: lesson._id.toString(),
        grade: lesson.grade,
        part: lesson.part,
        title: lesson.title,
        fileName: lesson.fileName,
        namespace: lesson.namespace,
        vocabulary: lesson.vocabulary || [],
        sentences: lesson.sentences || [],
        skillTags: lesson.skillTags || [],
      })),
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lessons",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
