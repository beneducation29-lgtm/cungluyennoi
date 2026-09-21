import React, { useRef, useEffect, useState } from "react";
import { Volume2, Copy, Check, Sparkles, User, Bot, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { DisplayMode, Message } from "../../types";

interface ConversationTranscriptProps {
  messages: Message[];
  displayMode: DisplayMode;
  onPlayAudio: (text: string) => void;
  teacherName: string;
  isAiSpeaking: boolean;
}

export const ConversationTranscript: React.FC<ConversationTranscriptProps> = ({
  messages,
  displayMode,
  onPlayAudio,
  teacherName,
  isAiSpeaking,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCorrectionIds, setExpandedCorrectionIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiSpeaking]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCorrection = (msgId: string) => {
    setExpandedCorrectionIds((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  return (
    <div
      id="conversation-transcript-container"
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scroll-smooth"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
          <Bot className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
          <p>Bắt đầu cuộc trò chuyện cùng {teacherName}...</p>
        </div>
      )}

      {messages.map((msg) => {
        const isUser = msg.role === "user";
        const hasCorrection = Boolean(msg.correction);
        const isCorrectionOpen = Boolean(expandedCorrectionIds[msg.id]);

        return (
          <div
            key={msg.id}
            id={`message-bubble-${msg.id}`}
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar indicator */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  isUser
                    ? "bg-slate-800 text-white"
                    : "bg-gradient-to-tr from-indigo-600 to-blue-500 text-white"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <span>{teacherName.charAt(0)}</span>}
              </div>

              {/* Bubble Content */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 transition-all shadow-xs ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                }`}
              >
                {/* Header inside bubble */}
                <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-white/10 dark:border-slate-100">
                  <span
                    className={`text-[11px] font-semibold ${
                      isUser ? "text-indigo-100" : "text-indigo-600 font-['Noto_Sans_SC']"
                    }`}
                  >
                    {isUser ? "Bạn (Học viên)" : `${teacherName} • AI`}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {!isUser && (
                      <button
                        id={`play-audio-btn-${msg.id}`}
                        onClick={() => onPlayAudio(msg.chinese)}
                        title="Phát lại phát âm tiếng Trung"
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                        aria-label="Nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(msg.id, msg.chinese)}
                      title="Sao chép chữ Hán"
                      className={`p-1 rounded transition-colors ${
                        isUser
                          ? "text-indigo-200 hover:text-white"
                          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      }`}
                      aria-label="Sao chép"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Chinese Characters (Prominent) */}
                <p
                  className={`text-lg sm:text-xl font-medium tracking-wide font-['Noto_Sans_SC'] leading-relaxed ${
                    isUser ? "text-white" : "text-slate-900"
                  }`}
                >
                  {msg.chinese}
                </p>

                {/* Pinyin (shown if mode is chinese-pinyin or full) */}
                {displayMode !== "chinese-only" && msg.pinyin && (
                  <p
                    className={`text-xs sm:text-sm font-sans tracking-wide mt-1.5 font-medium ${
                      isUser ? "text-indigo-200" : "text-slate-500"
                    }`}
                  >
                    {msg.pinyin}
                  </p>
                )}

                {/* Vietnamese Translation (shown if mode is full) */}
                {displayMode === "full" && msg.translation && (
                  <p
                    className={`text-xs sm:text-sm italic mt-2 pt-1.5 border-t ${
                      isUser
                        ? "text-indigo-100/90 border-indigo-500/40"
                        : "text-slate-600 border-slate-100"
                    }`}
                  >
                    {msg.translation}
                  </p>
                )}
              </div>
            </div>

            {/* Non-intrusive collapsible Correction Pill under student message */}
            {isUser && hasCorrection && msg.correction && (
              <div className="mr-12 mt-1.5 max-w-[80%]">
                <button
                  type="button"
                  onClick={() => toggleCorrection(msg.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-2xs"
                >
                  <HelpCircle className="w-3 h-3 text-amber-600" />
                  <span>Gợi ý cách nói tự nhiên hơn</span>
                  {isCorrectionOpen ? (
                    <ChevronUp className="w-3 h-3 text-amber-700" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-amber-700" />
                  )}
                </button>

                {isCorrectionOpen && (
                  <div className="mt-1.5 p-3 bg-amber-50/95 border border-amber-200 rounded-xl text-xs space-y-1.5 text-left shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">
                        {msg.correction.errorType || "Ngữ pháp & Lượng từ"}
                      </span>
                      <button
                        onClick={() => onPlayAudio(msg.correction!.corrected)}
                        className="p-1 text-emerald-700 hover:text-emerald-900"
                        title="Nghe câu chuẩn"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium">Chuẩn ngữ cảnh:</span>
                      <p className="font-['Noto_Sans_SC'] font-bold text-slate-900 text-sm">
                        {msg.correction.corrected}
                      </p>
                      <p className="text-[11px] text-slate-500">{msg.correction.pinyin}</p>
                    </div>
                    <p className="text-[11px] text-amber-900/90 pt-1 border-t border-amber-200/60 leading-relaxed">
                      💡 {msg.correction.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* AI Speaking Indicator bubble */}
      {isAiSpeaking && (
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-medium pl-12 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>{teacherName} đang phát âm...</span>
        </div>
      )}
    </div>
  );
};
