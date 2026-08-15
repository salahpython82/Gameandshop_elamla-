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
  | "vintage_coins"
  | "ai_generator"
  | "analytics"
  | "leaderboard"
  | "store"
  | "admin";

export type CoinEra =
  | "أموي"
  | "عباسي"
  | "نوميدي وشمال إفريقيا"
  | "أندلسي ومرابطي"
  | "فاطمي وأيوبي"
  | "عثماني"
  | "روماني"
  | "بيزنطي وإغريقي";

export type CoinMetal = "ذهب" | "فضة" | "برونز" | "نحاس" | "إلكتروم";

export type CoinRarity = "شائع" | "نادر" | "نادر جداً" | "فريد ومتحفي";

export interface AncientCoin {
  id: string;
  name: string;
  era: CoinEra;
  ruler: string;
  year: string;
  mintPlace: string;
  metal: CoinMetal;
  purity: string;
  weightGrams: number;
  diameterMm: number;
  rarity: CoinRarity;
  rarityScore: number; // 1 to 100
  grade: string; // e.g. "MS-65 سك ممتاز"
  priceCoins: number; // Price in game coins
  realEstimatedUsd: string;
  obverseText: string; // نصوص الوجه
  reverseText: string; // نصوص الظهر
  description: string;
  historicalSignificance: string;
  accentColor: string; // gradient / metal color
  badgeIcon: string;
  isCertified: boolean;
  stockCount: number;
}

export interface PlayerOwnedCoin {
  inventoryId: string;
  coin: AncientCoin;
  acquiredAt: string;
  purchasePrice: number;
  customNotes?: string;
  isExhibitedInMuseum?: boolean;
}

export interface CoinAppraisalRecord {
  id: string;
  title: string;
  era: string;
  rulerOrEmpire: string;
  metal: string;
  estimatedYear: string;
  mintLocation: string;
  rarity: CoinRarity;
  rarityScore: number;
  conditionGrade: string;
  estimatedValueCoins: number;
  estimatedValueUsd: string;
  authenticityConfidence: number; // e.g. 98%
  inscriptionsAnalysis: string;
  historicalContext: string;
  appraisedAt: string;
  coinObj?: AncientCoin;
}

export type RealPaymentMethod = "cod" | "baridimob" | "mastercard";

export type StoreSubscriptionPlan = "trial" | "monthly" | "yearly" | "expired";

export interface StoreSubscriptionConfig {
  freeTrialDays: number; // عدد أيام التجربة المجانية المحددة من طرف المدير (افتراضيا 14 يوماً)
  monthlyPriceDzd: number; // سعر الاشتراك الشهري بالدينار الجزائري (افتراضيا 1500 د.ج)
  yearlyPriceDzd: number; // سعر الاشتراك السنوي بالدينار الجزائري (افتراضيا 12000 د.ج)
  trialWelcomeBonusCoins?: number;
  allowTrialRenewal: boolean;
}

export interface StoreSubscriptionCard {
  id: string; // رمز البطاقة الفريد (مثل: VIP-M-8921-4320 أو VIP-Y-7734-1192)
  planType: "monthly" | "yearly" | "trial_extension";
  durationDays: number; // 30 يوما للشهري و 365 يوما للسنوي
  priceDzd: number;
  serialNumber: string; // الرقم التسلسلي للبطاقة
  isUsed: boolean;
  usedByEmail?: string;
  usedByStoreName?: string;
  usedAt?: string;
  createdAt: string;
  createdBy: string;
  batchId?: string;
  notes?: string;
}

export interface AuthorizedPointOfSale {
  id: string;
  name: string; // اسم نقطة البيع أو المحل المعتمد
  ownerOrManager: string;
  wilayaNumber: number;
  wilayaName: string; // اسم الولاية (مثال: الجزائر العاصمة 16، وهران 31، قسنطينة 25)
  address: string;
  phone: string;
  whatsappPhone?: string;
  workingHours: string;
  availableCards: ("monthly" | "yearly")[];
  isOfficialPartner: boolean;
  rating?: number;
  googleMapsUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface PlayerStore {
  id: string;
  ownerEmail: string;
  ownerName: string;
  storeName: string;
  description: string;
  wilayaCity: string;
  phoneWhatsApp: string;
  baridiMobRip?: string;
  rating: number; // e.g. 4.9
  totalReviews: number;
  totalSales: number;
  isVerified: boolean;
  bannerGradient: string;
  createdAt: string;
  isActive: boolean;
  // Subscription and Trial tracking
  subscriptionPlan?: StoreSubscriptionPlan;
  trialStartDate?: string;
  trialEndDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  subscriptionCardCode?: string;
  isSubscriptionActive?: boolean;
}

export interface RealCoinListing {
  id: string;
  storeId: string;
  storeName: string;
  sellerEmail: string;
  sellerPhone: string;
  title: string;
  era: CoinEra | string;
  metal: CoinMetal | string;
  year: string;
  weightGrams: number;
  diameterMm: number;
  conditionGrade: string;
  certificateNumber: string;
  realPriceDzd: number; // Algerian Dinar price
  realPriceUsd?: number;
  supportedPayments: RealPaymentMethod[];
  description: string;
  obverseNotes: string;
  reverseNotes: string;
  obverseImageUrl?: string; // صورة الوجه الأمامي
  reverseImageUrl?: string; // صورة الوجه الخلفي
  cityLocation: string;
  badgeIcon: string;
  isAvailable: boolean;
  createdAt: string;
  viewsCount: number;
}

export const PLATFORM_TRANSACTION_FEE_DZD = 100; // قيمة الاقتطاع الثابتة لمالك التطبيق لكل عملية بيع وشراء (100 د.ج)

export interface MarketOrder {
  id: string;
  listingId: string;
  listingTitle: string;
  storeName: string;
  sellerEmail: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddressWilaya: string;
  priceDzd: number; // المبلغ الإجمالي المدفوع للقطعة
  platformFeeDzd: number; // قيمة الاقتطاع المخصصة لمالك التطبيق (100 د.ج)
  sellerPayoutDzd: number; // المبلغ الصافي المستحق للبائع بعد اقتطاع رسم المالك
  paymentMethod: RealPaymentMethod;
  paymentStatus: "pending" | "confirmed_paid" | "cod_on_delivery";
  orderStatus: "قيد المراجعة" | "تم الدفع وتجهيز الطرد" | "تم الشحن مع شركة التوصيل" | "تم الاستلام بنجاح" | "ملغي";
  trackingNumber: string;
  createdAt: string;
  baridiMobTransactionRef?: string;
  cardLast4?: string;
  notes?: string;
}

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
