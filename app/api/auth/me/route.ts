import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get("doremi_user_email")?.value || "";
  const role = cookieStore.get("doremi_user_role")?.value || "USER";
  const displayName = cookieStore.get("doremi_display_name")?.value || "Bạn nhỏ";

  return NextResponse.json({
    email,
    role,
    displayName,
    isAdmin: role === "ADMIN",
  });
}
