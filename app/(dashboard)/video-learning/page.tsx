'use client';

import { useState, useEffect } from 'react';
import { Play, MessageCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Video {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  hasTranscript: boolean;
}

export default function VideoLearningPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();

      if (data.success) {
        setVideos(data.videos);
      } else {
        setError(data.error || 'Failed to load videos');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Đang tải video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Lỗi</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={fetchVideos}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      {/* Header */}
      <div className="glass border-b border-border/50 sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold neon-text mb-2">
                🎬 Ôn Luyện Qua Video
              </h1>
              <p className="text-muted-foreground">
                Học tiếng Anh qua video với trợ lý AI thông minh
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Tổng số video</div>
              <div className="text-3xl font-bold text-primary">{videos.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {videos.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-2xl font-bold mb-2">Chưa có video nào</h3>
            <p className="text-muted-foreground mb-6">
              Vui lòng chạy script crawler để tải video từ YouTube
            </p>
            <code className="glass px-4 py-2 rounded-lg text-sm">
              node scripts/crawl-youtube-playlist.js
            </code>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link
                key={video.videoId}
                href={`/video-learning/${video.videoId}`}
                className="group"
              >
                <div className="glass rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 neon-border hover:shadow-2xl">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-primary/90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-8 h-8 text-primary-foreground" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Transcript Badge */}
                    {video.hasTranscript && (
                      <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        AI Chat
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {video.description || 'Không có mô tả'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{video.channelTitle}</span>
                      <span>
                        {new Date(video.publishedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating Orbs for decoration */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-neon-purple/20 rounded-full blur-3xl floating-orb pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl floating-orb-delayed pointer-events-none" />
    </div>
  );
}
