import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Volume2,
  Sparkles,
  Database,
  ShieldCheck,
  CheckCircle2,
  Save,
  Layers,
  LogIn,
  LogOut,
  TrendingUp,
  Award,
  Cloud,
} from "lucide-react";
import { ChineseLevel, DisplayMode, UserProfile } from "../types";
import { TEACHERS } from "../data/teachers";
import { storageService } from "../services/storageService";
import { firestoreService } from "../services/firestoreService";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "../components/common/AuthModal";

interface SettingsPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onToggleDemoMode: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userProfile,
  onUpdateProfile,
  onToggleDemoMode,
}) => {
  const {
    firebaseUser,
    user,
    updateUserProfile,
    signOutUser,
    isFirebaseConfigured,
  } = useAuth();

  const [name, setName] = useState(user?.name || userProfile.name);
  const [currentLevel, setCurrentLevel] = useState<ChineseLevel>(
    user?.currentLevel || userProfile.currentLevel
  );
  const [preferredTeacher, setPreferredTeacher] = useState(userProfile.preferredTeacher);
  const [preferredDisplayMode, setPreferredDisplayMode] = useState<DisplayMode>(
    userProfile.preferredDisplayMode
  );
  const [speechSpeed, setSpeechSpeed] = useState(userProfile.speechSpeed);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.currentLevel) setCurrentLevel(user.currentLevel);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      currentLevel,
      preferredTeacher,
      preferredDisplayMode,
      speechSpeed,
    });

    if (firebaseUser) {
      await updateUserProfile({
        name,
        currentLevel,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Noto_Sans_SC']">
            设置
          </h1>
          <span className="text-base font-bold text-indigo-600">Cài Đặt Hệ Thống</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Tùy chỉnh giáo viên, chế độ hiển thị phiên âm, tài khoản Firebase và đồng bộ tiến độ
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: USER PROFILE & AUTH */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <span>Tài khoản & Hồ sơ người học</span>
            </h2>

            {firebaseUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Đã đăng nhập: <strong className="text-slate-800">{firebaseUser.email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => signOutUser()}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập (Google / Email)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Trình độ tiếng Trung hiện tại
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value as ChineseLevel)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              >
                {["Beginner", "HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6", "Advanced"].map(
                  (lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-indigo-600" />
              <span>
                {firebaseUser
                  ? "Dữ liệu học tập được đồng bộ an toàn theo tài khoản Firestore"
                  : isFirebaseConfigured
                  ? "Đang dùng chế độ Demo. Đăng nhập để lưu trữ dài hạn."
                  : "Chế độ Demo ngoại tuyến (Firebase chưa được khởi tạo)."}
              </span>
            </div>
            <span className="font-semibold text-indigo-700">
              {firebaseUser ? "Cloud Synced" : "Demo Mode"}
            </span>
          </div>
        </div>

        {/* SECTION 2: LEARNING PREFERENCES */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Tùy chỉnh phòng luyện nói</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Giáo viên mặc định
              </label>
              <select
                value={preferredTeacher}
                onChange={(e) => setPreferredTeacher(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              >
                {TEACHERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.pinyin}) - {t.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Chế độ hiển thị chữ mặc định
              </label>
              <select
                value={preferredDisplayMode}
                onChange={(e) => setPreferredDisplayMode(e.target.value as DisplayMode)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
              >
                <option value="full">Hán tự + Pinyin + Dịch tiếng Việt (Đầy đủ)</option>
                <option value="chinese-pinyin">Hán tự + Pinyin (Nâng cao)</option>
                <option value="chinese-only">Chỉ Hán tự (Thử thách phản xạ)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tốc độ phát âm của giáo viên AI
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeechSpeed(spd)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      speechSpeed === spd
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: GEMINI & AI ENGINE STATUS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Động cơ AI & Chế độ Demo</span>
            </h2>

            <button
              type="button"
              onClick={onToggleDemoMode}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
                userProfile.isDemoMode
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-emerald-50 text-emerald-800 border-emerald-300"
              }`}
            >
              {userProfile.isDemoMode ? "Chuyển sang Live Gemini" : "Chuyển sang Demo Mode"}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Trạng thái hiện tại:</span>
              <span
                className={`font-bold ${
                  userProfile.isDemoMode ? "text-amber-700" : "text-emerald-700"
                }`}
              >
                {userProfile.isDemoMode
                  ? "Chế độ Demo (Kịch bản thông minh định sẵn)"
                  : "Chế độ Gemini Live (Kết nối API thời gian thực)"}
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Ứng dụng hoạt động 100% trơn tru không cần API key thông qua bộ dữ liệu kịch bản Demo phong phú. Khi thêm <code>GEMINI_API_KEY</code> trên server, hệ thống sẽ tự động chuyển sang mô hình Gemini 3.8 Flash.
            </p>
          </div>
        </div>

        {/* SECTION 4: FIRESTORE ARCHITECTURE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <span>Kiến trúc Firebase Firestore</span>
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Cấu hình Firebase:</span>
              <span className="font-semibold text-slate-800 font-mono">
                {isFirebaseConfigured ? "Đã kết nối Firestore" : "Chưa cấu hình (Demo Mode)"}
              </span>
            </div>

            <div>
              <span className="text-slate-600 block mb-1 font-medium">
                Cấu trúc Firestore chuẩn:
              </span>
              <ul className="list-disc list-inside font-mono text-[11px] text-slate-700 space-y-0.5 bg-white p-3 rounded-lg border border-slate-200">
                <li>users/{`{userId}`}</li>
                <li>sessions/{`{sessionId}`}</li>
                <li>sessions/{`{sessionId}`}/messages/{`{messageId}`}</li>
                <li>vocabulary/{`{vocabularyId}`}</li>
                <li>progress/{`{userId}`}</li>
              </ul>
            </div>
            <p className="text-slate-500 text-[11px]">
              Tất cả quyền hạn được bảo vệ nghiêm ngặt bằng Firestore Security Rules đã triển khai.
            </p>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Đã lưu cài đặt thành công!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </form>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

