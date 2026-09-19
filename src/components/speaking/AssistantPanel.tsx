import React, { useState } from "react";
import {
  BookOpen,
  Volume2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  LifeBuoy,
  ArrowRight,
} from "lucide-react";
import { SentenceCorrection, VocabularyItem } from "../../types";
import { PronunciationEvaluation } from "../../services/pronunciationService";

interface AssistantPanelProps {
  vocabulary: VocabularyItem[];
  corrections: SentenceCorrection[];
  pronunciation: PronunciationEvaluation | null;
  onPlayAudio: (text: string) => void;
  onSaveVocab: (item: VocabularyItem) => void;
  onUsePhrase?: (text: string) => void;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  vocabulary,
  corrections,
  pronunciation,
  onPlayAudio,
  onSaveVocab,
  onUsePhrase,
}) => {
  const [activeTab, setActiveTab] = useState<"vocab" | "corrections" | "pronunciation" | "recovery">("vocab");
  const [expandedCorrectionId, setExpandedCorrectionId] = useState<string | null>(null);

  // Auto expand latest correction if available
  React.useEffect(() => {
    if (corrections.length > 0 && !expandedCorrectionId) {
      setExpandedCorrectionId(corrections[0].id);
    }
  }, [corrections]);

  // Standard emergency rescue phrases for speaking practice
  const emergencyPhrases = [
    {
      zh: "老师，可以再说一遍吗？",
      py: "Lǎoshī, kěyǐ zài shuō yí biàn ma?",
      vi: "Thưa cô, cô có thể nói lại một lần nữa không ạ?",
    },
    {
      zh: "我听不太懂，可以慢一点吗？",
      py: "Wǒ tīng bú tài dǒng, kěyǐ màn yìdiǎn ma?",
      vi: "Em nghe chưa rõ lắm, cô nói chậm lại một chút được không?",
    },
    {
      zh: "这个用中文怎么说？",
      py: "Zhège yòng Zhōngwén zěnme shuō?",
      vi: "Cái này tiếng Trung nói thế nào ạ?",
    },
    {
      zh: "我的意思是...",
      py: "Wǒ de yìsi shì...",
      vi: "Ý của em là...",
    },
  ];

  return (
    <div
      id="speaking-room-assistant-panel"
      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col gap-4 shadow-xs h-full"
    >
      {/* Assistant Tabs */}
      <div className="grid grid-cols-4 p-1 bg-slate-100 rounded-xl text-[11px] font-semibold gap-0.5">
        <button
          onClick={() => setActiveTab("vocab")}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "vocab"
              ? "bg-white text-indigo-700 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Từ vựng ({vocabulary.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("corrections")}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "corrections"
              ? "bg-white text-indigo-700 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Sửa câu ({corrections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("recovery")}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "recovery"
              ? "bg-white text-indigo-700 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5 text-rose-600" />
          <span>Cứu nguy</span>
        </button>

        <button
          onClick={() => setActiveTab("pronunciation")}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "pronunciation"
              ? "bg-white text-indigo-700 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <span>Phát âm</span>
        </button>
      </div>

      {/* Tab 1: Extracted Vocabulary with HSK levels */}
      {activeTab === "vocab" && (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Từ vựng trọng tâm theo cấp độ</span>
            <span className="text-indigo-600 font-semibold">{vocabulary.length} từ</span>
          </div>

          {vocabulary.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
              <p>Chưa có từ vựng nào trong lượt nói này.</p>
              <p className="mt-1 text-[11px]">Nói chuyện với AI để khám phá từ mới phù hợp cấp độ!</p>
            </div>
          ) : (
            vocabulary.map((item) => (
              <div
                key={item.id}
                id={`vocab-item-${item.id}`}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-slate-900 font-['Noto_Sans_SC']">
                      {item.word}
                    </span>
                    <span className="text-xs text-indigo-600 font-medium">[{item.pinyin}]</span>
                    {item.hskLevel && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {item.hskLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{item.meaning}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPlayAudio(item.word)}
                    title="Nghe phát âm"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSaveVocab(item)}
                    title={item.saved ? "Đã lưu vào sổ từ vựng" : "Lưu từ vựng"}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.saved
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-slate-400 hover:text-indigo-600 hover:bg-white"
                    }`}
                  >
                    {item.saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Sentence Corrections (Collapsible & Categorized) */}
      {activeTab === "corrections" && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Sửa lỗi sư phạm không làm gián đoạn hội thoại</span>
            <span className="text-amber-600 font-semibold">{corrections.length} gợi ý</span>
          </div>

          {corrections.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-300 stroke-1" />
              <p className="text-slate-600 font-medium">Chưa phát hiện lỗi lớn nào!</p>
              <p className="mt-1 text-[11px]">Diễn đạt của bạn rất trôi chảy và tự nhiên.</p>
            </div>
          ) : (
            corrections.map((corr) => {
              const isExpanded = expandedCorrectionId === corr.id;
              return (
                <div
                  key={corr.id}
                  id={`correction-card-${corr.id}`}
                  className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden text-xs transition-all shadow-xs"
                >
                  <button
                    onClick={() => setExpandedCorrectionId(isExpanded ? null : corr.id)}
                    className="w-full p-3 flex items-center justify-between text-left font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="shrink-0">✏️</span>
                      {corr.errorType && (
                        <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                          {corr.errorType}
                        </span>
                      )}
                      <span className="font-['Noto_Sans_SC'] font-normal text-slate-700 truncate">
                        "{corr.original}"
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-amber-700 shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="p-3 pt-0 space-y-2 border-t border-amber-100 bg-white/70">
                      <div>
                        <span className="text-[11px] text-slate-500 font-medium">Bạn đã nói:</span>
                        <p className="text-slate-500 font-['Noto_Sans_SC'] line-through">
                          {corr.original}
                        </p>
                      </div>

                      <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-emerald-700 font-bold">Người bản xứ nói:</span>
                          <button
                            onClick={() => onPlayAudio(corr.corrected)}
                            title="Nghe câu chuẩn"
                            className="text-emerald-700 hover:text-emerald-900"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="font-bold text-slate-900 font-['Noto_Sans_SC'] text-sm mt-0.5">
                          {corr.corrected}
                        </p>
                        <p className="text-[11px] text-emerald-800 italic mt-0.5">{corr.pinyin}</p>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 font-medium">Giải thích tiếng Việt:</span>
                        <p className="text-slate-700 leading-relaxed mt-0.5">{corr.explanation}</p>
                      </div>

                      {corr.hskTip && (
                        <div className="text-[10px] bg-slate-100 p-2 rounded text-slate-600">
                          💡 <span className="font-medium">Mẹo ghi nhớ:</span> {corr.hskTip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Emergency Recovery Phrases */}
      {activeTab === "recovery" && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-rose-900">
            <span className="font-bold block mb-1">Mẫu câu cứu nguy khi nói</span>
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Dùng những câu này khi bạn chưa kịp nghĩ ra từ hoặc muốn giáo viên nói chậm lại.
            </p>
          </div>

          <div className="space-y-2">
            {emergencyPhrases.map((phrase, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-['Noto_Sans_SC'] font-bold text-slate-900 text-sm">
                    {phrase.zh}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPlayAudio(phrase.zh)}
                      title="Nghe phát âm"
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-white"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {onUsePhrase && (
                      <button
                        onClick={() => onUsePhrase(phrase.zh)}
                        title="Dùng câu này"
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <span>Dùng</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">{phrase.py}</p>
                <p className="text-[11px] text-slate-600 italic mt-0.5">{phrase.vi}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Pronunciation Analysis */}
      {activeTab === "pronunciation" && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-indigo-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Phân tích phát âm Demo
              </span>
              <span className="text-[10px] font-semibold bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded">
                Ước tính
              </span>
            </div>
            <p className="text-indigo-700 text-[11px] leading-relaxed">
              Điểm số ước tính hỗ trợ luyện tập dựa trên mẫu âm thanh và thanh điệu chuẩn.
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Pronunciation (Phát âm)</span>
              <div className="text-xl font-bold text-indigo-600 mt-1">
                {pronunciation ? pronunciation.pronunciation : 82}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Tone (Thanh điệu)</span>
              <div className="text-xl font-bold text-blue-600 mt-1">
                {pronunciation ? pronunciation.tone : 88}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Fluency (Độ lưu loát)</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {pronunciation ? pronunciation.fluency : 78}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Completeness (Độ trọn vẹn)</span>
              <div className="text-xl font-bold text-purple-600 mt-1">
                {pronunciation ? pronunciation.completeness : 90}
                <span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
            </div>
          </div>

          {/* Feedback note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="font-semibold text-slate-900 block mb-1">Đánh giá nhanh:</span>
            <p className="leading-relaxed">
              {pronunciation
                ? pronunciation.feedbackVi
                : "Phát âm tròn vành rõ chữ! Các thanh điệu được giữ tương đối ổn định. Hãy tiếp tục luyện tập câu dài hơn."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
