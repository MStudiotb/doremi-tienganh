/**
 * Script tự động import bài học từ thư mục "du lieu nhap"
 * Phân loại theo lớp (grade) và phần (part) dựa trên tên file
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Đường dẫn thư mục chứa file
const INPUT_FOLDER = 'C:\\Users\\MSTUDIOTB\\Desktop\\HOCTIENGANH\\du lieu nhap';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'doremi';
const COLLECTION_NAME = 'lessons';

/**
 * Phân tích tên file để lấy thông tin grade và part
 * @param {string} filename - Tên file
 * @returns {Object} - { grade, part, title, originalName }
 */
function parseFileName(filename) {
  const lowerName = filename.toLowerCase();
  
  // Xác định lớp (grade)
  let grade = null;
  if (lowerName.includes('lop 1') || lowerName.includes('smart-start-1')) {
    grade = 1;
  } else if (lowerName.includes('lop 2') || lowerName.includes('smart-start-2')) {
    grade = 2;
  } else if (lowerName.includes('lop 3') || lowerName.includes('smart-start-3')) {
    grade = 3;
  } else if (lowerName.includes('lop 4') || lowerName.includes('level 4')) {
    grade = 4;
  } else if (lowerName.includes('lop 5') || lowerName.includes('level 5')) {
    grade = 5;
  }
  
  // Xác định phần (part)
  let part = 1; // Mặc định là phần 1
  if (lowerName.includes('phan 2') || lowerName.includes('p2') || lowerName.includes('part 2')) {
    part = 2;
  } else if (lowerName.includes('phan 3') || lowerName.includes('p3') || lowerName.includes('part 3')) {
    part = 3;
  } else if (lowerName.includes('phan 1') || lowerName.includes('p1') || lowerName.includes('part 1')) {
    part = 1;
  }
  
  // Tạo title từ tên file
  const title = filename
    .replace(/\.pdf$/i, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return {
    grade,
    part,
    title,
    originalName: filename
  };
}

/**
 * Quét thư mục và lấy danh sách file PDF
 * @param {string} folderPath - Đường dẫn thư mục
 * @returns {Array} - Danh sách file PDF
 */
function scanFolder(folderPath) {
  const files = [];
  
  try {
    const items = fs.readdirSync(folderPath);
    
    for (const item of items) {
      const fullPath = path.join(folderPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile() && item.toLowerCase().endsWith('.pdf')) {
        files.push({
          path: fullPath,
          name: item
        });
      }
    }
  } catch (error) {
    console.error('Lỗi khi quét thư mục:', error.message);
  }
  
  return files;
}

/**
 * Import lessons vào MongoDB
 */
async function importLessons() {
  let client;
  
  try {
    console.log('🔍 Đang quét thư mục:', INPUT_FOLDER);
    
    // Quét thư mục
    const files = scanFolder(INPUT_FOLDER);
    console.log(`📁 Tìm thấy ${files.length} file PDF\n`);
    
    if (files.length === 0) {
      console.log('❌ Không tìm thấy file PDF nào trong thư mục');
      return;
    }
    
    // Kết nối MongoDB
    console.log('🔌 Đang kết nối MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Đã kết nối MongoDB\n');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Xử lý từng file
    const lessons = [];
    const summary = {
      total: 0,
      byGrade: {}
    };
    
    for (const file of files) {
      const parsed = parseFileName(file.name);
      
      if (!parsed.grade) {
        console.log(`⚠️  Bỏ qua file (không xác định được lớp): ${file.name}`);
        continue;
      }
      
      const lesson = {
        grade: parsed.grade,
        part: parsed.part,
        title: parsed.title,
        fileName: parsed.originalName,
        filePath: file.path,
        namespace: 'primary_data', // All grades 1-5 are primary school (Cấp 1)
        vocabulary: [],
        sentences: [],
        skillTags: ['Từ vựng', 'Ngữ pháp', 'Nghe', 'Nói'],
        source: 'import',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      lessons.push(lesson);
      
      // Cập nhật summary
      summary.total++;
      if (!summary.byGrade[parsed.grade]) {
        summary.byGrade[parsed.grade] = { count: 0, parts: {} };
      }
      summary.byGrade[parsed.grade].count++;
      if (!summary.byGrade[parsed.grade].parts[parsed.part]) {
        summary.byGrade[parsed.grade].parts[parsed.part] = 0;
      }
      summary.byGrade[parsed.grade].parts[parsed.part]++;
      
      console.log(`✅ Lớp ${parsed.grade} - Phần ${parsed.part}: ${parsed.title}`);
    }
    
    if (lessons.length === 0) {
      console.log('\n❌ Không có bài học nào để import');
      return;
    }
    
    // Sắp xếp lessons theo grade và part
    lessons.sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      return a.part - b.part;
    });
    
    // Xóa dữ liệu cũ (nếu có) và insert mới
    console.log('\n🗑️  Đang xóa dữ liệu cũ...');
    await collection.deleteMany({ source: 'import' });
    
    console.log('📤 Đang import vào MongoDB...');
    const result = await collection.insertMany(lessons);
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ IMPORT THÀNH CÔNG!');
    console.log('='.repeat(60));
    console.log(`📊 Tổng số bài học: ${summary.total}`);
    console.log('\n📚 Phân bổ theo lớp:');
    
    for (let grade = 1; grade <= 5; grade++) {
      if (summary.byGrade[grade]) {
        const gradeData = summary.byGrade[grade];
        console.log(`\n   Lớp ${grade}: ${gradeData.count} bài học`);
        
        const parts = Object.keys(gradeData.parts).sort((a, b) => a - b);
        parts.forEach(part => {
          console.log(`      - Phần ${part}: ${gradeData.parts[part]} bài`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Đã import ${result.insertedCount} bài học vào database`);
    console.log(`📍 Database: ${DB_NAME}`);
    console.log(`📍 Collection: ${COLLECTION_NAME}`);
    
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Đã đóng kết nối MongoDB');
    }
  }
}

// Chạy script
if (require.main === module) {
  importLessons().catch(console.error);
}

module.exports = { importLessons, parseFileName, scanFolder };
