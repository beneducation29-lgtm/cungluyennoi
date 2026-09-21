import { Flashcard, FlashcardReview, FlashcardSettings, SpeakingSession, UserProfile, VocabularyItem } from "../types";

const STORAGE_KEYS = {
  USER_PROFILE: "chinese_ai_user_profile",
  SESSIONS: "chinese_ai_sessions",
  VOCABULARY: "chinese_ai_saved_vocabulary",
  SETTINGS: "chinese_ai_settings",
  FLASHCARDS: "chinese_ai_flashcards",
  FLASHCARD_REVIEWS: "chinese_ai_flashcard_reviews",
  FLASHCARD_SETTINGS: "chinese_ai_flashcard_settings",
  IGNORED_VOCABULARY: "chinese_ai_ignored_vocabulary",
};

const DEFAULT_FLASHCARD_SETTINGS = {
  dailyGoal: 10,
  autoAddFlashcards: true,
  autoPlayAudio: true,
  showMeaningFirst: false,
  dailyReminder: true,
  ignoredWords: [],
};

const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-init-1",
    userId: "user-minh",
    word: "朋友",
    normalizedWord: "朋友",
    pinyin: "péngyou",
    meaning: "bạn bè",
    exampleSentence: "我喜欢和朋友一起看电影。",
    examplePinyin: "Wǒ xǐhuan hé péngyou yìqǐ kàn diànyǐng.",
    exampleTranslation: "Tôi thích cùng bạn bè đi xem phim.",
    hskLevel: "HSK 1",
    partOfSpeech: "Danh từ",
    topic: "Cuộc sống hàng ngày",
    difficulty: "Dễ",
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    reviewCount: 1,
    correctCount: 1,
    incorrectCount: 0,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 1,
    nextReviewAt: Date.now() - 3600000, // Due for review today!
    status: "learning",
    reason: "Từ vựng cơ bản thông dụng khi chia sẻ về hoạt động xã hội",
  },
  {
    id: "fc-init-2",
    userId: "user-minh",
    word: "一起",
    normalizedWord: "一起",
    pinyin: "yìqǐ",
    meaning: "cùng nhau",
    exampleSentence: "我们一起去吃晚饭吧。",
    examplePinyin: "Wǒmen yìqǐ qù chī wǎnfàn ba.",
    exampleTranslation: "Chúng mình cùng đi ăn tối nhé.",
    hskLevel: "HSK 2",
    partOfSpeech: "Phó từ",
    topic: "Cuộc sống hàng ngày",
    difficulty: "Trung bình",
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewAt: Date.now() - 7200000, // Due for review today!
    status: "new",
    reason: "Phó từ chỉ sự kết nối và hành động chung rất quan trọng",
  },
  {
    id: "fc-init-3",
    userId: "user-minh",
    word: "电影",
    normalizedWord: "电影",
    pinyin: "diànyǐng",
    meaning: "phim, điện ảnh",
    exampleSentence: "这部中国电影很有意思。",
    examplePinyin: "Zhè bù Zhōngguó diànyǐng hěn yǒu yìsi.",
    exampleTranslation: "Bộ phim Trung Quốc này rất hay và thú vị.",
    hskLevel: "HSK 1",
    partOfSpeech: "Danh từ",
    topic: "Sở thích & Giải trí",
    difficulty: "Dễ",
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewAt: Date.now() - 1000, // Due for review!
    status: "new",
    reason: "Chủ đề giải trí cuối tuần phổ biến",
  },
  {
    id: "fc-init-4",
    userId: "user-minh",
    word: "咖啡",
    normalizedWord: "咖啡",
    pinyin: "kāfēi",
    meaning: "cà phê",
    exampleSentence: "你想喝冰咖啡还是热咖啡？",
    examplePinyin: "Nǐ xiǎng hē bīng kāfēi háishi rè kāfēi?",
    exampleTranslation: "Bạn muốn uống cà phê đá hay cà phê nóng?",
    hskLevel: "HSK 2",
    partOfSpeech: "Danh từ",
    topic: "Ẩm thực & Quán cafe",
    difficulty: "Dễ",
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
    reviewCount: 2,
    correctCount: 2,
    incorrectCount: 0,
    easeFactor: 2.6,
    interval: 4,
    repetitions: 2,
    nextReviewAt: Date.now() + 86400000 * 2, // Future review
    status: "review",
    reason: "Từ vựng đồ uống thiết yếu hàng ngày",
  },
  {
    id: "fc-init-5",
    userId: "user-minh",
    word: "菜单",
    normalizedWord: "菜单",
    pinyin: "càidān",
    meaning: "thực đơn",
    exampleSentence: "服务员，请给我们一份菜单。",
    examplePinyin: "Fúwùyuán, qǐng gěi wǒmen yí fèn càidān.",
    exampleTranslation: "Phục vụ ơi, xin cho chúng tôi một quyển thực đơn.",
    hskLevel: "HSK 2",
    partOfSpeech: "Danh từ",
    topic: "Nhà hàng & Gọi món",
    difficulty: "Dễ",
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 4,
    reviewCount: 4,
    correctCount: 4,
    incorrectCount: 0,
    easeFactor: 2.7,
    interval: 22,
    repetitions: 4,
    nextReviewAt: Date.now() + 86400000 * 18,
    status: "mastered",
    reason: "Từ vựng cốt lõi khi đi ăn ở nhà hàng Trung Quốc",
  },
];

