import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Google Drive API
export function getGoogleDriveClient() {
  try {
    // Path to credentials file
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    
    // Check if credentials file exists
    if (!fs.existsSync(credentialsPath)) {
      console.error('credentials.json not found. Please add it to the project root.');
      return null;
    }

    // Read credentials
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    // Create drive client
    const drive = google.drive({ version: 'v3', auth });
    
    return drive;
  } catch (error) {
    console.error('Error initializing Google Drive client:', error);
    return null;
  }
}

// Find or create "User" folder in Google Drive
export async function findOrCreateUserFolder(drive: any): Promise<string | null> {
  try {
    // Search for existing "User" folder
    const response = await drive.files.list({
      q: "name='User' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    // If folder exists, return its ID
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create new "User" folder
    const folderMetadata = {
      name: 'User',
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error finding/creating User folder:', error);
    return null;
  }
}

// Upload user registration data to Google Drive
export async function uploadUserDataToDrive(userData: {
  name: string;
  email: string;
  grade: string;
  age: string;
  gender: string;
  avatarUrl: string;
  registrationDate: string;
}): Promise<boolean> {
  try {
    const drive = getGoogleDriveClient();
    if (!drive) {
      console.error('Google Drive client not initialized');
      return false;
    }

    // Find or create User folder
    const folderId = await findOrCreateUserFolder(drive);
    if (!folderId) {
      console.error('Could not find or create User folder');
      return false;
    }

    // Format registration date for filename
    const date = new Date(userData.registrationDate);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Create filename: [Tên_User]_[Ngày_Đăng_Ký].txt
    const sanitizedName = userData.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const fileName = `${sanitizedName}_${dateStr}.txt`;

    // Create file content
    const fileContent = `
╔════════════════════════════════════════════════════════════╗
║           THÔNG TIN ĐĂNG KÝ HỌC VIÊN - DOREMI            ║
╚════════════════════════════════════════════════════════════╝

📋 THÔNG TIN CÁ NHÂN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Họ và Tên:           ${userData.name}
📧 Email:               ${userData.email}
🎂 Tuổi:                ${userData.age}
👥 Giới tính:           ${userData.gender === 'male' ? 'Nam' : 'Nữ'}

📚 THÔNG TIN HỌC TẬP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 Cấp độ bắt đầu:      Tập Sự
📖 Khối học:            ${userData.grade}
🖼️  Ảnh đại diện:        ${userData.avatarUrl}

⏰ THÔNG TIN ĐĂNG KÝ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Ngày đăng ký:        ${date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
🌐 Hệ thống:            DOREMI - Học Tiếng Anh Mỗi Ngày

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Ghi chú: File này được tạo tự động bởi hệ thống DOREMI
🔒 Bảo mật: Thông tin được lưu trữ an toàn trên Google Drive
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phát triển bởi: TJN MSTUDIOTB
Website: https://doremi-hoctienganh.com
`;

    // Upload file to Google Drive
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
      mimeType: 'text/plain',
    };

    const media = {
      mimeType: 'text/plain',
      body: fileContent,
    };

    await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    console.log(`✅ User data uploaded successfully: ${fileName}`);
    return true;
  } catch (error) {
    console.error('Error uploading user data to Google Drive:', error);
    return false;
  }
}
