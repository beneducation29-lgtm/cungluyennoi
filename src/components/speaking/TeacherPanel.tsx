import React from "react";
import { Volume2, Sparkles, Sliders, MessageCircle, HelpCircle } from "lucide-react";
import { AITeacher, MicState, Topic } from "../../types";

interface TeacherPanelProps {
  teacher: AITeacher;
  topic: Topic;
  micState: MicState;
  speechSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onUseStarterPhrase: (text: string) => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({
  teacher,
  topic,
  micState,
  speechSpeed,
  onChangeSpeed,
  onUseStarterPhrase,
}) => {
  const speeds = [0.75, 1.0, 1.25, 1.5];

  const getStatusBadge = () => {
    const s = String(micState).toUpperCase().replace("-", "_");
    switch (s) {
      case "AI_SPEAKING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Đang nói...
          </span>
        );
      case "LISTENING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Đang lắng nghe
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Đang suy nghĩ...
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Lỗi micro
          </span>
        );
      case "IDLE":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Sẵn sàng
          </span>
        );
    }
  };

  return (
    <div
      id="speaking-room-teacher-panel"
      className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-5 shadow-xs"
    >
      {/* Teacher Profile Header */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <img
            src={teacher.avatar}
            alt={teacher.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 shadow-sm"
          />
          <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-3 h-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Noto_Sans_SC']">
              {teacher.name}
            </h2>
            <span className="text-xs text-slate-400 font-medium">({teacher.pinyin})</span>
          </div>
          <p className="text-xs font-semibold text-indigo-600">{teacher.role}</p>
          <div className="mt-1.5">{getStatusBadge()}</div>
        </div>
      </div>

      {/* Teaching Style Card */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>Phong cách hướng dẫn</span>
        </div>
        <p className="leading-relaxed">{teacher.teachingStyle}</p>
      </div>

      {/* Speech Speed Controls */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
            Tốc độ phát âm AI
          </span>
          <span className="text-indigo-600 font-bold">{speechSpeed}x</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {speeds.map((spd) => (
            <button
              key={spd}
              id={`speed-btn-${spd}`}
              onClick={() => onChangeSpeed(spd)}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                speechSpeed === spd
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Starter Phrases Helper */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>Gợi ý mẫu câu để nói</span>
        </div>
        <div className="space-y-1.5">
          {topic.starterPhrases.slice(0, 3).map((item, idx) => (
            <button
              key={idx}
              onClick={() => onUseStarterPhrase(item.zh)}
              title="Bấm để nói mẫu câu này"
              className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 text-xs transition-colors group cursor-pointer"
            >
              <p className="font-semibold text-slate-800 group-hover:text-indigo-700 font-['Noto_Sans_SC']">
                {item.zh}
              </p>
              <p className="text-[10px] text-slate-400">{item.py}</p>
              <p className="text-[11px] text-slate-500 italic mt-0.5">{item.vi}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
