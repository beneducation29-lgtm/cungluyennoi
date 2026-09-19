import React, { useState } from "react";
import {
  Mic,
  Flame,
  User,
  Sparkles,
  BookOpen,
  History,
  Settings,
  Layers,
  Home,
  Menu,
  X,
  Volume2,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { UserProfile } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { AuthModal } from "./AuthModal";

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  userProfile: UserProfile;
  onToggleDemoMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  userProfile,
  onToggleDemoMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { firebaseUser, user, signOutUser, isFirebaseConfigured } = useAuth();

  const navItems = [
    { id: "home", labelZh: "首页", labelVi: "Trang chủ", icon: Home },
    { id: "speaking", labelZh: "口语室", labelVi: "Luyện nói", icon: Mic },
    { id: "topics", labelZh: "主题", labelVi: "Chủ đề", icon: Layers },
    { id: "vocabulary", labelZh: "生词本", labelVi: "Từ vựng", icon: BookOpen },
    { id: "history", labelZh: "学习记录", labelVi: "Lịch sử", icon: History },
    { id: "settings", labelZh: "设置", labelVi: "Cài đặt", icon: Settings },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const displayName = firebaseUser?.displayName || user?.name || userProfile.name;
  const photoUrl = firebaseUser?.photoURL || user?.photoURL;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => handleNav("home")}
            className="flex items-center gap-3 cursor-pointer select-none group"
            id="brand-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <span className="font-bold text-lg font-['Noto_Sans_SC']">中</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight font-['Noto_Sans_SC']">
                  中文AI口语室
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none">
                Phòng Luyện Nói Tiếng Trung AI
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNav(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.labelVi}</span>
                </button>
              );
            })}
          </nav>

          {/* User & Status Controls */}
          <div className="flex items-center gap-3">
            {/* Demo Mode Badge */}
            <button
              onClick={onToggleDemoMode}
              title="Nhấn để xem trạng thái API hoặc chuyển chế độ"
              id="demo-mode-badge"
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                userProfile.isDemoMode
                  ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                  : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{userProfile.isDemoMode ? "Demo Mode" : "Gemini Live"}</span>
            </button>

            {/* Streak Badge */}
            <div
              id="user-streak-badge"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold shadow-xs"
            >
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{userProfile.streakDays} ngày</span>
            </div>

            {/* User Profile / Auth Section */}
            {firebaseUser ? (
              <div className="relative">
                <div
                  id="user-profile-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group"
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={displayName}
                      className="w-8 h-8 rounded-full border border-indigo-200 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-semibold text-slate-700 group-hover:text-indigo-600 max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </div>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    id="user-dropdown-menu"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{firebaseUser.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav("settings")}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      id="dropdown-settings-link"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Cài đặt & Hồ sơ</span>
                    </button>
                    <button
                      onClick={() => handleNav("history")}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      id="dropdown-history-link"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      <span>Lịch sử luyện nói</span>
                    </button>
                    <button
                      onClick={() => handleNav("vocabulary")}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      id="dropdown-vocab-link"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span>Sổ từ vựng</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await signOutUser();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      id="dropdown-logout-btn"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  id="open-login-btn"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200 shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-indigo-500" />
                  <span>{item.labelVi}</span>
                </div>
                <span className="text-xs text-slate-400 font-['Noto_Sans_SC']">{item.labelZh}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
            <div className="flex items-center gap-2 text-sm text-orange-600 font-bold">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>Chuỗi học: {userProfile.streakDays} ngày</span>
            </div>
            {firebaseUser ? (
              <button
                onClick={() => signOutUser()}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
};