const DEFAULT_PROFILE: UserProfile = {
  id: "user-minh",
  name: "Minh",
  streakDays: 7,
  totalSessions: 23,
  totalMinutes: 185,
  totalWordsLearned: 420,
  currentLevel: "HSK 2",
  preferredTeacher: "lin-laoshi",
  preferredDisplayMode: "full",
  speechSpeed: 1.0,
  isDemoMode: false,
};

const INITIAL_VOCABULARY: VocabularyItem[] = [
  { id: "init-1", word: "餐厅", pinyin: "cāntīng", meaning: "nhà hàng, quán ăn", saved: true, hskLevel: "HSK 2", topic: "Restaurant" },
  { id: "init-2", word: "点菜", pinyin: "diǎn cài", meaning: "gọi món ăn", saved: true, hskLevel: "HSK 2", topic: "Restaurant" },
  { id: "init-3", word: "菜单", pinyin: "càidān", meaning: "thực đơn", saved: true, hskLevel: "HSK 2", topic: "Restaurant" },
  { id: "init-4", word: "多少钱", pinyin: "duōshao qián", meaning: "bao nhiêu tiền", saved: true, hskLevel: "HSK 1", topic: "Shopping" },
  { id: "init-5", word: "便宜", pinyin: "piányi", meaning: "rẻ, phải chăng", saved: true, hskLevel: "HSK 2", topic: "Shopping" },
  { id: "init-6", word: "认识", pinyin: "rènshi", meaning: "quen biết", saved: true, hskLevel: "HSK 1", topic: "Daily Conversation" },
  { id: "init-7", word: "很高兴", pinyin: "hěn gāoxìng", meaning: "rất vui mừng", saved: true, hskLevel: "HSK 1", topic: "Daily Conversation" },
  { id: "init-8", word: "行李", pinyin: "xíngli", meaning: "hành lý", saved: true, hskLevel: "HSK 3", topic: "Travel" },
];

