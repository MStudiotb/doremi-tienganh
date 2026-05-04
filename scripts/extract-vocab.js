const fs = require('fs');
const path = require('path');

async function extractVocabulary() {
  try {
    console.log('Đang đọc file PDF...');
    
    // Đọc file PDF
    const pdfPath = path.join(__dirname, '../public/tu-vung/1000 tu tieng anh.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);
    
    // Parse PDF using pdfjs-dist directly
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(dataBuffer),
      useSystemFonts: true,
    });
    
    const pdfDocument = await loadingTask.promise;
    console.log(`PDF có ${pdfDocument.numPages} trang`);
    
    let allText = '';
    
    // Trích xuất text từ tất cả các trang
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const content = await page.getTextContent();
      
      // Ghép text với khoảng trắng
      const pageText = content.items.map(item => item.str).join(' ');
      allText += pageText + ' ';
      
      if (pageNum % 5 === 0) {
        console.log(`Đã đọc ${pageNum}/${pdfDocument.numPages} trang...`);
      }
    }
    
    console.log('Đang xử lý dữ liệu...');
    console.log(`Tổng độ dài text: ${allText.length} ký tự`);
    
    const vocabulary = [];
    let currentCategory = 'GENERAL';
    
    // Pattern để tìm chủ đề (các từ viết hoa liên tiếp)
    const categoryMatches = allText.matchAll(/([A-Z][A-Z\s\-]+)(?=\s+\d+\s+[a-z])/g);
    const categories = new Map();
    
    for (const match of categoryMatches) {
      const category = match[1].trim();
      if (category.length > 3 && category.length < 50 && !category.includes('VỰNG') && !category.includes('STT')) {
        categories.set(match.index, category);
      }
    }
    
    // Pattern để tìm từ vựng: số + từ (loại từ) + phiên âm + nghĩa
    // Ví dụ: "1 accountant (n) /əˈkaʊn.t̬ənt/ kế toán"
    const vocabPattern = /(\d+)\s+([a-zA-Z\/\s\-']+?)\s*(\([a-z\.]+\))\s*(\/[^\/]+\/)\s*([^0-9]+?)(?=\s+\d+\s+[a-z]|\s*$)/g;
    
    let match;
    while ((match = vocabPattern.exec(allText)) !== null) {
      const [, stt, word, partOfSpeech, phonetic, meaning] = match;
      const sttNum = parseInt(stt);
      
      if (sttNum >= 1 && sttNum <= 1000) {
        // Tìm category gần nhất trước vị trí này
        let nearestCategory = 'GENERAL';
        for (const [pos, cat] of categories) {
          if (pos < match.index) {
            nearestCategory = cat;
          } else {
            break;
          }
        }
        
        vocabulary.push({
          stt: sttNum,
          word: (word.trim() + ' ' + partOfSpeech.trim()).trim(),
          phonetic: phonetic.trim(),
          meaning: meaning.trim().replace(/\s+/g, ' '),
          category: nearestCategory
        });
        
        if (vocabulary.length % 100 === 0) {
          console.log(`Đã trích xuất ${vocabulary.length} từ...`);
        }
      }
    }
    
    // Sắp xếp theo STT
    vocabulary.sort((a, b) => a.stt - b.stt);
    
    // Loại bỏ trùng lặp (giữ lại từ đầu tiên)
    const uniqueVocab = [];
    const seenStt = new Set();
    
    for (const item of vocabulary) {
      if (!seenStt.has(item.stt)) {
        seenStt.add(item.stt);
        uniqueVocab.push(item);
      }
    }
    
    console.log(`\nTổng số từ trích xuất: ${uniqueVocab.length}`);
    
    // Kiểm tra các STT bị thiếu
    const missingStt = [];
    for (let i = 1; i <= 1000; i++) {
      if (!seenStt.has(i)) {
        missingStt.push(i);
      }
    }
    
    if (missingStt.length > 0) {
      console.log(`\nCảnh báo: Thiếu ${missingStt.length} từ vựng`);
      if (missingStt.length <= 50) {
        console.log(`Các STT bị thiếu: ${missingStt.join(', ')}`);
      } else {
        console.log(`Các STT bị thiếu (20 đầu tiên): ${missingStt.slice(0, 20).join(', ')}...`);
      }
    }
    
    // Lưu file JSON
    const outputPath = path.join(__dirname, '../public/data_1000.json');
    fs.writeFileSync(outputPath, JSON.stringify(uniqueVocab, null, 2), 'utf8');
    
    console.log(`\n✅ Đã tạo file: ${outputPath}`);
    console.log(`📊 Số lượng từ vựng: ${uniqueVocab.length}/1000`);
    
    // Hiển thị một số từ mẫu
    console.log('\n📝 Một số từ vựng mẫu:');
    uniqueVocab.slice(0, 10).forEach(item => {
      console.log(`${item.stt}. ${item.word} ${item.phonetic} - ${item.meaning} [${item.category}]`);
    });
    
    // Thống kê theo category
    const categoryStats = {};
    uniqueVocab.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    });
    
    console.log('\n📊 Thống kê theo chủ đề:');
    Object.entries(categoryStats).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count} từ`);
    });
    
    return uniqueVocab;
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
}

// Chạy script
extractVocabulary()
  .then(() => {
    console.log('\n✅ Hoàn thành!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Thất bại:', error);
    process.exit(1);
  });
