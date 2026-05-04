'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, Clock, MessageCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { VideoAISummary } from '@/components/VideoAISummary';

interface Video {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  hasTranscript: boolean;
  chunks?: any[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  chunks?: Array<{
    text: string;
    startTime: number;
    endTime: number;
    similarity: number;
  }>;
}

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchVideo = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();

      if (data.success) {
        const foundVideo = data.videos.find((v: Video) => v.videoId === videoId);
        if (foundVideo) {
          setVideo(foundVideo);
        } else {
          setError('Video không tồn tại');
        }
      } else {
        setError(data.error || 'Failed to load video');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching video:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const seekToTime = (timeInMs: number) => {
    const timeInSeconds = Math.floor(timeInMs / 1000);
    if (playerRef.current) {
      // Send message to YouTube iframe to seek
      playerRef.current.contentWindow?.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [timeInSeconds, true],
        }),
        '*'
      );
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending || !video) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      const response = await fetch('/api/videos/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: video.videoId,
          question: inputMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.answer,
          chunks: data.chunks,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `❌ Lỗi: ${data.error}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Không thể kết nối đến server. Vui lòng thử lại.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (error || !video) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Lỗi</h2>
          <p className="text-muted-foreground mb-6">{error || 'Video không tồn tại'}</p>
          <Link
            href="/video-learning"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      {/* Header */}
      <div className="glass border-b border-border/50 sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/video-learning"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{video.title}</h1>
              <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl overflow-hidden neon-border">
              <div className="aspect-video bg-black">
                <iframe
                  ref={playerRef}
                  src={`https://www.youtube.com/embed/${video.videoId}?enablejsapi=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              
              {/* Video Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-3">{video.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{video.channelTitle}</span>
                  <span>•</span>
                  <span>{new Date(video.publishedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="mt-6">
              <VideoAISummary videoId={video.videoId} hasTranscript={video.hasTranscript} />
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-1">
            <div className="glass rounded-xl neon-border flex flex-col h-[600px] lg:h-[calc(100vh-200px)]">
              {/* Chat Header */}
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Hỏi về video này</h3>
                </div>
                {!video.hasTranscript && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Video này chưa có transcript. Chức năng chat chưa khả dụng.</span>
                  </div>
                )}
                {video.hasTranscript && (!video.chunks || video.chunks.length === 0) && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Chưa tạo embeddings. Chạy: node scripts/generate-video-embeddings.js</span>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Hãy đặt câu hỏi về nội dung video!</p>
                    <p className="text-xs mt-2">Ví dụ: "Video này nói về gì?"</p>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Show relevant chunks */}
                      {message.chunks && message.chunks.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs opacity-70">Các đoạn liên quan:</p>
                          {message.chunks.map((chunk, i) => (
                            <button
                              key={i}
                              onClick={() => seekToTime(chunk.startTime)}
                              className="w-full text-left text-xs bg-background/50 hover:bg-background/80 rounded p-2 transition-colors flex items-start gap-2"
                            >
                              <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold mb-1">
                                  {formatTime(chunk.startTime)} - {formatTime(chunk.endTime)}
                                </div>
                                <div className="line-clamp-2 opacity-80">{chunk.text}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={
                      video.hasTranscript && video.chunks && video.chunks.length > 0
                        ? 'Đặt câu hỏi...'
                        : 'Chức năng chat chưa khả dụng'
                    }
                    disabled={!video.hasTranscript || !video.chunks || video.chunks.length === 0 || sending}
                    className="flex-1 bg-input border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || sending || !video.hasTranscript || !video.chunks || video.chunks.length === 0}
                    className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
