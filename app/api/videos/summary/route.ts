/**
 * API Route: /api/videos/summary
 * Generates AI summary of video content using Ollama
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import { VideoDocument, checkOllamaStatus } from '@/lib/video-rag';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'videoId is required' },
        { status: 400 }
      );
    }

    // Check if Ollama is running
    const ollamaRunning = await checkOllamaStatus();
    if (!ollamaRunning) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ollama chưa chạy. Vui lòng khởi động Ollama với lệnh: ollama serve' 
        },
        { status: 503 }
      );
    }

    // Get video from database
    const clientPromise = getMongoClient();
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: 'MongoDB chưa được cấu hình' },
        { status: 500 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'doremi_eng');
    
    const video = await db
      .collection<VideoDocument>('videos')
      .findOne({ videoId });

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy video' },
        { status: 404 }
      );
    }

    if (!video.chunks || video.chunks.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Video chưa có transcript. Vui lòng chạy embedding generation trước.' 
        },
        { status: 400 }
      );
    }

    // Combine all transcript chunks
    const fullTranscript = video.chunks
      .map(chunk => chunk.text)
      .join(' ');

    // Generate summary using Ollama
    const prompt = `Bạn là một giáo viên tiếng Anh chuyên nghiệp. Hãy tóm tắt ngắn gọn nội dung bài học từ video sau đây.

Tiêu đề video: ${video.title}

Nội dung transcript:
${fullTranscript.substring(0, 8000)} ${fullTranscript.length > 8000 ? '...' : ''}

Hãy tóm tắt theo cấu trúc sau:

📚 **Nội dung chính:**
[Tóm tắt ý chính của bài học trong 2-3 câu]

📖 **Từ vựng quan trọng:**
[Liệt kê 5-7 từ vựng quan trọng nhất với nghĩa tiếng Việt]

✍️ **Ngữ pháp:**
[Nêu các điểm ngữ pháp chính được đề cập (nếu có)]

💡 **Ghi chú:**
[Các lưu ý hoặc mẹo học tập hữu ích]

Hãy viết ngắn gọn, dễ hiểu và tập trung vào những điểm quan trọng nhất.`;

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:latest',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error('Ollama API request failed');
    }

    const ollamaData = await ollamaResponse.json();
    const summary = ollamaData.response;

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Không thể tạo tóm tắt' 
      },
      { status: 500 }
    );
  }
}
