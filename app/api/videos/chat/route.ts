/**
 * API Route: /api/videos/chat
 * Handles RAG-based chat for video content
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import { 
  VideoDocument, 
  findRelevantChunks, 
  generateAnswer,
  checkOllamaStatus 
} from '@/lib/video-rag';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, question } = body;

    if (!videoId || !question) {
      return NextResponse.json(
        { success: false, error: 'videoId and question are required' },
        { status: 400 }
      );
    }

    // Check if Ollama is running
    const ollamaRunning = await checkOllamaStatus();
    if (!ollamaRunning) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ollama is not running. Please start Ollama with: ollama serve' 
        },
        { status: 503 }
      );
    }

    // Get video from database
    const clientPromise = getMongoClient();
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: 'MongoDB not configured' },
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
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    if (!video.chunks || video.chunks.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Video has no processed chunks. Please run embedding generation first.' 
        },
        { status: 400 }
      );
    }

    // Find relevant chunks using RAG
    const relevantChunks = await findRelevantChunks(question, video.chunks, 3);

    if (relevantChunks.length === 0) {
      return NextResponse.json({
        success: true,
        answer: 'Xin lỗi, tôi không tìm thấy thông tin liên quan đến câu hỏi của bạn trong video này.',
        chunks: [],
      });
    }

    // Generate answer using LLM
    const answer = await generateAnswer(question, relevantChunks, video.title);

    return NextResponse.json({
      success: true,
      answer,
      chunks: relevantChunks.map(chunk => ({
        text: chunk.text,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        similarity: chunk.similarity,
      })),
    });
  } catch (error) {
    console.error('Error in video chat:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process question' 
      },
      { status: 500 }
    );
  }
}
