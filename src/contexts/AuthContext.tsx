import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  isFirebaseConfigured,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  FirebaseUser,
} from "../services/firebase";
import { firestoreService } from "../services/firestoreService";
import { storageService } from "../services/storageService";
import { UserProfile } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  authError: string | null;
  isFirebaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // If Firebase is not configured, automatically load local demo profile
    if (!isFirebaseConfigured || !auth) {
      const localProfile = storageService.getUserProfile();
      setUser(localProfile);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          // Fetch user profile from Firestore `users/{userId}`
          const existingProfile = await firestoreService.getUserProfile(fbUser.uid);
          if (existingProfile) {
            setUser(existingProfile);
          } else {
            // First time login: create user profile document in Firestore
            const newProfile: UserProfile = {
              id: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split("@")[0] || "Học viên",
              email: fbUser.email || undefined,
              displayName: fbUser.displayName || undefined,
              photoURL: fbUser.photoURL || undefined,
              hskLevel: "HSK 1",
              streakDays: 1,
              totalSessions: 0,
              totalMinutes: 0,
              totalWordsLearned: 0,
              currentLevel: "HSK 1",
              preferredTeacher: "teacher-li",
              preferredDisplayMode: "full",
              speechSpeed: 1.0,
              isDemoMode: false,
              createdAt: Date.now(),
            };
            await firestoreService.saveUserProfile(newProfile);
            setUser(newProfile);
          }
        } catch (err) {
          console.warn("Could not sync Firestore profile, using fallback:", err);
          const fallback = storageService.getUserProfile();
          fallback.id = fbUser.uid;
          fallback.name = fbUser.displayName || fbUser.email?.split("@")[0] || fallback.name;
          setUser(fallback);
        }
      } else {
        // Logged out: fallback to local demo profile
        const local = storageService.getUserProfile();
        setUser(local);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setLoading(true);
    if (!isFirebaseConfigured || !auth) {
      setAuthError("Firebase chưa được cấu hình. Đang chạy ở chế độ Demo.");
      setLoading(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error("Google sign in error:", err);
      const msg = err instanceof Error ? err.message : "Đăng nhập Google thất bại.";
      if (msg.includes("popup-closed-by-user")) {
        setAuthError("Bạn đã đóng cửa sổ đăng nhập.");
      } else if (msg.includes("cancelled-popup-request")) {
        setAuthError("Yêu cầu đăng nhập bị hủy.");
      } else {
        setAuthError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    setLoading(true);
    if (!isFirebaseConfigured || !auth) {
      setAuthError("Firebase chưa được cấu hình. Đang chạy ở chế độ Demo.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: unknown) {
      console.error("Email sign in error:", err);
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại.";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setAuthError("Email hoặc mật khẩu không chính xác.");
      } else if (msg.includes("invalid-email")) {
        setAuthError("Địa chỉ email không hợp lệ.");
      } else {
        setAuthError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    setAuthError(null);
    setLoading(true);
    if (!isFirebaseConfigured || !auth) {
      setAuthError("Firebase chưa được cấu hình. Đang chạy ở chế độ Demo.");
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name && cred.user) {
        await updateFirebaseProfile(cred.user, { displayName: name.trim() });
      }
    } catch (err: unknown) {
      console.error("Email sign up error:", err);
      const msg = err instanceof Error ? err.message : "Đăng ký thất bại.";
      if (msg.includes("email-already-in-use")) {
        setAuthError("Email này đã được đăng ký. Vui lòng đăng nhập.");
      } else if (msg.includes("weak-password")) {
        setAuthError("Mật khẩu quá ngắn. Vui lòng đặt mật khẩu ít nhất 6 ký tự.");
      } else {
        setAuthError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    setAuthError(null);
    if (auth && isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
    const demo = storageService.getUserProfile();
    setUser(demo);
    setLoading(false);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    storageService.saveUserProfile(updated);

    if (isFirebaseConfigured && auth?.currentUser) {
      try {
        await firestoreService.saveUserProfile(updated);
      } catch (err) {
        console.warn("Could not update Firestore profile:", err);
      }
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        authError,
        isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        clearAuthError,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
