/**
 * Import videos from JSON file to MongoDB
 */

const fs = require('fs');
const path = require('path');

async function importVideos() {
  console.log('📥 Starting video import to MongoDB...\n');

  // Check if data file exists
  const dataPath = path.join(__dirname, '..', 'public', 'youtube-videos-data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ File not found: public/youtube-videos-data.json');
    console.log('\nPlease run the crawler first:');
    console.log('  node scripts/crawl-youtube-playlist.js\n');
    process.exit(1);
  }

  // Read video data
  console.log('📖 Reading video data...');
  const videos = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`✅ Found ${videos.length} videos\n`);

  // Check if dev server is running
  console.log('🔌 Connecting to API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videos }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Import successful!\n');
      console.log(`📊 Statistics:`);
      console.log(`   Inserted: ${result.inserted}`);
      console.log(`   Updated: ${result.updated}`);
      console.log(`   Total: ${videos.length}\n`);
      console.log('🎉 All videos have been imported to MongoDB!');
      console.log('\nNext step: Generate embeddings');
      console.log('  node scripts/generate-video-embeddings.js\n');
    } else {
      console.error('❌ Import failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error connecting to API:', error.message);
    console.log('\nMake sure the development server is running:');
    console.log('  npm run dev\n');
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importVideos();
}

module.exports = { importVideos };
