export type ChineseLevel =
  | "Beginner"
  | "HSK 1"
  | "HSK 2"
  | "HSK 3"
  | "HSK 4"
  | "HSK 5"
  | "HSK 6"
  | "Advanced";

export type ConversationMode = "free" | "roleplay" | "hsk";

export type DisplayMode = "chinese-only" | "chinese-pinyin" | "full";

export type VoiceConversationState = "IDLE" | "LISTENING" | "PROCESSING" | "AI_SPEAKING" | "ERROR";

export type MicState =
  | "idle"
  | "listening"
  | "processing"
  | "ai-speaking"
  | "error"
  | VoiceConversationState;

export interface SuggestedReply {
  zh: string;
  py: string;
  vi: string;
  type?: "simple" | "detailed" | "question";
}

export interface FollowUpQuestion {
  zh: string;
  py: string;
  vi: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  chinese: string;
  pinyin?: string;
  translation?: string;
  timestamp: number;
  audioDuration?: number;
  correction?: SentenceCorrection;
  followUpQuestion?: FollowUpQuestion;
  suggestions?: SuggestedReply[];
  difficultyFeedback?: string;
}

export interface SentenceCorrection {
  id: string;
  original: string;
  corrected: string;
  pinyin: string;
  explanation: string;
  timestamp: number;
  errorType?: "grammar" | "word-order" | "measure-word" | "vocabulary" | "nuance" | string;
  hskTip?: string;
}

export interface VocabularyItem {
  id?: string;
  word: string;
  pinyin: string;
  meaning: string;
  meaningVi?: string;
  saved: boolean;
  hskLevel?: string;
  topic?: string;
  learnedAt?: number;
  exampleSentence?: string;
  exampleZh?: string;
  examplePy?: string;
  exampleVi?: string;
}

export interface SessionScore {
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  overall?: number;
  tone?: number;
  completeness?: number;
}

export interface SpeakingSession {
  id: string;
  topic: string;
  topicTitleZh: string;
  level: ChineseLevel;
  mode: ConversationMode;
  teacher: string;
  teacherNameZh: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  messages: Message[];
  corrections: SentenceCorrection[];
  vocabulary: VocabularyItem[];
  score: SessionScore;
  keyPoints: string[];
}

export interface AITeacher {
  id: string;
  name: string;
  pinyin: string;
  role: string;
  avatar: string;
  description: string;
  teachingStyle: string;
  recommendedLevels: string;
  greetingZh: string;
  greetingPinyin: string;
  greetingVi: string;
  voiceGender: "female" | "male";
  accentColor: string;
}

export interface Topic {
  id: string;
  chineseTitle: string;
  pinyinTitle: string;
  vietnameseTitle: string;
  category: string;
  difficulty: "Dễ" | "Trung bình" | "Thử thách";
  hskLevel: ChineseLevel;
  estimatedDuration: string;
  vocabularyCount: number;
  icon: string;
  description: string;
  initialPrompt: string;
  starterPhrases: { zh: string; py: string; vi: string }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  hskLevel?: string;
  streakDays: number;
  totalSessions: number;
  totalMinutes: number;
  totalWordsLearned: number;
  totalWords?: number;
  currentLevel: ChineseLevel;
  preferredTeacher: string;
  preferredDisplayMode: DisplayMode;
  speechSpeed: number; // 0.75, 1, 1.25, 1.5
  isDemoMode: boolean;
  createdAt?: number;
}

export interface LearningProgress {
  userId: string;
  totalSessions: number;
  totalDurationSeconds: number;
  totalWordsLearned: number;
  targetHskLevel: string;
  averagePronunciation: number;
  lastPracticedAt: number;
}

export type FlashcardStatus = "new" | "learning" | "review" | "mastered";

export interface Flashcard {
  id: string;
  userId: string;
  word: string;
  normalizedWord: string;
  pinyin: string;
  meaning: string;
  exampleSentence: string;
  examplePinyin?: string;
  exampleTranslation?: string;
  hskLevel?: string;
  partOfSpeech?: string;
  topic?: string;
  difficulty?: string;
  sourceSessionId?: string;
  createdAt: number;
  updatedAt: number;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: number;
  status: FlashcardStatus;
  reason?: string;
}

export type ReviewResult = "again" | "hard" | "good" | "easy";

export interface FlashcardReview {
  id?: string;
  result: ReviewResult;
  reviewedAt: number;
  previousInterval: number;
  newInterval: number;
}

export interface FlashcardCandidate {
  word: string;
  pinyin: string;
  meaning: string;
  exampleSentence?: string;
  examplePinyin?: string;
  exampleTranslation?: string;
  hskLevel?: string;
  partOfSpeech?: string;
  reason?: string;
  priority?: "high" | "medium" | "low";
}

export interface FlashcardSettings {
  dailyGoal: number; // 5, 10, 20, 30
  autoAddFlashcards: boolean;
  autoPlayAudio: boolean;
  showMeaningFirst: boolean;
  dailyReminder: boolean;
  ignoredWords: string[];
}

export type NotificationType = "VOCABULARY_ADDED" | "REVIEW_DUE" | "SESSION_COMPLETE" | "MILESTONE";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  data?: any;
  cardCount?: number;
}

