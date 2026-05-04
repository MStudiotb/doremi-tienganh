/**
 * YouTube Playlist Crawler
 * Crawls video information and transcripts from a YouTube playlist
 */

const { YoutubeTranscript } = require('youtube-transcript');

// Playlist URL: https://www.youtube.com/playlist?list=PL8IRMG1KdNbwKBpMvDl3oluXw3s9JRhGB
const PLAYLIST_ID = 'PL8IRMG1KdNbwKBpMvDl3oluXw3s9JRhGB';

/**
 * Extract video IDs from playlist using YouTube Data API v3
 * Note: This requires YOUTUBE_API_KEY in .env.local
 */
async function getPlaylistVideos(playlistId, apiKey) {
  const videos = [];
  let nextPageToken = '';
  
  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`YouTube API Error: ${data.error.message}`);
    }
    
    for (const item of data.items) {
      videos.push({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
      });
    }
    
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);
  
  return videos;
}

/**
 * Get transcript for a video
 */
async function getVideoTranscript(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(item => ({
      text: item.text,
      offset: item.offset,
      duration: item.duration,
    }));
  } catch (error) {
    console.error(`Failed to get transcript for ${videoId}:`, error.message);
    return null;
  }
}

/**
 * Main crawler function
 */
async function crawlPlaylist() {
  console.log('🎬 Starting YouTube Playlist Crawler...\n');
  
  // Load API key from environment
  require('dotenv').config({ path: '.env.local' });
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.error('❌ YOUTUBE_API_KEY not found in .env.local');
    console.log('\nTo get a YouTube API key:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project or select existing one');
    console.log('3. Enable YouTube Data API v3');
    console.log('4. Create credentials (API Key)');
    console.log('5. Add YOUTUBE_API_KEY=your-key to .env.local\n');
    process.exit(1);
  }
  
  try {
    // Step 1: Get all videos from playlist
    console.log(`📋 Fetching videos from playlist: ${PLAYLIST_ID}`);
    const videos = await getPlaylistVideos(PLAYLIST_ID, apiKey);
    console.log(`✅ Found ${videos.length} videos\n`);
    
    // Step 2: Get transcripts for each video
    console.log('📝 Fetching transcripts...');
    const videosWithTranscripts = [];
    
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      console.log(`[${i + 1}/${videos.length}] ${video.title}`);
      
      const transcript = await getVideoTranscript(video.videoId);
      
      videosWithTranscripts.push({
        ...video,
        transcript: transcript,
        transcriptText: transcript ? transcript.map(t => t.text).join(' ') : null,
        hasTranscript: transcript !== null,
      });
      
      // Rate limiting - wait 1 second between requests
      if (i < videos.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Step 3: Save to JSON file
    const fs = require('fs');
    const outputPath = './public/youtube-videos-data.json';
    fs.writeFileSync(outputPath, JSON.stringify(videosWithTranscripts, null, 2));
    
    console.log(`\n✅ Successfully crawled ${videosWithTranscripts.length} videos`);
    console.log(`📁 Data saved to: ${outputPath}`);
    
    const withTranscripts = videosWithTranscripts.filter(v => v.hasTranscript).length;
    console.log(`\n📊 Statistics:`);
    console.log(`   Total videos: ${videosWithTranscripts.length}`);
    console.log(`   With transcripts: ${withTranscripts}`);
    console.log(`   Without transcripts: ${videosWithTranscripts.length - withTranscripts}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the crawler
if (require.main === module) {
  crawlPlaylist();
}

module.exports = { crawlPlaylist, getPlaylistVideos, getVideoTranscript };
