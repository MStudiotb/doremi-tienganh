const http = require('http');

console.log('🧪 KIỂM TRA API VOCABULARY\n');
console.log('=' .repeat(60));

// Test API endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/vocabulary/list',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('📡 Đang gọi API: http://localhost:3000/api/vocabulary/list\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📊 Kết quả:');
    console.log('   Status Code:', res.statusCode);
    
    if (res.statusCode === 200) {
      try {
        const result = JSON.parse(data);
        console.log('   ✅ API hoạt động tốt!');
        console.log('   📚 Tổng số từ vựng:', result.total || result.vocabulary?.length || 0);
        console.log('   📝 Số từ trả về:', result.vocabulary?.length || 0);
        
        if (result.vocabulary && result.vocabulary.length > 0) {
          console.log('\n   🔍 5 từ đầu tiên:');
          result.vocabulary.slice(0, 5).forEach((word, index) => {
            console.log(`   ${index + 1}. ${word.word} - ${word.meaning}`);
          });
        }
        
        console.log('\n' + '=' .repeat(60));
        
        if (result.vocabulary?.length === 854 || result.total === 854) {
          console.log('✅ THÀNH CÔNG! Giao diện sẽ hiển thị (854) từ vựng');
        } else if (result.vocabulary?.length > 0) {
          console.log(`⚠️  API trả về ${result.vocabulary.length} từ, cần kiểm tra lại`);
        } else {
          console.log('❌ API không trả về dữ liệu, cần kiểm tra lại');
        }
      } catch (error) {
        console.log('   ❌ Lỗi parse JSON:', error.message);
        console.log('   Raw data:', data.substring(0, 200));
      }
    } else {
      console.log('   ❌ API trả về lỗi');
      console.log('   Response:', data);
    }
    
    console.log('\n');
  });
});

req.on('error', (error) => {
  console.log('❌ Lỗi kết nối API:', error.message);
  console.log('\n⚠️  Đảm bảo Next.js server đang chạy:');
  console.log('   npm run dev\n');
});

req.end();
