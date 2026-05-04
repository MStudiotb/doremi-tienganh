/**
 * API Route: /api/videos
 * Handles video data operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import { VideoDocument } from '@/lib/video-rag';

export async function GET(request: NextRequest) {
  try {
    const clientPromise = getMongoClient();
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: 'MongoDB not configured' },
        { status: 500 }
      );
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'doremi_eng');
    
    const videos = await db
      .collection<VideoDocument>('videos')
      .find({})
      .sort({ publishedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      videos,
      count: videos.length,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videos } = body;

    if (!videos || !Array.isArray(videos)) {
      return NextResponse.json(
        { success: false, error: 'Invalid videos data' },
        { status: 400 }
      );
    }

    const clientPromise = getMongoClient();
    if (!clientPromise) {
      return NextResponse.json(
        { success: false, error: 'MongoDB not configured' },
        { status: 500 }
      );
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'doremi_eng');
    
    // Prepare videos with timestamps
    const videosToInsert = videos.map(video => ({
      ...video,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Use bulk write with upsert to avoid duplicates
    const bulkOps = videosToInsert.map(video => ({
      updateOne: {
        filter: { videoId: video.videoId },
        update: { $set: video },
        upsert: true,
      },
    }));

    const result = await db.collection('videos').bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      message: `Successfully processed ${videos.length} videos`,
    });
  } catch (error) {
    console.error('Error saving videos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save videos' },
      { status: 500 }
    );
  }
}
