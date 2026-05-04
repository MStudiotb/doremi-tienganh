import { NextResponse } from "next/server";
import { isAdmin, normalizeEmail } from "@/lib/auth";

type RegisterPayload = {
  email?: string;
  name?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterPayload;
    const email = body.email ? normalizeEmail(body.email) : "";
    const name = body.name?.trim() || "Bạn nhỏ";
    const role = isAdmin(email) ? "ADMIN" : "USER";
    const response = NextResponse.json(
      {
        message: "Đăng ký thành công (Local Mode)",
        user: {
          email,
          name,
          role,
        },
      },
      { status: 201 },
    );

    response.cookies.set("doremi_user_email", email, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    response.cookies.set("doremi_user_role", role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    response.cookies.set("doremi_display_name", name, {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Local register error:", error);

    return NextResponse.json(
      { message: "Không thể đăng ký lúc này. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}
