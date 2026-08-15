import React, { useState } from "react";
import {
  UserProfile,
  Question,
  QuizCategory,
  AuthAccount,
  Difficulty,
  MarketOrder,
  PLATFORM_TRANSACTION_FEE_DZD,
} from "../types";
import {
  ADMIN_EMAIL,
  isAdminEmail,
  getStoredQuestions,
  saveQuestions,
  getStoredCategories,
  saveCategories,
  getStoredAccounts,
  saveAccounts,
  getStoredAnnouncements,
  saveAnnouncements,
  Announcement,
  getStoredMarketOrders,
  saveMarketOrders,
} from "../utils/storage";
import { soundFx } from "../utils/sound";
import { generateQuizQuestions } from "../utils/aiGenerator";
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Save,
  Search,
  Users,
  HelpCircle,
  FolderTree,
  Bell,
  Coins,
  Star,
  Zap,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  X,
  CheckCircle,
  Crown,
  Lock,
  Eye,
  Gift,
  Award,
  AlertTriangle,
  Bot,
  Wand2,
  Sparkles,
  Tag,
  Play,
  ShoppingBag,
  DollarSign,
  Package,
  Phone,
  Truck,
  CreditCard,
} from "lucide-react";

interface AdminDashboardViewProps {
  currentUser: UserProfile;
  onUpdateCurrentUser: (user: UserProfile) => void;
  onNavigateHome: () => void;
  onStartGeneratedQuiz?: (questions: Question[], title: string) => void;
}

