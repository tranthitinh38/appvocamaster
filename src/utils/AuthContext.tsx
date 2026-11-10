import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProgress } from '../types';

/**
 * Context for authentication / user state.
 * Provides current user, progress and setters.
 */
interface AuthContextProps {
  user: User;
  userProgress: UserProgress;
  setUser: (u: User) => void;
  setUserProgress: (p: UserProgress) => void;
}

// Default values when no user is logged in.
const defaultAuth: AuthContextProps = {
  user: { id: '', name: '', role: 'student' },
  userProgress: {
    level: 0,
    levelTitle: '',
    xp: 0,
    xpToNextLevel: 0,
    streak: 0,
    lastActiveDate: '',
    dailyGoalWords: 0,
    wordsReviewedToday: 0,
    completedSpeakingToday: 0,
    pvpWins: 0,
    pvpTotal: 0,
    badges: [],
    items: [],
  },
  setUser: () => {},
  setUserProgress: () => {},
};

const AuthContext = createContext<AuthContextProps>(defaultAuth);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultAuth.user);
  const [userProgress, setUserProgress] = useState<UserProgress>(defaultAuth.userProgress);

  // Load persisted progress once on mount.
  useEffect(() => {
    const STORAGE_KEY = 'global_success_8_user_progress';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUserProgress(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read persisted user progress', e);
    }
  }, []);

  // Persist whenever progress changes.
  useEffect(() => {
    const STORAGE_KEY = 'global_success_8_user_progress';
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (e) {
      console.warn('Could not save user progress', e);
    }
    // Also sync student progress to class list for teachers
    if (user.role === 'student') {
      const CLASS_KEY = 'global_success_8_class_students';
      try {
        const existing = localStorage.getItem(CLASS_KEY);
        const arr: any[] = existing ? JSON.parse(existing) : [];
        const idx = arr.findIndex((s) => s.id === user.id);
        const studentData = { id: user.id, name: user.name, ...userProgress };
        if (idx >= 0) arr[idx] = studentData; else arr.push(studentData);
        localStorage.setItem(CLASS_KEY, JSON.stringify(arr));
      } catch (e) {
        console.warn('Could not sync class student data', e);
      }
    }
  }, [userProgress, user]);

  return (
    <AuthContext.Provider value={{ user, userProgress, setUser, setUserProgress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
