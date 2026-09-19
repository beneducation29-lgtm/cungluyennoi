import React, { useState, useEffect } from "react";
import {
  History,
  Calendar,
  Clock,
  MessageSquare,
  Award,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  BookOpen,
  Cloud,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { SpeakingSession } from "../types";
import { storageService } from "../services/storageService";
import { firestoreService } from "../services/firestoreService";
import { useAuth } from "../contexts/AuthContext";
import { TOPICS } from "../data/topics";

interface HistoryPageProps {
  onReplayTopic: (topicId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onReplayTopic }) => {
  const { firebaseUser, isFirebaseConfigured } = useAuth();
  const [sessions, setSessions] = useState<SpeakingSession[]>(() => storageService.getSessions());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    if (firebaseUser && isFirebaseConfigured) {
      setLoading(true);
      setError(null);
      try {
        const cloudSessions = await firestoreService.getUserSessions(firebaseUser.uid);
        if (cloudSessions && cloudSessions.length > 0) {
          setSessions(cloudSessions);
        } else {
          setSessions(storageService.getSessions());
        }
      } catch (err) {
        console.warn("Could not fetch sessions from Firestore:", err);
        setError("Không thể tải lịch sử từ đám mây, đang hiển thị bản sao lưu cục bộ.");
        setSessions(storageService.getSessions());
      } finally {
        setLoading(false);
      }
    } else {
      setSessions(storageService.getSessions());
    }
  };

  useEffect(() => {
    loadSessions();
  }, [firebaseUser, isFirebaseConfigured]);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString("vi-VN")} • ${d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}p ${s}s`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Noto_Sans_SC']">
              学习记录
            </h1>
            <span className="text-base font-bold text-indigo-600">Lịch Sử Luyện Nói</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem lại các buổi đàm thoại, từ vựng và câu đã được giáo viên AI góp ý
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2">
          {firebaseUser ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <Cloud className="w-3.5 h-3.5" />
              <span>Đã đồng bộ Firestore</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
              <span>Lưu cục bộ (Demo)</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadSessions}
            className="px-2 py-0.5 rounded bg-amber-200/60 hover:bg-amber-200 font-semibold cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 mx-auto text-indigo-600 animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-600">Đang tải lịch sử từ Firestore...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <History className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
          <p className="text-sm font-semibold text-slate-700">Chưa có lịch sử luyện nói</p>
          <p className="text-xs text-slate-400 mt-1">Hãy tham gia một buổi luyện nói đầu tiên để lưu lại lịch sử.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => {
            const isExpanded = expandedId === sess.id;
            return (
              <div
                key={sess.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : sess.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900 font-['Noto_Sans_SC']">
                        {sess.topicTitleZh}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold">
                        {sess.level}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        (với {sess.teacherNameZh})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(sess.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDuration(sess.durationSeconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        {(sess.messages || []).filter((m) => m.role === "user").length} lượt nói
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Độ lưu loát</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {sess.score?.fluency || 85}%
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-4">
                    {/* Key points */}
                    {sess.keyPoints && sess.keyPoints.length > 0 && (
                      <div className="pt-3">
                        <span className="text-xs font-bold text-slate-700 block mb-1.5">
                          Trọng tâm buổi học:
                        </span>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                          {sess.keyPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Corrections in this session */}
                    {sess.corrections && sess.corrections.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-amber-800 block mb-1.5">
                          Gợi ý sửa câu trong buổi ({sess.corrections.length}):
                        </span>
                        <div className="space-y-2">
                          {sess.corrections.map((c) => (
                            <div
                              key={c.id}
                              className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs"
                            >
                              <span className="text-slate-400 line-through font-['Noto_Sans_SC']">
                                {c.original}
                              </span>
                              <span className="text-emerald-700 font-bold font-['Noto_Sans_SC'] ml-2">
                                → {c.corrected}
                              </span>
                              <p className="text-slate-600 mt-1">{c.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Replay CTA */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onReplayTopic(sess.topic)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Luyện lại chủ đề này</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

