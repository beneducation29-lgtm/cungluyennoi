import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from "./firebase";
import {
  UserProfile,
  SpeakingSession,
  VocabularyItem,
  LearningProgress,
  Message,
  ChineseLevel,
} from "../types";
import { storageService } from "./storageService";

class FirestoreService {
  /**
   * Save or update User Profile at `users/{userId}`
   */
  public async saveUserProfile(user: UserProfile): Promise<void> {
    if (!isFirebaseConfigured || !db) {
      storageService.saveUserProfile(user);
      return;
    }

    const path = `users/${user.id}`;
    try {
      await setDoc(
        doc(db, "users", user.id),
        {
          id: user.id,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          hskLevel: user.hskLevel || "HSK 1",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Get User Profile from `users/{userId}`
   */
  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured || !db) {
      return storageService.getUserProfile();
    }

    const path = `users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const local = storageService.getUserProfile();
        return {
          ...local,
          id: data.id || local.id,
          name: data.displayName || local.name,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          currentLevel: (data.hskLevel as ChineseLevel) || local.currentLevel,
          hskLevel: data.hskLevel,
          streakDays: local.streakDays,
          totalMinutes: local.totalMinutes,
          totalWordsLearned: local.totalWordsLearned,
          totalWords: local.totalWordsLearned,
          createdAt: data.createdAt || Date.now(),
        };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  }

  /**
   * Save a completed Speaking Session to `sessions/{sessionId}`
   * and its turn messages to `sessions/{sessionId}/messages/{messageId}`
   */
  public async saveSession(session: SpeakingSession, userId?: string): Promise<void> {
    // Always keep local copy as fallback
    storageService.saveSession(session);

    if (!isFirebaseConfigured || !db || !userId) {
      return;
    }

    const sessionPath = `sessions/${session.id}`;
    try {
      await setDoc(doc(db, "sessions", session.id), {
        id: session.id,
        userId: userId,
        topic: session.topic,
        topicTitleZh: session.topicTitleZh,
        level: session.level,
        mode: session.mode,
        teacher: session.teacher,
        teacherNameZh: session.teacherNameZh,
        durationSeconds: session.durationSeconds,
        startTime: session.startTime,
        endTime: session.endTime,
        score: session.score || null,
        keyPoints: session.keyPoints || [],
        createdAt: new Date().toISOString(),
      });

      // Save each message into subcollection `sessions/{sessionId}/messages/{messageId}`
      if (session.messages && session.messages.length > 0) {
        for (const msg of session.messages) {
          const msgPath = `sessions/${session.id}/messages/${msg.id}`;
          try {
            await setDoc(doc(db, "sessions", session.id, "messages", msg.id), {
              id: msg.id,
              sessionId: session.id,
              userId: userId,
              role: msg.role,
              chinese: msg.chinese,
              pinyin: msg.pinyin || "",
              translation: msg.translation || "",
              timestamp: msg.timestamp,
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, msgPath);
          }
        }
      }

      // Automatically update progress record
      await this.updateProgressAfterSession(userId, session);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, sessionPath);
    }
  }

  /**
   * Get User Session History from `sessions`
   */
  public async getUserSessions(userId: string): Promise<SpeakingSession[]> {
    if (!isFirebaseConfigured || !db) {
      return storageService.getSessions();
    }

    const path = "sessions";
    try {
      const q = query(
        collection(db, "sessions"),
        where("userId", "==", userId),
        orderBy("startTime", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const sessions: SpeakingSession[] = [];

      snapshot.forEach((d) => {
        const data = d.data();
        sessions.push({
          id: data.id,
          topic: data.topic,
          topicTitleZh: data.topicTitleZh,
          level: data.level,
          mode: data.mode,
          teacher: data.teacher,
          teacherNameZh: data.teacherNameZh,
          durationSeconds: data.durationSeconds,
          startTime: data.startTime,
          endTime: data.endTime,
          messages: [],
          corrections: [],
          vocabulary: [],
          score: data.score,
          keyPoints: data.keyPoints || [],
        });
      });

      return sessions.length > 0 ? sessions : storageService.getSessions();
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return storageService.getSessions();
    }
  }

  /**
   * Save a vocabulary item to `vocabulary/{vocabularyId}`
   */
  public async saveVocabulary(item: VocabularyItem, userId?: string): Promise<void> {
    storageService.saveVocabularyItem(item);

    if (!isFirebaseConfigured || !db || !userId) {
      return;
    }

    const vocabId = `${userId}_${encodeURIComponent(item.word)}`;
    const path = `vocabulary/${vocabId}`;
    try {
      await setDoc(doc(db, "vocabulary", vocabId), {
        id: vocabId,
        userId: userId,
        word: item.word,
        pinyin: item.pinyin,
        meaningVi: item.meaningVi || item.meaning || "",
        hskLevel: item.hskLevel || "HSK 1",
        exampleZh: item.exampleZh || item.exampleSentence || "",
        examplePy: item.examplePy || "",
        exampleVi: item.exampleVi || "",
        savedAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Delete a vocabulary item from `vocabulary/{vocabularyId}`
   */
  public async deleteVocabulary(word: string, userId?: string): Promise<void> {
    storageService.removeVocabularyItem(word);

    if (!isFirebaseConfigured || !db || !userId) {
      return;
    }

    const vocabId = `${userId}_${encodeURIComponent(word)}`;
    const path = `vocabulary/${vocabId}`;
    try {
      await deleteDoc(doc(db, "vocabulary", vocabId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  /**
   * Get all user saved vocabulary from `vocabulary`
   */
  public async getUserVocabulary(userId: string): Promise<VocabularyItem[]> {
    if (!isFirebaseConfigured || !db) {
      return storageService.getVocabulary();
    }

    const path = "vocabulary";
    try {
      const q = query(
        collection(db, "vocabulary"),
        where("userId", "==", userId),
        orderBy("savedAt", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const list: VocabularyItem[] = [];

      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: data.id || `v-${data.word}`,
          word: data.word,
          pinyin: data.pinyin,
          meaning: data.meaningVi || "",
          meaningVi: data.meaningVi || "",
          hskLevel: data.hskLevel,
          exampleZh: data.exampleZh,
          exampleSentence: data.exampleZh,
          examplePy: data.examplePy,
          exampleVi: data.exampleVi,
          saved: true,
        });
      });

      return list.length > 0 ? list : storageService.getVocabulary();
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return storageService.getVocabulary();
    }
  }

  /**
   * Get Learning Progress from `progress/{userId}`
   */
  public async getUserProgress(userId: string): Promise<LearningProgress | null> {
    if (!isFirebaseConfigured || !db) {
      const profile = storageService.getUserProfile();
      return {
        userId,
        totalSessions: profile.totalSessions || 0,
        totalDurationSeconds: (profile.totalMinutes || 0) * 60,
        totalWordsLearned: profile.totalWordsLearned || 0,
        targetHskLevel: profile.currentLevel || "HSK 2",
        averagePronunciation: 85,
        lastPracticedAt: Date.now(),
      };
    }

    const path = `progress/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, "progress", userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          userId: data.userId,
          totalSessions: data.totalSessions || 0,
          totalDurationSeconds: data.totalDurationSeconds || 0,
          totalWordsLearned: data.totalWordsLearned || 0,
          targetHskLevel: data.targetHskLevel || "HSK 2",
          averagePronunciation: data.averagePronunciation || 85,
          lastPracticedAt: data.lastPracticedAt || Date.now(),
        };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  }

  /**
   * Update Learning Progress at `progress/{userId}`
   */
  public async updateUserProgress(
    userId: string,
    delta: { totalMinutes?: number; sessionsCompleted?: number; fluencyScore?: number }
  ): Promise<void> {
    if (!isFirebaseConfigured || !db || !userId) return;

    const path = `progress/${userId}`;
    try {
      const existing = await this.getUserProgress(userId);
      const totalSessions = (existing?.totalSessions || 0) + (delta.sessionsCompleted || 0);
      const totalDuration =
        (existing?.totalDurationSeconds || 0) + (delta.totalMinutes ? delta.totalMinutes * 60 : 0);
      const newScore = delta.fluencyScore || 85;
      const prevScore = existing?.averagePronunciation || 85;
      const avgScore =
        totalSessions > 0
          ? Math.round((prevScore * Math.max(0, totalSessions - 1) + newScore) / totalSessions)
          : newScore;

      await setDoc(
        doc(db, "progress", userId),
        {
          userId: userId,
          totalSessions: totalSessions,
          totalDurationSeconds: totalDuration,
          totalWordsLearned: existing?.totalWordsLearned || 0,
          targetHskLevel: existing?.targetHskLevel || "HSK 2",
          averagePronunciation: avgScore,
          lastPracticedAt: Date.now(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  /**
   * Update Learning Progress at `progress/{userId}` after session
   */
  private async updateProgressAfterSession(userId: string, session: SpeakingSession): Promise<void> {
    if (!isFirebaseConfigured || !db) return;

    const path = `progress/${userId}`;
    try {
      const existing = await this.getUserProgress(userId);
      const totalSessions = (existing?.totalSessions || 0) + 1;
      const totalDuration = (existing?.totalDurationSeconds || 0) + session.durationSeconds;
      const newScore = session.score?.fluency || session.score?.pronunciation || 85;
      const prevScore = existing?.averagePronunciation || 85;
      const avgScore = Math.round((prevScore * (totalSessions - 1) + newScore) / totalSessions);

      await setDoc(
        doc(db, "progress", userId),
        {
          userId: userId,
          totalSessions: totalSessions,
          totalDurationSeconds: totalDuration,
          totalWordsLearned: (existing?.totalWordsLearned || 0) + (session.vocabulary?.length || 0),
          targetHskLevel: existing?.targetHskLevel || "HSK 2",
          averagePronunciation: avgScore,
          lastPracticedAt: Date.now(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export const firestoreService = new FirestoreService();
