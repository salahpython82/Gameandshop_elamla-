import React, { useState, useEffect } from "react";
import {
  UserProfile,
  PowerUpState,
  RealCoinListing,
  MarketOrder,
  RealPaymentMethod,
} from "../types";
import {
  getStoredPowerUps,
  savePowerUps,
  getStoredRealCoinListings,
  getStoredMarketOrders,
  saveMarketOrders,
  getStoredPlayerStores,
} from "../utils/storage";
import { soundFx } from "../utils/sound";
import { RealCoinCheckoutModal } from "./RealCoinCheckoutModal";
import { AddCoinListingModal } from "./AddCoinListingModal";
import { StoreOrdersManagementModal } from "./StoreOrdersManagementModal";
import {
  ShoppingBag,
  Coins,
  Sparkles,
  Zap,
  Clock,
  HelpCircle,
  ShieldCheck,
  Award,
  PlusCircle,
  Package,
  RotateCw,
  Search,
  CheckCircle2,
  Lock,
  Crown,
  CreditCard,
  Truck,
  TrendingUp,
  Tag,
  Star,
  Check,
  Store,
  Info,
} from "lucide-react";

interface StoreViewProps {
  user: UserProfile;
  powerUps: PowerUpState;
  onBuyPowerUp: (type: keyof PowerUpState, count: number, costCoins: number) => void;
  onChangeAvatar: (avatar: string) => void;
  onUpdateUserCoins: (newCoinAmount: number) => void;
  onNavigateView?: (view: any) => void;
}

type StoreTab = "real_coins" | "powerups" | "avatars" | "gold_vault";

