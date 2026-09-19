import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from "./firebase";
import {
  Flashcard,
  FlashcardCandidate,
  FlashcardReview,
  FlashcardSettings,
  ReviewResult,
} from "../types";
import { storageService } from "./storageService";
import { spacedRepetitionService } from "./spacedRepetitionService";

class VocabularyService {
  /**
   * Normalize Chinese word for consistent deduplication
   * Trims whitespace, removes non-essential punctuation, lowercases
   */
  public normalizeWord(word: string): string {
    if (!word) return "";
    return word.trim().toLowerCase();
  }

  /**
   * Determine if a word is an obvious trivial stopword or single digit
   * that shouldn't be automatically turned into a flashcard
   */
  public isTrivialWord(word: string): boolean {
    const trivialList = new Set([
      "我", "你", "他", "她", "它", "我们", "你们", "他们",
      "这", "那", "的", "得", "地", "是", "在", "有", "个",
      "了", "吗", "呢", "吧", "啊", "呀", "哦", "嗯", "好",
      "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
    ]);
    return trivialList.has(word.trim());
  }

  /**
   * Extract high-value vocabulary candidates from raw AI response
   */
  public extractVocabulary(
    aiVocabulary: any[],
    context?: { topicTitle?: string; sessionId?: string; level?: string }
  ): FlashcardCandidate[] {
    if (!Array.isArray(aiVocabulary)) return [];

    const candidates: FlashcardCandidate[] = [];

    for (const item of aiVocabulary) {
      if (!item || typeof item !== "object") continue;
      const rawWord = item.word || "";
      const word = String(rawWord).trim();
      if (!word || this.isTrivialWord(word)) continue;

      const priority = item.priority === "low" ? "low" : item.priority === "medium" ? "medium" : "high";

      candidates.push({
        word,
        pinyin: item.pinyin ? String(item.pinyin).trim() : "",
        meaning: item.meaning || item.meaningVi || "",
        exampleSentence: item.exampleSentence || item.exampleZh || `我经常用“${word}”。`,
        examplePinyin: item.examplePinyin || item.examplePy || "",
        exampleTranslation: item.exampleTranslation || item.exampleVi || "",
        hskLevel: item.hskLevel || context?.level || "HSK 2",
        partOfSpeech: item.partOfSpeech || "Từ vựng",
        reason: item.reason || `Từ vựng hữu ích trong chủ đề ${context?.topicTitle || "giao tiếp"}`,
        priority,
      });
    }

    return candidates;
  }

