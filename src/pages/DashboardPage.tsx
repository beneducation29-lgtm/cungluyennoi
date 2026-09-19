import React from "react";
import { Play, Sparkles, Flame, Clock, BookOpen, ChevronRight, Mic } from "lucide-react";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { WeeklyChart } from "../components/dashboard/WeeklyChart";
import { TopicCard } from "../components/common/TopicCard";
import { TOPICS } from "../data/topics";
import { TEACHERS } from "../data/teachers";
import { Topic, UserProfile } from "../types";

interface DashboardPageProps {
  userProfile: UserProfile;
  onStartSession: (topic: Topic) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  userProfile,
  onStartSession,
  onNavigate,
}) => {
  const currentTeacher =
    TEACHERS.find((t) => t.id === userProfile.preferredTeacher) || TEACHERS[0];
  const lastTopic = TOPICS[0]; // "在餐厅点菜"
  const recommendedTopics = TOPICS.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* GREETING HERO */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background decorative accents */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-6 text-indigo-400/10 font-['Noto_Sans_SC'] text-9xl font-black select-none pointer-events-none">
          中文
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Mục tiêu khẩu ngữ hôm nay: 20 phút</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Noto_Sans_SC']">
              你好，{userProfile.name}！
            </h1>
            <p className="text-lg sm:text-xl text-indigo-200 font-medium mt-1">
              今天想练习什么？(Hôm nay bạn muốn luyện nói chủ đề gì?)
            </p>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Giáo viên <strong className="text-white">{currentTeacher.name}</strong> đã sẵn sàng hỗ trợ bạn luyện phát âm, sửa ngữ pháp và tăng cường phản xạ giao tiếp.
          </p>

          {/* Quick Resume Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="dashboard-resume-btn"
              onClick={() => onStartSession(lastTopic)}
              className="px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Tiếp tục luyện tập: {lastTopic.chineseTitle}</span>
              <span className="text-xs text-indigo-200">({lastTopic.vietnameseTitle})</span>
            </button>

            <button
              onClick={() => onNavigate("topics")}
              className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10"
            >
              Đổi chủ đề khác
            </button>
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Thống kê học tập</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
            Cập nhật tức thì
          </span>
        </h2>
        <StatsGrid userProfile={userProfile} />
      </section>

      {/* CHARTS & RECENT SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <WeeklyChart />
        </div>

        {/* Learning streak and teacher status card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-400 font-['Noto_Sans_SC']">当前伴读老师</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                Đang trực tuyến
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-4">
              <img
                src={currentTeacher.avatar}
                alt={currentTeacher.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Noto_Sans_SC']">
                  {currentTeacher.name}
                </h3>
                <p className="text-xs text-indigo-600 font-medium">{currentTeacher.role}</p>
                <p className="text-[11px] text-slate-400">{currentTeacher.recommendedLevels}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1.5 border border-slate-100">
              <span className="font-semibold text-slate-800 block">Lời nhắn từ cô:</span>
              <p className="italic font-['Noto_Sans_SC']">"{currentTeacher.greetingZh}"</p>
              <p className="text-[11px] text-slate-500">"{currentTeacher.greetingVi}"</p>
            </div>
          </div>

          <button
            onClick={() => onStartSession(lastTopic)}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Mở phòng luyện nói ngay</span>
          </button>
        </div>
      </div>

      {/* RECOMMENDED TOPICS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chủ đề đề xuất cho bạn</h2>
            <p className="text-xs text-slate-500">Được chọn lọc theo trình độ {userProfile.currentLevel}</p>
          </div>
          <button
            onClick={() => onNavigate("topics")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Tất cả chủ đề <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onSelect={() => onStartSession(topic)}
              onStartPractice={() => onStartSession(topic)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
