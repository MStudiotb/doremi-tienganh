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
    
    let text = '';
    
    // Trích xuất text từ trang đầu tiên để debug
    const page = await pdfDocument.getPage(1);
    const content = await page.getTextContent();
    
    console.log('\n=== DEBUG: Nội dung trang 1 ===');
    console.log('Số lượng items:', content.items.length);
    console.log('\nMột số items đầu tiên:');
    content.items.slice(0, 50).forEach((item, idx) => {
      console.log(`${idx}: "${item.str}"`);
    });
    
    // Thử nhiều cách ghép text
    const method1 = content.items.map(item => item.str).join(' ');
    const method2 = content.items.map(item => item.str).join('');
    const method3 = content.items.map(item => item.str + (item.hasEOL ? '\n' : ' ')).join('');
    
    console.log('\n=== Method 1 (join with space) ===');
    console.log(method1.slice(0, 500));
    
    console.log('\n=== Method 2 (join without space) ===');
    console.log(method2.slice(0, 500));
    
    console.log('\n=== Method 3 (with EOL) ===');
    console.log(method3.slice(0, 500));
    
    // Lưu toàn bộ text để kiểm tra
    const debugPath = path.join(__dirname, '../public/debug-pdf-text.txt');
    fs.writeFileSync(debugPath, method1, 'utf8');
    console.log(`\n✅ Đã lưu debug text vào: ${debugPath}`);
    
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
