/**
 * @license
 * Apache-2.0
 * 中文AI口语室 - Phòng Luyện Nói Tiếng Trung AI
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/common/Navbar";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { TopicsPage } from "./pages/TopicsPage";
import { SpeakingRoomPage } from "./pages/SpeakingRoomPage";
import { SessionResultPage } from "./pages/SessionResultPage";
import { VocabularyPage } from "./pages/VocabularyPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AITeacher, ChineseLevel, ConversationMode, SpeakingSession, Topic, UserProfile } from "./types";
import { storageService } from "./services/storageService";
import { TOPICS } from "./data/topics";
import { TEACHERS } from "./data/teachers";
import { geminiService } from "./services/geminiService";
import { firestoreService } from "./services/firestoreService";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const { firebaseUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    storageService.getUserProfile()
  );

  // Active speaking room parameters
  const [activeTopic, setActiveTopic] = useState<Topic>(TOPICS[0]);
  const [activeTeacher, setActiveTeacher] = useState<AITeacher>(TEACHERS[0]);
  const [activeLevel, setActiveLevel] = useState<ChineseLevel>("HSK 2");
  const [activeMode, setActiveMode] = useState<ConversationMode>("roleplay");
  const [lastCompletedSession, setLastCompletedSession] = useState<SpeakingSession | null>(null);

  // Check if Gemini API key exists on server on startup
  useEffect(() => {
    geminiService.checkApiStatus().then((status) => {
      if (!status.hasKey) {
        // Automatically default to demo mode if no key configured
        setUserProfile((prev) => ({ ...prev, isDemoMode: true }));
      } else {
        // When Gemini key is active, ensure user is in AI Mode by default unless they manually toggle
        const stored = storageService.getUserProfile();
        if (stored.isDemoMode === undefined || stored.isDemoMode === false) {
          setUserProfile((prev) => ({ ...prev, isDemoMode: false }));
        }
      }
    });
  }, []);

  const handleStartSpeaking = (
    topic: Topic = TOPICS[0],
    teacher: AITeacher = TEACHERS[0],
    level: ChineseLevel = "HSK 2",
    mode: ConversationMode = "roleplay"
  ) => {
    setActiveTopic(topic);
    setActiveTeacher(teacher);
    setActiveLevel(level);
    setActiveMode(mode);
    setCurrentTab("speaking");
  };

  const handleCompleteSession = async (session: SpeakingSession) => {
    setLastCompletedSession(session);
    setCurrentTab("result");

    // Persist to Firestore if user is authenticated
    if (firebaseUser) {
      try {
        await firestoreService.saveSession(session, firebaseUser.uid);
        const mins = Math.max(1, Math.round(session.durationSeconds / 60));
        await firestoreService.updateUserProgress(firebaseUser.uid, {
          totalMinutes: mins,
          sessionsCompleted: 1,
          fluencyScore: session.score?.fluency || 85,
        });
      } catch (err) {
        console.warn("Could not save session to Firestore:", err);
      }
    }
  };

  const handleRestartPractice = () => {
    setCurrentTab("speaking");
  };

  const handleToggleDemoMode = () => {
    const updated = storageService.saveUserProfile({
      isDemoMode: !userProfile.isDemoMode,
    });
    setUserProfile(updated);
  };

  const handleUpdateProfile = (partial: Partial<UserProfile>) => {
    const updated = storageService.saveUserProfile(partial);
    setUserProfile(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        userProfile={userProfile}
        onToggleDemoMode={handleToggleDemoMode}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === "home" && (
          <HomePage
            onStartPractice={() => handleStartSpeaking(activeTopic, activeTeacher, activeLevel, activeMode)}
            onExploreTopics={() => setCurrentTab("topics")}
            onSelectTeacher={(teacherId) => {
              const teacher = TEACHERS.find((t) => t.id === teacherId) || TEACHERS[0];
              handleStartSpeaking(activeTopic, teacher, activeLevel, activeMode);
            }}
          />
        )}

        {currentTab === "dashboard" && (
          <DashboardPage
            userProfile={userProfile}
            onStartSession={(topic) => handleStartSpeaking(topic, activeTeacher, activeLevel, activeMode)}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === "topics" && (
          <TopicsPage
            onStartSession={(topic, teacher, level, mode) =>
              handleStartSpeaking(topic, teacher, level, mode)
            }
            defaultTeacherId={userProfile.preferredTeacher}
            defaultLevel={userProfile.currentLevel}
          />
        )}

        {currentTab === "speaking" && (
          <SpeakingRoomPage
            topic={activeTopic}
            teacher={activeTeacher}
            level={activeLevel}
            mode={activeMode}
            initialSpeed={userProfile.speechSpeed}
            isDemoMode={userProfile.isDemoMode}
            onToggleDemoMode={handleToggleDemoMode}
            onBack={() => setCurrentTab("topics")}
            onCompleteSession={handleCompleteSession}
          />
        )}

        {currentTab === "result" && lastCompletedSession && (
          <SessionResultPage
            session={lastCompletedSession}
            onRestartPractice={handleRestartPractice}
            onGoHome={() => setCurrentTab("home")}
          />
        )}

        {currentTab === "vocabulary" && <VocabularyPage />}

        {currentTab === "history" && (
          <HistoryPage
            onReplayTopic={(topicId) => {
              const found = TOPICS.find((t) => t.id === topicId) || TOPICS[0];
              handleStartSpeaking(found, activeTeacher, activeLevel, activeMode);
            }}
          />
        )}

        {currentTab === "settings" && (
          <SettingsPage
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onToggleDemoMode={handleToggleDemoMode}
          />
        )}
      </main>

      {/* Global Footer (shown on non-speaking room pages) */}
      {currentTab !== "speaking" && (
        <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 font-['Noto_Sans_SC']">中文AI口语室</span>
              <span>• Phòng Luyện Nói Tiếng Trung AI</span>
            </div>
            <p className="text-slate-400">
              Thiết kế tối ưu hóa khẩu ngữ tiếng Trung cho người học Việt Nam • HSK 1 - HSK 6
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
