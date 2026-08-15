import React, { useState } from "react";
import { UserProfile, PlayerStore, StoreSubscriptionConfig, AuthorizedPointOfSale } from "../types";
import {
  getStoreSubscriptionConfig,
  getStoredPointsOfSale,
  redeemSubscriptionCard,
  checkStoreTrialAndSubscription,
} from "../utils/storage";
import { soundFx } from "../utils/sound";
import {
  X,
  CreditCard,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Clock,
  Search,
  Gift,
  Crown,
  Zap,
  ExternalLink,
  MessageCircle,
  Calendar,
} from "lucide-react";

interface StoreSubscriptionActivationModalProps {
  currentUser: UserProfile;
  playerStore?: PlayerStore | null;
  onClose: () => void;
  onActivated: (updatedStore: PlayerStore) => void;
}

export const StoreSubscriptionActivationModal: React.FC<StoreSubscriptionActivationModalProps> = ({
  currentUser,
  playerStore,
  onClose,
  onActivated,
}) => {
  const config: StoreSubscriptionConfig = getStoreSubscriptionConfig();
  const pointsOfSale: AuthorizedPointOfSale[] = getStoredPointsOfSale();

  const [activeTab, setActiveTab] = useState<"redeem" | "plans" | "pos">("redeem");
  const [cardCode, setCardCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // POS Search & Filter
  const [posSearch, setPosSearch] = useState("");
  const [posWilayaFilter, setPosWilayaFilter] = useState<string>("all");

  const subStatus = checkStoreTrialAndSubscription(playerStore || undefined, config);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardCode.trim()) {
      setErrorMessage("الرجاء إدخال رقم أو كود بطاقة الاشتراك");
      soundFx.playWrong();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    setTimeout(() => {
      const result = redeemSubscriptionCard(
        cardCode.trim(),
        currentUser.email || "player@quiz.com",
        playerStore?.id
      );

      setIsLoading(false);

      if (result.success && result.updatedStore) {
        soundFx.playVictory();
        setSuccessMessage(result.message);
        setTimeout(() => {
          onActivated(result.updatedStore!);
        }, 1800);
      } else {
        soundFx.playWrong();
        setErrorMessage(result.message);
      }
    }, 400);
  };

  // Filter POS
  const filteredPos = pointsOfSale.filter((pos) => {
    const matchesSearch =
      !posSearch ||
      pos.name.toLowerCase().includes(posSearch.toLowerCase()) ||
      pos.address.toLowerCase().includes(posSearch.toLowerCase()) ||
      pos.wilayaName.toLowerCase().includes(posSearch.toLowerCase()) ||
      pos.ownerOrManager.toLowerCase().includes(posSearch.toLowerCase());

    const matchesWilaya =
      posWilayaFilter === "all" || pos.wilayaName.includes(posWilayaFilter);

    return matchesSearch && matchesWilaya;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto dir-rtl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-500/20 overflow-hidden my-4">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30">
              <CreditCard className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-amber-200">
                  تفعيل واشتراك متجر المسكوكات
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                  كارت الشحن 🎫
                </span>
              </div>
              <p className="text-xs text-slate-300">
                فترة تجريبية مجانية {config.freeTrialDays} يوماً، أو تفعيل فوري ببطاقة اشتراك معتمدة
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Bar */}
        <div className="bg-slate-950/90 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">حالة متجرك الحالي:</span>
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] ${subStatus.badgeClass}`}>
              {subStatus.label}
            </span>
          </div>
          {playerStore && (
            <div className="text-amber-300 font-mono text-[11px]">
              {playerStore.storeName}
            </div>
          )}
        </div>

        {/* Sub-Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("redeem");
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === "redeem"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>إدخال كود البطاقة 🎫</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("plans");
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === "plans"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>باقات الاشتراك 💎</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("pos");
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === "pos"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>نقاط البيع المعتمدة ({pointsOfSale.length}) 📍</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-5">
          
          {/* TAB 1: REDEEM CARD */}
          {activeTab === "redeem" && (
            <div className="space-y-5">
              
              {/* Scratch Card Visual Mockup */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 text-slate-950 border-2 border-yellow-300 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <h4 className="font-black text-sm text-slate-950">بطاقة شحن واشتراك المتجر</h4>
                      <p className="text-[10px] text-slate-900/80 font-bold">المسكوكات والنميات القديمة الأصلية</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px] font-black bg-slate-950/20 px-2 py-1 rounded-lg">
                    DZ NUMIS VIP CARD
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-950 text-amber-300 rounded-2xl border border-amber-400/50 text-center font-mono tracking-widest text-base sm:text-lg font-black shadow-inner">
                  {cardCode || "VIP-X-XXXX-XXXX"}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-950">
                  <span>صالحة لفتح متجر والبيع المباشر</span>
                  <span>متوفرة لدى نقاط البيع المعتمدة</span>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleRedeem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    أدخل كود أو رقم بطاقة الاشتراك المكون من 12 إلى 16 رقماً وحرفاً:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardCode}
                      onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                      placeholder="مثال: VIP-M-7491-8832 أو VIP-Y-9921-4710"
                      className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl py-3 px-4 text-center font-mono text-sm sm:text-base font-black text-amber-300 placeholder:text-slate-600 focus:outline-none transition-colors tracking-wider"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    * يمكنك الحصول على البطاقة من أحد الموزعين ونقاط البيع المعتمدة في ولايتك.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-2xl text-xs font-bold text-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-xs font-bold text-emerald-200 flex items-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !cardCode.trim()}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    isLoading || !cardCode.trim()
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isLoading ? "جاري التحقق والتفعيل..." : "تفعيل المتجر الآن ⚡"}</span>
                </button>
              </form>

              {/* Free Trial Banner Info */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="flex-1 text-xs space-y-1">
                  <div className="font-bold text-emerald-300">ميزة التجربة المجانية المتاحة:</div>
                  <p className="text-slate-300 leading-relaxed">
                    يحق لكل لاعب جديد الاستفادة من تجربة متجر مجانية لمدة{" "}
                    <span className="font-black text-emerald-400 font-mono">
                      {config.freeTrialDays} يوماً
                    </span>{" "}
                    لعرض المسكوكات والتواصل مع المشترين قبل الحاجة لشراء بطاقة اشتراك.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PLANS & PRICING */}
          {activeTab === "plans" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-black text-base text-amber-200">باقات اشتراك متاجر المسكوكات</h3>
                <p className="text-xs text-slate-400">
                  اختر الباقة المناسبة واشترِ بطاقة الشحن من نقاط البيع المعتمدة
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Monthly Plan */}
                <div className="p-5 rounded-3xl bg-slate-950/90 border-2 border-slate-700 hover:border-amber-400 transition-all space-y-4 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">الاشتراك الشهري</span>
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                        30 يوم
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white font-mono">
                      {config.monthlyPriceDzd.toLocaleString("ar-EG")}{" "}
                      <span className="text-xs font-sans text-amber-400">د.ج / شهر</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>عرض وبيع عدد غير محدود من المسكوكات</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>توثيق شارة التاجر المعتمد ✅</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>استقبال الطلبات والدفع بـ BaridiMob</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setActiveTab("pos");
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition-colors"
                  >
                    شراء بطاقة شهرية من نقطة بيع 📍
                  </button>
                </div>

                {/* Yearly VIP Plan */}
                <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-500/10 via-slate-950 to-slate-950 border-2 border-amber-400 shadow-xl space-y-4 relative flex flex-col justify-between">
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
                    الأكثر توفيراً (33% خصم) 👑
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-300">الاشتراك السنوي VIP</span>
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold">
                        365 يوم
                      </span>
                    </div>
                    <div className="text-2xl font-black text-amber-300 font-mono">
                      {config.yearlyPriceDzd.toLocaleString("ar-EG")}{" "}
                      <span className="text-xs font-sans text-amber-400">د.ج / سنة</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-slate-200">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>جميع مزايا المتجر لمدة سنة كاملة</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>أولوية الظهور في الصفحة الأولى للسوق</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>دعم فني واستشارات نميات مجانية</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setActiveTab("pos");
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-colors"
                  >
                    شراء بطاقة سنوية VIP من نقطة بيع 📍
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: AUTHORIZED POINTS OF SALE */}
          {activeTab === "pos" && (
            <div className="space-y-4">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="ابحث بالولاية أو اسم المحل أو العنوان..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pr-9 pl-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* POS Cards List */}
              <div className="space-y-3">
                {filteredPos.map((pos) => (
                  <div
                    key={pos.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-100">{pos.name}</h4>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            معتمد ✅
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          المسؤول: {pos.ownerOrManager} • {pos.wilayaName}
                        </p>
                      </div>
                      <div className="text-left font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        {pos.availableCards.includes("yearly") ? "شهري + سنوي VIP" : "شهري"}
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{pos.address}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{pos.workingHours}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2 text-xs">
                      {pos.phone && (
                        <a
                          href={`tel:${pos.phone.replace(/\s+/g, "")}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>اتصال: {pos.phone}</span>
                        </a>
                      )}
                      {pos.whatsappPhone && (
                        <a
                          href={`https://wa.me/${pos.whatsappPhone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </a>
                      )}
                      {pos.googleMapsUrl && (
                        <a
                          href={pos.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>الموقع على الخريطة</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {filteredPos.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    لم يتم العثور على نقاط بيع مطابقة للبحث
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>نظام كروت شحن معتمد ومحمي من إدارة التطبيق</span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
