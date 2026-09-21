import { useState, useEffect, useRef, useCallback } from "react";
import {
  AITeacher,
  ChineseLevel,
  ConversationMode,
  Flashcard,
  FollowUpQuestion,
  Message,
  VoiceConversationState,
  SentenceCorrection,
  SpeakingSession,
  SuggestedReply,
  Topic,
  VocabularyItem,
} from "../types";
import { geminiService } from "../services/geminiService";
import { pronunciationService, PronunciationEvaluation } from "../services/pronunciationService";
import { storageService } from "../services/storageService";
import { vocabularyService } from "../services/vocabularyService";
import { useTextToSpeech } from "./useTextToSpeech";
import { useSpeechRecognition } from "./useSpeechRecognition";

export interface FlashcardNotificationState {
  id: string;
  cards: Flashcard[];
  message: string;
  words: string[];
  timestamp: number;
}

interface UseSpeakingSessionProps {
  topic: Topic;
  teacher: AITeacher;
  level: ChineseLevel;
  mode: ConversationMode;
  initialSpeed?: number;
  isDemoMode?: boolean;
}

export function useSpeakingSession({
  topic,
  teacher,
  level,
  mode,
  initialSpeed = 1.0,
  isDemoMode = true,
}: UseSpeakingSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [corrections, setCorrections] = useState<SentenceCorrection[]>([]);
  const [sessionVocabulary, setSessionVocabulary] = useState<VocabularyItem[]>([]);
  const [micState, setMicState] = useState<VoiceConversationState>("IDLE");
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [wordsSpoken, setWordsSpoken] = useState(0);
  const [pronunciationScore, setPronunciationScore] = useState<PronunciationEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [latestSuggestions, setLatestSuggestions] = useState<SuggestedReply[]>([]);
  const [latestFollowUp, setLatestFollowUp] = useState<FollowUpQuestion | null>(null);
  const [difficultyFeedback, setDifficultyFeedback] = useState<string | null>(null);
  const [latestFlashcardNotification, setLatestFlashcardNotification] = useState<FlashcardNotificationState | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  const { speak, stop: stopTts, isSpeaking, speechSpeed, setSpeechSpeed } = useTextToSpeech(initialSpeed);
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    errorMessage: speechError,
    isSupported: isMicSupported,
    waveformLevels,
  } = useSpeechRecognition();

  // Keep micState synchronized with speech recognition errors
  useEffect(() => {
    if (speechError) {
      setErrorMessage(speechError);
      setMicState("ERROR");
    }
  }, [speechError]);

  // Session timer ticker
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  // Initial welcome message from AI teacher & setup initial suggestion prompts
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Reset turn counter for consistent progression
    geminiService.resetTurnCounter();

    const welcomeZh = topic.initialPrompt || teacher.greetingZh;
    const welcomePy = topic.starterPhrases[0] ? topic.starterPhrases[0].py : teacher.greetingPinyin;
    const welcomeVi = teacher.greetingVi;

    // Setup initial smart reply suggestions from topic starter phrases
    if (topic.starterPhrases && topic.starterPhrases.length > 0) {
      setLatestSuggestions(
        topic.starterPhrases.map((p, idx) => ({
          zh: p.zh,
          py: p.py,
          vi: p.vi,
          type: idx === 0 ? "simple" : idx === 1 ? "detailed" : "question",
        }))
      );
    }

    const initialMsg: Message = {
      id: "initial-msg",
      role: "assistant",
      chinese: welcomeZh,
      pinyin: welcomePy,
      translation: welcomeVi,
      timestamp: Date.now(),
      suggestions: topic.starterPhrases.map((p) => ({
        zh: p.zh,
        py: p.py,
        vi: p.vi,
      })),
    };

    setMessages([initialMsg]);

    // Teacher speaks greeting automatically: IDLE -> AI_SPEAKING -> IDLE
    setMicState("AI_SPEAKING");
    const timeout = setTimeout(() => {
      speak(welcomeZh, {
        voiceGender: teacher.voiceGender,
        speed: speechSpeed,
        onEnd: () => {
          setMicState("IDLE");
        },
        onError: () => {
          setMicState("IDLE");
        },
      });
    }, 600);

    return () => clearTimeout(timeout);
  }, [topic, teacher, speak, speechSpeed]);

  // Allow stopping AI speech at any time
  const stopAiSpeech = useCallback(() => {
    stopTts();
    setMicState("IDLE");
  }, [stopTts]);

  // Handle user speech or text submission:
  // Microphone -> zh-CN Speech Recognition -> transcript -> Gemini -> Chinese response -> zh-CN Text-to-Speech
  const handleUserSend = useCallback(
    async (spokenChinese: string) => {
      const cleanText = spokenChinese.trim();
      if (!cleanText) return;

      // Stop any ongoing speech or recognition
      stopTts();
      stopListening();
      setMicState("PROCESSING");
      setErrorMessage(null);

      // Add student message to transcript
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        chinese: cleanText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setWordsSpoken((prev) => prev + cleanText.length);

      // Evaluate pronunciation metrics
      const evaluation = pronunciationService.evaluateSpokenText(cleanText);
      setPronunciationScore(evaluation);

      try {
        // Send to Gemini (with automatic Demo fallback if offline)
        const response = await geminiService.generateTeacherReply({
          studentMessage: cleanText,
          messages,
          teacher,
          topic,
          level,
          mode,
          forceDemo: isDemoMode,
        });

        if (response.statusNotice) {
          setErrorMessage(response.statusNotice);
          setTimeout(() => setErrorMessage(null), 4000);
        }

        // Add pedagogical corrections if detected (without interrupting dialogue audio)
        if (response.correction) {
          setCorrections((prev) => [response.correction!, ...prev]);
          // Also link correction to userMsg in messages state for visual indicator
          setMessages((prev) =>
            prev.map((m) => (m.id === userMsg.id ? { ...m, correction: response.correction } : m))
          );
        }

        // Update suggestions for next turn
        setLatestFollowUp(null);
        if (response.suggestions && response.suggestions.length > 0) {
          setLatestSuggestions(response.suggestions);
        }
        if (response.difficultyFeedback) {
          setDifficultyFeedback(response.difficultyFeedback);
        }

        // Add extracted vocabulary with HSK levels to session list
        if (response.vocabulary && response.vocabulary.length > 0) {
          setSessionVocabulary((prev) => {
            const existingWords = new Set(prev.map((v) => v.word));
            const newItems = response.vocabulary.filter((v) => !existingWords.has(v.word));
            return [...newItems, ...prev];
          });

          // Automatically generate and persist flashcards in background
          const profile = storageService.getUserProfile();
          vocabularyService
            .processTurnVocabulary({
              aiVocabulary: response.vocabulary,
              userId: profile.id,
              sessionId: `sess-${Date.now()}`,
              topic: topic.chineseTitle,
              level,
            })
            .then(({ addedCards }) => {
              if (addedCards.length > 0) {
                setLatestFlashcardNotification({
                  id: `fc-notif-${Date.now()}`,
                  cards: addedCards,
                  message: `Đã tự động tạo ${addedCards.length} flashcard: ${addedCards.map((c) => c.word).join(", ")}`,
                  words: addedCards.map((c) => c.word),
                  timestamp: Date.now(),
                });
              }
            })
            .catch((err) => {
              console.warn("Background flashcard creation error:", err);
            });
        }

        // Append teacher Chinese reply to transcript (strictly 1 turn, at most 1 question inside reply)
        const assistantMsg: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          chinese: response.reply,
          pinyin: response.pinyin,
          translation: response.translation,
          timestamp: Date.now(),
          suggestions: response.suggestions,
          difficultyFeedback: response.difficultyFeedback,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // Speak AI reply in Mandarin Chinese (zh-CN)
        setMicState("AI_SPEAKING");
        speak(response.reply, {
          voiceGender: teacher.voiceGender,
          speed: speechSpeed,
          onEnd: () => {
            setMicState("IDLE");
          },
          onError: () => {
            setMicState("IDLE");
          },
        });
      } catch (err) {
        console.error("Error generating teacher reply:", err);
        setErrorMessage("Không thể kết nối với AI. Vui lòng kiểm tra lại kết nối hoặc thử nói lại.");
        setMicState("ERROR");
      }
    },
    [stopTts, stopListening, messages, teacher, topic, level, mode, isDemoMode, speak, speechSpeed]
  );

  // Trigger conversation recovery if student is stuck or needs prompt assistance
  const handleTriggerRecovery = useCallback(() => {
    handleUserSend("老师，我不知道该怎么说，请提示我一下。(Thưa giáo viên, em chưa biết nói thế nào, xin gợi ý giúp em.)");
  }, [handleUserSend]);

  // Trigger microphone toggle:
  // - If AI is speaking: prevents user speaking and interrupts AI speech
  // - If listening: stops listening and processes final speech
  // - If idle or error: initiates speech recognition in zh-CN
  const toggleMicrophone = useCallback(() => {
    if (micState === "AI_SPEAKING") {
      // Prevent user speaking while AI is speaking; stopping AI returns to IDLE
      stopAiSpeech();
      return;
    }

    if (micState === "LISTENING") {
      stopListening();
      const current = transcript || interimTranscript;
      if (current && current.trim()) {
        handleUserSend(current.trim());
      } else {
        setMicState("IDLE");
      }
      return;
    }

    // Start speech recognition in zh-CN
    setErrorMessage(null);
    setMicState("LISTENING");
    startListening((finalTranscript) => {
      if (finalTranscript && finalTranscript.trim()) {
        handleUserSend(finalTranscript.trim());
      } else {
        setMicState("IDLE");
      }
    });
  }, [micState, stopAiSpeech, stopListening, transcript, interimTranscript, startListening, handleUserSend]);

  // Finish session and compile full report
  const finalizeSession = useCallback((): SpeakingSession => {
    stopTts();
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);

    const aggregateScores = pronunciationService.aggregateSessionScores(
      pronunciationScore ? [pronunciationScore] : []
    );

    const sessionRecord: SpeakingSession = {
      id: `sess-${Date.now()}`,
      topic: topic.id,
      topicTitleZh: topic.chineseTitle,
      level,
      mode,
      teacher: teacher.id,
      teacherNameZh: teacher.name,
      startTime: Date.now() - sessionSeconds * 1000,
      endTime: Date.now(),
      durationSeconds: Math.max(1, sessionSeconds),
      messages,
      corrections,
      vocabulary: sessionVocabulary,
      score: aggregateScores,
      keyPoints: [
        `Giao tiếp theo chủ đề: ${topic.chineseTitle} (${topic.vietnameseTitle})`,
        corrections[0] ? `Ngữ pháp cần lưu ý: ${corrections[0].corrected}` : `Lượng từ & trợ từ ngữ khí trong giao tiếp`,
        `Thực hành phản xạ cùng ${teacher.name} ở cấp độ ${level}`,
      ],
    };

    storageService.saveSession(sessionRecord);
    return sessionRecord;
  }, [
    stopTts,
    stopListening,
    pronunciationScore,
    topic,
    level,
    mode,
    teacher,
    sessionSeconds,
    messages,
    corrections,
    sessionVocabulary,
  ]);

  const undoAddFlashcards = useCallback(async (cards: Flashcard[]) => {
    const profile = storageService.getUserProfile();
    for (const c of cards) {
      await vocabularyService.deleteFlashcard(c.id, profile.id);
    }
    setLatestFlashcardNotification(null);
  }, []);

  const dismissFlashcardNotification = useCallback(() => {
    setLatestFlashcardNotification(null);
  }, []);

  return {
    messages,
    corrections,
    sessionVocabulary,
    setSessionVocabulary,
    micState,
    waveformLevels,
    liveTranscript: interimTranscript || transcript,
    sessionSeconds,
    isPaused,
    setIsPaused,
    wordsSpoken,
    turnCount: Math.floor(messages.filter((m) => m.role === "user").length),
    pronunciationScore,
    errorMessage,
    latestSuggestions,
    latestFollowUp,
    difficultyFeedback,
    latestFlashcardNotification,
    undoAddFlashcards,
    dismissFlashcardNotification,
    handleTriggerRecovery,
    speechSpeed,
    setSpeechSpeed,
    isMicSupported,
    toggleMicrophone,
    handleUserSend,
    stopAiSpeech,
    finalizeSession,
    speakMessage: (text: string) =>
      speak(text, { voiceGender: teacher.voiceGender, speed: speechSpeed }),
  };
}
