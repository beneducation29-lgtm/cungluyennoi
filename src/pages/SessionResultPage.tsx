import React, { useState } from "react";
import {
  Award,
  Clock,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Home,
  FileText,
  Volume2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SpeakingSession } from "../types";
import { ttsService } from "../services/ttsService";

interface SessionResultPageProps {
  session: SpeakingSession;
  onRestartPractice: () => void;
  onGoHome: () => void;
}

export const SessionResultPage: React.FC<SessionResultPageProps> = ({
  session,
  onRestartPractice,
  onGoHome,
}) => {
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} phút ${secs > 0 ? `${secs} giây` : ""}`;
  };

  const playChinese = (text: string) => {
    ttsService.speakChinese(text);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* SUCCESS HEADER */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
          <Award className="w-9 h-9" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-['Noto_Sans_SC']">
            本次练习完成！
          </h1>
          <p className="text-base font-semibold text-emerald-600 mt-1">
            Chúc mừng bạn đã hoàn thành buổi luyện nói!
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Chủ đề: {session.topicTitleZh} • Cấp độ {session.level}
          </p>
        </div>
      </div>

      {/* QUICK SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
          <Clock className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
          <span className="text-xs text-slate-400">Thời lượng nói</span>
          <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {formatDuration(session.durationSeconds)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
          <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
          <span className="text-xs text-slate-400">Lượt hội thoại</span>
          <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {session.messages.filter((m) => m.role === "user").length} lượt
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
          <BookOpen className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
          <span className="text-xs text-slate-400">Từ vựng xuất hiện</span>
          <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {session.vocabulary.length} từ
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
          <CheckCircle2 className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
          <span className="text-xs text-slate-400">Góp ý sửa câu</span>
          <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
            {session.corrections.length} điểm
          </div>
        </div>
      </div>

      {/* ESTIMATED LEARNING INDICATORS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Chỉ số đánh giá buổi nói (Ước tính)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 inline-block">
            Phân tích phát âm Demo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Độ lưu loát (Fluency)</span>
              <strong className="text-indigo-600 font-bold">{session.score.fluency}%</strong>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${session.score.fluency}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Ngữ pháp (Grammar)</span>
              <strong className="text-blue-600 font-bold">{session.score.grammar}%</strong>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${session.score.grammar}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Từ vựng (Vocabulary)</span>
              <strong className="text-emerald-600 font-bold">{session.score.vocabulary}%</strong>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${session.score.vocabulary}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Phát âm (Pronunciation)</span>
              <strong className="text-purple-600 font-bold">{session.score.pronunciation}%</strong>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${session.score.pronunciation}%` }} />
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          *Lưu ý: Điểm số trên là phân tích ước tính dựa trên tốc độ và cấu trúc câu luyện tập (Demo scoring).
        </p>
      </div>

      {/* KEY LEARNING POINTS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 font-['Noto_Sans_SC'] flex items-center gap-2">
          <span>今天学到的重点</span>
          <span className="text-xs text-slate-500 font-sans font-normal">(Trọng tâm bài học hôm nay)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-indigo-700 font-['Noto_Sans_SC']">
                一件衣服
              </span>
              <button onClick={() => playChinese("一件衣服")} className="text-slate-400 hover:text-indigo-600">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Lượng từ “件” (jiàn) chuẩn cho quần áo, áo sơ mi, áo khoác.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-indigo-700 font-['Noto_Sans_SC']">
                因为...所以...
              </span>
              <button onClick={() => playChinese("因为所以")} className="text-slate-400 hover:text-indigo-600">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Mẫu câu liên kết nguyên nhân - kết quả: Bởi vì... cho nên...
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-indigo-700 font-['Noto_Sans_SC']">
                我觉得...
              </span>
              <button onClick={() => playChinese("我觉得")} className="text-slate-400 hover:text-indigo-600">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Khởi đầu nêu quan điểm cá nhân: Tôi cảm thấy/Tôi nghĩ rằng...
            </p>
          </div>
        </div>
      </div>

      {/* CORRECTIONS REVIEW */}
      {session.corrections.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900">Chi tiết câu đã sửa trong buổi học</h2>
          <div className="space-y-2.5">
            {session.corrections.map((corr, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-400 line-through font-['Noto_Sans_SC']">
                    {corr.original}
                  </span>
                  <span className="text-emerald-700 font-bold font-['Noto_Sans_SC'] text-sm">
                    → {corr.corrected}
                  </span>
                  <button
                    onClick={() => playChinese(corr.corrected)}
                    className="ml-auto text-emerald-700 hover:text-emerald-900"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-600 italic">{corr.pinyin}</p>
                <p className="text-slate-700 font-medium pt-1 border-t border-amber-200/60">
                  {corr.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSCRIPT ACCORDION */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          onClick={() => setShowFullTranscript(!showFullTranscript)}
          className="w-full p-4 flex items-center justify-between text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Xem chi tiết toàn bộ hội thoại ({session.messages.length} tin nhắn)</span>
          </span>
          {showFullTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFullTranscript && (
          <div className="p-4 pt-0 border-t border-slate-100 space-y-3 bg-slate-50/50 max-h-96 overflow-y-auto">
            {session.messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-xl text-xs space-y-1 ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white ml-8"
                    : "bg-white text-slate-800 border border-slate-200 mr-8"
                }`}
              >
                <span className={`text-[10px] font-bold block ${m.role === "user" ? "text-indigo-200" : "text-indigo-600"}`}>
                  {m.role === "user" ? "Bạn (Học viên)" : "Giáo viên AI"}
                </span>
                <p className="text-sm font-['Noto_Sans_SC'] font-medium">{m.chinese}</p>
                {m.pinyin && <p className={m.role === "user" ? "text-indigo-200" : "text-slate-400"}>{m.pinyin}</p>}
                {m.translation && <p className={`italic ${m.role === "user" ? "text-indigo-100" : "text-slate-500"}`}>{m.translation}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          id="restart-practice-btn"
          onClick={onRestartPractice}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>再次练习 (Luyện tập lại chủ đề này)</span>
        </button>

        <button
          id="return-home-btn"
          onClick={onGoHome}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>返回首页 (Về trang chủ)</span>
        </button>
      </div>
    </div>
  );
};
