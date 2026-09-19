import React from "react";
import { MessageSquare, Clock, Flame, BookOpen } from "lucide-react";
import { UserProfile } from "../../types";

interface StatsGridProps {
  userProfile: UserProfile;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ userProfile }) => {
  const stats = [
    {
      id: "sessions",
      labelZh: "练习次数",
      labelVi: "Speaking Sessions",
      value: `${userProfile.totalSessions} buổi`,
      icon: MessageSquare,
      color: "indigo",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      textColor: "text-indigo-600",
    },
    {
      id: "minutes",
      labelZh: "口语时长",
      labelVi: "Speaking Minutes",
      value: `${userProfile.totalMinutes} phút`,
      icon: Clock,
      color: "blue",
      bg: "bg-blue-50",
      border: "border-blue-100",
      textColor: "text-blue-600",
    },
    {
      id: "streak",
      labelZh: "连续学习",
      labelVi: "Current Streak",
      value: `${userProfile.streakDays} ngày`,
      icon: Flame,
      color: "orange",
      bg: "bg-orange-50",
      border: "border-orange-100",
      textColor: "text-orange-600",
    },
    {
      id: "words",
      labelZh: "掌握生词",
      labelVi: "Vocabulary Learned",
      value: `${userProfile.totalWordsLearned} từ`,
      icon: BookOpen,
      color: "emerald",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div id="dashboard-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            id={`stat-card-${stat.id}`}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-['Noto_Sans_SC']">
                {stat.labelZh}
              </span>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.textColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stat.value}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">{stat.labelVi}</p>
          </div>
        );
      })}
    </div>
  );
};