  /**
   * Create a new Flashcard object from candidate
   */
  public createFlashcard(
    candidate: FlashcardCandidate,
    userId: string,
    sessionId?: string,
    topic?: string
  ): Flashcard {
    const normalizedWord = this.normalizeWord(candidate.word);
    const id = `fc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = Date.now();

    return {
      id,
      userId: userId || "local-user",
      word: candidate.word,
      normalizedWord,
      pinyin: candidate.pinyin,
      meaning: candidate.meaning,
      exampleSentence: candidate.exampleSentence || "",
      examplePinyin: candidate.examplePinyin || "",
      exampleTranslation: candidate.exampleTranslation || "",
      hskLevel: candidate.hskLevel || "HSK 2",
      partOfSpeech: candidate.partOfSpeech || "Từ vựng",
      topic: topic || "Hội thoại",
      difficulty: candidate.priority === "high" ? "Thử thách" : "Trung bình",
      sourceSessionId: sessionId || "",
      createdAt: now,
      updatedAt: now,
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewAt: now, // Due immediately for first learning/review
      status: "new",
      reason: candidate.reason || "",
    };
  }

  /**
   * Find an existing card by word using normalized comparison
   */
  public findExistingFlashcard(cards: Flashcard[], word: string): Flashcard | undefined {
    const norm = this.normalizeWord(word);
    return cards.find((c) => c.normalizedWord === norm || this.normalizeWord(c.word) === norm);
  }

  /**
   * Fetch all flashcards for user (merges Firestore with local storage)
   */
  public async getFlashcards(userId?: string): Promise<Flashcard[]> {
    const localCards = storageService.getFlashcards();

    if (!isFirebaseConfigured || !db || !userId) {
      return localCards;
    }

    const path = `users/${userId}/flashcards`;
    try {
      const q = query(
        collection(db, "users", userId, "flashcards"),
        orderBy("createdAt", "desc"),
        limit(500)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const cloudCards: Flashcard[] = [];
        snap.forEach((d) => {
          const data = d.data() as Flashcard;
          cloudCards.push(data);
        });

        // Merge cloud cards with local cards (cloud is primary)
        storageService.saveFlashcardsBatch(cloudCards);
        return cloudCards;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }

    return localCards;
  }

  /**
   * Save a single flashcard to Firestore and Local Storage
   */
  public async saveFlashcard(card: Flashcard, userId?: string): Promise<Flashcard> {
    const saved = storageService.saveFlashcard(card);

    if (isFirebaseConfigured && db && userId) {
      const path = `users/${userId}/flashcards/${card.id}`;
      try {
        await setDoc(doc(db, "users", userId, "flashcards", card.id), {
          ...saved,
          userId,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    return saved;
  }

  /**
   * Update flashcard details
   */
  public async updateFlashcard(card: Flashcard, userId?: string): Promise<Flashcard> {
    return this.saveFlashcard(card, userId);
  }

  /**
   * Delete flashcard permanently
   */
  public async deleteFlashcard(cardId: string, userId?: string): Promise<void> {
    storageService.deleteFlashcard(cardId);

    if (isFirebaseConfigured && db && userId) {
      const path = `users/${userId}/flashcards/${cardId}`;
      try {
        await deleteDoc(doc(db, "users", userId, "flashcards", cardId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  }

  /**
   * Save a review attempt and update SRS stats
   */
  public async recordReview(
    card: Flashcard,
    result: ReviewResult,
    userId?: string
  ): Promise<{ updatedCard: Flashcard; review: FlashcardReview }> {
    const { updatedCard, review } = spacedRepetitionService.updateCardAfterReview(card, result);

    // Save updated card
    await this.saveFlashcard(updatedCard, userId);

    // Save review log
    storageService.saveFlashcardReview(card.id, review);

    if (isFirebaseConfigured && db && userId) {
      const path = `users/${userId}/flashcards/${card.id}/reviews/${review.id}`;
      try {
        await setDoc(
          doc(db, "users", userId, "flashcards", card.id, "reviews", review.id!),
          review
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }

    return { updatedCard, review };
  }

  /**
   * Reset flashcard review progress back to "new"
   */
  public async resetFlashcardProgress(cardId: string, userId?: string): Promise<Flashcard | null> {
    const cards = await this.getFlashcards(userId);
    const card = cards.find((c) => c.id === cardId);
    if (!card) return null;

    const reset: Flashcard = {
      ...card,
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewAt: Date.now(),
      status: "new",
      updatedAt: Date.now(),
    };

    return this.saveFlashcard(reset, userId);
  }

  /**
   * Ignore a word so it is never automatically extracted again
   */
  public async ignoreVocabulary(word: string, userId?: string): Promise<void> {
    storageService.addIgnoredWord(word);

    // Also remove any existing flashcard for this word
    const cards = storageService.getFlashcards();
    const existing = this.findExistingFlashcard(cards, word);
    if (existing) {
      await this.deleteFlashcard(existing.id, userId);
    }
  }

  /**
   * Un-ignore a previously ignored word
   */
  public async unignoreVocabulary(word: string): Promise<void> {
    storageService.removeIgnoredWord(word);
  }

  /**
   * Get user ignored words list
   */
  public getIgnoredWords(): string[] {
    return storageService.getIgnoredWords();
  }

  /**
   * Get user flashcard preferences
   */
  public getSettings(): FlashcardSettings {
    return storageService.getFlashcardSettings();
  }

  /**
   * Save user flashcard preferences
   */
  public saveSettings(settings: Partial<FlashcardSettings>): FlashcardSettings {
    return storageService.saveFlashcardSettings(settings);
  }

  /**
   * Filter cards due for review
   */
  public async getDueFlashcards(userId?: string): Promise<Flashcard[]> {
    const cards = await this.getFlashcards(userId);
    return spacedRepetitionService.getDueCards(cards);
  }

  /**
   * Filter new flashcards
   */
  public async getNewFlashcards(userId?: string): Promise<Flashcard[]> {
    const cards = await this.getFlashcards(userId);
    return cards.filter((c) => c.status === "new");
  }

  /**
   * Filter mastered flashcards
   */
  public async getMasteredFlashcards(userId?: string): Promise<Flashcard[]> {
    const cards = await this.getFlashcards(userId);
    return cards.filter((c) => c.status === "mastered");
  }

  /**
   * Core automatic workflow during speaking practice:
   * 1. Inspect extracted AI vocabulary
   * 2. Filter priority (high/medium)
   * 3. Check duplicate protection & ignore list
   * 4. Automatically generate and persist flashcards
   * 5. Return created cards for non-intrusive notifications
   */
  public async processTurnVocabulary(params: {
    aiVocabulary: any[];
    userId: string;
    sessionId?: string;
    topic?: string;
    level?: string;
  }): Promise<{ addedCards: Flashcard[]; existingCount: number }> {
    const { aiVocabulary, userId, sessionId, topic, level } = params;

    const settings = this.getSettings();
    if (!settings.autoAddFlashcards) {
      return { addedCards: [], existingCount: 0 };
    }

    const ignoredWords = new Set(this.getIgnoredWords().map((w) => this.normalizeWord(w)));
    const currentCards = await this.getFlashcards(userId);
    const existingNormals = new Set(currentCards.map((c) => c.normalizedWord));

    const candidates = this.extractVocabulary(aiVocabulary, {
      topicTitle: topic,
      sessionId,
      level,
    });

    const addedCards: Flashcard[] = [];
    let existingCount = 0;

    for (const candidate of candidates) {
      // Only high and medium priority vocabulary become flashcards
      if (candidate.priority === "low") continue;

      const norm = this.normalizeWord(candidate.word);

      // Check ignore list
      if (ignoredWords.has(norm)) continue;

      // Check duplicate protection
      if (existingNormals.has(norm)) {
        existingCount++;
        continue;
      }

      // Create new flashcard
      const newCard = this.createFlashcard(candidate, userId, sessionId, topic);
      const savedCard = await this.saveFlashcard(newCard, userId);
      addedCards.push(savedCard);
      existingNormals.add(norm);
    }

    return { addedCards, existingCount };
  }
}

export const vocabularyService = new VocabularyService();
