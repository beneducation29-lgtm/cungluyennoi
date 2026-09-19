import React, { useState } from "react";
import { Play, Pause, Square, Clock, MessageSquare, BookOpen, AlertCircle } from "lucide-react";

interface SessionTimerProps {
  seconds: number;
  turns: number;
  wordsSpoken: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onEndSession: () => void;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  seconds,
  turns,
  wordsSpoken,
  isPaused,
  onTogglePause,
  onEndSession,
}) => {
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleConfirmEnd = () => {
    setShowConfirmEnd(false);
    onEndSession();
  };

  return (
    <>
      <div
        id="session-timer-bar"
        className="flex items-center gap-3 sm:gap-4 bg-white/90 backdrop-blur px-3 py-2 rounded-2xl border border-slate-200 shadow-xs text-xs sm:text-sm font-medium"
      >
        {/* Timer display */}
        <div className="flex items-center gap-1.5 font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl font-bold">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>⏱ {formatTime(seconds)}</span>
        </div>

        {/* Turns count */}
        <div className="hidden md:flex items-center gap-1 text-slate-600">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Lượt nói: <strong className="text-slate-900">{turns}</strong>
          </span>
        </div>

        {/* Words spoken */}
        <div className="hidden lg:flex items-center gap-1 text-slate-600">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Chữ Hán: <strong className="text-slate-900">{wordsSpoken}</strong>
          </span>
        </div>

        {/* Timer controls */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <button
            id="pause-resume-btn"
            onClick={onTogglePause}
            title={isPaused ? "Tiếp tục đếm giờ" : "Tạm dừng đếm giờ"}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            id="end-session-trigger-btn"
            onClick={() => setShowConfirmEnd(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1"
          >
            <Square className="w-3 h-3 fill-rose-600" />
            <span className="hidden sm:inline">Kết thúc</span>
          </button>
        </div>
      </div>

      {/* Confirm End Modal Dialog */}
      {showConfirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div
            id="confirm-end-modal"
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 text-center"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-['Noto_Sans_SC'] mb-1">
              确定要结束本次练习吗？
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Bạn có chắc chắn muốn kết thúc buổi luyện tập này? Hệ thống sẽ tổng hợp báo cáo phát âm, từ vựng và kết quả học tập cho bạn.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                id="cancel-end-btn"
                onClick={() => setShowConfirmEnd(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                继续练习 (Tiếp tục luyện tập)
              </button>
              <button
                id="confirm-end-btn"
                onClick={handleConfirmEnd}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors"
              >
                结束练习 (Kết thúc)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
