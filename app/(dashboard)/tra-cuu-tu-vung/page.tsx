"use client";

import { Search, Volume2, BookOpen, Image as ImageIcon, Loader2, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface VocabularyResult {
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  imageUrl?: string;
}

export default function VocabularyLookupPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<VocabularyResult | null>(null);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const session = localStorage.getItem("doremi_session");
    if (session) {
      const data = JSON.parse(session);
      setIsAdmin(data.role === "ADMIN");
    }
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError("Vui lòng nhập từ vựng cần tra cứu");
      return;
    }

    setIsSearching(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/vocabulary/search?word=${encodeURIComponent(searchTerm.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể tra cứu từ vựng");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tra cứu");
    } finally {
      setIsSearching(false);
    }
  }

  function playPronunciation() {
    if (result?.word) {
      const utterance = new SpeechSynthesisUtterance(result.word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03010a] via-[#0a0520] to-[#03010a] p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              Tra Cứu Từ Vựng
            </h1>
            <p className="text-sm text-white/60">
              Tìm kiếm nghĩa, phiên âm và ví dụ của từ vựng tiếng Anh
            </p>
          </div>
          
          {/* Admin Button */}
          {isAdmin && (
            <Link
              href="/tra-cuu-tu-vung/quan-ly"
              className="flex items-center gap-2 rounded-2xl border border-[#4fd1c5]/20 bg-gradient-to-r from-[#4fd1c5]/10 to-[#38b2ac]/10 px-4 py-3 text-sm font-semibold text-[#4fd1c5] shadow-lg shadow-[#4fd1c5]/10 transition-all hover:shadow-[#4fd1c5]/30"
            >
              <Settings className="size-5" strokeWidth={1.7} />
              Quản lý kho từ
            </Link>
          )}
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#1a1c2e] p-1 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -left-8 -top-8 size-32 rounded-full bg-[#4fd1c5]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 size-32 rounded-full bg-violet-pink/10 blur-3xl" />
            
            <div className="relative flex items-center gap-3 rounded-[1.4rem] bg-[#03010a]/50 p-5">
              <Search className="size-6 text-neon-cyan" strokeWidth={1.7} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập từ vựng cần tra cứu..."
                className="flex-1 bg-transparent text-lg text-white placeholder:text-white/40 focus:outline-none"
                disabled={isSearching}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="rounded-2xl border border-[#4fd1c5]/20 bg-gradient-to-r from-[#4fd1c5] to-[#38b2ac] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4fd1c5]/20 transition-all hover:shadow-[#4fd1c5]/40 disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  "Tra cứu"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#3a1c24] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="relative p-8">
              <div className="pointer-events-none absolute -left-12 -top-12 size-40 rounded-full bg-[#4fd1c5]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -right-12 size-40 rounded-full bg-violet-pink/10 blur-3xl" />

              <div className="relative space-y-6">
                {/* Word and Pronunciation */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="mb-2 text-4xl font-bold text-white">
                      {result.word}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-[#4fd1c5]">
                        {result.phonetic}
                      </span>
                      <button
                        onClick={playPronunciation}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Phát âm"
                      >
                        <Volume2 className="size-5" strokeWidth={1.7} />
                      </button>
                    </div>
                  </div>

                  {/* Image */}
                  {result.imageUrl && (
                    <div className="relative size-32 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg">
                      <Image
                        src={result.imageUrl}
                        alt={result.word}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Meaning */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <BookOpen className="size-5 text-neon-cyan" strokeWidth={1.7} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
                      Nghĩa tiếng Việt
                    </h3>
                  </div>
                  <p className="text-lg text-white">{result.meaning}</p>
                </div>

                {/* Example */}
                {result.example && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <ImageIcon className="size-5 text-violet-pink" strokeWidth={1.7} />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
                        Ví dụ
                      </h3>
                    </div>
                    <p className="text-base italic text-white/80">
                      "{result.example}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !error && !isSearching && (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#1a1c2e] p-12 text-center">
            <div className="mx-auto mb-4 grid size-20 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <Search className="size-10 text-white/30" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Bắt đầu tra cứu
            </h3>
            <p className="text-sm text-white/50">
              Nhập từ vựng vào ô tìm kiếm để xem nghĩa, phiên âm và ví dụ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
