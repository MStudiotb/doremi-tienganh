import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH,
  isAdmin,
  normalizeEmail,
} from "@/lib/auth";

type LoginPayload = {
  email?: string;
  password?: string;
};

const LOCAL_ADMIN_PASSWORD = "1b30lethanhtong";

function createAdminLoginResponse(email: string) {
  const response = NextResponse.json({
    message: "Đăng nhập Admin thành công (Local Mode).",
    redirectTo: "/",
    user: {
      email,
      name: "Admin",
      role: "ADMIN",
    },
  });

  response.cookies.set("doremi_user_email", email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  response.cookies.set("doremi_user_role", "ADMIN", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  response.cookies.set("doremi_display_name", "Admin", {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload;
    const email = body.email ? normalizeEmail(body.email) : "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập email và mật khẩu." },
        { status: 400 },
      );
    }

    if (email === ADMIN_EMAIL && password === LOCAL_ADMIN_PASSWORD) {
      return createAdminLoginResponse(email);
    }

    const isAdminPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isAdmin(email) || !isAdminPassword) {
      return NextResponse.json(
        { message: "Email hoặc mật khẩu không đúng." },
        { status: 401 },
      );
    }

    return createAdminLoginResponse(email);
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Không thể đăng nhập lúc này. Vui lòng thử lại sau." },
      { status: 500 },
    );
  }
}
