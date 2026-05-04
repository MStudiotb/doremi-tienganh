'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface VideoAISummaryProps {
  videoId: string;
  hasTranscript: boolean;
}

export function VideoAISummary({ videoId, hasTranscript }: VideoAISummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasTranscript) {
      setLoading(false);
      return;
    }

    generateSummary();
  }, [videoId, hasTranscript]);

  const generateSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/videos/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });

      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
      } else {
        setError(data.error || 'Không thể tạo tóm tắt');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  if (!hasTranscript) {
    return (
      <div className="glass rounded-xl p-6 neon-border">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Tóm tắt AI
            </h3>
            <p className="text-sm text-muted-foreground">
              Đang trích xuất nội dung bài học...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass rounded-xl p-6 neon-border">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Tóm tắt AI
            </h3>
            <p className="text-sm text-muted-foreground">
              Đang phân tích nội dung bài học...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-6 neon-border">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Tóm tắt AI
            </h3>
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={generateSummary}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 neon-border backdrop-blur-xl bg-gradient-to-br from-primary/5 to-primary/10">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Tóm tắt AI
      </h3>
      <div className="prose prose-sm max-w-none text-foreground">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {summary}
        </div>
      </div>
    </div>
  );
}
