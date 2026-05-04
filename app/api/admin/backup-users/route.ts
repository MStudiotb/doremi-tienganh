import { NextResponse } from "next/server";
import { backupUsersToFile } from "@/lib/backup-users";

export const runtime = "nodejs";

export async function POST() {
  try {
    const backup = await backupUsersToFile();

    return NextResponse.json({
      message: "Sao lưu dữ liệu người dùng thành công.",
      ...backup,
    });
  } catch (error) {
    console.error("Backup users error:", error);

    return NextResponse.json(
      { message: "Không thể sao lưu dữ liệu người dùng lúc này." },
      { status: 500 },
    );
  }
}
