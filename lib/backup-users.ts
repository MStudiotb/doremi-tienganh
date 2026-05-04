import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getMongoClient } from "@/lib/mongodb";

const BACKUP_DIR = "C:\\Users\\MSTUDIOTB\\Desktop\\HOCTIENGANH\\datauser";

type BackupUser = {
  name?: string;
  email?: string;
  createdAt?: Date | string;
};

function formatDateForFile(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("_");
}

function formatDisplayDate(value?: Date | string) {
  if (!value) {
    return "Không rõ";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Không rõ";
  }

  return date.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function createBackupContent(users: BackupUser[]) {
  const lines = [
    "DOREMI ENG - USERS BACKUP",
    `Thời gian sao lưu: ${formatDisplayDate(new Date())}`,
    `Tổng số người dùng: ${users.length}`,
    "",
    "========================================",
    "",
  ];

  users.forEach((user, index) => {
    lines.push(
      `${index + 1}. Tên: ${user.name || "Bạn nhỏ"}`,
      `   Email: ${user.email || "Không rõ"}`,
      `   Ngày đăng ký: ${formatDisplayDate(user.createdAt)}`,
      "",
    );
  });

  return lines.join("\n");
}

export async function backupUsersToFile() {
  const client = await getMongoClient();
  const users = client
    ? await client
        .db(process.env.MONGODB_DB || "doremi_eng")
        .collection<BackupUser>("users")
        .find({}, { projection: { name: 1, email: 1, createdAt: 1 } })
        .sort({ createdAt: 1 })
        .toArray()
    : [];
  const now = new Date();
  const fileName = `users_backup_${formatDateForFile(now)}.txt`;
  const filePath = path.join(BACKUP_DIR, fileName);

  await mkdir(BACKUP_DIR, { recursive: true });
  await writeFile(filePath, createBackupContent(users), "utf8");

  return {
    fileName,
    filePath,
    userCount: users.length,
  };
}
