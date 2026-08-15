export type Difficulty = "سهل" | "متوسط" | "صعب" | "خبير";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0 to 3
  hint?: string;
  explanation?: string;
  categoryId: string;
  levelNumber?: number;
  difficulty?: Difficulty;
  imageUrl?: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  description: string;
  gradient: string;
  badgeColor: string;
  totalLevels: number;
}

export interface LevelData {
  levelNumber: number;
  categoryId: string;
  starsEarned: number; // 0 to 3
  isUnlocked: boolean;
  highScore: number;
  totalQuestions: number;
}

export type UserRole = "admin" | "player";

export interface UserProfile {
  name: string;
  avatar: string;
  email?: string;
  role?: UserRole;
  coins: number;
  stars: number;
  iqScore: number; // Dynamic IQ score calculated from quiz performance (starts at 100)
  level: number;
  xp: number;
  xpToNextLevel: number;
  currentStreak: number;
  lastPlayedDate?: string;
  totalQuizzesPlayed: number;
  totalCorrectAnswers: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface AuthAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  isBanned?: boolean;
  coins: number;
  stars: number;
  iqScore: number;
  level: number;
  xp: number;
  totalQuizzes: number;
}

export interface PowerUpState {
  removeTwoCount: number; // حذف إجابتين
  extraTimeCount: number; // وقت إضافي
  aiHintCount: number;    // كشف تلميح بالذكاء الاصطناعي
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardCoins: number;
  rewardStars: number;
}

export interface AIOpponent {
  id: string;
  name: string;
  avatar: string;
  title: string;
  difficulty: Difficulty;
  accuracy: number; // e.g. 0.7 = 70% chance of correct answer
  answerSpeedSeconds: number; // avg seconds per answer
}

export type GameView =
  | "home"
  | "categories"
  | "levels"
  | "quiz"
  | "vs_mode"
  | "ai_generator"
  | "analytics"
  | "leaderboard"
  | "store"
  | "admin";

export type MultiplayerMode = "same_phone" | "online" | "bluetooth" | "ai_bot";

export type SamePhoneSubMode = "split_screen" | "pass_and_play";

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  selectedOption: number | null;
  answeredTimeMs: number | null;
  streak: number;
  isReady: boolean;
}

export interface OnlineRoomData {
  roomCode: string;
  host: MultiplayerPlayer;
  guest: MultiplayerPlayer | null;
  status: "waiting" | "starting" | "playing" | "round_finished" | "game_over";
  currentRound: number;
  totalRounds: number;
  questions: Question[];
  categoryTitle: string;
  roundStartTime: number;
  emojis: { from: string; emoji: string; id: number }[];
}

export interface ScoreHistoryPoint {
  date: string;
  iq: number;
  accuracy: number;
  quizzes: number;
}