const INITIAL_HISTORY: SpeakingSession[] = [
  {
    id: "sess-hist-1",
    topic: "ordering-food",
    topicTitleZh: "在餐厅点菜",
    level: "HSK 2",
    mode: "roleplay",
    teacher: "lin-laoshi",
    teacherNameZh: "林老师",
    startTime: Date.now() - 86400000 * 1,
    endTime: Date.now() - 86400000 * 1 + 540000,
    durationSeconds: 540,
    messages: [
      { id: "m1", role: "assistant", chinese: "您好，欢迎光临！请问几位？这是菜单。", pinyin: "Nín hǎo, huānyíng guānglín! Qǐngwèn jǐ wèi? Zhè shì càidān.", translation: "Chào quý khách! Mấy vị ạ? Đây là thực đơn.", timestamp: 1 },
      { id: "m2", role: "user", chinese: "你好，我想点菜。两位。", timestamp: 2 },
      { id: "m3", role: "assistant", chinese: "好的，请这边坐。今天推荐北京烤鸭和麻婆豆腐。", pinyin: "Hǎo de, qǐng zhèbiān zuò. Jīntiān tuījiàn Běijīng kǎoyā hé mápó dòufu.", translation: "Vâng, mời ngồi bàn này. Hôm nay gợi ý vịt quay Bắc Kinh và đậu phụ Ma Bà.", timestamp: 3 },
    ],
    corrections: [
      {
        id: "c-hist-1",
        original: "我要两个乌龙茶。",
        corrected: "我要两杯乌龙茶。",
        pinyin: "Wǒ yào liǎng bēi wūlóngchá.",
        explanation: "Khi nói về đồ uống dùng cốc ly, nên dùng lượng từ “杯” (bēi).",
        timestamp: Date.now() - 86400000 * 1,
      },
    ],
    vocabulary: [
      { id: "vh1", word: "菜单", pinyin: "càidān", meaning: "thực đơn", saved: true },
      { id: "vh2", word: "点菜", pinyin: "diǎn cài", meaning: "gọi món", saved: true },
    ],
    score: {
      fluency: 84,
      grammar: 88,
      vocabulary: 86,
      pronunciation: 85,
    },
    keyPoints: ["Lượng từ 杯 (bēi) cho đồ uống", "Mẫu câu: 请问有推荐的菜吗？", "北京烤鸭 (Běijīng kǎoyā)"],
  },
  {
    id: "sess-hist-2",
    topic: "introduce-yourself",
    topicTitleZh: "介绍自己",
    level: "HSK 1",
    mode: "free",
    teacher: "lin-laoshi",
    teacherNameZh: "林老师",
    startTime: Date.now() - 86400000 * 2,
    endTime: Date.now() - 86400000 * 2 + 420000,
    durationSeconds: 420,
    messages: [],
    corrections: [],
    vocabulary: [],
    score: {
      fluency: 80,
      grammar: 84,
      vocabulary: 82,
      pronunciation: 81,
    },
    keyPoints: ["Cấu trúc giới thiệu họ tên: 我叫...", "Hỏi quốc tịch: 你是哪国人？"],
  },
];

