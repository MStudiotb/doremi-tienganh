import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Không có file được tải lên" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Dung lượng ảnh không được vượt quá 10MB" },
        { status: 400 }
      );
    }

    // Create avatars directory if it doesn't exist
    const avatarsDir = join(process.cwd(), "public", "avatars");
    if (!existsSync(avatarsDir)) {
      await mkdir(avatarsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const safeUserId = userId?.replace(/[^a-zA-Z0-9]/g, "") || "user";
    const filename = `${safeUserId}-${timestamp}.${fileExtension}`;
    const filepath = join(avatarsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL path
    const avatarUrl = `/avatars/${filename}`;

    return NextResponse.json(
      {
        message: "Tải ảnh đại diện thành công",
        avatarUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Không thể tải ảnh lên. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
