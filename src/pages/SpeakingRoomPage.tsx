import React, { useState } from "react";
import { ArrowLeft, Sparkles, HelpCircle, Volume2, AlertCircle } from "lucide-react";
import {
  AITeacher,
  ChineseLevel,
  ConversationMode,
  DisplayMode,
  SpeakingSession,
  Topic,
  VocabularyItem,
} from "../types";
import { useSpeakingSession } from "../hooks/useSpeakingSession";
import { ConversationTranscript } from "../components/speaking/ConversationTranscript";
import { MicrophoneButton } from "../components/speaking/MicrophoneButton";
import { TeacherPanel } from "../components/speaking/TeacherPanel";
import { AssistantPanel } from "../components/speaking/AssistantPanel";
import { QuickRepliesBar } from "../components/speaking/QuickRepliesBar";
import { SessionTimer } from "../components/speaking/SessionTimer";
import { TextInputFallback } from "../components/speaking/TextInputFallback";
import { DisplayModeToggle } from "../components/common/DisplayModeToggle";
import { storageService } from "../services/storageService";
import { firestoreService } from "../services/firestoreService";
import { useAuth } from "../contexts/AuthContext";

interface SpeakingRoomPageProps {
  topic: Topic;
  teacher: AITeacher;
  level: ChineseLevel;
  mode: ConversationMode;
  initialSpeed?: number;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
  onBack: () => void;
  onCompleteSession: (session: SpeakingSession) => void;
}

