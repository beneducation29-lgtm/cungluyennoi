import React, { useState } from "react";
import {
  Search,
  Filter,
  Sparkles,
  Layers,
  MessageSquare,
  Award,
  Users,
  CheckCircle2,
} from "lucide-react";
import { TOPICS } from "../data/topics";
import { TEACHERS } from "../data/teachers";
import { TopicCard } from "../components/common/TopicCard";
import { TeacherCard } from "../components/common/TeacherCard";
import { AITeacher, ChineseLevel, ConversationMode, Topic } from "../types";

interface TopicsPageProps {
  onStartSession: (topic: Topic, teacher: AITeacher, level: ChineseLevel, mode: ConversationMode) => void;
  defaultTeacherId?: string;
  defaultLevel?: ChineseLevel;
}

export const TopicsPage: React.FC<TopicsPageProps> = ({
  onStartSession,
  defaultTeacherId = "lin-laoshi",
  defaultLevel = "HSK 2",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<ConversationMode>("roleplay");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(defaultTeacherId);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showTeacherModal, setShowTeacherModal] = useState<boolean>(false);

  const categories = [
    { id: "all", labelVi: "Tất cả chủ đề", labelZh: "全部" },
    { id: "Daily Conversation", labelVi: "Đời sống hàng ngày", labelZh: "日常" },
    { id: "Restaurant", labelVi: "Ẩm thực & Nhà hàng", labelZh: "餐饮" },
    { id: "Travel", labelVi: "Du lịch & Khách sạn", labelZh: "旅游" },
    { id: "Shopping", labelVi: "Mua sắm & Giá cả", labelZh: "购物" },
    { id: "Work", labelVi: "Công sở & Kinh doanh", labelZh: "职场" },
    { id: "School", labelVi: "Học tập & Trường học", labelZh: "校园" },
  ];

  const levels: ("all" | ChineseLevel)[] = [
    "all",
    "Beginner",
    "HSK 1",
    "HSK 2",
    "HSK 3",
    "HSK 4",
    "HSK 5",
    "HSK 6",
    "Advanced",
  ];

  const modes: { id: ConversationMode; labelZh: string; labelVi: string; desc: string }[] = [
    {
      id: "roleplay",
      labelZh: "情景对话",
      labelVi: "Đóng vai tình huống (Role Play)",
      desc: "AI hóa thân thành bồi bàn, lễ tân, đồng nghiệp bản xứ",
    },
    {
      id: "free",
      labelZh: "自由对话",
      labelVi: "Trò chuyện tự do (Free Conversation)",
      desc: "Thoải mái trò chuyện không bị gò bó kịch bản cố định",
    },
    {
      id: "hsk",
      labelZh: "HSK练习",
      labelVi: "Luyện thi HSK (HSK Practice)",
      desc: "Tập trung từ vựng và ngữ pháp trọng tâm theo cấp độ HSK",
    },
  ];

  const currentTeacher =
    TEACHERS.find((t) => t.id === selectedTeacherId) || TEACHERS[0];

  // Filter topics
  const filteredTopics = TOPICS.filter((t) => {
    const matchCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchLevel = selectedLevel === "all" || t.hskLevel === selectedLevel;
    const matchSearch =
      !searchQuery.trim() ||
      t.chineseTitle.includes(searchQuery) ||
      t.pinyinTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vietnameseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchLevel && matchSearch;
  });

  const handleLaunch = (topic: Topic) => {
    const effectiveLevel = (topic.hskLevel as ChineseLevel) || defaultLevel;
    onStartSession(topic, currentTeacher, effectiveLevel, selectedMode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kho Chủ Đề Luyện Nói
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chọn kịch bản tình huống thực tế và bắt đầu trò chuyện cùng giáo viên AI
          </p>
        </div>

        {/* Selected Teacher Quick Bar */}
        <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <img
            src={currentTeacher.avatar}
            alt={currentTeacher.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Giáo viên:</span>
              <strong className="text-xs text-slate-900 font-['Noto_Sans_SC']">
                {currentTeacher.name}
              </strong>
            </div>
            <span className="text-[11px] text-indigo-600 font-semibold">{currentTeacher.role}</span>
          </div>
          <button
            onClick={() => setShowTeacherModal(true)}
            className="ml-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-colors"
          >
            Đổi giáo viên
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <span className="text-xs font-bold text-slate-500 block mb-2">
          CHỌN HÌNH THỨC LUYỆN NÓI
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {modes.map((m) => {
            const isSelected = selectedMode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-900 font-['Noto_Sans_SC']">
                      {m.labelZh}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-indigo-600">{m.labelVi}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="topics-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm chủ đề (ví dụ: 点菜, gọi món, du lịch, HSK 2)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* HSK Level Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedLevel === lvl
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {lvl === "all" ? "Mọi cấp độ" : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="font-['Noto_Sans_SC'] hidden sm:inline">{cat.labelZh}</span>
              <span>{cat.labelVi}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Tìm thấy {filteredTopics.length} chủ đề phù hợp</span>
          <span>Chế độ đang chọn: {modes.find((m) => m.id === selectedMode)?.labelVi}</span>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Layers className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Không tìm thấy chủ đề phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng thử tìm từ khoá khác hoặc đổi bộ lọc cấp độ.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onSelect={() => handleLaunch(topic)}
                onStartPractice={() => handleLaunch(topic)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Teacher Selection Modal Dialog */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-['Noto_Sans_SC']">
                  选择 AI 伴读老师
                </h3>
                <p className="text-xs text-slate-500">Chọn giáo viên AI đồng hành luyện nói cùng bạn</p>
              </div>
              <button
                onClick={() => setShowTeacherModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEACHERS.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  isSelected={selectedTeacherId === teacher.id}
                  onSelect={(t) => {
                    setSelectedTeacherId(t.id);
                    setShowTeacherModal(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
