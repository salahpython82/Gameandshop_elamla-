import {
  UserProfile,
  PowerUpState,
  LevelData,
  ScoreHistoryPoint,
  Question,
  QuizCategory,
  AuthAccount,
  UserRole,
  AncientCoin,
  PlayerOwnedCoin,
  CoinAppraisalRecord,
  PlayerStore,
  RealCoinListing,
  MarketOrder,
  StoreSubscriptionConfig,
  StoreSubscriptionCard,
  AuthorizedPointOfSale,
  StoreSubscriptionPlan,
} from "../types";
import {
  INITIAL_USER_PROFILE,
  INITIAL_POWER_UPS,
  INITIAL_QUESTIONS,
  INITIAL_CATEGORIES,
} from "../data/initialData";
import {
  INITIAL_ANCIENT_COINS,
  INITIAL_PLAYER_VAULT_COINS,
  INITIAL_PLAYER_STORES,
  INITIAL_REAL_COIN_LISTINGS,
  INITIAL_MARKET_ORDERS,
  DEFAULT_STORE_CONFIG,
  INITIAL_SUBSCRIPTION_CARDS,
  INITIAL_POINTS_OF_SALE,
} from "../data/ancientCoinsData";

export const ADMIN_EMAIL = "salahbousbia82@gmail.com";

export function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

const STORAGE_KEYS = {
  PROFILE: "brain_game_user_profile_v1",
  ACCOUNTS: "brain_game_accounts_v1",
  CURRENT_USER_EMAIL: "brain_game_current_email_v1",
  QUESTIONS: "brain_game_questions_v2",
  CATEGORIES: "brain_game_categories_v2",
  POWERUPS: "brain_game_powerups_v1",
  LEVELS: "brain_game_levels_v1",
  SCORE_HISTORY: "brain_game_score_history_v1",
  ANNOUNCEMENTS: "brain_game_announcements_v1",
  ANCIENT_COINS_MARKET: "brain_game_ancient_coins_market_v1",
  PLAYER_COIN_VAULT: "brain_game_player_coin_vault_v1",
  COIN_APPRAISALS: "brain_game_coin_appraisals_v1",
  PLAYER_STORES: "brain_game_player_stores_v1",
  REAL_COIN_LISTINGS: "brain_game_real_coin_listings_v1",
  MARKET_ORDERS: "brain_game_market_orders_v1",
  STORE_SUBSCRIPTION_CONFIG: "brain_game_store_subscription_config_v1",
  SUBSCRIPTION_CARDS: "brain_game_subscription_cards_v1",
  POINTS_OF_SALE: "brain_game_points_of_sale_v1",
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

// --- Ancient Coins Market & Player Vault Storage ---

export function getStoredAncientCoinsMarket(): AncientCoin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANCIENT_COINS_MARKET);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_ANCIENT_COINS;
}

export function saveAncientCoinsMarket(coins: AncientCoin[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ANCIENT_COINS_MARKET, JSON.stringify(coins));
  } catch (e) {}
}

export function getStoredPlayerCoinVault(): PlayerOwnedCoin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER_COIN_VAULT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return INITIAL_PLAYER_VAULT_COINS;
}

export function savePlayerCoinVault(vault: PlayerOwnedCoin[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_COIN_VAULT, JSON.stringify(vault));
  } catch (e) {}
}

export function getStoredCoinAppraisals(): CoinAppraisalRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COIN_APPRAISALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [
    {
      id: "appraisal-sample-1",
      title: "فلس أموي نحاسي نادر - طبريا",
      era: "أموي مبكر",
      rulerOrEmpire: "الخلافة الأموية",
      metal: "برونز / نحاس أثري",
      estimatedYear: "80 هـ - 100 هـ",
      mintLocation: "طبريا (بلاد الشام)",
      rarity: "نادر",
      rarityScore: 82,
      conditionGrade: "VF-35 (جيد جداً)",
      estimatedValueCoins: 1100,
      estimatedValueUsd: "$1,200 - $2,500",
      authenticityConfidence: 97,
      inscriptionsAnalysis: "طراز شجرة النخيل مع شهادة التوحيد بخط كوفي بدائي أصيل",
      historicalContext: "مسكوك محلي من أندر الفلوس النحاسية المعربة في بداية الإصلاح النقدي.",
      appraisedAt: "2025-04-12",
    },
  ];
}

export function saveCoinAppraisals(records: CoinAppraisalRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COIN_APPRAISALS, JSON.stringify(records));
  } catch (e) {}
}

// Player Stores
export function getStoredPlayerStores(): PlayerStore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER_STORES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_PLAYER_STORES;
}

export function savePlayerStores(stores: PlayerStore[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_STORES, JSON.stringify(stores));
  } catch (e) {}
}

// Real Coin Listings
export function getStoredRealCoinListings(): RealCoinListing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REAL_COIN_LISTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_REAL_COIN_LISTINGS;
}

