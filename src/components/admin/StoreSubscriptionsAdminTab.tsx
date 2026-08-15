import React, { useState } from "react";
import {
  UserProfile,
  StoreSubscriptionConfig,
  StoreSubscriptionCard,
  AuthorizedPointOfSale,
  PlayerStore,
} from "../../types";
import {
  getStoreSubscriptionConfig,
  saveStoreSubscriptionConfig,
  getStoredSubscriptionCards,
  saveSubscriptionCards,
  generateSubscriptionCardsBatch,
  getStoredPointsOfSale,
  savePointsOfSale,
  getStoredPlayerStores,
  savePlayerStores,
  checkStoreTrialAndSubscription,
  ADMIN_EMAIL,
} from "../../utils/storage";
import { soundFx } from "../../utils/sound";
import {
  CreditCard,
  Gift,
  Plus,
  Trash2,
  Edit,
  Save,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  Search,
  MapPin,
  Phone,
  Clock,
  Sparkles,
  Crown,
  Zap,
  Building2,
  Printer,
  Calendar,
  ExternalLink,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

interface StoreSubscriptionsAdminTabProps {
  currentUser: UserProfile;
  showNotice: (text: string, type?: "success" | "error") => void;
}

export const StoreSubscriptionsAdminTab: React.FC<StoreSubscriptionsAdminTabProps> = ({
  currentUser,
  showNotice,
}) => {
  const [config, setConfig] = useState<StoreSubscriptionConfig>(getStoreSubscriptionConfig());
  const [cards, setCards] = useState<StoreSubscriptionCard[]>(getStoredSubscriptionCards());
  const [pointsOfSale, setPointsOfSale] = useState<AuthorizedPointOfSale[]>(getStoredPointsOfSale());
  const [playerStores, setPlayerStores] = useState<PlayerStore[]>(getStoredPlayerStores());

  const [activeSubTab, setActiveSubTab] = useState<"cards" | "settings" | "pos" | "stores">("cards");

  // Batch Generation State
  const [genPlanType, setGenPlanType] = useState<"monthly" | "yearly">("monthly");
  const [genCount, setGenCount] = useState<number>(5);
  const [genPrice, setGenPrice] = useState<number>(config.monthlyPriceDzd);
  const [genNotes, setGenNotes] = useState<string>("");
  const [recentlyGeneratedBatch, setRecentlyGeneratedBatch] = useState<StoreSubscriptionCard[]>([]);

  // Search & Filters for Cards
  const [cardSearch, setCardSearch] = useState("");
  const [cardStatusFilter, setCardStatusFilter] = useState<"all" | "unused" | "used">("all");
  const [cardPlanFilter, setCardPlanFilter] = useState<"all" | "monthly" | "yearly">("all");

  // New POS Form State
  const [isAddingPos, setIsAddingPos] = useState(false);
  const [editingPosId, setEditingPosId] = useState<string | null>(null);
  const [posForm, setPosForm] = useState<Partial<AuthorizedPointOfSale>>({
    name: "",
    ownerOrManager: "",
    wilayaNumber: 16,
    wilayaName: "الجزائر العاصمة (16)",
    address: "",
    phone: "",
    whatsappPhone: "",
    workingHours: "السبت - الخميس: 08:30 إلى 18:30",
    availableCards: ["monthly", "yearly"],
    isOfficialPartner: true,
    googleMapsUrl: "",
    notes: "",
  });

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    soundFx.playCoin();
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
    showNotice(`تم نسخ كود البطاقة [${code}] إلى الحافظة! 📋`);
  };

  // Save Settings
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playCorrect();
    saveStoreSubscriptionConfig(config);
    showNotice("تم حفظ إعدادات التجربة المجانية وأسعار الاشتراكات بنجاح! 💾");
  };

  // Generate Cards
  const handleGenerateCards = () => {
    soundFx.playVictory();
    const newCards = generateSubscriptionCardsBatch(
      genPlanType,
      genCount,
      currentUser.email || ADMIN_EMAIL,
      genPrice,
      genNotes
    );

    const updated = getStoredSubscriptionCards();
    setCards(updated);
    setRecentlyGeneratedBatch(newCards);
    showNotice(`تم توليد دفعة جديدة تحتوي على ${newCards.length} بطاقة بنجاح! 🎫⚡`);
  };

  // Delete Card
  const handleDeleteCard = (cardId: string) => {
    if (window.confirm("هل أنت متأكد من حذف وإلغاء هذه البطاقة؟")) {
      soundFx.playWrong();
      const updated = cards.filter((c) => c.id !== cardId);
      setCards(updated);
      saveSubscriptionCards(updated);
      showNotice("تم حذف البطاقة من النظام.");
    }
  };

  // Export Cards JSON
  const handleExportCards = () => {
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dz_numis_subscription_cards_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showNotice("تم تصدير ملف بطاقات الاشتراك بنجاح! 📄");
  };

  // POS Handlers
  const handleSavePos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posForm.name || !posForm.phone || !posForm.address) {
      showNotice("يرجى ملء جميع الحقول الأساسية لنقطة البيع", "error");
      return;
    }

    soundFx.playCorrect();
    let updated: AuthorizedPointOfSale[] = [];

    if (editingPosId) {
      updated = pointsOfSale.map((p) =>
        p.id === editingPosId ? ({ ...p, ...posForm } as AuthorizedPointOfSale) : p
      );
      showNotice("تم تحديث بيانات نقطة البيع المعتمدة بنجاح!");
    } else {
      const newPos: AuthorizedPointOfSale = {
        ...(posForm as AuthorizedPointOfSale),
        id: "pos-" + Date.now(),
        createdAt: new Date().toISOString().split("T")[0],
        isOfficialPartner: true,
        availableCards: posForm.availableCards || ["monthly", "yearly"],
      };
      updated = [newPos, ...pointsOfSale];
      showNotice("تمت إضافة نقطة بيع معتمدة جديدة بنجاح! 📍");
    }

    setPointsOfSale(updated);
    savePointsOfSale(updated);
    setIsAddingPos(false);
    setEditingPosId(null);
  };

  const handleDeletePos = (posId: string) => {
    if (window.confirm("هل أنت متأكد من حذف نقطة البيع هذه؟")) {
      soundFx.playWrong();
      const updated = pointsOfSale.filter((p) => p.id !== posId);
      setPointsOfSale(updated);
      savePointsOfSale(updated);
      showNotice("تم حذف نقطة البيع.");
    }
  };

  // Manually extend store subscription
  const handleManualExtendStore = (storeId: string, days: number, plan: "monthly" | "yearly") => {
    soundFx.playCoin();
    const updated = playerStores.map((s) => {
      if (s.id === storeId) {
        const now = new Date();
        let baseDate = new Date();
        if (s.subscriptionEndDate && new Date(s.subscriptionEndDate) > now) {
          baseDate = new Date(s.subscriptionEndDate);
        }
        baseDate.setDate(baseDate.getDate() + days);
        const newEndDateStr = baseDate.toISOString().split("T")[0];

        return {
          ...s,
          subscriptionPlan: plan,
          subscriptionEndDate: newEndDateStr,
          isSubscriptionActive: true,
          isActive: true,
        };
      }
      return s;
    });

    setPlayerStores(updated);
    savePlayerStores(updated);
    showNotice(`تم تمديد اشتراك المتجر بنجاح لمدة ${days} يوم! 🎉`);
  };

  // Filtered Cards
  const filteredCards = cards.filter((c) => {
    const matchesSearch =
      !cardSearch ||
      c.id.toLowerCase().includes(cardSearch.toLowerCase()) ||
      c.serialNumber.toLowerCase().includes(cardSearch.toLowerCase()) ||
      c.usedByEmail?.toLowerCase().includes(cardSearch.toLowerCase()) ||
      c.usedByStoreName?.toLowerCase().includes(cardSearch.toLowerCase());

    const matchesStatus =
      cardStatusFilter === "all" ||
      (cardStatusFilter === "unused" && !c.isUsed) ||
      (cardStatusFilter === "used" && c.isUsed);

    const matchesPlan =
      cardPlanFilter === "all" || c.planType === cardPlanFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Calculate Metrics
  const unusedCardsCount = cards.filter((c) => !c.isUsed).length;
  const usedCardsCount = cards.filter((c) => c.isUsed).length;
  const totalCardsRevenue = cards.filter((c) => c.isUsed).reduce((acc, c) => acc + c.priceDzd, 0);

  return (
    <div className="space-y-6 dir-rtl text-slate-100">
      
      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab("cards");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === "cards"
              ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>مولد وإدارة كروت الاشتراك ({cards.length}) 🎫</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab("settings");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === "settings"
              ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>إعدادات التجربة المجانية والأسعار ⚙️</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab("pos");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === "pos"
              ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>نقاط البيع المعتمدة ({pointsOfSale.length}) 📍</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            setActiveSubTab("stores");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === "stores"
              ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>متابعة اشتراكات المتاجر ({playerStores.length}) 🏛️</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/30 space-y-1">
          <div className="text-xs text-slate-400">أيام التجربة المجانية</div>
          <div className="text-xl font-black text-amber-300 font-mono">
            {config.freeTrialDays} يوماً
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-500/30 space-y-1">
          <div className="text-xs text-slate-400">كروت شحن غير مستخدمة</div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {unusedCardsCount} كارت
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-cyan-500/30 space-y-1">
          <div className="text-xs text-slate-400">كروت تم تفعيلها</div>
          <div className="text-xl font-black text-cyan-300 font-mono">
            {usedCardsCount} كارت
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-2xl border border-yellow-500/30 space-y-1">
          <div className="text-xs text-slate-400">مداخيل بيع الكروت</div>
          <div className="text-xl font-black text-yellow-300 font-mono">
            {totalCardsRevenue.toLocaleString("ar-EG")} د.ج
          </div>
        </div>
      </div>

      {/* --- SUBTAB 1: SUBSCRIPTION CARDS GENERATOR --- */}
      {activeSubTab === "cards" && (
        <div className="space-y-6">
          
          {/* Card Generator Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border-2 border-amber-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-amber-200">
                    مولد كروت الاشتراك والشحن الفوري
                  </h3>
                  <p className="text-xs text-slate-400">
                    توليد دفعات كروت معتمدة لتسليمها لنقاط البيع والأكشاك
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportCards}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>تصدير JSON</span>
              </button>
            </div>

            {/* Generator Form */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نوع الاشتراك:</label>
                <select
                  value={genPlanType}
                  onChange={(e) => {
                    const plan = e.target.value as "monthly" | "yearly";
                    setGenPlanType(plan);
                    setGenPrice(plan === "monthly" ? config.monthlyPriceDzd : config.yearlyPriceDzd);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-bold"
                >
                  <option value="monthly">اشتراك شهري (30 يوماً)</option>
                  <option value="yearly">اشتراك سنوي VIP (365 يوماً)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عدد الكروت المطلوبة:</label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono font-bold"
                >
                  <option value={1}>1 كارت فقط</option>
                  <option value={5}>5 كروت شحن</option>
                  <option value={10}>10 كروت شحن</option>
                  <option value={20}>20 كارت شحن</option>
                  <option value={50}>50 كارت شحن (دفعة كاملة)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">سعر الكارت بالدينار (DZD):</label>
                <input
                  type="number"
                  value={genPrice}
                  onChange={(e) => setGenPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظة / اسم الدفعة:</label>
                <input
                  type="text"
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  placeholder="مثال: دفعة وهران أو العاصمة"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateCards}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
            >
              <Zap className="w-4 h-4" />
              <span>توليد {genCount} كارت اشتراك الآن ⚡</span>
            </button>
          </div>

          {/* Recently Generated Cards Preview */}
          {recentlyGeneratedBatch.length > 0 && (
            <div className="p-5 rounded-3xl bg-amber-950/30 border-2 border-amber-400/60 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-amber-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>الدفعة المولدة حديثاً ({recentlyGeneratedBatch.length} كارت جاهز)</span>
                </h4>
                <span className="text-xs text-amber-400 font-mono">
                  {recentlyGeneratedBatch[0].batchId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentlyGeneratedBatch.map((card) => (
                  <div
                    key={card.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-amber-400/40 relative space-y-2 shadow-md"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400">{card.serialNumber}</span>
                      <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                        {card.planType === "monthly" ? "شهري (30 يوم)" : "سنوي VIP"}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center font-mono font-black text-amber-300 text-sm tracking-wider flex items-center justify-between">
                      <span>{card.id}</span>
                      <button
                        onClick={() => handleCopyCode(card.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                        title="نسخ الكود"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span>السعر: {card.priceDzd.toLocaleString("ar-EG")} د.ج</span>
                      <span className="text-emerald-400">جاهز للتفعيل</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cards Inventory & Search */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>سجل ومخزون بطاقات الاشتراك ({cards.length})</span>
              </h3>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cardSearch}
                    onChange={(e) => setCardSearch(e.target.value)}
                    placeholder="بحث بالكود أو الرقم التسلسلي أو المستخدم..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pr-9 pl-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={cardStatusFilter}
                  onChange={(e) => setCardStatusFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">كل الحالات</option>
                  <option value="unused">غير مستخدمة فقط</option>
                  <option value="used">مستخدمة ومفعلة</option>
                </select>

                <select
                  value={cardPlanFilter}
                  onChange={(e) => setCardPlanFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">كل الخطط</option>
                  <option value="monthly">شهري</option>
                  <option value="yearly">سنوي VIP</option>
                </select>
              </div>
            </div>

            {/* Cards Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <th className="p-3">رمز البطاقة (Code)</th>
                    <th className="p-3">الرقم التسلسلي</th>
                    <th className="p-3">نوع الباقة</th>
                    <th className="p-3">السعر</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">المستخدم / المتجر</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredCards.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="p-3 font-mono font-black text-amber-300">
                        <div className="flex items-center gap-2">
                          <span>{card.id}</span>
                          <button
                            onClick={() => handleCopyCode(card.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="نسخ الكود"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{card.serialNumber}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            card.planType === "yearly"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          }`}
                        >
                          {card.planType === "yearly" ? "سنوي VIP (365 يوم)" : "شهري (30 يوم)"}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-200">
                        {card.priceDzd.toLocaleString("ar-EG")} د.ج
                      </td>
                      <td className="p-3">
                        {card.isUsed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            مستخدمة ({card.usedAt})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            جاهزة للبيع والتفعيل ✅
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300">
                        {card.usedByStoreName || card.usedByEmail || "-"}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="حذف البطاقة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCards.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  لا توجد بطاقات مطابقة للبحث
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- SUBTAB 2: TRIAL PERIOD & PRICING SETTINGS --- */}
      {activeSubTab === "settings" && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-100">إعدادات مدة التجربة المجانية والأسعار</h3>
              <p className="text-xs text-slate-400">
                تحكم في المدة التجريبية الممنوحة لمتاجر اللاعبين وقيمة بطاقات الاشتراك
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                عدد أيام التجربة المجانية للمتجر الجديد:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={config.freeTrialDays}
                  onChange={(e) => setConfig({ ...config, freeTrialDays: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-black text-emerald-400 font-mono focus:outline-none focus:border-emerald-400"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  يوماً
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                يحصل كل متجر لاعب على هذه المدة مجاناً لبيع وشراء العملات الحقيقية.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                سعر كارت الاشتراك الشهري (30 يوماً):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={config.monthlyPriceDzd}
                  onChange={(e) => setConfig({ ...config, monthlyPriceDzd: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-black text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  د.ج
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                سعر البيع الموصى به لبطاقة الاشتراك الشهرية لدى نقاط البيع.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                سعر كارت الاشتراك السنوي VIP (365 يوماً):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={config.yearlyPriceDzd}
                  onChange={(e) => setConfig({ ...config, yearlyPriceDzd: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm font-black text-yellow-400 font-mono focus:outline-none focus:border-yellow-400"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  د.ج
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                سعر البيع لبطاقة الاشتراك السنوية VIP متضمنة الخصم والمزايا.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات والأسعار 💾</span>
            </button>
          </div>
        </form>
      )}

      {/* --- SUBTAB 3: AUTHORIZED POINTS OF SALE (نقاط البيع) --- */}
      {activeSubTab === "pos" && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-slate-100">شبكة نقاط البيع المعتمدة لكروت الاشتراك</h3>
              <p className="text-xs text-slate-400">
                إدارة الأكشاك ومكتبات النميات والموزعين المعتمدين لبيع بطاقات الشحن عبر 58 ولاية
              </p>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                setEditingPosId(null);
                setPosForm({
                  name: "",
                  ownerOrManager: "",
                  wilayaNumber: 16,
                  wilayaName: "الجزائر العاصمة (16)",
                  address: "",
                  phone: "",
                  whatsappPhone: "",
                  workingHours: "السبت - الخميس: 08:30 إلى 18:30",
                  availableCards: ["monthly", "yearly"],
                  isOfficialPartner: true,
                  googleMapsUrl: "",
                  notes: "",
                });
                setIsAddingPos(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة نقطة بيع جديدة 📍</span>
            </button>
          </div>

          {/* Add/Edit POS Form Modal */}
          {isAddingPos && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto dir-rtl animate-fade-in">
              <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-black text-base text-amber-200">
                    {editingPosId ? "تعديل نقطة بيع معتمدة" : "إضافة نقطة بيع وموزع معتمد جديد"}
                  </h3>
                  <button
                    onClick={() => setIsAddingPos(false)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSavePos} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">اسم المحل أو نقطة البيع:</label>
                    <input
                      type="text"
                      required
                      value={posForm.name}
                      onChange={(e) => setPosForm({ ...posForm, name: e.target.value })}
                      placeholder="مثال: كشك البهجة للنميات والمقتنيات"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">اسم المدير / المسؤول:</label>
                      <input
                        type="text"
                        required
                        value={posForm.ownerOrManager}
                        onChange={(e) => setPosForm({ ...posForm, ownerOrManager: e.target.value })}
                        placeholder="الأستاذ مراد العاصمي"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">الولاية:</label>
                      <input
                        type="text"
                        required
                        value={posForm.wilayaName}
                        onChange={(e) => setPosForm({ ...posForm, wilayaName: e.target.value })}
                        placeholder="الجزائر العاصمة (16)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">العنوان التفصيلي:</label>
                    <input
                      type="text"
                      required
                      value={posForm.address}
                      onChange={(e) => setPosForm({ ...posForm, address: e.target.value })}
                      placeholder="شارع ديدوش مراد، قرب البريد المركزي"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">رقم الهاتف للاتصال:</label>
                      <input
                        type="text"
                        required
                        value={posForm.phone}
                        onChange={(e) => setPosForm({ ...posForm, phone: e.target.value })}
                        placeholder="0555 12 34 56"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">رقم الواتساب (WhatsApp):</label>
                      <input
                        type="text"
                        value={posForm.whatsappPhone}
                        onChange={(e) => setPosForm({ ...posForm, whatsappPhone: e.target.value })}
                        placeholder="+213555123456"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">ساعات وأيام العمل:</label>
                    <input
                      type="text"
                      value={posForm.workingHours}
                      onChange={(e) => setPosForm({ ...posForm, workingHours: e.target.value })}
                      placeholder="السبت - الخميس: 08:30 إلى 18:30"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">رابط خرائط جوجل (Google Maps):</label>
                    <input
                      type="text"
                      value={posForm.googleMapsUrl}
                      onChange={(e) => setPosForm({ ...posForm, googleMapsUrl: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 font-mono text-[11px]"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingPos(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-amber-500 text-slate-950 font-black rounded-xl shadow-md"
                    >
                      حفظ نقطة البيع
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* POS Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pointsOfSale.map((pos) => (
              <div
                key={pos.id}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{pos.name}</h4>
                      <p className="text-xs text-amber-300 mt-0.5">{pos.wilayaName}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      معتمد ✅
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{pos.address}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span>{pos.workingHours}</span>
                  </div>

                  <div className="text-xs text-slate-200 font-mono flex items-center gap-2 pt-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{pos.phone}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {pos.whatsappPhone && (
                      <a
                        href={`https://wa.me/${pos.whatsappPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30"
                        title="واتساب"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {pos.googleMapsUrl && (
                      <a
                        href={pos.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                        title="خريطة"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingPosId(pos.id);
                        setPosForm(pos);
                        setIsAddingPos(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="تعديل"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePos(pos.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* --- SUBTAB 4: PLAYER STORES AUDIT & SUBSCRIPTION CONTROL --- */}
      {activeSubTab === "stores" && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>متاجر اللاعبين وحالة التفعيل ({playerStores.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              مراقبة تواريخ انتهاء الفترة التجريبية وتمديد الاشتراكات يدوياً
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <th className="p-3">المتجر وصاحبه</th>
                  <th className="p-3">الولاية والتواصل</th>
                  <th className="p-3">تاريخ الإنشاء</th>
                  <th className="p-3">حالة الاشتراك / التجربة</th>
                  <th className="p-3">تاريخ الانتهاء</th>
                  <th className="p-3 text-center">إجراءات المدير السريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {playerStores.map((store) => {
                  const status = checkStoreTrialAndSubscription(store, config);

                  return (
                    <tr key={store.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-100">{store.storeName}</div>
                        <div className="text-[11px] text-slate-400">{store.ownerName} ({store.ownerEmail})</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-300">{store.wilayaCity}</div>
                        <div className="text-[11px] font-mono text-slate-400">{store.phoneWhatsApp}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-400">{store.createdAt}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {store.subscriptionEndDate || "-"}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleManualExtendStore(store.id, 30, "monthly")}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold"
                          >
                            +30 يوم مجاناً 🎁
                          </button>
                          <button
                            onClick={() => handleManualExtendStore(store.id, 365, "yearly")}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold"
                          >
                            ترقية سنوي VIP 👑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
