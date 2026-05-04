const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function listDriveFiles() {
  try {
    // Read credentials
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    
    if (!fs.existsSync(credentialsPath)) {
      console.error('❌ credentials.json not found!');
      return;
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    console.log('🔍 Searching for User folder...\n');
    
    // Search for "User" folder
    const folderResponse = await drive.files.list({
      q: "name='User' and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name, webViewLink)',
      spaces: 'drive',
    });

    if (!folderResponse.data.files || folderResponse.data.files.length === 0) {
      console.log('❌ User folder not found!');
      console.log('Creating User folder...\n');
      
      const folderMetadata = {
        name: 'User',
        mimeType: 'application/vnd.google-apps.folder',
      };

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name, webViewLink',
      });

      console.log('✅ User folder created!');
      console.log(`📁 Folder ID: ${folder.data.id}`);
      console.log(`🔗 Link: ${folder.data.webViewLink}\n`);
      
      return folder.data.id;
    }

    const folderId = folderResponse.data.files[0].id;
    console.log('✅ User folder found!');
    console.log(`📁 Folder ID: ${folderId}`);
    console.log(`🔗 Link: ${folderResponse.data.files[0].webViewLink}\n`);

    // List files in User folder
    console.log('📋 Files in User folder:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const filesResponse = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, createdTime, size, webViewLink)',
      orderBy: 'createdTime desc',
    });

    if (!filesResponse.data.files || filesResponse.data.files.length === 0) {
      console.log('📭 No files found in User folder.');
    } else {
      filesResponse.data.files.forEach((file, index) => {
        console.log(`\n${index + 1}. ${file.name}`);
        console.log(`   📄 ID: ${file.id}`);
        console.log(`   📅 Created: ${new Date(file.createdTime).toLocaleString('vi-VN')}`);
        console.log(`   📦 Size: ${file.size ? (parseInt(file.size) / 1024).toFixed(2) + ' KB' : 'N/A'}`);
        console.log(`   🔗 Link: ${file.webViewLink}`);
      });
      
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`\n📊 Total files: ${filesResponse.data.files.length}`);
    }

    return folderId;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 403) {
      console.error('\n⚠️  Permission denied! Please check:');
      console.error('   1. Service account has Editor access to the folder');
      console.error('   2. Google Drive API is enabled');
      console.error('   3. credentials.json is correct');
    }
  }
}

listDriveFiles();
