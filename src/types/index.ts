import { VocabularyItem, UnitData, SpeakingChallenge } from '../data/unitsData';

/**
 * Thông tin người dùng hiện tại (học sinh hoặc giáo viên).
 */
export interface User {
  /** Định danh duy nhất */
  id: string;
  /** Tên hiển thị */
  name: string;
  /** Vai trò của người dùng */
  role: 'student' | 'teacher';
}


export interface UserProgress {
  /** Unique identifier for student (optional, used in teacher view) */
  id?: string;
  /** Display name (optional, used in teacher view) */
  name?: string;
  level: number;
  levelTitle: string;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastActiveDate: string;
  dailyGoalWords: number;
  wordsReviewedToday: number;
  completedSpeakingToday: number;
  pvpWins: number;
  pvpTotal: number;
  /** optional IPA score for teacher dashboard */
  ipaScore?: number;
  badges: Badge[];
  items: InventoryItem[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  xpAwarded?: number;
}

export interface SpeakingFeedback {
  overallScore: number;
  ipaScore: number;
  stressScore: number;
  intonationScore: number;
  targetIpa: string;
  phoneticBreakdown: {
    word: string;
    ipa: string;
    status: 'perfect' | 'warning' | 'need_work';
    tip: string;
  }[];
  feedbackIpa: string;
  feedbackStress: string;
  feedbackIntonation: string;
  encouragement: string;
  xpGained: number;
}

export interface ExtractedOcrResult {
  detectedUnit: string;
  summary: string;
  extractedVocabulary: {
    word: string;
    partOfSpeech: string;
    ipa: string;
    meaningVi: string;
    collocation: string;
    wordFamily: string;
    synonyms?: string;
    antonyms?: string;
    contextExample: string;
    imagePrompt4k: string;
    difficulty: string;
  }[];
  quickQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}