export function saveRealCoinListings(listings: RealCoinListing[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REAL_COIN_LISTINGS, JSON.stringify(listings));
  } catch (e) {}
}

// Market Orders
export function getStoredMarketOrders(): MarketOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MARKET_ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return INITIAL_MARKET_ORDERS;
}

export function saveMarketOrders(orders: MarketOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MARKET_ORDERS, JSON.stringify(orders));
  } catch (e) {}
}

// --- Store Subscription Configuration (Admin Managed) ---
export function getStoreSubscriptionConfig(): StoreSubscriptionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STORE_SUBSCRIPTION_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STORE_CONFIG, ...parsed };
    }
  } catch (e) {}
  return DEFAULT_STORE_CONFIG;
}

export function saveStoreSubscriptionConfig(config: StoreSubscriptionConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STORE_SUBSCRIPTION_CONFIG, JSON.stringify(config));
  } catch (e) {}
}

// --- Store Subscription Cards (كروت الاشتراك) ---
export function getStoredSubscriptionCards(): StoreSubscriptionCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_CARDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return INITIAL_SUBSCRIPTION_CARDS;
}

export function saveSubscriptionCards(cards: StoreSubscriptionCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_CARDS, JSON.stringify(cards));
  } catch (e) {}
}

/**
 * Generate a random alphanumeric unique card code in the format VIP-M-XXXX-XXXX or VIP-Y-XXXX-XXXX
 */