export const SpeakingRoomPage: React.FC<SpeakingRoomPageProps> = ({
  topic,
  teacher,
  level,
  mode,
  initialSpeed = 1.0,
  isDemoMode = false,
  onToggleDemoMode,
  onBack,
  onCompleteSession,
}) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("full");
  const { firebaseUser } = useAuth();

  const {
    messages,
    corrections,
    sessionVocabulary,
    setSessionVocabulary,
    micState,
    waveformLevels,
    liveTranscript,
    sessionSeconds,
    isPaused,
    setIsPaused,
    wordsSpoken,
    turnCount,
    pronunciationScore,
    errorMessage,
    latestSuggestions,
    latestFollowUp,
    difficultyFeedback,
    handleTriggerRecovery,
    speechSpeed,
    setSpeechSpeed,
    isMicSupported,
    toggleMicrophone,
    handleUserSend,
    stopAiSpeech,
    finalizeSession,
    speakMessage,
  } = useSpeakingSession({
    topic,
    teacher,
    level,
    mode,
    initialSpeed,
    isDemoMode,
  });

  const handleEndSession = () => {
    const session = finalizeSession();
    onCompleteSession(session);
  };

  const handleSaveVocab = async (item: VocabularyItem) => {
    const isCurrentlySaved = item.saved;
    if (isCurrentlySaved) {
      storageService.removeVocabularyItem(item.word);
      if (firebaseUser) {
        await firestoreService.deleteVocabulary(item.word, firebaseUser.uid);
      }
    } else {
      storageService.saveVocabularyItem({ ...item, saved: true });
      if (firebaseUser) {
        await firestoreService.saveVocabulary({ ...item, saved: true }, firebaseUser.uid);
      }
    }
    setSessionVocabulary((prev) =>
      prev.map((v) => (v.word === item.word ? { ...v, saved: !v.saved } : v))
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 gap-3">
      {/* TOP BAR */}
      <header
        id="speaking-room-topbar"
        className="bg-white rounded-2xl border border-slate-200 px-3 sm:px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0"
      >
        {/* Left: Back & Topic details */}
        <div className="flex items-center gap-3">
          <button
            id="speaking-room-back-btn"
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Quay lại danh sách chủ đề"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 font-['Noto_Sans_SC']">
                {topic.chineseTitle}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold">
                {level}
              </span>
              <span className="hidden md:inline text-xs text-slate-400 font-medium">
                ({mode === "roleplay" ? "Đóng vai" : mode === "hsk" ? "Luyện HSK" : "Tự do"})
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">{topic.vietnameseTitle}</p>
          </div>
        </div>

        {/* Center: Timer & Controls */}
        <div className="flex items-center gap-3">
          <SessionTimer
            seconds={sessionSeconds}
            turns={turnCount}
            wordsSpoken={wordsSpoken}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            onEndSession={handleEndSession}
          />
        </div>

        {/* Right: AI Mode Badge & Display Mode Toggle */}
        <div className="hidden sm:flex items-center gap-2.5">
          {onToggleDemoMode ? (
            <button
              onClick={onToggleDemoMode}
              title={isDemoMode ? "Bấm để chuyển sang Live AI Mode" : "Bấm để chuyển sang Demo Mode"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                !isDemoMode
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  !isDemoMode ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <Sparkles className="w-3.5 h-3.5" />
              <span>{!isDemoMode ? "AI Mode (Gemini)" : "Demo Mode"}</span>
            </button>
          ) : (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                !isDemoMode
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  !isDemoMode ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span>{!isDemoMode ? "Gemini 3.8 Flash" : "Demo Mode"}</span>
            </div>
          )}

          <div className="hidden lg:block">
            <DisplayModeToggle currentMode={displayMode} onChangeMode={setDisplayMode} />
          </div>
        </div>
      </header>

      {/* Sub-bar for mobile display mode toggle if on small screens */}
      <div className="lg:hidden flex items-center justify-between px-1">
        <DisplayModeToggle currentMode={displayMode} onChangeMode={setDisplayMode} />
        <div className="flex items-center gap-2">
          {onToggleDemoMode && (
            <button
              onClick={onToggleDemoMode}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                !isDemoMode ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {!isDemoMode ? "AI Live" : "Demo"}
            </button>
          )}
          <span className="text-xs text-slate-400">
            Giáo viên: <strong className="text-slate-700 font-['Noto_Sans_SC']">{teacher.name}</strong>
          </span>
        </div>
      </div>

      {/* MAIN 3-COLUMN LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 overflow-hidden min-h-0">
        {/* LEFT COLUMN: Teacher Profile, Speed, Starter phrases */}
        <aside className="hidden lg:block lg:col-span-3 h-full overflow-y-auto">
          <TeacherPanel
            teacher={teacher}
            topic={topic}
            micState={micState}
            speechSpeed={speechSpeed}
            onChangeSpeed={setSpeechSpeed}
            onUseStarterPhrase={(text) => handleUserSend(text)}
          />
        </aside>

        {/* CENTER COLUMN: Conversation Transcript + Microphone + Text Fallback */}
        <main className="lg:col-span-6 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs h-full overflow-hidden">
          {/* Transcript Area */}
          <ConversationTranscript
            messages={messages}
            displayMode={displayMode}
            onPlayAudio={(text) => speakMessage(text)}
            teacherName={teacher.name}
            isAiSpeaking={micState === "AI_SPEAKING"}
          />

          {/* Teacher Follow-up Prompt, Context-Aware Quick Replies & Conversation Recovery */}
          <QuickRepliesBar
            followUpQuestion={latestFollowUp}
            suggestions={latestSuggestions}
            onSelectSuggestion={(text) => handleUserSend(text)}
            onPlayAudio={(text) => speakMessage(text)}
            onTriggerRecovery={handleTriggerRecovery}
            difficultyFeedback={difficultyFeedback}
            disabled={isPaused || micState === "PROCESSING"}
          />

          {/* Bottom Action Area: Error Alert, Mic, Live Speech Transcript, Text Fallback */}
          <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 space-y-2.5 shrink-0">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="flex-1">{errorMessage}</span>
                </div>
                <button
                  onClick={toggleMicrophone}
                  className="px-2 py-0.5 rounded bg-rose-200/60 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Live speech recognition preview if user is speaking */}
            {micState === "LISTENING" && liveTranscript && (
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span className="text-slate-500 font-medium shrink-0">Đang nghe:</span>
                <span className="font-['Noto_Sans_SC'] font-bold text-indigo-900 text-sm tracking-wide">
                  {liveTranscript}
                </span>
              </div>
            )}

            {/* Central Microphone Button with Waveform */}
            <div className="flex justify-center">
              <MicrophoneButton
                micState={micState}
                waveformLevels={waveformLevels}
                onToggleMic={toggleMicrophone}
                onStopAiSpeech={stopAiSpeech}
                disabled={isPaused}
              />
            </div>

            {/* Text Input Fallback (for noisy spaces or manual typing) */}
            <TextInputFallback
              onSendText={(text) => handleUserSend(text)}
              disabled={isPaused || micState === "PROCESSING"}
            />
          </div>
        </main>

        {/* RIGHT COLUMN: Assistant Panel (Vocabulary, Corrections, Pronunciation Demo) */}
        <aside className="hidden lg:block lg:col-span-3 h-full overflow-y-auto">
          <AssistantPanel
            vocabulary={sessionVocabulary}
            corrections={corrections}
            pronunciation={pronunciationScore}
            onPlayAudio={(text) => speakMessage(text)}
            onSaveVocab={handleSaveVocab}
            onUsePhrase={(text) => handleUserSend(text)}
          />
        </aside>
      </div>
    </div>
  );
};
