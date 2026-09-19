import React from "react";
import { Clock, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { Topic } from "../../types";

interface TopicCardProps {
  topic: Topic;
  isSelected?: boolean;
  onSelect: (topic: Topic) => void;
  onStartPractice?: (topic: Topic) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  isSelected,
  onSelect,
  onStartPractice,
}) => {
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "Dễ":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Trung bình":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Thử thách":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div
      id={`topic-card-${topic.id}`}
      onClick={() => onSelect(topic)}
      className={`rounded-2xl border-2 p-5 transition-all cursor-pointer flex flex-col justify-between group ${
        isSelected
          ? "border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div>
        {/* Badges Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
            {topic.hskLevel}
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getDifficultyBadge(
              topic.difficulty
            )}`}
          >
            {topic.difficulty}
          </span>
        </div>

        {/* Titles */}
        <h3 className="text-xl font-bold text-slate-900 font-['Noto_Sans_SC'] group-hover:text-indigo-600 transition-colors">
          {topic.chineseTitle}
        </h3>
        <p className="text-xs text-slate-400 font-medium tracking-wide mt-0.5">
          {topic.pinyinTitle}
        </p>
        <p className="text-sm font-semibold text-slate-700 mt-1">
          {topic.vietnameseTitle}
        </p>

        <p className="text-xs text-slate-500 leading-relaxed mt-2.5 line-clamp-2">
          {topic.description}
        </p>
      </div>

      {/* Meta Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {topic.estimatedDuration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            {topic.vocabularyCount} từ
          </span>
        </div>

        {onStartPractice ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartPractice(topic);
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1"
          >
            <span>Vào phòng</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </div>
  );
};
