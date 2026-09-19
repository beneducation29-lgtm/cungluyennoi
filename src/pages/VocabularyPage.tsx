import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Volume2,
  Trash2,
  Sparkles,
  Layers,
  RotateCw,
  ChevronRight,
  ChevronLeft,
  Cloud,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { VocabularyItem } from "../types";
import { ttsService } from "../services/ttsService";
import { storageService } from "../services/storageService";
import { firestoreService } from "../services/firestoreService";
import { useAuth } from "../contexts/AuthContext";

export const VocabularyPage: React.FC = () => {
  const { firebaseUser, isFirebaseConfigured } = useAuth();
  const [vocabList, setVocabList] = useState<VocabularyItem[]>(() =>
    storageService.getVocabulary()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVocabulary = async () => {
    if (firebaseUser && isFirebaseConfigured) {
      setLoading(true);
      setError(null);
      try {
        const cloudVocab = await firestoreService.getUserVocabulary(firebaseUser.uid);
        if (cloudVocab && cloudVocab.length > 0) {
          setVocabList(cloudVocab);
        } else {
          setVocabList(storageService.getVocabulary());
        }
      } catch (err) {
        console.warn("Could not fetch vocabulary from Firestore:", err);
        setError("Không thể tải từ vựng từ đám mây, đang hiển thị từ vựng lưu cục bộ.");
        setVocabList(storageService.getVocabulary());
      } finally {
        setLoading(false);
      }
    } else {
      setVocabList(storageService.getVocabulary());
    }
  };

  useEffect(() => {
    loadVocabulary();
  }, [firebaseUser, isFirebaseConfigured]);

  const filtered = vocabList.filter((item) => {
    const matchFilter = selectedFilter === "all" || item.hskLevel === selectedFilter;
    const meaningText = item.meaning || item.meaningVi || "";
    const matchSearch =
      !searchQuery.trim() ||
      item.word.includes(searchQuery) ||
      item.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meaningText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handlePlay = (word: string) => {
    ttsService.speakChinese(word);
  };

  const handleDelete = async (word: string) => {
    setVocabList((prev) => prev.filter((v) => v.word !== word));
    await firestoreService.deleteVocabulary(word, firebaseUser?.uid);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % filtered.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };

  const currentCard = filtered[cardIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Noto_Sans_SC']">
              生词本
            </h1>
            <span className="text-base font-bold text-indigo-600">Sổ Tay Từ Vựng</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Từ vựng bạn đã tích lũy và lưu lại trong các buổi luyện nói cùng AI
          </p>
        </div>

        <div className="flex items-center gap-2">
          {firebaseUser ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <Cloud className="w-3.5 h-3.5" />
              <span>Đồng bộ Firestore</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
              <span>Lưu cục bộ</span>
            </div>
          )}

          <button
            onClick={() => {
              setIsFlashcardMode(!isFlashcardMode);
              setIsFlipped(false);
              setCardIndex(0);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              isFlashcardMode
                ? "bg-slate-900 text-white"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isFlashcardMode ? "Xem dạng danh sách" : "Chế độ Flashcard"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadVocabulary}
            className="px-2 py-0.5 rounded bg-amber-200/60 hover:bg-amber-200 font-semibold cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {loading && (
        <div className="p-4 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Đang đồng bộ từ vựng từ Firestore...</span>
        </div>
      )}

      {/* FLASHCARD MODE */}
      {isFlashcardMode && filtered.length > 0 ? (
        <div className="max-w-md mx-auto space-y-4 py-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Thẻ <strong>{cardIndex + 1}</strong> / {filtered.length}
            </span>
            <span>Bấm vào thẻ để lật mặt</span>
          </div>

          {/* Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-72 rounded-3xl bg-white border-2 border-slate-200 shadow-md p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-transform hover:scale-[1.01] relative select-none"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay(currentCard.word);
                }}
                className="p-2 rounded-full bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {!isFlipped ? (
              <div className="space-y-3">
                <span className="text-5xl font-bold text-slate-900 font-['Noto_Sans_SC'] block">
                  {currentCard.word}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 inline-block">
                  {currentCard.hskLevel || "HSK"}
                </span>
                <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                  <RotateCw className="w-3.5 h-3.5" /> Chạm để xem Pinyin & Nghĩa
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                <span className="text-2xl font-bold text-indigo-600 font-['Noto_Sans_SC'] block">
                  {currentCard.word}
                </span>
                <p className="text-lg font-medium text-slate-700 font-mono">
                  [{currentCard.pinyin}]
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {currentCard.meaning}
                </p>
              </div>
            )}
          </div>

          {/* Flashcard navigation controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={prevCard}
              className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handlePlay(currentCard.word)}
              className="px-5 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" /> Phát âm
            </button>
            <button
              onClick={nextCard}
              className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* LIST MODE */
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm từ vựng theo chữ Hán, Pinyin hoặc nghĩa tiếng Việt..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {["all", "HSK 1", "HSK 2", "HSK 3", "HSK 4"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedFilter(lvl)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedFilter === lvl
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {lvl === "all" ? "Tất cả" : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Vocab Cards Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Chưa tìm thấy từ vựng nào</p>
              <p className="text-xs text-slate-400 mt-1">Luyện nói trong phòng để tự động thu thập từ mới.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition-all flex items-start justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900 font-['Noto_Sans_SC']">
                        {item.word}
                      </span>
                      <span className="text-xs font-mono text-indigo-600 font-medium">
                        [{item.pinyin}]
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mt-1">{item.meaning}</p>
                    {item.hskLevel && (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {item.hskLevel}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePlay(item.word)}
                      title="Nghe phát âm"
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.word)}
                      title="Xóa khỏi sổ từ vựng"
                      className="p-2 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
