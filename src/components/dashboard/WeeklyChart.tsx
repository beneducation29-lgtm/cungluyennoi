import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";

export const WeeklyChart: React.FC = () => {
  const weekData = [
    { day: "Thứ 2", dayZh: "周一", minutes: 25, isToday: false },
    { day: "Thứ 3", dayZh: "周二", minutes: 30, isToday: false },
    { day: "Thứ 4", dayZh: "周三", minutes: 20, isToday: false },
    { day: "Thứ 5", dayZh: "周四", minutes: 35, isToday: false },
    { day: "Thứ 6", dayZh: "周五", minutes: 25, isToday: false },
    { day: "Thứ 7", dayZh: "周六", minutes: 40, isToday: false },
    { day: "CN", dayZh: "周日", minutes: 15, isToday: true },
  ];

  const maxMinutes = 45;

  return (
    <div
      id="weekly-learning-chart-card"
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Thời lượng nói trong tuần</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +18% so với tuần trước
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mục tiêu hàng ngày: 20 phút khẩu ngữ
          </p>
        </div>
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
          <BarChart3 className="w-5 h-5" />
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 pb-2 border-b border-slate-100">
        {weekData.map((item, index) => {
          const heightPercent = Math.round((item.minutes / maxMinutes) * 100);
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
              {/* Tooltip on hover */}
              <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {item.minutes}p
              </span>

              {/* Bar */}
              <div className="w-full max-w-[36px] bg-slate-100 rounded-xl h-28 flex items-end p-1 overflow-hidden">
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${
                    item.isToday
                      ? "bg-gradient-to-t from-indigo-600 to-blue-500 shadow-sm"
                      : "bg-indigo-200 group-hover:bg-indigo-400"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Day label */}
              <div className="text-center">
                <span className="block text-[11px] font-semibold text-slate-700">
                  {item.day}
                </span>
                <span className="block text-[10px] text-slate-400 font-['Noto_Sans_SC']">
                  {item.dayZh}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between pt-3 text-xs text-slate-500 font-medium">
        <span>Tổng thời gian tuần này: <strong className="text-slate-900">190 phút</strong></span>
        <span className="text-indigo-600 font-semibold">Đạt 135% chỉ tiêu tuần</span>
      </div>
    </div>
  );
};