class StorageService {
  public getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn("Error reading profile from localStorage:", e);
    }
    return DEFAULT_PROFILE;
  }

  public saveUserProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, ...profile };
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated));
    } catch (e) {
      console.warn("Error saving profile to localStorage:", e);
    }
    return updated;
  }

  public getSessions(): SpeakingSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Error reading sessions:", e);
    }
    return INITIAL_HISTORY;
  }

  public saveSession(session: SpeakingSession): void {
    const list = this.getSessions();
    const filtered = list.filter((s) => s.id !== session.id);
    filtered.unshift(session);
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
      // Also update user profile stats
      const profile = this.getUserProfile();
      this.saveUserProfile({
        totalSessions: profile.totalSessions + 1,
        totalMinutes: profile.totalMinutes + Math.ceil(session.durationSeconds / 60),
        totalWordsLearned: profile.totalWordsLearned + session.vocabulary.length,
      });
    } catch (e) {
      console.warn("Error saving session:", e);
    }
  }

  public getVocabulary(): VocabularyItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Error reading vocabulary:", e);
    }
    return INITIAL_VOCABULARY;
  }

  public saveVocabularyItem(item: VocabularyItem): void {
    const list = this.getVocabulary();
    const index = list.findIndex((v) => v.word === item.word);
    if (index >= 0) {
      list[index] = { ...list[index], saved: true };
    } else {
      list.unshift({ ...item, saved: true, learnedAt: Date.now() });
    }
    try {
      localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(list));
    } catch (e) {
      console.warn("Error saving vocabulary:", e);
    }
  }

  public removeVocabularyItem(idOrWord: string): void {
    const list = this.getVocabulary().filter((v) => v.id !== idOrWord && v.word !== idOrWord);
    try {
      localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(list));
    } catch (e) {
      console.warn("Error removing vocabulary:", e);
    }
  }

  // --- Flashcard Persistence ---

  public getFlashcards(): Flashcard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Error reading flashcards:", e);
    }
    return INITIAL_FLASHCARDS;
  }

  public saveFlashcard(card: Flashcard): Flashcard {
    const list = this.getFlashcards();
    const index = list.findIndex((c) => c.id === card.id || c.normalizedWord === card.normalizedWord);
    let updated: Flashcard;
    if (index >= 0) {
      updated = { ...list[index], ...card, updatedAt: Date.now() };
      list[index] = updated;
    } else {
      updated = { ...card, updatedAt: Date.now() };
      list.unshift(updated);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(list));
    } catch (e) {
      console.warn("Error saving flashcard:", e);
    }
    return updated;
  }

  public saveFlashcardsBatch(cards: Flashcard[]): void {
    const current = this.getFlashcards();
    const map = new Map<string, Flashcard>();
    current.forEach((c) => map.set(c.normalizedWord, c));
    cards.forEach((c) => map.set(c.normalizedWord, c));
    const merged = Array.from(map.values());
    try {
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(merged));
    } catch (e) {
      console.warn("Error saving flashcards batch:", e);
    }
  }

  public deleteFlashcard(idOrWord: string): void {
    const list = this.getFlashcards().filter((c) => c.id !== idOrWord && c.word !== idOrWord && c.normalizedWord !== idOrWord);
    try {
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(list));
    } catch (e) {
      console.warn("Error deleting flashcard:", e);
    }
  }

  public saveFlashcardReview(cardId: string, review: FlashcardReview): void {
    try {
      const key = `${STORAGE_KEYS.FLASHCARD_REVIEWS}_${cardId}`;
      const existingStr = localStorage.getItem(key);
      const reviews: FlashcardReview[] = existingStr ? JSON.parse(existingStr) : [];
      reviews.push(review);
      localStorage.setItem(key, JSON.stringify(reviews));
    } catch (e) {
      console.warn("Error saving flashcard review:", e);
    }
  }

  public getFlashcardReviews(cardId: string): FlashcardReview[] {
    try {
      const key = `${STORAGE_KEYS.FLASHCARD_REVIEWS}_${cardId}`;
      const existingStr = localStorage.getItem(key);
      return existingStr ? JSON.parse(existingStr) : [];
    } catch (e) {
      console.warn("Error reading flashcard reviews:", e);
      return [];
    }
  }

  // --- Flashcard Settings ---

  public getFlashcardSettings(): FlashcardSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FLASHCARD_SETTINGS);
      if (data) {
        return { ...DEFAULT_FLASHCARD_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn("Error reading flashcard settings:", e);
    }
    return DEFAULT_FLASHCARD_SETTINGS;
  }

  public saveFlashcardSettings(settings: Partial<FlashcardSettings>): FlashcardSettings {
    const current = this.getFlashcardSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.FLASHCARD_SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.warn("Error saving flashcard settings:", e);
    }
    return updated;
  }

  // --- Ignored Words ---

  public getIgnoredWords(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IGNORED_VOCABULARY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Error reading ignored words:", e);
    }
    return [];
  }

  public addIgnoredWord(word: string): void {
    const list = this.getIgnoredWords();
    const norm = word.trim().toLowerCase();
    if (!list.includes(norm)) {
      list.push(norm);
      try {
        localStorage.setItem(STORAGE_KEYS.IGNORED_VOCABULARY, JSON.stringify(list));
      } catch (e) {
        console.warn("Error adding ignored word:", e);
      }
    }
  }

  public removeIgnoredWord(word: string): void {
    const list = this.getIgnoredWords();
    const norm = word.trim().toLowerCase();
    const filtered = list.filter((w) => w !== norm);
    try {
      localStorage.setItem(STORAGE_KEYS.IGNORED_VOCABULARY, JSON.stringify(filtered));
    } catch (e) {
      console.warn("Error removing ignored word:", e);
    }
  }
}

export const storageService = new StorageService();