export function generateCardCode(type: "monthly" | "yearly"): string {
  const prefix = type === "monthly" ? "VIP-M" : "VIP-Y";
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${part1}-${part2}`;
}

export function generateSubscriptionCardsBatch(
  planType: "monthly" | "yearly",
  count: number,
  createdBy: string,
  priceOverrideDzd?: number,
  notes?: string
): StoreSubscriptionCard[] {
  const existing = getStoredSubscriptionCards();
  const config = getStoreSubscriptionConfig();
  const newCards: StoreSubscriptionCard[] = [];
  const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;

  const defaultPrice = planType === "monthly" ? config.monthlyPriceDzd : config.yearlyPriceDzd;
  const durationDays = planType === "monthly" ? 30 : 365;

  for (let i = 0; i < count; i++) {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const serial = `SN-DZ-${planType === "monthly" ? "M" : "Y"}${new Date().getFullYear()}-${randomHex}${i + 1}`;
    
    // Ensure unique code
    let code = generateCardCode(planType);
    while (existing.some((c) => c.id === code) || newCards.some((c) => c.id === code)) {
      code = generateCardCode(planType);
    }

    const card: StoreSubscriptionCard = {
      id: code,
      planType,
      durationDays,
      priceDzd: priceOverrideDzd || defaultPrice,
      serialNumber: serial,
      isUsed: false,
      createdAt: new Date().toISOString().split("T")[0],
      createdBy,
      batchId,
      notes: notes || (planType === "monthly" ? "بطاقة اشتراك متجر شهري" : "بطاقة اشتراك متجر سنوي VIP"),
    };

    newCards.push(card);
  }

  const updated = [...newCards, ...existing];
  saveSubscriptionCards(updated);
  return newCards;
}

/**
 * Redeem a subscription card to activate or extend a player store subscription
 */
export function redeemSubscriptionCard(
  cardCode: string,
  userEmail: string,
  storeId?: string
): {
  success: boolean;
  message: string;
  card?: StoreSubscriptionCard;
  updatedStore?: PlayerStore;
} {
  const cleanCode = cardCode.trim().toUpperCase();
  const cards = getStoredSubscriptionCards();
  const cardIndex = cards.findIndex((c) => c.id.toUpperCase() === cleanCode);

  if (cardIndex === -1) {
    return {
      success: false,
      message: "رمز بطاقة الاشتراك غير صالح أو غير موجود. يرجى التحقق من الرقم.",
    };
  }

  const card = cards[cardIndex];
  if (card.isUsed) {
    return {
      success: false,
      message: `هذه البطاقة تم استخدامها مسبقاً بتاريخ ${card.usedAt || ""} بواسطة ${card.usedByStoreName || card.usedByEmail || ""}.`,
    };
  }

  const stores = getStoredPlayerStores();
  let store = stores.find((s) => s.ownerEmail.toLowerCase() === userEmail.toLowerCase() || (storeId && s.id === storeId));

  const now = new Date();
  const nowStr = now.toISOString().split("T")[0];

  // Calculate new subscription end date
  let newEndDate = new Date();
  if (store && store.subscriptionEndDate && new Date(store.subscriptionEndDate) > now) {
    // Extend existing active subscription
    newEndDate = new Date(store.subscriptionEndDate);
  }
  newEndDate.setDate(newEndDate.getDate() + card.durationDays);
  const newEndDateStr = newEndDate.toISOString().split("T")[0];

  if (!store) {
    // If player doesn't have a store yet, create default store
    store = {
      id: "store-" + Date.now(),
      ownerEmail: userEmail,
      ownerName: userEmail.split("@")[0],
      storeName: `متجر ${userEmail.split("@")[0]} للمسكوكات 🪙`,
      description: "متجر موثق لبيع وشراء العملات والمسكوكات التاريخية الجزائرية والعالمية.",
      wilayaCity: "الجزائر (16)",
      phoneWhatsApp: "+213 555 00 00 00",
      rating: 5.0,
      totalReviews: 0,
      totalSales: 0,
      isVerified: true,
      bannerGradient: "from-amber-600 via-yellow-600 to-amber-700",
      createdAt: nowStr,
      isActive: true,
      subscriptionPlan: card.planType,
      subscriptionStartDate: nowStr,
      subscriptionEndDate: newEndDateStr,
      subscriptionCardCode: card.id,
      isSubscriptionActive: true,
    };
    stores.unshift(store);
  } else {
    store.subscriptionPlan = card.planType;
    store.subscriptionStartDate = store.subscriptionStartDate || nowStr;
    store.subscriptionEndDate = newEndDateStr;
    store.subscriptionCardCode = card.id;
    store.isSubscriptionActive = true;
    store.isActive = true;
  }

  // Mark card as used
  card.isUsed = true;
  card.usedByEmail = userEmail;
  card.usedByStoreName = store.storeName;
  card.usedAt = nowStr;

  cards[cardIndex] = card;
  saveSubscriptionCards(cards);
  savePlayerStores(stores);

  return {
    success: true,
    message: `تهانينا! تم تفعيل اشتراك ${card.planType === "monthly" ? "الشهري (30 يوماً)" : "السنوي VIP (365 يوماً)"} بنجاح حتى تاريخ ${newEndDateStr}.`,
    card,
    updatedStore: store,
  };
}

// --- Authorized Points of Sale (نقاط البيع المعتمدة) ---
export function getStoredPointsOfSale(): AuthorizedPointOfSale[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POINTS_OF_SALE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_POINTS_OF_SALE;
}

export function savePointsOfSale(points: AuthorizedPointOfSale[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POINTS_OF_SALE, JSON.stringify(points));
  } catch (e) {}
}

/**
 * Check store trial and subscription status
 */
export function checkStoreTrialAndSubscription(
  store: PlayerStore | undefined,
  config: StoreSubscriptionConfig
): {
  isAllowedToSell: boolean;
  status: StoreSubscriptionPlan;
  daysRemaining: number;
  label: string;
  isTrial: boolean;
  isExpired: boolean;
  badgeClass: string;
} {
  // If admin, always unrestricted
  if (store && isAdminEmail(store.ownerEmail)) {
    return {
      isAllowedToSell: true,
      status: "yearly",
      daysRemaining: 9999,
      label: "اشتراك دائم ومجاني (حساب الإدارة 👑)",
      isTrial: false,
      isExpired: false,
      badgeClass: "bg-amber-500 text-slate-950 border-amber-400 font-bold",
    };
  }

  if (!store) {
    return {
      isAllowedToSell: false,
      status: "expired",
      daysRemaining: 0,
      label: "لا يوجد متجر مفعل",
      isTrial: false,
      isExpired: true,
      badgeClass: "bg-slate-800 text-slate-400 border-slate-700",
    };
  }

  const now = new Date().getTime();

  // 1. Check paid active subscription
  if (store.subscriptionEndDate) {
    const subEnd = new Date(store.subscriptionEndDate).getTime();
    if (subEnd > now) {
      const days = Math.ceil((subEnd - now) / (1000 * 60 * 60 * 24));
      const planName = store.subscriptionPlan === "yearly" ? "سنوي VIP 💎" : "شهري ⚡";
      return {
        isAllowedToSell: true,
        status: store.subscriptionPlan || "monthly",
        daysRemaining: days,
        label: `اشتراك ${planName} (متبقي ${days} يوم)`,
        isTrial: false,
        isExpired: false,
        badgeClass: store.subscriptionPlan === "yearly" ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black" : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold",
      };
    }
  }

  // 2. Check trial period
  const createdTime = store.createdAt ? new Date(store.createdAt).getTime() : now;
  const trialDaysAllowed = config.freeTrialDays || 14;
  const trialEndTime = createdTime + (trialDaysAllowed * 24 * 60 * 60 * 1000);

  if (now < trialEndTime) {
    const daysLeft = Math.max(1, Math.ceil((trialEndTime - now) / (1000 * 60 * 60 * 24)));
    return {
      isAllowedToSell: true,
      status: "trial",
      daysRemaining: daysLeft,
      label: `فترة تجريبية مجانية (${daysLeft} يوم متبقي)`,
      isTrial: true,
      isExpired: false,
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold animate-pulse",
    };
  }

  // 3. Expired
  return {
    isAllowedToSell: false,
    status: "expired",
    daysRemaining: 0,
    label: "انتهت الفترة التجريبية (يلزم بطاقة اشتراك)",
    isTrial: false,
    isExpired: true,
    badgeClass: "bg-red-500/20 text-red-300 border-red-500/40 font-bold",
  };
}

