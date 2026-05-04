/**
 * Generate embeddings for video transcripts
 * This script processes videos and creates embeddings using Ollama
 */

const { MongoClient } = require('mongodb');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

/**
 * Split transcript into chunks
 */
function chunkTranscript(videoId, transcript, chunkSize = 500) {
  const chunks = [];
  let currentChunk = '';
  let chunkStartTime = 0;
  let chunkIndex = 0;

  for (let i = 0; i < transcript.length; i++) {
    const item = transcript[i];
    
    if (currentChunk.length === 0) {
      chunkStartTime = item.offset;
    }
    
    currentChunk += item.text + ' ';
    
    if (currentChunk.length >= chunkSize || i === transcript.length - 1) {
      chunks.push({
        videoId,
        chunkIndex,
        text: currentChunk.trim(),
        startTime: chunkStartTime,
        endTime: item.offset + item.duration,
      });
      
      currentChunk = '';
      chunkIndex++;
    }
  }

  return chunks;
}

/**
 * Generate embedding using Ollama
 */
async function generateEmbedding(text) {
  try {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:latest',
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    return null;
  }
}

/**
 * Check if Ollama is running
 */
async function checkOllama() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Main function
 */
async function generateEmbeddings() {
  console.log('🤖 Starting Video Embedding Generation...\n');

  // Check Ollama
  console.log('Checking Ollama status...');
  const ollamaRunning = await checkOllama();
  
  if (!ollamaRunning) {
    console.error('❌ Ollama is not running!');
    console.log('\nPlease start Ollama:');
    console.log('1. Open a terminal');
    console.log('2. Run: ollama serve');
    console.log('3. Make sure qwen2.5:latest model is installed: ollama pull qwen2.5:latest\n');
    process.exit(1);
  }
  console.log('✅ Ollama is running\n');

  // Connect to MongoDB
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(process.env.MONGODB_DB || 'doremi_eng');
    const videosCollection = db.collection('videos');

    // Get all videos with transcripts
    const videos = await videosCollection
      .find({ hasTranscript: true })
      .toArray();

    console.log(`📹 Found ${videos.length} videos with transcripts\n`);

    if (videos.length === 0) {
      console.log('No videos to process. Please run the crawler first.');
      process.exit(0);
    }

    // Process each video
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      console.log(`[${i + 1}/${videos.length}] Processing: ${video.title}`);

      // Skip if already has embeddings
      if (video.chunks && video.chunks.length > 0 && video.chunks[0].embedding) {
        console.log('  ⏭️  Already has embeddings, skipping...\n');
        continue;
      }

      // Create chunks
      const chunks = chunkTranscript(video.videoId, video.transcript);
      console.log(`  📝 Created ${chunks.length} chunks`);

      // Generate embeddings for each chunk
      const chunksWithEmbeddings = [];
      for (let j = 0; j < chunks.length; j++) {
        process.stdout.write(`  🔄 Generating embeddings: ${j + 1}/${chunks.length}\r`);
        
        const embedding = await generateEmbedding(chunks[j].text);
        
        if (embedding) {
          chunksWithEmbeddings.push({
            ...chunks[j],
            embedding,
          });
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`  ✅ Generated ${chunksWithEmbeddings.length} embeddings`);

      // Update video in database
      await videosCollection.updateOne(
        { videoId: video.videoId },
        { 
          $set: { 
            chunks: chunksWithEmbeddings,
            updatedAt: new Date(),
          } 
        }
      );

      console.log(`  💾 Saved to database\n`);
    }

    console.log('✅ All videos processed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the script
if (require.main === module) {
  generateEmbeddings();
}

module.exports = { generateEmbeddings };
