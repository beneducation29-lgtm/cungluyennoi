import React from "react";
import { DisplayMode } from "../../types";

interface DisplayModeToggleProps {
  currentMode: DisplayMode;
  onChangeMode: (mode: DisplayMode) => void;
}

export const DisplayModeToggle: React.FC<DisplayModeToggleProps> = ({
  currentMode,
  onChangeMode,
}) => {
  const modes: { id: DisplayMode; labelZh: string; labelVi: string; desc: string }[] = [
    {
      id: "chinese-only",
      labelZh: "仅中文",
      labelVi: "Chỉ Hán tự",
      desc: "Luyện phản xạ đọc nhận diện chữ Hán",
    },
    {
      id: "chinese-pinyin",
      labelZh: "中文+拼音",
      labelVi: "+ Pinyin",
      desc: "Chữ Hán kèm phiên âm thanh điệu",
    },
    {
      id: "full",
      labelZh: "完整模式",
      labelVi: "+ Tiếng Việt",
      desc: "Hán tự + Pinyin + Dịch nghĩa",
    },
  ];

  return (
    <div
      id="display-mode-selector"
      className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium"
      role="group"
      aria-label="Chế độ hiển thị văn bản hội thoại"
    >
      {modes.map((m) => {
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            id={`display-mode-btn-${m.id}`}
            onClick={() => onChangeMode(m.id)}
            title={m.desc}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isActive
                ? "bg-white text-indigo-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="font-['Noto_Sans_SC'] font-medium hidden sm:inline">{m.labelZh}</span>
            <span>{m.labelVi}</span>
          </button>
        );
      })}
    </div>
  );
};
