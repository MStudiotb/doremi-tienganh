import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { markUnitCompleted } from "@/lib/user-progress";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const email = cookieStore.get("doremi_user_email")?.value;

    if (!email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { unitId } = body;

    if (!unitId) {
      return NextResponse.json(
        { message: "Unit ID is required" },
        { status: 400 }
      );
    }

    const progress = await markUnitCompleted(email, unitId);

    return NextResponse.json({
      message: "Unit completed successfully",
      progress,
    });
  } catch (error) {
    console.error("Error marking unit complete:", error);
    return NextResponse.json(
      { message: "Failed to mark unit complete" },
      { status: 500 }
    );
  }
}
