import { Flashcard, FlashcardReview, FlashcardStatus, ReviewResult } from "../types";

export interface SrsCalculationResult {
  nextReviewAt: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
  status: FlashcardStatus;
}

export interface ReviewStatusSummary {
  total: number;
  dueCount: number;
  newCount: number;
  learningCount: number;
  reviewCount: number;
  masteredCount: number;
  retentionRate: number;
}

class SpacedRepetitionService {
  private readonly ONE_DAY_MS = 24 * 60 * 60 * 1000;

  /**
   * Calculate next review interval, ease factor, and learning status
   * based on a modified SM-2 spaced repetition algorithm.
   */
  public calculateNextReview(card: Flashcard, result: ReviewResult): SrsCalculationResult {
    let easeFactor = card.easeFactor || 2.5;
    let repetitions = card.repetitions || 0;
    let interval = card.interval || 0;
    let status: FlashcardStatus = card.status || "new";

    switch (result) {
      case "again":
        repetitions = 0;
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        status = "learning";
        break;

      case "hard":
        interval = Math.max(1, Math.round((interval || 1) * 1.2));
        easeFactor = Math.max(1.3, easeFactor - 0.15);
        repetitions += 1;
        status = interval >= 21 ? "mastered" : "learning";
        break;

      case "good":
        repetitions += 1;
        if (repetitions === 1) {
          interval = 1;
        } else if (repetitions === 2) {
          interval = 3;
        } else {
          interval = Math.max(1, Math.round((interval || 1) * easeFactor));
        }
        status = interval >= 21 ? "mastered" : interval > 3 ? "review" : "learning";
        break;

      case "easy":
        repetitions += 1;
        if (repetitions === 1) {
          interval = 4;
        } else {
          interval = Math.max(1, Math.round((interval || 1) * easeFactor * 1.3));
        }
        easeFactor += 0.15;
        status = interval >= 21 ? "mastered" : "review";
        break;
    }

    const nextReviewAt = Date.now() + interval * this.ONE_DAY_MS;

    return {
      nextReviewAt,
      interval,
      easeFactor: Number(easeFactor.toFixed(2)),
      repetitions,
      status,
    };
  }

  /**
   * Update flashcard state after learner completes a review turn
   */
  public updateCardAfterReview(
    card: Flashcard,
    result: ReviewResult
  ): { updatedCard: Flashcard; review: FlashcardReview } {
    const previousInterval = card.interval || 0;
    const srs = this.calculateNextReview(card, result);

    const isCorrect = result === "good" || result === "easy";
    const updatedCard: Flashcard = {
      ...card,
      reviewCount: (card.reviewCount || 0) + 1,
      correctCount: (card.correctCount || 0) + (isCorrect ? 1 : 0),
      incorrectCount: (card.incorrectCount || 0) + (result === "again" ? 1 : 0),
      easeFactor: srs.easeFactor,
      interval: srs.interval,
      repetitions: srs.repetitions,
      nextReviewAt: srs.nextReviewAt,
      status: srs.status,
      updatedAt: Date.now(),
    };

    const review: FlashcardReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      result,
      reviewedAt: Date.now(),
      previousInterval,
      newInterval: srs.interval,
    };

    return { updatedCard, review };
  }

  /**
   * Filter flashcards that are due for review (including cards due today)
   */
  public getDueCards(cards: Flashcard[]): Flashcard[] {
    const now = Date.now();
    // Allow cards scheduled up to the end of today
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const threshold = endOfToday.getTime();

    return cards
      .filter((c) => c.status !== "mastered" && c.nextReviewAt <= threshold)
      .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  }

  /**
   * Generate aggregate SRS breakdown for dashboard and study views
   */
  public getReviewStatus(cards: Flashcard[]): ReviewStatusSummary {
    const dueCards = this.getDueCards(cards);
    let totalReviews = 0;
    let totalCorrect = 0;

    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;
    let masteredCount = 0;

    cards.forEach((c) => {
      totalReviews += c.reviewCount || 0;
      totalCorrect += c.correctCount || 0;

      if (c.status === "new") newCount++;
      else if (c.status === "learning") learningCount++;
      else if (c.status === "review") reviewCount++;
      else if (c.status === "mastered") masteredCount++;
    });

    const retentionRate =
      totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 100;

    return {
      total: cards.length,
      dueCount: dueCards.length,
      newCount,
      learningCount,
      reviewCount,
      masteredCount,
      retentionRate,
    };
  }
}

export const spacedRepetitionService = new SpacedRepetitionService();
