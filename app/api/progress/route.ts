import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserProgress } from "@/lib/user-progress";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get("doremi_user_email")?.value;

    if (!email) {
      // Return default progress for guest users instead of 401
      return NextResponse.json({
        email: "guest",
        completedUnits: [],
        currentStreak: 0,
        totalLessonsCompleted: 0,
        lastActivityDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const progress = await getUserProgress(email);

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    // Return default progress on error instead of 500
    return NextResponse.json({
      email: "guest",
      completedUnits: [],
      currentStreak: 0,
      totalLessonsCompleted: 0,
      lastActivityDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}
