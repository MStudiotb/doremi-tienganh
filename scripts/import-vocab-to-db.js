const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function importVocabularyToDatabase() {
  let client;
  
  try {
    console.log('🔄 Đang kết nối đến MongoDB...');
    
    // Kết nối MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI không được cấu hình trong .env.local');
    }
    
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    const collection = db.collection('vocabulary');
    
    console.log('✅ Đã kết nối đến MongoDB');
    
    // Đọc file JSON
    console.log('\n📖 Đang đọc file data_1000.json...');
    const jsonPath = path.join(__dirname, '../public/data_1000.json');
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`File không tồn tại: ${jsonPath}\nVui lòng chạy script extract-vocab.js trước.`);
    }
    
    const vocabularyData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ Đã đọc ${vocabularyData.length} từ vựng từ file`);
    
    // Chuẩn bị dữ liệu để import
    console.log('\n🔄 Đang chuẩn bị dữ liệu...');
    const vocabularyToImport = vocabularyData.map(item => ({
      word: item.word,
      phonetic: item.phonetic || '',
      meaning: item.meaning,
      category: item.category || 'GENERAL',
      examples: [],
      level: 'basic', // Đánh dấu là từ vựng cơ bản
      source: '1000_tu_vung_co_ban',
      stt: item.stt,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Kiểm tra xem có từ vựng nào đã tồn tại không
    console.log('\n🔍 Đang kiểm tra từ vựng đã tồn tại...');
    const existingWords = await collection.find({
      source: '1000_tu_vung_co_ban'
    }).toArray();
    
    console.log(`Tìm thấy ${existingWords.length} từ vựng đã tồn tại từ nguồn này`);
    
    // Hỏi người dùng có muốn xóa dữ liệu cũ không
    if (existingWords.length > 0) {
      console.log('\n⚠️  Phát hiện dữ liệu cũ từ nguồn "1000_tu_vung_co_ban"');
      console.log('Đang xóa dữ liệu cũ để import dữ liệu mới...');
      
      const deleteResult = await collection.deleteMany({
        source: '1000_tu_vung_co_ban'
      });
      
      console.log(`✅ Đã xóa ${deleteResult.deletedCount} từ vựng cũ`);
    }
    
    // Import dữ liệu mới
    console.log('\n🔄 Đang import dữ liệu vào database...');
    
    // Chia nhỏ để import (tránh quá tải)
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < vocabularyToImport.length; i += batchSize) {
      const batch = vocabularyToImport.slice(i, i + batchSize);
      await collection.insertMany(batch);
      imported += batch.length;
      console.log(`Đã import ${imported}/${vocabularyToImport.length} từ...`);
    }
    
    console.log('\n✅ Import hoàn tất!');
    console.log(`📊 Tổng số từ vựng đã import: ${imported}`);
    
    // Thống kê theo category
    console.log('\n📊 Thống kê theo chủ đề:');
    const stats = await collection.aggregate([
      { $match: { source: '1000_tu_vung_co_ban' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} từ`);
    });
    
    // Hiển thị một số từ mẫu
    console.log('\n📝 Một số từ vựng đã import:');
    const samples = await collection.find({ source: '1000_tu_vung_co_ban' })
      .sort({ stt: 1 })
      .limit(5)
      .toArray();
    
    samples.forEach(item => {
      console.log(`${item.stt}. ${item.word} ${item.phonetic} - ${item.meaning} [${item.category}]`);
    });
    
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Đã đóng kết nối MongoDB');
    }
  }
}

// Chạy script
importVocabularyToDatabase()
  .then(() => {
    console.log('\n✅ Hoàn thành!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Thất bại:', error);
    process.exit(1);
  });
