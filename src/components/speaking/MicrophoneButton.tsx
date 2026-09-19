import React from "react";
import { Mic, Loader2, Volume2, AlertTriangle, Square, ShieldCheck } from "lucide-react";
import { MicState } from "../../types";

interface MicrophoneButtonProps {
  micState: MicState;
  waveformLevels?: number[];
  onToggleMic: () => void;
  onStopAiSpeech: () => void;
  disabled?: boolean;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  micState,
  waveformLevels = [0.2, 0.5, 0.8, 0.4, 0.9, 0.6, 0.3, 0.5],
  onToggleMic,
  onStopAiSpeech,
  disabled = false,
}) => {
  // Normalize state to standard uppercase string
  const normalizedState = (() => {
    const s = String(micState).toUpperCase().replace("-", "_");
    if (s === "LISTENING") return "LISTENING";
    if (s === "PROCESSING") return "PROCESSING";
    if (s === "AI_SPEAKING") return "AI_SPEAKING";
    if (s === "ERROR") return "ERROR";
    return "IDLE";
  })();

  const renderContent = () => {
    switch (normalizedState) {
      case "LISTENING":
        return {
          icon: <Square className="w-6 h-6 text-white fill-white" />,
          labelZh: "正在聆听...",
          labelVi: "Dừng & Gửi",
          bgClass: "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200 ring-4 ring-rose-200 animate-pulse",
          caption: "🔴 Đang nghe tiếng Trung... (Bấm khi nói xong để gửi)",
        };
      case "PROCESSING":
        return {
          icon: <Loader2 className="w-7 h-7 text-white animate-spin" />,
          labelZh: "正在思考...",
          labelVi: "Đang xử lý...",
          bgClass: "bg-amber-500 text-white shadow-lg shadow-amber-100",
          caption: "⏳ Gemini AI đang lắng nghe và chuẩn bị phản hồi...",
        };
      case "AI_SPEAKING":
        return {
          icon: <Volume2 className="w-7 h-7 text-white animate-bounce" />,
          labelZh: "老师正在讲话",
          labelVi: "Ngắt lời",
          bgClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-100",
          caption: "🔊 Giáo viên đang nói tiếng Trung (Nhấn để ngắt lời)",
        };
      case "ERROR":
        return {
          icon: <AlertTriangle className="w-7 h-7 text-white" />,
          labelZh: "重试",
          labelVi: "Thử lại",
          bgClass: "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200",
          caption: "⚠️ Lỗi micro hoặc chưa cấp quyền. Nhấn thử lại hoặc gõ chữ bên dưới.",
        };
      case "IDLE":
      default:
        return {
          icon: <Mic className="w-8 h-8 text-white" />,
          labelZh: "按住说话",
          labelVi: "Bấm để nói",
          bgClass: "bg-gradient-to-tr from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95",
          caption: "🎤 Nhấn để nói tiếng Trung với giáo viên AI",
        };
    }
  };

  const stateInfo = renderContent();

  const handleClick = () => {
    if (normalizedState === "AI_SPEAKING") {
      // Prevent user from speaking while AI is speaking; stopping AI returns to IDLE
      onStopAiSpeech();
    } else {
      onToggleMic();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2.5 select-none w-full max-w-sm">
      {/* Waveform Visualization */}
      <div className="h-7 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 min-w-[140px]">
        {normalizedState === "LISTENING" && (
          <div className="flex items-center gap-1">
            {waveformLevels.slice(0, 10).map((lvl, i) => {
              const clampedHeight = Math.max(6, Math.min(24, Math.round(lvl * 24)));
              return (
                <span
                  key={i}
                  className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                  style={{
                    height: `${clampedHeight}px`,
                  }}
                />
              );
            })}
          </div>
        )}

        {normalizedState === "AI_SPEAKING" && (
          <div className="flex items-center gap-1">
            {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7, 0.4].map((scale, i) => (
              <span
                key={i}
                className="w-1 bg-indigo-600 rounded-full animate-pulse"
                style={{
                  height: `${Math.round(scale * 20)}px`,
                  animationDelay: `${i * 90}ms`,
                  animationDuration: "600ms",
                }}
              />
            ))}
          </div>
        )}

        {normalizedState === "PROCESSING" && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>Phân tích giọng nói...</span>
          </div>
        )}

        {normalizedState === "ERROR" && (
          <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
            <span>Micro gián đoạn</span>
          </div>
        )}

        {normalizedState === "IDLE" && (
          <div className="flex items-center gap-1 opacity-40">
            {[4, 8, 12, 16, 12, 8, 4].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-slate-400 rounded-full"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Microphone Button */}
      <div className="relative flex items-center justify-center">
        <button
          id="main-voice-interaction-button"
          onClick={handleClick}
          disabled={disabled || normalizedState === "PROCESSING"}
          aria-label={stateInfo.labelVi}
          className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${stateInfo.bgClass} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {stateInfo.icon}
          <span className="text-[10px] font-semibold mt-1 tracking-tight">
            {stateInfo.labelVi}
          </span>
        </button>

        {/* Floating Interrupt Button when AI is speaking */}
        {normalizedState === "AI_SPEAKING" && (
          <button
            onClick={onStopAiSpeech}
            title="Ngắt lời AI"
            className="absolute -right-14 bg-slate-800 hover:bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
          >
            <Square className="w-3 h-3 fill-white" />
            <span className="text-[11px]">Dừng</span>
          </button>
        )}
      </div>

      {/* State Caption */}
      <p className="text-xs text-slate-500 font-medium text-center max-w-xs transition-opacity leading-tight">
        {stateInfo.caption}
      </p>

      {/* Privacy Notice: Never store or record audio by default */}
      <div className="flex items-center gap-1 text-[10px] text-slate-400 select-none">
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        <span>Bảo mật: Giọng nói chuyển hóa tức thì, không lưu trữ tệp ghi âm</span>
      </div>
    </div>
  );
};
