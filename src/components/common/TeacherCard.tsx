import React from "react";
import { Check, Sparkles, Volume2 } from "lucide-react";
import { AITeacher } from "../../types";

interface TeacherCardProps {
  teacher: AITeacher;
  isSelected: boolean;
  onSelect: (teacher: AITeacher) => void;
  onPlayGreeting?: (text: string) => void;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
  teacher,
  isSelected,
  onSelect,
  onPlayGreeting,
}) => {
  return (
    <div
      id={`teacher-card-${teacher.id}`}
      onClick={() => onSelect(teacher)}
      className={`rounded-2xl border-2 p-5 transition-all cursor-pointer relative flex flex-col justify-between ${
        isSelected
          ? "border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Top right selected check badge */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      <div>
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="relative shrink-0">
            <img
              src={teacher.avatar}
              alt={teacher.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-md bg-white border border-slate-200">
              <Sparkles className="w-3 h-3 text-indigo-600" />
            </div>
          </div>

          <div className="pr-6">
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-lg font-bold text-slate-900 font-['Noto_Sans_SC']">
                {teacher.name}
              </h3>
              <span className="text-xs text-slate-400 font-medium">({teacher.pinyin})</span>
            </div>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">{teacher.role}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
              {teacher.recommendedLevels}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
          {teacher.description}
        </p>

        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[11px] text-slate-600 space-y-1">
          <span className="font-semibold text-slate-800 block">Phong cách:</span>
          <p className="leading-snug">{teacher.teachingStyle}</p>
        </div>
      </div>

      {/* Greeting sample listen button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-['Noto_Sans_SC'] truncate max-w-[170px]">
          "{teacher.greetingZh}"
        </span>
        {onPlayGreeting && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPlayGreeting(teacher.greetingZh);
            }}
            title="Nghe giọng chào"
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