export const StoreView: React.FC<StoreViewProps> = ({
  user,
  powerUps,
  onBuyPowerUp,
  onChangeAvatar,
  onUpdateUserCoins,
  onNavigateView,
}) => {
  const [activeTab, setActiveTab] = useState<StoreTab>("real_coins");

  // Real Coins State
  const [realListings, setRealListings] = useState<RealCoinListing[]>(getStoredRealCoinListings());
  const [marketOrders, setMarketOrders] = useState<MarketOrder[]>(getStoredMarketOrders());
  const [checkoutListing, setCheckoutListing] = useState<RealCoinListing | null>(null);
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [listingImageSide, setListingImageSide] = useState<Record<string, "obverse" | "reverse">>({});

  // Real Coins Search and Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEraFilter, setSelectedEraFilter] = useState<string>("all");
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<"all" | RealPaymentMethod>("all");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Avatar Catalog
  const AVATAR_CATALOG = [
    { id: "king_masinissa", avatar: "👑", name: "الملك ماسينيسا", role: "مؤسس نوميديا الموحدة", cost: 0, unlocked: true },
    { id: "emir_abdelkader", avatar: "🥷", name: "فارس سكة تاقدمت", role: "مدافع السيادة والمحمدية", cost: 0, unlocked: true },
    { id: "archaeologist", avatar: "👩‍🔬", name: "خبيرة النميات والآثار", role: "باحثة وفاحصة نقوش", cost: 0, unlocked: true },
    { id: "scholar", avatar: "👨‍🎓", name: "مؤرخ الحضارات", role: "دارس المسكوكات القديمة", cost: 0, unlocked: true },
    { id: "wise_sage", avatar: "🧙‍♂️", name: "الحكيم النمياتي", role: "خبير الدنانير والدراهم", cost: 150, unlocked: user.coins >= 150 || user.level >= 3 },
    { id: "atlas_lion", avatar: "🦁", name: "أسد الأطلس النوميدي", role: "رمز الشجاعة التاريخية", cost: 300, unlocked: user.coins >= 300 || user.level >= 5 },
    { id: "ai_scanner", avatar: "🤖", name: "محلل الآثار بالذكاء الاصطناعي", role: "ماسح وفاحص التزوير", cost: 500, unlocked: user.coins >= 500 || user.level >= 7 },
    { id: "emperor_knight", avatar: "🦸", name: "فارس المسكوكات الذهبية", role: "جامع الكنوز النادرة", cost: 800, unlocked: user.coins >= 800 || user.level >= 10 },
  ];

  // Flip image side between obverse and reverse
  const toggleImageSide = (listingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    setListingImageSide((prev) => ({
      ...prev,
      [listingId]: prev[listingId] === "reverse" ? "obverse" : "reverse",
    }));
  };

  // Filtered Real Coin Listings
  const filteredListings = realListings.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rulerOrCaliph.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mintPlace.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEra = selectedEraFilter === "all" || item.era === selectedEraFilter;
    const matchesPayment =
      selectedPaymentFilter === "all" || item.acceptedPayments.includes(selectedPaymentFilter);

    return matchesSearch && matchesEra && matchesPayment;
  });

  return (
    <div className="space-y-6 pb-20 dir-rtl">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-2xl border-2 border-amber-300 animate-bounce text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Store Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-amber-950/80 to-slate-900 p-6 sm:p-7 rounded-3xl border-2 border-amber-500/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-right">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-1 shadow-xl shadow-amber-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100">
                  متجر التطبيق والمسكوكات
                </h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                  رسم المنصة 100 د.ج 🛡️
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                الوجهة الشاملة لاقتناء وبيع المسكوكات الأثرية الحقيقية بالدينار الجزائري، وشراء أدوات المساعدة وترقية الشخصيات بالذهب!
              </p>
            </div>
          </div>

          {/* User Balances Summary Bar */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/80 p-2.5 sm:p-3 rounded-2xl border border-amber-500/30 shrink-0 shadow-lg">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <Coins className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block">رصيد الذهب</span>
                <span className="text-xs font-black text-amber-300 font-mono">{user.coins.toLocaleString('ar-EG')}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block">النجوم</span>
                <span className="text-xs font-black text-yellow-300 font-mono">{user.stars}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
              <Crown className="w-4 h-4 text-amber-400" />
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block">الرتبة</span>
                <span className="text-xs font-bold text-slate-200">مستوى {user.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions for Real Marketplace */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>نظام دفع آمن عبر BaridiMob أو الدفع عند الاستلام مع فحص التوثيق والأصالة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowOrdersModal(true);
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>طلباتي وفواتيري ({marketOrders.length})</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                setShowAddListingModal(true);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
              <span>عرض مسكوكة للبيع بالمتجر</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Category Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          {
            id: "real_coins" as StoreTab,
            label: "سوق المسكوكات الحقيقية",
            subtitle: "شراء وبيع بالدينار (DZD)",
            icon: Store,
            badge: `${realListings.length} معروضة`,
            color: "from-amber-500 to-yellow-600",
          },
          {
            id: "powerups" as StoreTab,
            label: "متجر وسائل المساعدة",
            subtitle: "حزم ذكاء وأوقات إضافية",
            icon: Zap,
            badge: "طاقة وفوز",
            color: "from-blue-500 to-cyan-600",
          },
          {
            id: "avatars" as StoreTab,
            label: "الأفاتارات والشخصيات",
            subtitle: "رموز تاريخية وملكية",
            icon: Crown,
            badge: "شخصيات نادرة",
            color: "from-purple-500 to-indigo-600",
          },
          {
            id: "gold_vault" as StoreTab,
            label: "خزينة وباقات الذهب",
            subtitle: "مكافآت وشحن الرصيد",
            icon: Coins,
            badge: "ذهب وجواهر",
            color: "from-emerald-500 to-teal-600",
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id);
              }}
              className={`p-3.5 rounded-2xl border text-right transition-all duration-200 relative overflow-hidden group ${
                isActive
                  ? "bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02]"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                    isActive
                      ? `bg-gradient-to-br ${tab.color} text-slate-950 font-bold`
                      : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isActive
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-100">{tab.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{tab.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REAL ANCIENT COINS MARKETPLACE */}
      {activeTab === "real_coins" && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Search, Era, and Payment Filters Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="ابحث بالاسم، الحاكم، دار الضرب، أو اسم المتجر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedEraFilter}
                onChange={(e) => setSelectedEraFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">كل الحقب التاريخية</option>
                <option value="نوميدي وشمال إفريقيا">نوميدي وشمال إفريقيا</option>
                <option value="عثماني وبايلك الجزائر">عثماني وبايلك الجزائر</option>
                <option value="سكة الأمير عبد القادر">سكة الأمير عبد القادر</option>
                <option value="الدينار الجزائري الحديث">الدينار الجزائري الحديث</option>
                <option value="أموي">أموي</option>
                <option value="عباسي">عباسي</option>
                <option value="أندلسي ومرابطي">أندلسي ومرابطي</option>
                <option value="فاطمي ورستمي">فاطمي ورستمي</option>
                <option value="روماني وبيزنطي">روماني وبيزنطي</option>
              </select>

              <select
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">كل طرق الدفع</option>
                <option value="baridimob">بريد موب (BaridiMob)</option>
                <option value="cod">الدفع عند الاستلام</option>
                <option value="mastercard">بطاقة بنكية</option>
              </select>
            </div>
          </div>

          {/* Platform Fee Notice Banner */}
          <div className="p-3 bg-gradient-to-r from-amber-950/40 via-slate-900 to-yellow-950/40 rounded-2xl border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ضمان حماية المشتري والبائع: يقتطع النظام <strong>100 د.ج ثابتة</strong> فقط لكل صفقة لصالح مالك التطبيق لتغطية التوثيق والمتابعة.</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              طرق الاستلام: <strong>توصيل مؤمن لكافة ولايات الجزائر 🚚</strong>
            </div>
          </div>

          {/* Real Coins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-slate-900/50 border border-slate-800 rounded-3xl text-slate-400 space-y-3">
                <Coins className="w-12 h-12 text-amber-500/40 mx-auto animate-pulse" />
                <p className="text-sm font-bold text-slate-300">لا توجد مسكوكات تطابق البحث الحالي</p>
                <p className="text-xs text-slate-500">جرب تغيير تصنيف الحقبة أو وسيلة الدفع</p>
              </div>
            ) : (
              filteredListings.map((item) => {
                const isShowingReverse = listingImageSide[item.id] === "reverse";
                const currentImg = isShowingReverse && item.reverseImageUrl
                  ? item.reverseImageUrl
                  : item.obverseImageUrl;

                return (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Visual Stage & 3D Flip */}
                    <div className="relative h-56 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 border-b border-slate-800/80 overflow-hidden">
                      {/* Ambient Glow */}
                      <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />

                      {currentImg ? (
                        <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-amber-400/80 shadow-2xl shadow-amber-500/30 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center bg-slate-950">
                          <img
                            src={currentImg}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-600/30 border-2 border-amber-400/50 flex items-center justify-center text-5xl shadow-inner">
                          {item.badgeIcon || "🪙"}
                        </div>
                      )}

                      {/* Flip Side Button (If has reverse image) */}
                      {item.reverseImageUrl && (
                        <button
                          onClick={(e) => toggleImageSide(item.id, e)}
                          className="absolute bottom-3 left-3 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-lg transition active:scale-95"
                          title="قلب العملة بين الوجه والظهر"
                        >
                          <RotateCw className="w-3 h-3 text-amber-400" />
                          <span>{isShowingReverse ? "عرض الوجه" : "عرض الظهر"}</span>
                        </button>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow">
                          {item.era}
                        </span>
                        <span className="bg-slate-900/90 text-emerald-400 border border-emerald-500/40 font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                          درجة الحفظ: {item.conditionGrade}
                        </span>
                      </div>

                      {item.certificateNumber && (
                        <div className="absolute top-3 left-3 bg-slate-900/90 text-amber-300 border border-amber-500/40 font-mono text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <ShieldCheck className="w-3 h-3 text-amber-400" />
                          <span>موثقة: {item.certificateNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>المتجر: <strong className="text-amber-300">{item.storeName}</strong></span>
                          <span>الولاية: {item.storeWilaya}</span>
                        </div>
                        <h3 className="font-bold text-slate-100 text-sm group-hover:text-amber-300 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {item.historicalStory || item.description}
                        </p>
                      </div>

                      {/* Technical Specs Strip */}
                      <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center text-[10px]">
                        <div>
                          <span className="text-slate-500 block">المعدن</span>
                          <span className="font-bold text-slate-200">{item.metal}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">الوزن</span>
                          <span className="font-mono text-amber-300">{item.weightGrams}g</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">القطر</span>
                          <span className="font-mono text-cyan-300">{item.diameterMm}mm</span>
                        </div>
                      </div>

                      {/* Pricing & Fee Strip */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 block">السعر الإجمالي</span>
                            <div className="text-base font-black text-amber-300 font-mono">
                              {item.realPriceDzd.toLocaleString()} <span className="text-xs">د.ج</span>
                            </div>
                          </div>

                          <div className="text-left">
                            <span className="text-[10px] text-slate-400 block">اقتطاع المالك</span>
                            <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              -100 د.ج
                            </span>
                          </div>
                        </div>

                        {/* Buy / Checkout Action Button */}
                        <button
                          onClick={() => {
                            soundFx.playCoin();
                            setCheckoutListing(item);
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
                        >
                          <ShoppingBag className="w-4 h-4 text-slate-950" />
                          <span>شراء فوري / إتمام الطلب (DZD)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POWER-UPS & GAME BOOSTERS STORE */}
      {activeTab === "powerups" && (
        <div className="space-y-5 animate-fade-in">
          
          <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 space-y-2">
            <h3 className="text-base font-bold text-yellow-300 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>متجر أدوات ووسائل المساعدة (Power-Ups)</span>
            </h3>
            <p className="text-xs text-slate-400">
              استبدل رصيدك من القطع الذهبية الافتراضية المكتسبة من المسابقات بحزم أدوات ذكية لتخطي أصعب التحديات والمستويات!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Power-up 1: Remove Two Options */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 text-center space-y-3 flex flex-col justify-between shadow-xl">
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-4xl flex items-center justify-center mx-auto shadow-inner">
                  ❌
                </div>
                <h4 className="font-bold text-slate-100 text-base">حذف إجابتين خاطئتين (50:50)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  يقوم بحذف خيارين خاطئين فوراً أثناء الاختبار لزيادة فرصة إجابتك الصحيحة بنسبة 50%.
                </p>
                <div className="text-xs font-mono text-amber-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  الرصيد المتوفر لديك حالياً: <strong>{powerUps.removeTwoCount}</strong> استخدام
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    soundFx.playCoin();
                    onBuyPowerUp("removeTwoCount", 3, 200);
                    showToast("تم شراء حزمة 3 استخدامات (حذف إجابتين) بنجاح! 🎯");
                  }}
                  disabled={user.coins < 200}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Coins className="w-4 h-4" />
                  <span>شراء 3 مرات بـ 200 🪙</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playCoin();
                    onBuyPowerUp("removeTwoCount", 10, 500);
                    showToast("تم شراء الحزمة الاقتصادية 10 استخدامات بنجاح! 🔥");
                  }}
                  disabled={user.coins < 500}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 border border-amber-500/30 transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>حزمة التوفير (10 مرات بـ 500 🪙)</span>
                </button>
              </div>
            </div>

            {/* Power-up 2: Extra Time */}
            <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 text-center space-y-3 flex flex-col justify-between shadow-xl">
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-4xl flex items-center justify-center mx-auto shadow-inner">
                  ⏱️
                </div>
                <h4 className="font-bold text-slate-100 text-base">وقت إضافي (+15 ثانية)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  يمنحك مهلة 15 ثانية إضافية للتفكير في الأسئلة المعقدة وحل الألغاز بهدوء.
                </p>
                <div className="text-xs font-mono text-cyan-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  الرصيد المتوفر لديك حالياً: <strong>{powerUps.extraTimeCount}</strong> استخدام
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    soundFx.playCoin();
                    onBuyPowerUp("extraTimeCount", 3, 150);
                    showToast("تم شراء حزمة 3 استخدامات (وقت إضافي) بنجاح! ⏱️");
                  }}
                  disabled={user.coins < 150}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Coins className="w-4 h-4" />
                  <span>شراء 3 مرات بـ 150 🪙</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playCoin();
                    onBuyPowerUp("extraTimeCount", 10, 400);
                    showToast("تم شراء الحزمة الاقتصادية 10 استخدامات بنجاح! ⚡");
                  }}
                  disabled={user.coins < 400}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 border border-cyan-500/30 transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>حزمة التوفير (10 مرات بـ 400 🪙)</span>
                </button>
              </div>
            </div>

            {/* Power-up 3: AI Smart Hint */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 text-center space-y-3 flex flex-col justify-between shadow-xl">
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-4xl flex items-center justify-center mx-auto shadow-inner">
                  💡
                </div>
                <h4 className="font-bold text-slate-100 text-base">تلميح الذكاء الاصطناعي الذكي</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  يقوم المساعد الذكي بتحليل السؤال وكشف تلميح تاريخي نمياتي يرشدك نحو الإجابة الصحيحة.
                </p>
                <div className="text-xs font-mono text-emerald-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  الرصيد المتوفر لديك حالياً: <strong>{powerUps.aiHintCount}</strong> استخدام
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    soundFx.playCoin();
                    onBuyPowerUp("aiHintCount", 3, 250);
                    showToast("تم شراء حزمة 3 تلميحات ذكية بنجاح! 💡");
                  }}
                  disabled={user.coins < 250}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <Coins className="w-4 h-4" />
                  <span>شراء 3 مرات بـ 250 🪙</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playCoin();
                    onBuyPowerUp("aiHintCount", 10, 650);
                    showToast("تم شراء الحزمة الاقتصادية 10 تلميحات بنجاح! 🌟");
                  }}
                  disabled={user.coins < 650}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl disabled:opacity-40 flex items-center justify-center gap-1.5 border border-emerald-500/30 transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>حزمة التوفير (10 مرات بـ 650 🪙)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AVATARS & ROYAL TITLES STORE */}
      {activeTab === "avatars" && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 space-y-2">
            <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-400" />
              <span>متجر الشخصيات والأفاتارات الملكية</span>
            </h3>
            <p className="text-xs text-slate-400">
              اختر رمزك وشخصيتك النمياتية لتظهر في لوحة المتصدرين وحسابك الشخصي!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AVATAR_CATALOG.map((item) => {
              const isCurrent = user.avatar === item.avatar;
              const isLocked = !item.unlocked && user.coins < item.cost;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-3xl border text-center space-y-3 flex flex-col justify-between transition-all duration-200 ${
                    isCurrent
                      ? "bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400 shadow-xl shadow-amber-500/10 scale-105"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-4xl mx-auto shadow-inner">
                      {item.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-xs sm:text-sm">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.role}</p>
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <div className="py-2 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>مفعل حالياً</span>
                      </div>
                    ) : item.unlocked ? (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onChangeAvatar(item.avatar);
                          showToast(`تم تعيين الأفاتار (${item.name}) بنجاح! 👑`);
                        }}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition active:scale-95"
                      >
                        اختيار هذا الرمز
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (user.coins >= item.cost) {
                            soundFx.playCoin();
                            onUpdateUserCoins(user.coins - item.cost);
                            onChangeAvatar(item.avatar);
                            showToast(`مبروك! تم فتح وتعيين (${item.name}) 🎉`);
                          }
                        }}
                        disabled={user.coins < item.cost}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl disabled:opacity-40 transition flex items-center justify-center gap-1 active:scale-95"
                      >
                        <Lock className="w-3 h-3" />
                        <span>فتح بـ {item.cost} 🪙</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: GOLD VAULT & COIN PACKAGES */}
      {activeTab === "gold_vault" && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 space-y-2">
            <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              <span>خزينة باقات الذهب والمكافآت</span>
            </h3>
            <p className="text-xs text-slate-400">
              اربح واجمع القطع الذهبية الافتراضية عبر إكمال المستويات وتحديات VS اليومية!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Box 1: Daily Chest */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 text-center space-y-3 shadow-xl">
              <div className="text-4xl">🎁</div>
              <h4 className="font-bold text-slate-100 text-sm">صندوق الذهب اليومي</h4>
              <p className="text-xs text-slate-400">افتح الصندوق كل 24 ساعة لربح حتى +250 قطعة ذهبية ونجمتين مجاناً!</p>
              <button
                onClick={() => {
                  soundFx.playClick();
                  if (onNavigateView) onNavigateView("home");
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30"
              >
                افتح من الشاشة الرئيسية
              </button>
            </div>

            {/* Box 2: Fortune Wheel */}
            <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl p-5 text-center space-y-3 shadow-xl">
              <div className="text-4xl">🎡</div>
              <h4 className="font-bold text-slate-100 text-sm">عجلة الحظ الذهبية</h4>
              <p className="text-xs text-slate-400">أدر عجلة الحظ يومياً لربح جوائز كبرى تصل حتى 500 قطعة ذهبية!</p>
              <button
                onClick={() => {
                  soundFx.playClick();
                  if (onNavigateView) onNavigateView("home");
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/30"
              >
                أدر العجلة الآن
              </button>
            </div>

            {/* Box 3: Quiz Battles */}
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 text-center space-y-3 shadow-xl">
              <div className="text-4xl">⚔️</div>
              <h4 className="font-bold text-slate-100 text-sm">تحديات VS والمستويات</h4>
              <p className="text-xs text-slate-400">اهزم الخصوم في وضع التحدي واربح ذهباً مضاعفاً مع كل انتصار!</p>
              <button
                onClick={() => {
                  soundFx.playClick();
                  if (onNavigateView) onNavigateView("vs_mode");
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30"
              >
                بدء تحدي VS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real Coin Checkout Modal */}
      {checkoutListing && (
        <RealCoinCheckoutModal
          listing={checkoutListing}
          currentUser={user}
          onClose={() => setCheckoutListing(null)}
          onOrderSuccess={(order) => {
            const updatedOrders = [order, ...getStoredMarketOrders()];
            setMarketOrders(updatedOrders);
            saveMarketOrders(updatedOrders);
            setCheckoutListing(null);
            showToast(`تم تسجيل طلبك بنجاح برقم: [${order.id}] 📦`);
          }}
        />
      )}

      {/* Add Real Coin Listing Modal */}
      {showAddListingModal && (
        <AddCoinListingModal
          currentUser={user}
          onClose={() => setShowAddListingModal(false)}
          onListingCreated={(newListing) => {
            const updated = [newListing, ...realListings];
            setRealListings(updated);
            setShowAddListingModal(false);
            showToast("تم نشر مسكوكتك في المتجر بنجاح! 🪙");
          }}
        />
      )}

      {/* Orders Management Modal */}
      {showOrdersModal && (
        <StoreOrdersManagementModal
          currentUser={user}
          onClose={() => setShowOrdersModal(false)}
        />
      )}

    </div>
  );
};
