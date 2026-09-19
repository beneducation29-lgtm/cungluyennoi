import React, { useState } from "react";
import { Send, Keyboard, Sparkles } from "lucide-react";

interface TextInputFallbackProps {
  onSendText: (text: string) => void;
  disabled?: boolean;
}

export const TextInputFallback: React.FC<TextInputFallbackProps> = ({
  onSendText,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState("");

  const quickPhrases = ["你好！", "是的", "我想点菜", "多少钱？", "太好了", "谢谢！"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (clean && !disabled) {
      onSendText(clean);
      setInputText("");
    }
  };

  const handleQuickSend = (phrase: string) => {
    if (!disabled) {
      onSendText(phrase);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400">
          <Keyboard className="w-4 h-4" />
        </div>
        <input
          type="text"
          id="speaking-text-fallback-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={disabled}
          placeholder="Hoặc gõ chữ tiếng Trung (Ví dụ: 你好，我想点菜)..."
          className="w-full pl-10 pr-12 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 shadow-xs font-['Noto_Sans_SC'] placeholder:font-sans placeholder:text-slate-400 disabled:bg-slate-50"
        />
        <button
          type="submit"
          id="speaking-text-fallback-send-btn"
          disabled={!inputText.trim() || disabled}
          aria-label="Gửi câu tiếng Trung"
          className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40 disabled:hover:bg-indigo-600 shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Quick response chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
        <span className="text-slate-400 whitespace-nowrap text-[11px] font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Mẫu nhanh:
        </span>
        {quickPhrases.map((phrase, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleQuickSend(phrase)}
            disabled={disabled}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-['Noto_Sans_SC'] border border-slate-200/60 transition-colors whitespace-nowrap text-xs"
          >
            {phrase}
          </button>
        ))}
      </div>
    </div>
  );
};
