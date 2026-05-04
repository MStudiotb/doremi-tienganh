const { MongoClient } = require('mongodb');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function checkDatabaseData() {
  let client;
  
  try {
    console.log('🔍 KIỂM TRA DỮ LIỆU MONGODB\n');
    console.log('=' .repeat(60));
    
    // Kết nối MongoDB
    const uri = process.env.MONGODB_URI;
    console.log('📡 URI:', uri);
    
    if (!uri) {
      throw new Error('MONGODB_URI không được cấu hình');
    }
    
    client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Đã kết nối MongoDB\n');
    
    // Lấy database
    const db = client.db();
    console.log('📊 Database name:', db.databaseName);
    console.log('=' .repeat(60));
    
    // Liệt kê tất cả collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Danh sách Collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    console.log('\n' + '=' .repeat(60));
    
    // Kiểm tra collection 'vocabulary'
    const vocabCollection = db.collection('vocabulary');
    const totalCount = await vocabCollection.countDocuments();
    
    console.log('\n📚 COLLECTION: vocabulary');
    console.log(`   Tổng số documents: ${totalCount}`);
    
    if (totalCount > 0) {
      // Đếm theo source
      const bySource = await vocabCollection.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();
      
      console.log('\n   Phân loại theo source:');
      bySource.forEach(item => {
        console.log(`   - ${item._id || '(không có source)'}: ${item.count} từ`);
      });
      
      // Đếm theo userId (nếu có)
      const byUser = await vocabCollection.aggregate([
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();
      
      if (byUser.length > 0 && byUser[0]._id !== null) {
        console.log('\n   Phân loại theo userId:');
        byUser.forEach(item => {
          console.log(`   - ${item._id || '(không có userId)'}: ${item.count} từ`);
        });
      }
      
      // Hiển thị 5 từ mẫu
      console.log('\n   📝 5 từ vựng mẫu:');
      const samples = await vocabCollection.find().limit(5).toArray();
      samples.forEach((item, index) => {
        console.log(`\n   ${index + 1}. ${item.word}`);
        console.log(`      - meaning: ${item.meaning}`);
        console.log(`      - phonetic: ${item.phonetic || '(không có)'}`);
        console.log(`      - source: ${item.source || '(không có)'}`);
        console.log(`      - userId: ${item.userId || '(không có)'}`);
        console.log(`      - _id: ${item._id}`);
      });
    } else {
      console.log('   ⚠️  Collection rỗng!');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Kiểm tra hoàn tất!\n');
    
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Đã đóng kết nối MongoDB\n');
    }
  }
}

// Chạy script
checkDatabaseData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Thất bại:', error);
    process.exit(1);
  });