type AdminTab = "questions" | "ai_generator" | "market_fees" | "users" | "categories" | "announcements" | "stats" | "backup";

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onUpdateCurrentUser,
  onNavigateHome,
  onStartGeneratedQuiz,
}) => {
  const isAdmin = isAdminEmail(currentUser.email);

  const [activeTab, setActiveTab] = useState<AdminTab>("questions");
  const [questions, setQuestions] = useState<Question[]>(getStoredQuestions());
  const [categories, setCategories] = useState<QuizCategory[]>(getStoredCategories());
  const [accounts, setAccounts] = useState<AuthAccount[]>(getStoredAccounts());
  const [announcements, setAnnouncements] = useState<Announcement[]>(getStoredAnnouncements());
  const [marketOrders, setMarketOrders] = useState<MarketOrder[]>(getStoredMarketOrders());

  // Market Orders Filters & Search for Admin
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>("all");

  // Search & Filter for Questions
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // AI Question Generator State (Admin Only)
  const [aiTopic, setAiTopic] = useState("");
  const [aiCategoryId, setAiCategoryId] = useState<string>(categories[0]?.id || "riddles");
  const [aiLevelNumber, setAiLevelNumber] = useState<number>(1);
  const [aiDifficulty, setAiDifficulty] = useState<string>("متوسط");
  const [aiCount, setAiCount] = useState<number>(5);
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<Question[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const ADMIN_AI_TOPICS = [
    "تاريخ الحضارة الإسلامية والأندلس",
    "ألغاز وفوازير ذكاء صعبة ومنطقية",
    "عجائب الكون والفضاء والفيزياء",
    "الرياضة وبطولات كرة القدم العربية والعالمية",
    "اختراعات وتكنولوجيا المستقبل والذكاء الاصطناعي",
    "أدب وشعر ومعاني اللغة العربية",
    "جغرافيا وعواصم ومعالم طبيعية",
    "علوم الأحياء وعجائب الكائنات الحية",
  ];

  // Add / Edit Question Modal State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionFormData, setQuestionFormData] = useState<Partial<Question>>({
    categoryId: "riddles",
    levelNumber: 1,
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    hint: "",
    explanation: "",
    difficulty: "سهل",
  });

  // New Announcement Form State
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [announcementCoins, setAnnouncementCoins] = useState(250);

  // Success / Alert Notice
  const [statusNotice, setStatusNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showNotice = (text: string, type: "success" | "error" = "success") => {
    setStatusNotice({ text, type });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // If user is not admin, deny access immediately
  if (!isAdmin) {
    return (
      <div className="py-12 px-4 max-w-lg mx-auto text-center dir-rtl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white mb-2">منطقة محمية خاصة بمدير النظام</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          عذراً، لوحة التحكم مخصصة للمدير (
          <span className="text-amber-400 font-mono">{ADMIN_EMAIL}</span>) فقط. حسابك الحالي مسجل كلاعب.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-transform active:scale-95"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  // --- Questions Actions ---
  const handleOpenAddQuestion = () => {
    setIsAddingQuestion(true);
    setEditingQuestion(null);
    setQuestionFormData({
      id: "q-custom-" + Date.now(),
      categoryId: categories[0]?.id || "riddles",
      levelNumber: 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      hint: "",
      explanation: "",
      difficulty: "سهل",
    });
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setIsAddingQuestion(false);
    setQuestionFormData({ ...q, options: [...q.options] });
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionFormData.question?.trim()) {
      showNotice("يرجى إدخال نص السؤال", "error");
      return;
    }
    if (!questionFormData.options || questionFormData.options.some((opt) => !opt?.trim())) {
      showNotice("يرجى ملء جميع الخيارات الأربعة", "error");
      return;
    }

    soundFx.playCorrect();
    const updated = [...questions];
    if (editingQuestion) {
      const idx = updated.findIndex((item) => item.id === editingQuestion.id);
      if (idx !== -1) {
        updated[idx] = questionFormData as Question;
      }
      showNotice("تم تحديث السؤال بنجاح!");
    } else {
      const newQ: Question = {
        ...(questionFormData as Question),
        id: "q-custom-" + Date.now(),
      };
      updated.unshift(newQ);
      showNotice("تمت إضافة السؤال الجديد إلى بنك الأسئلة!");
    }

    setQuestions(updated);
    saveQuestions(updated);
    setIsAddingQuestion(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السؤال نهائياً؟")) {
      soundFx.playWrong();
      const updated = questions.filter((q) => q.id !== id);
      setQuestions(updated);
      saveQuestions(updated);
      showNotice("تم حذف السؤال بنجاح");
    }
  };

  // --- AI Generator Actions (Admin Exclusive) ---
  const handleAdminGenerateAi = async () => {
    if (!aiTopic.trim()) {
      setAiError("الرجاء كتابة أو اختيار موضوع المسابقة أولاً");
      return;
    }
    setAiError(null);
    setAiIsLoading(true);
    soundFx.playCoin();

    try {
      const generated = await generateQuizQuestions(aiTopic, aiCount);
      if (generated && generated.length > 0) {
        const formatted: Question[] = generated.map((q, idx) => ({
          ...q,
          id: `q-ai-${Date.now()}-${idx}`,
          categoryId: aiCategoryId,
          levelNumber: aiLevelNumber,
          difficulty: aiDifficulty as Difficulty,
        }));
        setAiGeneratedQuestions(formatted);
        soundFx.playVictory();
        showNotice(`تم توليد ${formatted.length} سؤال بنجاح بواسطة الذكاء الاصطناعي!`);
      } else {
        throw new Error("لم يتم إرجاع أي أسئلة من النموذج");
      }
    } catch (err: any) {
      console.error(err);
      setAiError("حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي Gemini. يرجى المحاولة مجدداً.");
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleSaveAllAiQuestionsToBank = () => {
    if (aiGeneratedQuestions.length === 0) return;
    soundFx.playVictory();
    const updated = [...aiGeneratedQuestions, ...questions];
    setQuestions(updated);
    saveQuestions(updated);
    showNotice(`تم حفظ ${aiGeneratedQuestions.length} سؤال في بنك الأسئلة للمستوى ${aiLevelNumber}!`);
    setAiGeneratedQuestions([]);
  };

  const handlePlayAiQuiz = () => {
    if (aiGeneratedQuestions.length === 0) return;
    soundFx.playVictory();
    onStartGeneratedQuiz?.(aiGeneratedQuestions, `اختبار المدير AI: ${aiTopic || "تحدي ذكي"}`);
  };

  // --- Users Actions ---
  const handleAddCoinsToUser = (accountEmail: string, amount: number) => {
    soundFx.playCoin();
    const updated = accounts.map((acc) => {
      if (acc.email.toLowerCase() === accountEmail.toLowerCase()) {
        const newCoins = (acc.coins || 0) + amount;
        return { ...acc, coins: newCoins };
      }
      return acc;
    });
    setAccounts(updated);
    saveAccounts(updated);

    // If current logged in user received coins
    if (currentUser.email?.toLowerCase() === accountEmail.toLowerCase()) {
      const newProfile = { ...currentUser, coins: currentUser.coins + amount };
      onUpdateCurrentUser(newProfile);
    }
    showNotice(`تم إضافة ${amount} عملة إلى الحساب ${accountEmail}`);
  };

  const handleToggleUserBan = (accountEmail: string) => {
    if (isAdminEmail(accountEmail)) {
      showNotice("لا يمكن حظر حساب المدير الأساسي!", "error");
      return;
    }
    soundFx.playClick();
    const updated = accounts.map((acc) => {
      if (acc.email.toLowerCase() === accountEmail.toLowerCase()) {
        return { ...acc, isBanned: !acc.isBanned };
      }
      return acc;
    });
    setAccounts(updated);
    saveAccounts(updated);
    showNotice("تم تحديث حالة المستخدم بنجاح");
  };

  // --- Announcement & Gift Action ---
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMsg.trim()) {
      showNotice("يرجى ملء عنوان التنبيه ونص الرسالة", "error");
      return;
    }

    soundFx.playCorrect();
    const newAnn: Announcement = {
      id: "ann-" + Date.now(),
      title: announcementTitle.trim(),
      message: announcementMsg.trim(),
      rewardCoins: Number(announcementCoins) || 0,
      date: new Date().toISOString().split("T")[0],
      sender: "المدير صلاح بوعصبية",
    };

    const updatedAnn = [newAnn, ...announcements];
    setAnnouncements(updatedAnn);
    saveAnnouncements(updatedAnn);

    // Grant gift to all accounts if rewardCoins > 0
    if (newAnn.rewardCoins && newAnn.rewardCoins > 0) {
      const updatedAccs = accounts.map((acc) => ({
        ...acc,
        coins: (acc.coins || 0) + newAnn.rewardCoins!,
      }));
      setAccounts(updatedAccs);
      saveAccounts(updatedAccs);

      // update current user too
      onUpdateCurrentUser({
        ...currentUser,
        coins: currentUser.coins + newAnn.rewardCoins,
      });
    }

    setAnnouncementTitle("");
    setAnnouncementMsg("");
    showNotice("تم بث الإشعار وتوزيع الهدية لجميع اللاعبين بنجاح!");
  };

  // --- Export / Import ---
  const handleExportData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      admin: ADMIN_EMAIL,
      questions,
      categories,
      accounts,
      announcements,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz_brain_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showNotice("تم تصدير النسخة الاحتياطية بنجاح!");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          saveQuestions(data.questions);
        }
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
          saveCategories(data.categories);
        }
        if (data.accounts && Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
          saveAccounts(data.accounts);
        }
        showNotice("تم استيراد البيانات وتحديث النظام بنجاح!");
      } catch (err) {
        showNotice("ملف النسخ الاحتياطي غير صالح", "error");
      }
    };
    reader.readAsText(file);
  };

  // --- Market Orders & Platform Fee Handlers (100 DZD per Order) ---
  const handleUpdateAdminOrderStatus = (orderId: string, newStatus: MarketOrder["orderStatus"]) => {
    soundFx.playClick();
    const updated = marketOrders.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    setMarketOrders(updated);
    saveMarketOrders(updated);
    showNotice(`تم تحديث حالة طلب السوق [${orderId}] إلى: ${newStatus}`);
  };

  const handleExportFeeReport = () => {
    const totalFees = marketOrders.length * PLATFORM_TRANSACTION_FEE_DZD;
    const totalVolume = marketOrders.reduce((acc, o) => acc + o.priceDzd, 0);
    const totalPayouts = marketOrders.reduce(
      (acc, o) => acc + (o.sellerPayoutDzd || Math.max(0, o.priceDzd - PLATFORM_TRANSACTION_FEE_DZD)),
      0
    );

    const report = {
      reportTitle: "كشف حساب عمولات واقتطاعات منصة المسكوكات النقدية الحقيقية لمالك التطبيق",
      platformOwner: ADMIN_EMAIL,
      generatedAt: new Date().toISOString(),
      feePolicy: "اقتطاع 100 دينار جزائري (100 DZD) ثابتة لكل عملية بيع وشراء",
      summary: {
        totalOrdersCount: marketOrders.length,
        platformFeePerOrderDzd: PLATFORM_TRANSACTION_FEE_DZD,
        totalOwnerFeesEarnedDzd: totalFees,
        totalMarketVolumeDzd: totalVolume,
        totalSellerNetPayoutsDzd: totalPayouts,
      },
      ordersLedger: marketOrders.map((o) => ({
        orderId: o.id,
        listingTitle: o.listingTitle,
        storeName: o.storeName,
        sellerEmail: o.sellerEmail,
        buyerName: o.buyerName,
        buyerPhone: o.buyerPhone,
        buyerWilaya: o.buyerAddressWilaya,
        grossPriceDzd: o.priceDzd,
        appOwnerDeductionDzd: o.platformFeeDzd || PLATFORM_TRANSACTION_FEE_DZD,
        sellerNetPayoutDzd: o.sellerPayoutDzd || Math.max(0, o.priceDzd - PLATFORM_TRANSACTION_FEE_DZD),
        paymentMethod: o.paymentMethod,
        orderStatus: o.orderStatus,
        trackingNumber: o.trackingNumber,
        createdAt: o.createdAt,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `app_owner_fee_statement_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showNotice("تم تنزيل كشف حساب عمولات مالك التطبيق بنجاح! 📑💰");
  };

  // Filtered Market Orders
  const filteredMarketOrders = marketOrders.filter((order) => {
    const matchesSearch =
      !orderSearchQuery ||
      order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.listingTitle.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.storeName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.buyerAddressWilaya.toLowerCase().includes(orderSearchQuery.toLowerCase());

    const matchesStatus = orderStatusFilter === "all" || order.orderStatus === orderStatusFilter;
    const matchesPayment = orderPaymentFilter === "all" || order.paymentMethod === orderPaymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Key Financial Totals
  const totalOwnerFeesCollected = marketOrders.length * PLATFORM_TRANSACTION_FEE_DZD;
  const totalMarketVolume = marketOrders.reduce((acc, o) => acc + o.priceDzd, 0);
  const totalSellerNetPayouts = marketOrders.reduce(
    (acc, o) => acc + (o.sellerPayoutDzd || Math.max(0, o.priceDzd - PLATFORM_TRANSACTION_FEE_DZD)),
    0
  );

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesCategory =
      selectedCategoryFilter === "all" || q.categoryId === selectedCategoryFilter;
    const matchesSearch =
      !searchQuery ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.explanation?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 dir-rtl text-slate-100 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-yellow-950/80 border-2 border-amber-500/50 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-3xl text-slate-950 shadow-lg shadow-amber-500/30">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-amber-200">
                  لوحة تحكم المدير العام
                </h1>
                <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                  صلاحيات كاملة
                </span>
              </div>
              <p className="text-xs text-amber-300/80 font-mono mt-0.5">
                المدير: {ADMIN_EMAIL}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              id="admin-export-backup-btn"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-xl text-slate-200 transition-colors"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>نسخة احتياطية</span>
            </button>
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold rounded-xl text-amber-300 transition-colors"
            >
              <span>معاينة كلاعب</span>
            </button>
          </div>
        </div>

        {/* Global Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-amber-500/20">
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-amber-500/20 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">إجمالي الأسئلة</div>
              <div className="text-lg font-black text-white">{questions.length}</div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-blue-500/20 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">اللاعبين المسجلين</div>
              <div className="text-lg font-black text-white">{accounts.length}</div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">التصنيفات المتاحة</div>
              <div className="text-lg font-black text-white">{categories.length}</div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-yellow-500/20 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">رصيد المدير</div>
              <div className="text-lg font-black text-yellow-300">
                {currentUser.coins.toLocaleString("ar-EG")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Toast */}
      {statusNotice && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-2 font-bold text-sm border shadow-lg animate-bounce ${
            statusNotice.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/60 text-rose-200"
          }`}
        >
          {statusNotice.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{statusNotice.text}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "questions" as AdminTab, label: "بنك الأسئلة", icon: HelpCircle, count: questions.length },
          { id: "ai_generator" as AdminTab, label: "مولد AI الذكي", icon: Bot, isSpecialAi: true },
          { id: "market_fees" as AdminTab, label: "خزينة الاقتطاعات (100 د.ج)", icon: DollarSign, count: marketOrders.length },
          { id: "users" as AdminTab, label: "إدارة اللاعبين", icon: Users, count: accounts.length },
          { id: "categories" as AdminTab, label: "التصنيفات والمستويات", icon: FolderTree, count: categories.length },
          { id: "announcements" as AdminTab, label: "التنبيهات والهدايا", icon: Bell, count: announcements.length },
          { id: "stats" as AdminTab, label: "الإحصائيات والنشاط", icon: TrendingUp },
          { id: "backup" as AdminTab, label: "النسخ الاحتياطي", icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isSpecial = (tab as any).isSpecialAi;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? isSpecial
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105 font-black"
                    : "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                  : isSpecial
                  ? "bg-emerald-950/40 text-emerald-300 hover:text-white hover:bg-emerald-900/60 border border-emerald-500/30"
                  : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isSpecial && !isActive ? "text-emerald-400" : ""}`} />
              <span>{tab.label}</span>
              {isSpecial ? (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                  Gemini
                </span>
              ) : tab.count !== undefined ? (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-slate-950 text-amber-300 font-black" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* TAB 1: QUESTIONS BANK */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Category Filter, Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="ابحث في الأسئلة أو الشرح..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">جميع التصنيفات ({questions.length})</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({questions.filter((q) => q.categoryId === cat.id).length})
                  </option>
                ))}
              </select>
            </div>

            <button
              id="admin-add-question-btn"
              onClick={handleOpenAddQuestion}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سؤال جديد</span>
            </button>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 text-sm">
                لا توجد أسئلة تطابق معايير البحث.
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const categoryObj = categories.find((c) => c.id === q.categoryId);
                return (
                  <div
                    key={q.id || idx}
                    className="p-4 bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-400">#{idx + 1}</span>
                          <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-700">
                            {categoryObj?.name || q.categoryId}
                          </span>
                          <span className="bg-amber-500/10 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                            مستوى {q.levelNumber || 1}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            الصعوبة: {q.difficulty || "متوسط"}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                          {q.question}
                        </h3>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleOpenEditQuestion(q)}
                          className="p-2 text-slate-300 hover:text-amber-400 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                          title="تعديل السؤال"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 rounded-xl transition-colors"
                          title="حذف السؤال"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                            optIdx === q.correctAnswer
                              ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-bold"
                              : "bg-slate-800/60 border-slate-700/50 text-slate-300"
                          }`}
                        >
                          <span>{opt}</span>
                          {optIdx === q.correctAnswer && (
                            <span className="text-[10px] text-emerald-400 font-black bg-emerald-500/20 px-1.5 py-0.2 rounded">
                              ✓ الإجابة الصحيحة
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Hint / Explanation */}
                    {(q.explanation || q.hint) && (
                      <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 space-y-0.5">
                        {q.hint && (
                          <p>
                            <strong className="text-amber-400">تلميح:</strong> {q.hint}
                          </p>
                        )}
                        {q.explanation && (
                          <p>
                            <strong className="text-cyan-400">الشرح:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB: AI QUESTION GENERATOR (ADMIN ONLY) */}
      {activeTab === "ai_generator" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/80 rounded-3xl border-2 border-emerald-500/40 shadow-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
                  <Bot className="w-7 h-7 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-emerald-200 flex items-center gap-2">
                    <span>مولد الأسئلة بالذكاء الاصطناعي (Gemini AI)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                      صلاحية المدير 👑
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    توليد دفعات من الأسئلة والألغاز وحفظها مباشرة في مستويات اللعبة وبنك الأسئلة للجميع.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Generator Control Form */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            {/* Topic Input */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>موضوع المسابقة أو المجال المطلوب توليد الأسئلة فيه:</span>
              </label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="مثال: أسئلة في تاريخ الأندلس، ألغاز منطقية ورياضية، فيزياء الفضاء، عواصم العالم..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-2xl p-3.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-colors"
              />
            </div>

            {/* Quick Topic Suggestions */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-2 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>مقترحات جاهزة للتوليد السريع:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {ADMIN_AI_TOPICS.map((tagText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setAiTopic(tagText);
                    }}
                    className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
                  >
                    {tagText}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Category, Target Level, Difficulty, Count */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  إدراج في التصنيف:
                </label>
                <select
                  value={aiCategoryId}
                  onChange={(e) => setAiCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  المستوى المستهدف:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={aiLevelNumber}
                  onChange={(e) => setAiLevelNumber(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  مستوى الصعوبة:
                </label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                >
                  <option value="سهل">سهل</option>
                  <option value="متوسط">متوسط</option>
                  <option value="صعب">صعب</option>
                  <option value="خبير">خبير</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  عدد الأسئلة:
                </label>
                <select
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                >
                  <option value={3}>3 أسئلة</option>
                  <option value={5}>5 أسئلة</option>
                  <option value={10}>10 أسئلة</option>
                  <option value={15}>15 سؤال</option>
                </select>
              </div>
            </div>

            {aiError && (
              <p className="text-xs text-rose-400 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                {aiError}
              </p>
            )}

            {/* Trigger Button */}
            <button
              onClick={handleAdminGenerateAi}
              disabled={aiIsLoading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {aiIsLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                  <span>جاري توليد الأسئلة بواسطة الذكاء الاصطناعي Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-slate-950" />
                  <span>توليد الأسئلة بواسطة الذكاء الاصطناعي الآن</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Questions Review & Insertion Area */}
          {aiGeneratedQuestions.length > 0 && (
            <div className="p-5 bg-slate-900 border-2 border-emerald-500/40 rounded-3xl space-y-4 animate-fade-in shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span>تم توليد ({aiGeneratedQuestions.length}) سؤال بنجاح</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    التصنيف المستهدف:{" "}
                    <span className="text-amber-300 font-bold">
                      {categories.find((c) => c.id === aiCategoryId)?.name || aiCategoryId}
                    </span>{" "}
                    | المستوى: <span className="text-cyan-300 font-bold">{aiLevelNumber}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSaveAllAiQuestionsToBank}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ جميع الأسئلة في بنك الأسئلة 📥</span>
                  </button>

                  <button
                    onClick={handlePlayAiQuiz}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>تجربة واختبار الأسئلة ▶️</span>
                  </button>

                  <button
                    onClick={() => setAiGeneratedQuestions([])}
                    className="p-2.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded-xl transition-colors"
                    title="مسح القائمة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Questions Cards */}
              <div className="space-y-3">
                {aiGeneratedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 bg-slate-950/80 border border-emerald-500/20 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400">سؤال #{idx + 1}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                            {q.difficulty}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm sm:text-base text-white">{q.question}</h5>
                      </div>

                      <button
                        onClick={() =>
                          setAiGeneratedQuestions((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="استبعاد هذا السؤال"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                            optIdx === q.correctAnswer
                              ? "bg-emerald-950/70 border-emerald-500/70 text-emerald-200 font-bold"
                              : "bg-slate-900 border-slate-800 text-slate-300"
                          }`}
                        >
                          <span>{opt}</span>
                          {optIdx === q.correctAnswer && (
                            <span className="text-[10px] text-emerald-400 font-black">✓ صحيح</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <span className="text-cyan-400 font-bold">الشرح:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: MARKET COINS TRANSACTION FEES & OWNER TREASURY (100 DZD) */}
      {activeTab === "market_fees" && (
        <div className="space-y-5 animate-fade-in">
          {/* Header Card */}
          <div className="p-5 bg-gradient-to-r from-amber-950/70 via-slate-900 to-yellow-950/60 rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg">
                  💰
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-200">
                    خزينة وعمولات مبيعات المسكوكات الحقيقية (100 د.ج/عملية)
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    اقتطاع نظامي ثابت قدره <strong className="text-amber-400 font-bold">100 د.ج</strong> عن كل عملية بيع وشراء حقيقية لفائدة مالك التطبيق (<span className="text-amber-300 font-mono">{ADMIN_EMAIL}</span>)
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportFeeReport}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>تصدير كشف حساب العمولات (JSON)</span>
              </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-amber-500/20">
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-amber-500/30">
                <div className="text-[11px] text-amber-400 font-bold">إجمالي دخل مالك التطبيق (100 د.ج)</div>
                <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1 font-mono">
                  {totalOwnerFeesCollected.toLocaleString()} <span className="text-xs text-slate-400">د.ج</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                  (100 د.ج × {marketOrders.length} معاملة)
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400">إجمالي حجم التداول بالدينار</div>
                <div className="text-xl sm:text-2xl font-black text-slate-100 mt-1 font-mono">
                  {totalMarketVolume.toLocaleString()} <span className="text-xs text-slate-400">د.ج</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">القيمة الإجمالية للمسكوكات</div>
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-emerald-500/30">
                <div className="text-[11px] text-emerald-400 font-bold">صافي مستحقات المتاجر</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 font-mono">
                  {totalSellerNetPayouts.toLocaleString()} <span className="text-xs text-slate-400">د.ج</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">بعد خصم رسم المنصة</div>
              </div>

              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-blue-500/30">
                <div className="text-[11px] text-blue-400 font-bold">عدد الصفقات المسجلة</div>
                <div className="text-xl sm:text-2xl font-black text-blue-300 mt-1 font-mono">
                  {marketOrders.length} <span className="text-xs text-slate-400">طلب</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">في جميع الولايات الجزائرية</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="ابحث برقم الطلب، اسم القطعة، المشتري، المتجر، أو الولاية..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">كل الحالات ({marketOrders.length})</option>
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="تم الدفع وتجهيز الطرد">تم الدفع وتجهيز الطرد</option>
                <option value="تم الشحن مع شركة التوصيل">تم الشحن مع شركة التوصيل</option>
                <option value="تم الاستلام بنجاح">تم الاستلام بنجاح</option>
                <option value="ملغي">ملغي</option>
              </select>

              <select
                value={orderPaymentFilter}
                onChange={(e) => setOrderPaymentFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">كل وسائل الدفع</option>
                <option value="baridimob">بريد موب (BaridiMob)</option>
                <option value="cod">الدفع عند الاستلام</option>
                <option value="mastercard">بطاقة بنكية</option>
              </select>
            </div>
          </div>

          {/* Orders / Transactions Ledger */}
          <div className="space-y-3">
            {filteredMarketOrders.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 text-sm">
                لا توجد معاملات مسكوكات تطابق البحث الحالي.
              </div>
            ) : (
              filteredMarketOrders.map((order) => {
                const ownerFee = order.platformFeeDzd || PLATFORM_TRANSACTION_FEE_DZD;
                const sellerNet = order.sellerPayoutDzd || Math.max(0, order.priceDzd - ownerFee);

                return (
                  <div
                    key={order.id}
                    className="p-4 bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {order.id}
                          </span>
                          <h4 className="font-bold text-sm text-slate-100">{order.listingTitle}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          المتجر: <strong className="text-amber-300">{order.storeName}</strong> • البائع: {order.sellerEmail} • التاريخ: {order.createdAt}
                        </p>
                      </div>

                      {/* Status Selector for Admin */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-[11px] text-slate-400">تحديث الحالة:</span>
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleUpdateAdminOrderStatus(
                              order.id,
                              e.target.value as MarketOrder["orderStatus"]
                            )
                          }
                          className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:outline-none ${
                            order.orderStatus === "تم الاستلام بنجاح"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                              : order.orderStatus === "تم الشحن مع شركة التوصيل"
                              ? "bg-blue-950 text-blue-300 border-blue-500/40"
                              : order.orderStatus === "تم الدفع وتجهيز الطرد"
                              ? "bg-amber-950 text-amber-300 border-amber-500/40"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          <option value="قيد المراجعة">قيد المراجعة</option>
                          <option value="تم الدفع وتجهيز الطرد">تم الدفع وتجهيز الطرد</option>
                          <option value="تم الشحن مع شركة التوصيل">تم الشحن مع شركة التوصيل</option>
                          <option value="تم الاستلام بنجاح">تم الاستلام بنجاح</option>
                          <option value="ملغي">ملغي</option>
                        </select>
                      </div>
                    </div>

                    {/* Financial Ledger Row - 100 DZD Owner Fee Highlight */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">سعر البيع الإجمالي:</span>
                        <span className="font-bold text-slate-100 font-mono">
                          {order.priceDzd.toLocaleString()} د.ج
                        </span>
                      </div>

                      <div className="p-2.5 bg-gradient-to-r from-amber-950/50 to-slate-900 rounded-xl border border-amber-500/40 flex items-center justify-between">
                        <span className="text-amber-300 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>اقتطاع مالك التطبيق:</span>
                        </span>
                        <span className="font-black text-amber-400 font-mono text-sm bg-amber-500/20 px-2 py-0.5 rounded">
                          +{ownerFee} د.ج
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                        <span className="text-emerald-400 font-medium">صافي استحقاق البائع:</span>
                        <span className="font-black text-emerald-400 font-mono">
                          {sellerNet.toLocaleString()} د.ج
                        </span>
                      </div>
                    </div>

                    {/* Buyer & Shipping Info */}
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300">
                      <div>
                        <span>المشتري: </span>
                        <strong className="text-slate-100">{order.buyerName}</strong>
                        <span className="mx-1 text-slate-500">•</span>
                        <span className="text-slate-400">الهاتف: {order.buyerPhone}</span>
                        <span className="mx-1 text-slate-500">•</span>
                        <span className="text-slate-400">العنوان: {order.buyerAddressWilaya}</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px] self-end sm:self-center">
                        <span className="text-slate-400">تتبع الشحن:</span>
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          {order.trackingNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USERS & PLAYERS */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">سجل اللاعبين والحسابات المسجلة</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                يمكن للمدير تعديل أرصدة العملات، إهداء المكافآت، أو حظر الحسابات المخالفة
              </p>
            </div>
            <div className="text-xs text-amber-400 font-bold">
              إجمالي: {accounts.length} حساب
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {accounts.map((acc) => {
              const isAccAdmin = isAdminEmail(acc.email);
              return (
                <div
                  key={acc.id || acc.email}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAccAdmin
                      ? "bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-500/40"
                      : acc.isBanned
                      ? "bg-rose-950/30 border-rose-500/40 opacity-75"
                      : "bg-slate-900/90 border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{acc.avatar || "👤"}</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-100">{acc.name}</span>
                          {isAccAdmin ? (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded">
                              المدير
                            </span>
                          ) : acc.isBanned ? (
                            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                              محظور
                            </span>
                          ) : (
                            <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-cyan-500/30">
                              لاعب
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{acc.email}</div>
                      </div>
                    </div>

                    <div className="text-left text-xs space-y-1">
                      <div className="flex items-center justify-end gap-1 text-yellow-400 font-bold">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{(acc.coins || 0).toLocaleString("ar-EG")}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-cyan-300 text-[11px]">
                        <Zap className="w-3 h-3" />
                        <span>IQ: {acc.iqScore || 100}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this user */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleAddCoinsToUser(acc.email, 1000)}
                      className="flex-1 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>+1000 عملة</span>
                    </button>

                    {!isAccAdmin && (
                      <button
                        onClick={() => handleToggleUserBan(acc.email)}
                        className={`py-1.5 px-3 text-xs font-bold rounded-xl border transition-colors ${
                          acc.isBanned
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                            : "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                        }`}
                      >
                        {acc.isBanned ? "إلغاء الحظر" : "حظر اللاعب"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES & LEVELS */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const catQuestions = questions.filter((q) => q.categoryId === cat.id);
              return (
                <div
                  key={cat.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{cat.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                    </div>
                    <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-xl border border-amber-500/30">
                      {catQuestions.length} سؤال
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-xl">
                    <span>عدد المستويات المقررة:</span>
                    <span className="font-bold text-amber-400">{cat.totalLevels} مستويات</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ANNOUNCEMENTS & GIFTS */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          {/* Send Broadcast Form */}
          <form
            onSubmit={handleSendAnnouncement}
            className="p-5 bg-slate-900 border border-amber-500/30 rounded-3xl space-y-4"
          >
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Gift className="w-5 h-5 text-amber-400" />
              <span>إرسال إشعار عام وهدايا لجميع اللاعبين</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                عنوان الإشعار
              </label>
              <input
                type="text"
                required
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="مثال: مكافأة الأعياد أو تحديث جديد!"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                نص الرسالة
              </label>
              <textarea
                rows={3}
                required
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                placeholder="اكتب التنبيه أو رسالة التهنئة للاعبين..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                هدية عملات مرفقة لكل لاعب (عملة مجانية)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={announcementCoins}
                onChange={(e) => setAnnouncementCoins(Number(e.target.value))}
                className="w-full sm:w-48 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-yellow-300 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>إرسال التنبيه وتوزيع المكافأة فوراً</span>
            </button>
          </form>

          {/* Past Announcements History */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">سجل التنبيهات المرسلة</h3>
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-amber-200">{ann.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{ann.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{ann.message}</p>
                {ann.rewardCoins && ann.rewardCoins > 0 ? (
                  <div className="text-xs text-yellow-400 font-bold flex items-center gap-1 mt-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>مكافأة موزعة: {ann.rewardCoins} عملة</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STATS & ACTIVITY */}
      {activeTab === "stats" && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">مؤشرات الأداء والنظام</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-xs text-slate-400">متوسط معدل ذكاء اللاعبين</div>
                <div className="text-2xl font-black text-cyan-300 mt-1">122 IQ</div>
              </div>
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-xs text-slate-400">معدل الإجابة الصحيحة العام</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">74%</div>
              </div>
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-xs text-slate-400">حالة خادم التحديات</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">متصل 🟢</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BACKUP & RESTORE */}
      {activeTab === "backup" && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">النسخ الاحتياطي واستعادة البيانات</h3>
            <p className="text-xs text-slate-400 mt-1">
              تصدير قاعدة بيانات الأسئلة، التصنيفات، وسجلات اللاعبين بصيغة JSON لسهولة النقل والاستعادة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportData}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>تحميل نسخة احتياطية (Export JSON)</span>
            </button>

            <label className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>استيراد واستعادة البيانات (Import JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* ADD / EDIT QUESTION MODAL */}
      {(isAddingQuestion || editingQuestion) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fade-in dir-rtl">
          <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-amber-200">
                {editingQuestion ? "تعديل السؤال" : "إضافة سؤال جديد إلى بنك الأسئلة"}
              </h3>
              <button
                onClick={() => {
                  setIsAddingQuestion(false);
                  setEditingQuestion(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Category, Level, Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    التصنيف
                  </label>
                  <select
                    value={questionFormData.categoryId}
                    onChange={(e) =>
                      setQuestionFormData({ ...questionFormData, categoryId: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    رقم المستوى
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={questionFormData.levelNumber || 1}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        levelNumber: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={questionFormData.difficulty || "سهل"}
                    onChange={(e) =>
                      setQuestionFormData({
                        ...questionFormData,
                        difficulty: e.target.value as Difficulty,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="سهل">سهل</option>
                    <option value="متوسط">متوسط</option>
                    <option value="صعب">صعب</option>
                    <option value="خبير">خبير</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  نص السؤال <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionFormData.question}
                  onChange={(e) =>
                    setQuestionFormData({ ...questionFormData, question: e.target.value })
                  }
                  placeholder="اكتب السؤال بوضوح هنا..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 4 Options & Correct Answer Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  الخيارات الأربعة (اختر الدائرة الخضراء بجانب الخيار الصحيح) <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswerOption"
                        id={`opt-radio-${optIndex}`}
                        checked={questionFormData.correctAnswer === optIndex}
                        onChange={() =>
                          setQuestionFormData({ ...questionFormData, correctAnswer: optIndex })
                        }
                        className="w-4 h-4 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        required
                        value={questionFormData.options?.[optIndex] || ""}
                        onChange={(e) => {
                          const newOpts = [...(questionFormData.options || ["", "", "", ""])];
                          newOpts[optIndex] = e.target.value;
                          setQuestionFormData({ ...questionFormData, options: newOpts });
                        }}
                        placeholder={`الخيار ${optIndex + 1}`}
                        className={`flex-1 bg-slate-800 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none ${
                          questionFormData.correctAnswer === optIndex
                            ? "border-emerald-500 bg-emerald-950/30"
                            : "border-slate-700"
                        }`}
                      />
                      {questionFormData.correctAnswer === optIndex && (
                        <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">
                          ✓ صحيح
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hint & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    تلميح المساعدة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={questionFormData.hint || ""}
                    onChange={(e) =>
                      setQuestionFormData({ ...questionFormData, hint: e.target.value })
                    }
                    placeholder="تلميح لمساعدة اللاعب عند طلب مساعدة الذكاء الاصطناعي"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    الشرح التعليمي بعد الحل (اختياري)
                  </label>
                  <input
                    type="text"
                    value={questionFormData.explanation || ""}
                    onChange={(e) =>
                      setQuestionFormData({ ...questionFormData, explanation: e.target.value })
                    }
                    placeholder="شرح وتفسير الإجابة الصحيحة للمتسابقين"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingQuestion(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingQuestion ? "حفظ التعديلات" : "إضافة السؤال"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
