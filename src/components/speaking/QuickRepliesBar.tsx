import React, { useState } from "react";
import { Sparkles, Volume2, HelpCircle, ArrowRight, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { FollowUpQuestion, SuggestedReply } from "../../types";

interface QuickRepliesBarProps {
  followUpQuestion: FollowUpQuestion | null;
  suggestions: SuggestedReply[];
  onSelectSuggestion: (text: string) => void;
  onPlayAudio: (text: string) => void;
  onTriggerRecovery: () => void;
  difficultyFeedback?: string | null;
  disabled?: boolean;
}

export const QuickRepliesBar: React.FC<QuickRepliesBarProps> = ({
  followUpQuestion,
  suggestions,
  onSelectSuggestion,
  onPlayAudio,
  onTriggerRecovery,
  difficultyFeedback,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRecoveryDrawer, setShowRecoveryDrawer] = useState(false);

  // Survival rescue phrases when student completely freezes or forgets words
  const survivalPhrases = [
    {
      zh: "老师，我不知道该怎么回答，请提示一下。",
      py: "Lǎoshī, wǒ bù zhīdào gāi zěnme huídá, qǐng tíshì yíxià.",
      vi: "Thưa giáo viên, em chưa biết trả lời thế nào, xin gợi ý giúp em.",
    },
    {
      zh: "请问这句话用中文怎么表达？",
      py: "Qǐngwèn zhè jù huà yòng Zhōngwén zěnme biǎodá?",
      vi: "Cho em hỏi câu này tiếng Trung diễn đạt thế nào ạ?",
    },
    {
      zh: "请您说得稍微慢一点，可以吗？",
      py: "Qǐng nín shuō de shāowēi màn yìdiǎn, kěyǐ ma?",
      vi: "Thầy/Cô có thể nói chậm lại một chút được không ạ?",
    },
    {
      zh: "不好意思，你能再说一遍吗？",
      py: "Bù hǎoyìsi, nǐ néng zài shuō yí biàn ma?",
      vi: "Ngại quá, bạn có thể nhắc lại một lần nữa không?",
    },
  ];

  return (
    <div className="w-full bg-slate-50/90 backdrop-blur-xs border-t border-slate-200/90 p-3 sm:px-5 sm:py-3 transition-all">
      {/* Top row: Teacher's current prompt & Stuck Recovery helper button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="font-semibold text-indigo-950 shrink-0">Gợi ý câu trả lời:</span>
          <span className="text-slate-500 italic text-[11px] truncate">Chọn mẫu câu bên dưới hoặc nói tự do</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowRecoveryDrawer(!showRecoveryDrawer)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/90 hover:bg-amber-100 hover:border-amber-300 transition-colors shadow-2xs"
            title="Nhấp khi bạn bị bí từ hoặc không biết nói gì tiếp theo"
          >
            <Lightbulb className="w-3 h-3 text-amber-600" />
            <span>Cứu nguy bí từ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label={isExpanded ? "Thu gọn gợi ý" : "Mở rộng gợi ý"}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Adaptive feedback badge if available */}
      {difficultyFeedback && (
        <div className="mb-2 text-[11px] text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-md border border-indigo-100/80 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
          <span className="truncate">{difficultyFeedback}</span>
        </div>
      )}

      {/* Suggested Quick-Replies Chips */}
      {isExpanded && suggestions && suggestions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {suggestions.map((sug, idx) => {
            const badgeLabel =
              sug.type === "simple"
                ? "Dễ"
                : sug.type === "question"
                ? "Hỏi lại"
                : "Chi tiết";
            const badgeColor =
              sug.type === "simple"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : sug.type === "question"
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-indigo-100 text-indigo-800 border-indigo-200";

            return (
              <div
                key={idx}
                className="group flex flex-col justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all text-left relative"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${badgeColor}`}
                  >
                    {badgeLabel}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAudio(sug.zh);
                    }}
                    title="Nghe mẫu phát âm"
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>

                <p className="font-semibold text-slate-900 text-xs sm:text-[13px] font-['Noto_Sans_SC'] line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {sug.zh}
                </p>
                <p className="text-[10px] text-slate-400 font-sans truncate">{sug.py}</p>
                <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">{sug.vi}</p>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectSuggestion(sug.zh)}
                  className="mt-2 w-full py-1 px-2 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span>Nói câu này</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Conversation Recovery Modal / Slide-down Drawer */}
      {showRecoveryDrawer && (
        <div className="mt-3 p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Phục hồi hội thoại khi bị bí từ (Conversation Recovery)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowRecoveryDrawer(false)}
              className="text-amber-800 hover:text-amber-950 text-xs font-semibold px-2 py-0.5 rounded hover:bg-amber-200/50"
            >
              Đóng
            </button>
          </div>

          <p className="text-amber-900 text-[11px] leading-relaxed">
            Đừng lo lắng khi chưa nghĩ ra từ! Hãy chọn một câu cứu nguy dưới đây để nhờ giáo viên gợi mở hoặc điều chỉnh tốc độ:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {survivalPhrases.map((phrase, pIdx) => (
              <div
                key={pIdx}
                className="p-2.5 rounded-xl bg-white border border-amber-200/80 hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-['Noto_Sans_SC'] font-bold text-slate-900 text-xs">
                      {phrase.zh}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPlayAudio(phrase.zh)}
                      className="p-1 rounded text-slate-400 hover:text-amber-700 hover:bg-amber-50"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">{phrase.py}</p>
                  <p className="text-[11px] text-slate-600 italic mt-0.5">{phrase.vi}</p>
                </div>

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelectSuggestion(phrase.zh);
                    setShowRecoveryDrawer(false);
                  }}
                  className="mt-2 py-1 px-2 text-[11px] font-semibold bg-amber-100 hover:bg-amber-600 hover:text-white text-amber-900 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Dùng câu này</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onTriggerRecovery();
                setShowRecoveryDrawer(false);
              }}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline decoration-amber-400"
            >
              Nhờ giáo viên tự động gợi ý chủ đề dễ hơn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
