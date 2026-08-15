import {
  UserProfile,
  PowerUpState,
  LevelData,
  ScoreHistoryPoint,
  Question,
  QuizCategory,
  AuthAccount,
  UserRole,
} from "../types";
import {
  INITIAL_USER_PROFILE,
  INITIAL_POWER_UPS,
  INITIAL_QUESTIONS,
  INITIAL_CATEGORIES,
} from "../data/initialData";

export const ADMIN_EMAIL = "salahbousbia82@gmail.com";

export function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

const STORAGE_KEYS = {
  PROFILE: "brain_game_user_profile_v1",
  ACCOUNTS: "brain_game_accounts_v1",
  CURRENT_USER_EMAIL: "brain_game_current_email_v1",
  QUESTIONS: "brain_game_questions_v1",
  CATEGORIES: "brain_game_categories_v1",
  POWERUPS: "brain_game_powerups_v1",
  LEVELS: "brain_game_levels_v1",
  SCORE_HISTORY: "brain_game_score_history_v1",
  ANNOUNCEMENTS: "brain_game_announcements_v1",
};

// Initial sample accounts
const DEFAULT_ACCOUNTS: AuthAccount[] = [
  {
    id: "admin-salah",
    email: ADMIN_EMAIL,
    name: "صلاح بوعصبية (المدير)",
    role: "admin",
    avatar: "👑",
    createdAt: "2025-01-01",
    coins: 99999,
    stars: 999,
    iqScore: 160,
    level: 50,
    xp: 50000,
    totalQuizzes: 120,
  },
  {
    id: "player-demo",
    email: "player@quiz.com",
    name: "أحمد المنافس",
    role: "player",
    avatar: "👨‍🎓",
    createdAt: "2025-02-10",
    coins: 3400,
    stars: 125,
    iqScore: 128,
    level: 12,
    xp: 2800,
    totalQuizzes: 42,
  },
  {
    id: "player-sara",
    email: "sara@brain.org",
    name: "سارة العبقرية",
    role: "player",
    avatar: "👩‍🔬",
    createdAt: "2025-03-01",
    coins: 5200,
    stars: 190,
    iqScore: 135,
    level: 16,
    xp: 4100,
    totalQuizzes: 58,
  },
];

// Accounts Management
export function getStoredAccounts(): AuthAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure admin always exists and has admin role
        const hasAdmin = parsed.some((acc: AuthAccount) => isAdminEmail(acc.email));
        if (!hasAdmin) {
          parsed.unshift(DEFAULT_ACCOUNTS[0]);
        }
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_ACCOUNTS;
}

export function saveAccounts(accounts: AuthAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {}
}

export function registerOrLoginAccount(email: string, name?: string): { account: AuthAccount; isNew: boolean } {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getStoredAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);

  if (existing) {
    // If it's the admin email, make sure role is admin
    if (isAdminEmail(normalizedEmail)) {
      existing.role = "admin";
      saveAccounts(accounts);
    }
    return { account: existing, isNew: false };
  }

  // Create new account
  const isAdmin = isAdminEmail(normalizedEmail);
  const newAccount: AuthAccount = {
    id: "user-" + Date.now(),
    email: normalizedEmail,
    name: name?.trim() || (isAdmin ? "صلاح بوعصبية (المدير)" : `لاعب جديد (${normalizedEmail.split("@")[0]})`),
    role: isAdmin ? "admin" : "player",
    avatar: isAdmin ? "👑" : "🧑‍🎓",
    createdAt: new Date().toISOString().split("T")[0],
    coins: isAdmin ? 99999 : 1000,
    stars: isAdmin ? 999 : 20,
    iqScore: isAdmin ? 150 : 100,
    level: isAdmin ? 25 : 1,
    xp: isAdmin ? 25000 : 0,
    totalQuizzes: 0,
  };

  accounts.push(newAccount);
  saveAccounts(accounts);
  return { account: newAccount, isNew: true };
}

// User Profile
export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto upgrade role if email matches admin
      if (isAdminEmail(parsed.email)) {
        parsed.role = "admin";
      }
      return parsed;
    }
  } catch (e) {}
  return INITIAL_USER_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    if (isAdminEmail(profile.email)) {
      profile.role = "admin";
    }
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));

    // Also sync to accounts list if email exists
    if (profile.email) {
      const accounts = getStoredAccounts();
      const idx = accounts.findIndex((a) => a.email.toLowerCase() === profile.email!.toLowerCase());
      if (idx !== -1) {
        accounts[idx] = {
          ...accounts[idx],
          name: profile.name,
          avatar: profile.avatar,
          coins: profile.coins,
          stars: profile.stars,
          iqScore: profile.iqScore,
          level: profile.level,
          xp: profile.xp,
          totalQuizzes: profile.totalQuizzesPlayed,
          role: isAdminEmail(profile.email) ? "admin" : accounts[idx].role || "player",
        };
        saveAccounts(accounts);
      }
    }
  } catch (e) {}
}

// Questions Bank Management
export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_QUESTIONS;
}

export function saveQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (e) {}
}

// Categories Management
export function getStoredCategories(): QuizCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_CATEGORIES;
}

export function saveCategories(categories: QuizCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {}
}

// PowerUps
export function getStoredPowerUps(): PowerUpState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POWERUPS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return INITIAL_POWER_UPS;
}

export function savePowerUps(powerUps: PowerUpState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POWERUPS, JSON.stringify(powerUps));
  } catch (e) {}
}

// Levels
export function getStoredLevels(): Record<string, LevelData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEVELS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

export function saveLevels(levels: Record<string, LevelData>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEVELS, JSON.stringify(levels));
  } catch (e) {}
}

// Score History
export function getScoreHistory(): ScoreHistoryPoint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCORE_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    { date: "10/5", iq: 105, accuracy: 60, quizzes: 4 },
    { date: "15/5", iq: 114, accuracy: 72, quizzes: 8 },
    { date: "20/5", iq: 120, accuracy: 80, quizzes: 14 },
    { date: "25/5", iq: 128, accuracy: 88, quizzes: 22 },
  ];
}

export function saveScoreHistory(history: ScoreHistoryPoint[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCORE_HISTORY, JSON.stringify(history));
  } catch (e) {}
}

// Admin Announcements
export interface Announcement {
  id: string;
  title: string;
  message: string;
  rewardCoins?: number;
  date: string;
  sender: string;
}

export function getStoredAnnouncements(): Announcement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      id: "welcome-notice",
      title: "مرحباً بكم في الموسم الجديد 🌟",
      message: "تم تحديث بنك الأسئلة وإضافة تحديات ذكاء حصرية وتنافس متعدد اللاعبين!",
      rewardCoins: 100,
      date: "2025-05-01",
      sender: "إدارة اللعبة",
    },
  ];
}

export function saveAnnouncements(announcements: Announcement[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  } catch (e) {}
}
