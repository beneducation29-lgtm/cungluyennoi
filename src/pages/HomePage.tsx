import React from "react";
import {
  Mic,
  MessageSquare,
  Award,
  BookOpen,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import { TEACHERS } from "../data/teachers";
import { TOPICS } from "../data/topics";

interface HomePageProps {
  onStartPractice: () => void;
  onExploreTopics: () => void;
  onSelectTeacher: (teacherId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartPractice,
  onExploreTopics,
  onSelectTeacher,
}) => {
  const features = [
    {
      icon: MessageSquare,
      titleZh: "AI 实时会话",
      titleVi: "AI Conversation",
      desc: "Trò chuyện phản xạ tự nhiên cùng giáo viên ảo theo ngữ cảnh đời thực.",
      color: "indigo",
    },
    {
      icon: Mic,
      titleZh: "纯正中文语音",
      titleVi: "Voice Practice",
      desc: "Nhận diện giọng nói tiếng Trung chuẩn phổ thông, có hỗ trợ Pinyin và dịch nghĩa.",
      color: "rose",
    },
    {
      icon: Award,
      titleZh: "HSK 专项考级",
      titleVi: "HSK Practice",
      desc: "Luyện khẩu ngữ bám sát từ vựng và cấu trúc ngữ pháp HSK 1 đến HSK 6.",
      color: "blue",
    },
    {
      icon: CheckCircle2,
      titleZh: "发音智能纠错",
      titleVi: "Pronunciation Feedback",
      desc: "Phát hiện lỗi phát âm thanh điệu và gợi ý cách diễn đạt chuẩn xác người bản xứ.",
      color: "emerald",
    },
    {
      icon: BookOpen,
      titleZh: "智能生词沉淀",
      titleVi: "Vocabulary",
      desc: "Tự động trích xuất từ mới trong lúc nói chuyện và lưu vào sổ tay ôn tập.",
      color: "amber",
    },
    {
      icon: TrendingUp,
      titleZh: "学习进度追踪",
      titleVi: "Progress Tracking",
      desc: "Theo dõi số phút luyện nói, duy trì chuỗi học và biểu đồ phát triển khẩu ngữ.",
      color: "purple",
    },
  ];

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Phòng Luyện Nói Tiếng Trung AI Thông Minh Dành Cho Người Việt</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-['Noto_Sans_SC']">
                  练中文，说得更自信
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-indigo-600">
                  Luyện nói tiếng Trung cùng AI — mọi lúc, mọi nơi.
                </p>
              </div>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Xóa tan rào cản sợ sai khi mở miệng nói tiếng Trung. Trò chuyện 1-kèm-1 cùng giáo viên AI kiên nhẫn, sửa lỗi ngữ pháp tức thì và làm chủ phản xạ giao tiếp từ HSK 1 đến HSK 6.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="hero-start-practice-btn"
                  onClick={onStartPractice}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <span className="font-['Noto_Sans_SC'] font-bold text-lg">开始练习</span>
                  <span className="text-sm font-semibold opacity-90 border-l border-indigo-400 pl-3">
                    Bắt đầu luyện tập
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-explore-topics-btn"
                  onClick={onExploreTopics}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-semibold text-base transition-all shadow-xs"
                >
                  Khám phá chủ đề
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Không cần cấu hình phức tạp
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  Chế độ Demo sẵn sàng 100%
                </span>
              </div>
            </div>

            {/* Right: Virtual AI Chinese Classroom Visual */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={TEACHERS[0].avatar}
                      alt="林老师"
                      className="w-10 h-10 rounded-xl object-cover border border-indigo-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 font-['Noto_Sans_SC']">
                          林老师
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <span className="text-[11px] text-slate-400">AI Giáo viên tiếng Trung</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold">
                    HSK 2
                  </span>
                </div>

                {/* Simulated Conversation Bubble */}
                <div className="py-5 space-y-3.5">
                  {/* Teacher message */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 block">林老师 • Giáo viên</span>
                    <p className="text-base font-medium text-slate-900 font-['Noto_Sans_SC']">
                      您好！欢迎光临。请问几位？
                    </p>
                    <p className="text-xs text-slate-400 font-sans">Nín hǎo! Huānyíng guānglín. Qǐngwèn jǐ wèi?</p>
                    <p className="text-xs text-slate-500 italic">Chào quý khách! Xin hỏi mấy vị ạ?</p>
                  </div>

                  {/* Student response */}
                  <div className="bg-indigo-600 text-white rounded-2xl p-4 ml-8 space-y-1 shadow-xs">
                    <span className="text-[10px] font-bold text-indigo-200 block">Bạn • Học viên</span>
                    <p className="text-base font-medium font-['Noto_Sans_SC']">两位。请给我们一份菜单。</p>
                    <p className="text-xs text-indigo-200">Liǎng wèi. Qǐng gěi wǒmen yí fèn càidān.</p>
                  </div>

                  {/* Dynamic correction hint preview */}
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-start gap-2 text-xs">
                    <span className="text-base">💡</span>
                    <div>
                      <span className="font-bold text-emerald-800 block">Phản xạ chuẩn xác!</span>
                      <p className="text-emerald-700 text-[11px] leading-relaxed">
                        Sử dụng đúng lượng từ “份” (fèn) cho thực đơn.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated Mic Waveform */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[12, 20, 28, 16, 24, 18, 10].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-indigo-500 rounded-full"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                    <span className="text-[11px] text-slate-500 font-medium ml-2">Phát hiện giọng nói zh-CN</span>
                  </div>
                  <button
                    onClick={onStartPractice}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Thử ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Trải nghiệm như lớp học khẩu ngữ 1-kèm-1 thực thụ
          </h2>
          <p className="text-sm text-slate-500">
            Hệ thống AI chuyên sâu được tối ưu hoá theo phương pháp tiếp nhận ngôn ngữ tự nhiên dành riêng cho người Việt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all hover:border-indigo-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900">{feat.titleVi}</h3>
                  <span className="text-xs text-slate-400 font-['Noto_Sans_SC'] font-medium">
                    {feat.titleZh}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* TEACHERS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Đội ngũ Giáo viên AI</h2>
            <p className="text-sm text-slate-500 mt-1">
              Lựa chọn người đồng hành phù hợp với mục tiêu học tập và trình độ của bạn
            </p>
          </div>
          <button
            onClick={onStartPractice}
            className="mt-4 sm:mt-0 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Chọn giáo viên & Bắt đầu <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEACHERS.map((teacher) => (
            <div
              key={teacher.id}
              onClick={() => onSelectTeacher(teacher.id)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs mb-3.5"
                />
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-lg font-bold text-slate-900 font-['Noto_Sans_SC']">
                    {teacher.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">({teacher.pinyin})</span>
                </div>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">{teacher.role}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                  {teacher.recommendedLevels}
                </span>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                  {teacher.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Vào luyện nói</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR TOPICS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Chủ đề giao tiếp nổi bật</h2>
            <p className="text-sm text-slate-500 mt-1">
              Hơn 14 chủ đề đa dạng từ sinh hoạt hàng ngày đến công sở và du lịch
            </p>
          </div>
          <button
            onClick={onExploreTopics}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Xem tất cả chủ đề <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS.slice(0, 3).map((topic) => (
            <div
              key={topic.id}
              onClick={onExploreTopics}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono">
                    {topic.hskLevel}
                  </span>
                  <span className="text-xs text-slate-400">{topic.estimatedDuration}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-['Noto_Sans_SC']">
                  {topic.chineseTitle}
                </h3>
                <p className="text-xs text-slate-400">{topic.pinyinTitle}</p>
                <p className="text-sm font-semibold text-slate-700 mt-1">{topic.vietnameseTitle}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{topic.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>{topic.vocabularyCount} từ vựng</span>
                <span className="flex items-center gap-1">Luyện ngay →</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
