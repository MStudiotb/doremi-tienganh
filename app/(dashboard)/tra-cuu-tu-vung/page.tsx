"use client";

import { Search, Volume2, BookOpen, Image as ImageIcon, Loader2, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

interface VocabularyItem {
  _id?: string;
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  imageUrl?: string;
}

export default function VocabularyLookupPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [allVocabulary, setAllVocabulary] = useState<VocabularyItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<VocabularyItem | null>(null);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayCount, setDisplayCount] = useState(50); // For lazy loading

  // Load all vocabulary on mount
  useEffect(() => {
    loadAllVocabulary();
    
    // Check if user is admin
    const session = localStorage.getItem("doremi_session");
    if (session) {
      const data = JSON.parse(session);
      setIsAdmin(data.role === "ADMIN");
    }
  }, []);

  async function loadAllVocabulary() {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/vocabulary/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Không thể tải danh sách từ vựng");
      }

      // Sort alphabetically (A-Z)
      const sortedVocab = (data.vocabulary || []).sort((a: VocabularyItem, b: VocabularyItem) => 
        a.word.toLowerCase().localeCompare(b.word.toLowerCase())
      );
      
      setAllVocabulary(sortedVocab);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải danh sách");
    } finally {
      setIsLoading(false);
    }
  }

  // Filter vocabulary based on search term
  const filteredVocabulary = useMemo(() => {
    if (!searchTerm.trim()) {
      return allVocabulary;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    return allVocabulary.filter(vocab => 
      vocab.word.toLowerCase().includes(searchLower) ||
      vocab.meaning.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, allVocabulary]);

  // Display only a subset for performance (lazy loading)
  const displayedVocabulary = filteredVocabulary.slice(0, displayCount);

  function handleWordClick(vocab: VocabularyItem) {
    setSelectedWord(vocab);
    // Scroll to top to show the detail card
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function playPronunciation(word: string) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  function handleLoadMore() {
    setDisplayCount(prev => prev + 50);
  }

  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setDisplayCount(50); // Reset display count when searching
    if (!value.trim()) {
      setSelectedWord(null); // Clear selection when search is cleared
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
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#1a1c2e] p-1 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -left-8 -top-8 size-32 rounded-full bg-[#4fd1c5]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 size-32 rounded-full bg-violet-pink/10 blur-3xl" />
            
            <div className="relative flex items-center gap-3 rounded-[1.4rem] bg-[#03010a]/50 p-5">
              <Search className="size-6 text-neon-cyan" strokeWidth={1.7} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm từ vựng hoặc nghĩa..."
                className="flex-1 bg-transparent text-lg text-white placeholder:text-white/40 focus:outline-none"
                disabled={isLoading}
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Results count */}
          {!isLoading && (
            <div className="mt-3 text-center text-sm text-white/50">
              {filteredVocabulary.length > 0 ? (
                <>
                  Hiển thị {displayedVocabulary.length} / {filteredVocabulary.length} từ
                  {searchTerm && ` (lọc từ ${allVocabulary.length} từ)`}
                </>
              ) : (
                searchTerm ? "Không tìm thấy từ vựng phù hợp" : "Chưa có từ vựng nào"
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Selected Word Detail Card */}
        {selectedWord && (
          <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#3a1c24] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl">
            <div className="relative p-8">
              <div className="pointer-events-none absolute -left-12 -top-12 size-40 rounded-full bg-[#4fd1c5]/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -right-12 size-40 rounded-full bg-violet-pink/10 blur-3xl" />

              {/* Close button */}
              <button
                onClick={() => setSelectedWord(null)}
                className="absolute right-4 top-4 rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Đóng"
              >
                ✕
              </button>

              <div className="relative space-y-6">
                {/* Word and Pronunciation */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="mb-2 text-4xl font-bold text-white">
                      {selectedWord.word}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-[#4fd1c5]">
                        {selectedWord.phonetic}
                      </span>
                      <button
                        onClick={() => playPronunciation(selectedWord.word)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Phát âm"
                      >
                        <Volume2 className="size-5" strokeWidth={1.7} />
                      </button>
                    </div>
                  </div>

                  {/* Image */}
                  {selectedWord.imageUrl && (
                    <div className="relative size-32 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg">
                      <Image
                        src={selectedWord.imageUrl}
                        alt={selectedWord.word}
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
                  <p className="text-lg text-white">{selectedWord.meaning}</p>
                </div>

                {/* Example */}
                {selectedWord.example && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <ImageIcon className="size-5 text-violet-pink" strokeWidth={1.7} />
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
                        Ví dụ
                      </h3>
                    </div>
                    <p className="text-base italic text-white/80">
                      "{selectedWord.example}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#1a1c2e] p-12 text-center">
            <Loader2 className="mx-auto mb-4 size-12 animate-spin text-[#4fd1c5]" />
            <p className="text-sm text-white/50">Đang tải danh sách từ vựng...</p>
          </div>
        )}

        {/* Vocabulary List */}
        {!isLoading && displayedVocabulary.length > 0 && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {displayedVocabulary.map((vocab) => (
                <button
                  key={vocab._id || vocab.word}
                  onClick={() => handleWordClick(vocab)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#1a1c2e] p-5 text-left shadow-lg transition-all hover:border-[#4fd1c5]/30 hover:shadow-[#4fd1c5]/20"
                >
                  <div className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full bg-[#4fd1c5]/5 blur-2xl transition-all group-hover:bg-[#4fd1c5]/10" />
                  
                  <div className="relative">
                    <h3 className="mb-1 text-xl font-bold text-white group-hover:text-[#4fd1c5] transition-colors">
                      {vocab.word}
                    </h3>
                    <p className="mb-2 text-sm text-[#4fd1c5]/80">
                      {vocab.phonetic}
                    </p>
                    <p className="line-clamp-2 text-sm text-white/60">
                      {vocab.meaning}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Load More Button */}
            {displayedVocabulary.length < filteredVocabulary.length && (
              <div className="pt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  className="rounded-2xl border border-[#4fd1c5]/20 bg-gradient-to-r from-[#4fd1c5]/10 to-[#38b2ac]/10 px-8 py-3 text-sm font-semibold text-[#4fd1c5] shadow-lg transition-all hover:shadow-[#4fd1c5]/30"
                >
                  Xem thêm ({filteredVocabulary.length - displayedVocabulary.length} từ)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State - No vocabulary in database */}
        {!isLoading && allVocabulary.length === 0 && !error && (
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#1a1c2e] p-12 text-center">
            <div className="mx-auto mb-4 grid size-20 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <BookOpen className="size-10 text-white/30" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Chưa có từ vựng
            </h3>
            <p className="text-sm text-white/50">
              Kho từ vựng hiện đang trống. Vui lòng thêm từ vựng mới.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
