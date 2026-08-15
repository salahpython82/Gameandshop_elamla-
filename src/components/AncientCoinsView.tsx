import React, { useState, useEffect } from "react";
import {
  UserProfile,
  AncientCoin,
  PlayerOwnedCoin,
  CoinAppraisalRecord,
  CoinEra,
  CoinMetal,
  CoinRarity,
  PlayerStore,
  RealCoinListing,
  MarketOrder,
  RealPaymentMethod,
} from "../types";
import {
  getStoredAncientCoinsMarket,
  saveAncientCoinsMarket,
  getStoredPlayerCoinVault,
  savePlayerCoinVault,
  getStoredCoinAppraisals,
  saveCoinAppraisals,
  getStoredPlayerStores,
  savePlayerStores,
  getStoredRealCoinListings,
  saveRealCoinListings,
  getStoredMarketOrders,
  saveMarketOrders,
} from "../utils/storage";
import { evaluateAntiqueCoin, CoinAppraisalInput } from "../utils/coinAppraiser";
import { soundFx } from "../utils/sound";
import { RealCoinCheckoutModal } from "./RealCoinCheckoutModal";
import { CreateStoreModal } from "./CreateStoreModal";
import { AddCoinListingModal } from "./AddCoinListingModal";
import { StoreOrdersManagementModal } from "./StoreOrdersManagementModal";
import {
  Coins,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Award,
  Building2,
  CheckCircle2,
  TrendingUp,
  Tag,
  Eye,
  PlusCircle,
  ShoppingBag,
  RotateCw,
  Scale,
  Compass,
  Scroll,
  Info,
  X,
  History,
  DollarSign,
  Landmark,
  ArrowRight,
  Flame,
  Star,
  Layers,
  FileText,
  CreditCard,
  Truck,
  Phone,
  Package,
  Store,
  Plus,
  Camera,
} from "lucide-react";

interface AncientCoinsViewProps {
  user: UserProfile;
  onUpdateUserCoins: (newCoinAmount: number) => void;
  onNavigateHome: () => void;
}

type CoinTab = "market" | "stores" | "appraisal" | "vault" | "orders";

export const AncientCoinsView: React.FC<AncientCoinsViewProps> = ({
  user,
  onUpdateUserCoins,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<CoinTab>("market");

  // State for Market & Vault
  const [marketCoins, setMarketCoins] = useState<AncientCoin[]>(getStoredAncientCoinsMarket());
  const [playerVault, setPlayerVault] = useState<PlayerOwnedCoin[]>(getStoredPlayerCoinVault());
  const [appraisals, setAppraisals] = useState<CoinAppraisalRecord[]>(getStoredCoinAppraisals());

  // Real Stores & Listings State
  const [playerStores, setPlayerStores] = useState<PlayerStore[]>(getStoredPlayerStores());
  const [realListings, setRealListings] = useState<RealCoinListing[]>(getStoredRealCoinListings());
  const [marketOrders, setMarketOrders] = useState<MarketOrder[]>(getStoredMarketOrders());

  // Modal Controls
  const [checkoutListing, setCheckoutListing] = useState<RealCoinListing | null>(null);
  const [inspectingRealListing, setInspectingRealListing] = useState<RealCoinListing | null>(null);
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [listingImageSide, setListingImageSide] = useState<Record<string, "obverse" | "reverse">>({});

  // Store Market Filters
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const [storePaymentFilter, setStorePaymentFilter] = useState<"all" | RealPaymentMethod>("all");
  const [storeEraFilter, setStoreEraFilter] = useState<string>("all");

  // Market Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEra, setSelectedEra] = useState<string>("all");
  const [selectedMetal, setSelectedMetal] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");

  // Find if current user has a store
  const myStore = playerStores.find(
    (s) =>
      (user.email && s.ownerEmail.toLowerCase() === user.email.toLowerCase()) ||
      s.ownerName === user.name
  );

  // Sync state with storage
  useEffect(() => {
    savePlayerStores(playerStores);
  }, [playerStores]);

  useEffect(() => {
    saveRealCoinListings(realListings);
  }, [realListings]);

  useEffect(() => {
    saveMarketOrders(marketOrders);
  }, [marketOrders]);

  // Inspection Modal State
  const [inspectingCoin, setInspectingCoin] = useState<AncientCoin | null>(null);
  const [coinSide, setCoinSide] = useState<"obverse" | "reverse">("obverse");

  // Appraisal Form State
  const [appraisalQuery, setAppraisalQuery] = useState("");
  const [appraisalEra, setAppraisalEra] = useState("أموي");
  const [appraisalMetal, setAppraisalMetal] = useState("ذهب");
  const [appraisalInscriptions, setAppraisalInscriptions] = useState("");
  const [appraisalLocation, setAppraisalLocation] = useState("");
  const [isAppraising, setIsAppraising] = useState(false);
  const [currentAppraisalResult, setCurrentAppraisalResult] = useState<CoinAppraisalRecord | null>(null);

  // Listing / Selling Form State
  const [selectedVaultCoinToSell, setSelectedVaultCoinToSell] = useState<string>("");
  const [sellPrice, setSellPrice] = useState<number>(1000);

  // Toast / Feedback Notification
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // Sync state with storage
  useEffect(() => {
    saveAncientCoinsMarket(marketCoins);
  }, [marketCoins]);

  useEffect(() => {
    savePlayerCoinVault(playerVault);
  }, [playerVault]);

  useEffect(() => {
    saveCoinAppraisals(appraisals);
  }, [appraisals]);

  // Handle Buy Coin
  const handleBuyCoin = (coin: AncientCoin) => {
    if (user.coins < coin.priceCoins) {
      soundFx.playWrong();
      showNotice("عذراً! رصيد العملات لديك لا يكفي لشراء هذه التحفة النقدية.");
      return;
    }

    soundFx.playCoin();
    const newCoinsBalance = user.coins - coin.priceCoins;
    onUpdateUserCoins(newCoinsBalance);

    // Add to player's vault
    const newInventoryItem: PlayerOwnedCoin = {
      inventoryId: `inv-${Date.now()}`,
      coin: coin,
      acquiredAt: new Date().toISOString().split("T")[0],
      purchasePrice: coin.priceCoins,
      isExhibitedInMuseum: true,
    };

    const updatedVault = [newInventoryItem, ...playerVault];
    setPlayerVault(updatedVault);

    // Decrease market stock if > 0
    const updatedMarket = marketCoins.map((c) =>
      c.id === coin.id ? { ...c, stockCount: Math.max(0, c.stockCount - 1) } : c
    );
    setMarketCoins(updatedMarket);

    soundFx.playVictory();
    showNotice(`مبروك! تم اقتناء [${coin.name}] وإضافتها إلى متحفك وخزانتك بنجاح! 🏛️✨`);
  };

  // Handle Sell Coin from Vault to Treasury / Dealer
  const handleInstantSellToDealer = (ownedItem: PlayerOwnedCoin) => {
    const refundAmount = Math.round(ownedItem.coin.priceCoins * 0.85); // 85% of market value
    soundFx.playCoin();

    const newCoinsBalance = user.coins + refundAmount;
    onUpdateUserCoins(newCoinsBalance);

    // Remove from vault
    const updatedVault = playerVault.filter((item) => item.inventoryId !== ownedItem.inventoryId);
    setPlayerVault(updatedVault);

    soundFx.playVictory();
    showNotice(`تم بيع [${ownedItem.coin.name}] إلى تاجر الآثار وحصلت على ${refundAmount} عملة ذهبية! 💰`);
  };

  // Toggle Exhibition in Museum
  const handleToggleExhibition = (inventoryId: string) => {
    soundFx.playClick();
    const updated = playerVault.map((item) =>
      item.inventoryId === inventoryId
        ? { ...item, isExhibitedInMuseum: !item.isExhibitedInMuseum }
        : item
    );
    setPlayerVault(updated);
    showNotice("تم تحديث حالة عرض العملة في متحفك العام! 🏛️");
  };

  // Handle Appraisal Submission
  const handleRunAppraisal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!appraisalQuery.trim() && !appraisalInscriptions.trim()) {
      showNotice("الرجاء إدخال اسم العملة أو النقوش والكلمات المكتوبة عليها للفحص.");
      return;
    }

    setIsAppraising(true);
    setCurrentAppraisalResult(null);
    soundFx.playClick();

    try {
      const input: CoinAppraisalInput = {
        coinNameOrQuery: appraisalQuery,
        eraOrDynasty: appraisalEra,
        metal: appraisalMetal,
        inscriptionsVisible: appraisalInscriptions,
        foundLocation: appraisalLocation,
      };

      const result = await evaluateAntiqueCoin(input);
      setCurrentAppraisalResult(result);

      // Save to recent appraisals
      const updatedAppraisals = [result, ...appraisals.slice(0, 9)];
      setAppraisals(updatedAppraisals);

      soundFx.playVictory();
      showNotice("اكتمل الفحص والتقييم الأثري بنجاح مع إصدار شهادة الأصالة! 📜✨");
    } catch (err) {
      showNotice("حدث خطأ أثناء فحص العملة، يرجى المحاولة ثانية.");
    } finally {
      setIsAppraising(false);
    }
  };

  // Add appraised coin to vault
  const handleAddAppraisedToVault = (appraisal: CoinAppraisalRecord) => {
    soundFx.playVictory();
    const convertedCoin: AncientCoin = {
      id: `appraised-coin-${Date.now()}`,
      name: appraisal.title,
      era: appraisal.era as CoinEra,
      ruler: appraisal.rulerOrEmpire,
      year: appraisal.estimatedYear,
      mintPlace: appraisal.mintLocation,
      metal: appraisal.metal.includes("ذهب")
        ? "ذهب"
        : appraisal.metal.includes("فضة")
        ? "فضة"
        : "برونز",
      purity: appraisal.metal,
      weightGrams: 4.1,
      diameterMm: 22,
      rarity: appraisal.rarity,
      rarityScore: appraisal.rarityScore,
      grade: appraisal.conditionGrade,
      priceCoins: appraisal.estimatedValueCoins,
      realEstimatedUsd: appraisal.estimatedValueUsd,
      obverseText: appraisal.inscriptionsAnalysis,
      reverseText: `سك معتمد بنسبة ثقة ${appraisal.authenticityConfidence}%`,
      description: appraisal.historicalContext,
      historicalSignificance: appraisal.historicalContext,
      accentColor: appraisal.metal.includes("ذهب")
        ? "from-amber-400 to-yellow-600"
        : "from-slate-300 to-zinc-500",
      badgeIcon: "🪙",
      isCertified: true,
      stockCount: 1,
    };

    const newVaultItem: PlayerOwnedCoin = {
      inventoryId: `inv-appraised-${Date.now()}`,
      coin: convertedCoin,
      acquiredAt: new Date().toISOString().split("T")[0],
      purchasePrice: 0,
      customNotes: "تم تقييمها وفحصها في معمل النميات الأثري",
      isExhibitedInMuseum: true,
    };

    setPlayerVault([newVaultItem, ...playerVault]);
    showNotice(`تم اعتماد العملة المقيّمة وإضافتها إلى متحفك الشخصي! 🏛️`);
    setCurrentAppraisalResult(null);
  };

  // Sell appraised coin directly
  const handleSellAppraisedDirectly = (appraisal: CoinAppraisalRecord) => {
    soundFx.playCoin();
    const earnings = appraisal.estimatedValueCoins;
    onUpdateUserCoins(user.coins + earnings);
    soundFx.playVictory();
    showNotice(`تم بيع العملة المقيّمة للمتحف الوطني بمبلغ ${earnings} عملة ذهبية! 💰`);
    setCurrentAppraisalResult(null);
  };

  // Real Store Handlers
  const handleStoreSaved = (store: PlayerStore) => {
    const existingIdx = playerStores.findIndex((s) => s.id === store.id);
    if (existingIdx !== -1) {
      const updated = [...playerStores];
      updated[existingIdx] = store;
      setPlayerStores(updated);
      showNotice("تم تحديث بيانات متجرك بنجاح! 🏛️");
    } else {
      setPlayerStores([store, ...playerStores]);
      showNotice(`تهانينا! تم إطلاق وتفعيل متجرك [${store.storeName}] بنجاح! 🏪✨`);
    }
    setShowCreateStoreModal(false);
  };

  const handleListingCreated = (newListing: RealCoinListing) => {
    setRealListings([newListing, ...realListings]);
    setShowAddListingModal(false);
    showNotice(`تم نشر القطعة [${newListing.title}] في متجرك وسوق اللاعبين بنجاح! 🪙`);
  };

  const handleOrderCompleted = (order: MarketOrder) => {
    setMarketOrders([order, ...marketOrders]);
    // Increase views/sales on store
    setPlayerStores((prev) =>
      prev.map((s) => (s.storeName === order.storeName ? { ...s, totalSales: s.totalSales + 1 } : s))
    );
    showNotice(`تم تسجيل طلبك [${order.id}] بنجاح، ووصل الإشعار إلى البائع! 📦`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: MarketOrder["orderStatus"]) => {
    setMarketOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    showNotice(`تم تحديث حالة الطلب إلى: [${newStatus}] 🚚`);
  };

  // Filtered Real Coin Listings
  const filteredRealListings = realListings.filter((listing) => {
    const matchesQuery =
      listing.title.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
      listing.storeName.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
      listing.cityLocation.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
      listing.era.toLowerCase().includes(storeSearchQuery.toLowerCase());

    const matchesEra = storeEraFilter === "all" || listing.era === storeEraFilter;
    const matchesPayment =
      storePaymentFilter === "all" || listing.supportedPayments.includes(storePaymentFilter);

    return matchesQuery && matchesEra && matchesPayment;
  });

  // Filtered Market Coins
  const filteredMarketCoins = marketCoins.filter((coin) => {
    const matchesSearch =
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.ruler.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.era.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.mintPlace.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEra = selectedEra === "all" || coin.era === selectedEra;
    const matchesMetal = selectedMetal === "all" || coin.metal === selectedMetal;
    const matchesRarity = selectedRarity === "all" || coin.rarity === selectedRarity;

    return matchesSearch && matchesEra && matchesMetal && matchesRarity;
  });

  // Calculate Museum Prestige & Total Vault Valuation
  const totalVaultValue = playerVault.reduce((acc, curr) => acc + curr.coin.priceCoins, 0);
  const totalGoldCoins = playerVault.filter((i) => i.coin.metal === "ذهب").length;
  const totalSilverCoins = playerVault.filter((i) => i.coin.metal === "فضة").length;
  const museumPrestigeScore = Math.round(
    playerVault.length * 150 + totalGoldCoins * 200 + totalSilverCoins * 80
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Treasury Status */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-950/70 via-slate-900 to-yellow-950/60 rounded-3xl border-2 border-amber-500/40 p-5 sm:p-7 shadow-2xl">
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30">
                <Coins className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-amber-200 flex items-center gap-2">
                  <span>سوق وتقييم العملات النقدية القديمة</span>
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                    مزاد ونميات أثرية 🏛️
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  شراء وبيع وفحص العملات الذهبية والفضية الأثرية النادرة من مختلف الحضارات.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Player Stats Widget */}
          <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-amber-500/30">
            <div className="text-center px-3 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">رصيدك الحالي</span>
              <span className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                <Coins className="w-4 h-4" />
                {user.coins.toLocaleString()}
              </span>
            </div>
            <div className="text-center px-3 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">مقتنياتك</span>
              <span className="text-base font-black text-emerald-400">
                {playerVault.length} تحفة
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-slate-400 block font-bold">هيبة المتحف</span>
              <span className="text-base font-black text-cyan-400 flex items-center justify-center gap-1">
                <Landmark className="w-3.5 h-3.5" />
                {museumPrestigeScore}
              </span>
            </div>
          </div>
        </div>

        {/* Global Action Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-2 border-t border-amber-500/20 scrollbar-none">
          {[
            {
              id: "stores" as CoinTab,
              label: `🏪 متاجر اللاعبين الحقيقية (${realListings.length})`,
              badge: "بريد موب / كارد / كاش",
            },
            {
              id: "market" as CoinTab,
              label: "🏛️ سوق ومزاد المسكوكات",
              badge: "اقتناء بالعملات",
            },
            {
              id: "appraisal" as CoinTab,
              label: "🔬 معمل التقييم والتثمين الذكي",
              badge: "فحص وتوثيق",
            },
            {
              id: "vault" as CoinTab,
              label: `🏺 متحفي وخزانتي (${playerVault.length})`,
              badge: "مقتنياتي الخاصة",
            },
            {
              id: "orders" as CoinTab,
              label: `📦 طلباتي ومبيعاتي (${marketOrders.length})`,
              badge: "تتبع الشحن",
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex flex-col items-center gap-0.5 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black scale-105"
                    : "bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[9px] ${isActive ? "text-slate-900 font-bold opacity-80" : "text-amber-400/80"}`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Notification / Feedback */}
      {notice && (
        <div className="p-3.5 bg-amber-500 text-slate-950 font-bold rounded-2xl shadow-xl flex items-center justify-between text-xs sm:text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:bg-black/10 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 0: REAL PLAYER STORES & PHYSICAL COIN MARKET (متاجر اللاعبين الحقيقية) */}
      {/* ========================================================================= */}
      {activeTab === "stores" && (
        <div className="space-y-6">
          {/* Header & Seller Action Hub */}
          <div className="p-6 bg-slate-900/90 border border-amber-500/30 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏪</span>
                  <h3 className="text-lg font-black text-amber-200">
                    متاجر اللاعبين لبيع وشراء القطع النقدية الحقيقية
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  تسوّق قطعاً نقدية أثرية حقيقية معتمدة من هواة الآثار في الجزائر والوطن العربي.
                  الدفع متاح عبر: <strong className="text-amber-300">الدفع عند الاستلام (COD)</strong>،{" "}
                  <strong className="text-emerald-300">بريد موب (BaridiMob RIP)</strong>، و{" "}
                  <strong className="text-indigo-300">ماستر كارد / فيزا</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setShowCreateStoreModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Store className="w-4 h-4" />
                  <span>{myStore ? "إدارة متجري" : "إنشاء متجري الخاص"}</span>
                </button>

                <button
                  onClick={() => {
                    if (!myStore) {
                      soundFx.playWrong();
                      showNotice("يرجى إنشاء وتفعيل متجرك أولاً لتتمكن من إضافة قطع للبيع!");
                      setShowCreateStoreModal(true);
                      return;
                    }
                    soundFx.playClick();
                    setShowAddListingModal(true);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>عرض قطعة للبيع</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setShowOrdersModal(true);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4" />
                  <span>سجل الطلبات ({marketOrders.length})</span>
                </button>
              </div>
            </div>

            {/* My Active Store Card (if exists) */}
            {myStore && (
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${myStore.bannerGradient} text-white border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black/30 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20">
                    🏛️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm">{myStore.storeName}</h4>
                      <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-400/40">
                        متجر موثق ومفعل ✅
                      </span>
                    </div>
                    <p className="text-xs text-white/80 mt-0.5">
                      المسؤول: {myStore.ownerName} • {myStore.wilayaCity} • الهاتف: {myStore.phoneWhatsApp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="bg-black/30 px-3 py-1.5 rounded-xl text-center border border-white/10">
                    <span className="text-[10px] text-white/70 block">المبيعات</span>
                    <span className="text-xs font-bold">{myStore.totalSales} طلب</span>
                  </div>
                  <div className="bg-black/30 px-3 py-1.5 rounded-xl text-center border border-white/10">
                    <span className="text-[10px] text-white/70 block">التقييم</span>
                    <span className="text-xs font-bold text-yellow-300">★ {myStore.rating}</span>
                  </div>
                  <button
                    onClick={() => setShowAddListingModal(true)}
                    className="px-3 py-1.5 bg-white text-slate-950 rounded-xl text-xs font-black hover:bg-white/90 transition"
                  >
                    + بيع قطعة
                  </button>
                </div>
              </div>
            )}

            {/* Filter and Search Bar for Real Listings */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={storeSearchQuery}
                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                    placeholder="ابحث في متاجر اللاعبين (اسم القطعة، اسم المتجر، الولاية، أو الحقبة)..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                <select
                  value={storeEraFilter}
                  onChange={(e) => setStoreEraFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">جميع العصور والحضارات</option>
                  <option value="نوميدي وشمال إفريقيا">نوميديا وشمال إفريقيا</option>
                  <option value="أموي">الخلافة الأموية</option>
                  <option value="عباسي">الخلافة العباسية</option>
                  <option value="أندلسي ومرابطي">الأندلس والمرابطين</option>
                  <option value="عثماني">الدولة العثمانية</option>
                  <option value="روماني">الإمبراطورية الرومانية</option>
                  <option value="بيزنطي وإغريقي">البيزنطي والإغريقي</option>
                </select>
              </div>

              {/* Payment Method Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-bold shrink-0">طريقة الدفع:</span>
                {[
                  { id: "all", label: "الكل" },
                  { id: "cod", label: "🤝 عند الاستلام (COD)" },
                  { id: "baridimob", label: "📲 بريد موب (BaridiMob)" },
                  { id: "mastercard", label: "💳 ماستر كارد / فيزا" },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      soundFx.playClick();
                      setStorePaymentFilter(chip.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
                      storePaymentFilter === chip.id
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real Coin Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRealListings.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-3">
                <span className="text-4xl block">🏺</span>
                <h4 className="font-bold text-slate-300 text-sm">لم يتم العثور على قطع معروضة للبيع مطابقة للبحث</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  كن أول من يعرض قطعة نقدية حقيقية للبيع في متجرك لجميع اللاعبين!
                </p>
                <button
                  onClick={() => {
                    if (!myStore) setShowCreateStoreModal(true);
                    else setShowAddListingModal(true);
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow transition"
                >
                  {myStore ? "+ عرض قطعة للبيع الآن" : "إنشاء متجر وعرض أول قطعة"}
                </button>
              </div>
            ) : (
              filteredRealListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/50 rounded-3xl p-5 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Top Store Badge */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {listing.storeName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                        📍 {listing.cityLocation}
                      </span>
                    </div>

                    {/* Coin Header with Dual-Side Photo Preview */}
                    <div className="flex items-start gap-3">
                      {listing.obverseImageUrl ? (
                        <div className="relative group/coin shrink-0">
                          <div
                            onClick={() => {
                              if (listing.reverseImageUrl) {
                                soundFx.playClick();
                                setListingImageSide((prev) => ({
                                  ...prev,
                                  [listing.id]: prev[listing.id] === "reverse" ? "obverse" : "reverse",
                                }));
                              } else {
                                soundFx.playClick();
                                setInspectingRealListing(listing);
                              }
                            }}
                            className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shadow-amber-500/20 cursor-pointer relative transition-transform hover:scale-105"
                          >
                            <img
                              src={
                                (listingImageSide[listing.id] === "reverse" && listing.reverseImageUrl)
                                  ? listing.reverseImageUrl
                                  : listing.obverseImageUrl
                              }
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                            {listing.reverseImageUrl && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/coin:opacity-100 transition flex items-center justify-center text-[9px] font-bold text-white">
                                🔄 اقلب
                              </div>
                            )}
                          </div>
                          {listing.reverseImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                setListingImageSide((prev) => ({
                                  ...prev,
                                  [listing.id]: prev[listing.id] === "reverse" ? "obverse" : "reverse",
                                }));
                              }}
                              className="text-[9px] font-bold text-amber-300 hover:text-amber-200 block text-center mt-1 w-full bg-slate-950/70 rounded py-0.5 border border-slate-800"
                            >
                              {listingImageSide[listing.id] === "reverse" ? "الظهر 🔄" : "الوجه 🔄"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 via-yellow-500/10 to-amber-600/30 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition">
                          {listing.badgeIcon}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {listing.era} • {listing.metal}
                          </span>
                          {listing.obverseImageUrl && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-0.5">
                              <Camera className="w-2.5 h-2.5" />
                              <span>صور موثقة</span>
                            </span>
                          )}
                        </div>
                        <h4
                          onClick={() => {
                            soundFx.playClick();
                            setInspectingRealListing(listing);
                          }}
                          className="font-black text-sm text-slate-100 mt-1 leading-snug truncate hover:text-amber-300 cursor-pointer transition"
                        >
                          {listing.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          سنة السك: <strong className="text-slate-300">{listing.year}</strong> • {listing.weightGrams}غ • {listing.diameterMm}ملم
                        </p>
                      </div>
                    </div>

                    {/* Condition & Certificate */}
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                      <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block">درجة الحفظ:</span>
                        <span className="font-bold text-cyan-300">{listing.conditionGrade}</span>
                      </div>
                      <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block">شهادة الأصالة:</span>
                        <span className="font-mono font-bold text-emerald-400 truncate block">
                          {listing.certificateNumber}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300/90 line-clamp-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                      {listing.description}
                    </p>

                    {/* Supported Payments badges */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">طرق الدفع المدعومة:</span>
                      <div className="flex flex-wrap gap-1">
                        {listing.supportedPayments.map((pay) => (
                          <span
                            key={pay}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              pay === "baridimob"
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                                : pay === "mastercard"
                                ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {pay === "baridimob"
                              ? "📲 بريد موب BaridiMob"
                              : pay === "mastercard"
                              ? "💳 ماستر كارد / فيزا"
                              : "🤝 عند الاستلام COD"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & Buy Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">السعر المطلوب:</span>
                      <div className="text-base font-black text-amber-300">
                        {listing.realPriceDzd.toLocaleString()}{" "}
                        <span className="text-xs font-bold text-slate-400">د.ج DZD</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ≈ ${listing.realPriceUsd} USD
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setInspectingRealListing(listing);
                        }}
                        title="معاينة صور الوجهين وتفاصيل الشهادة"
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl transition border border-slate-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={`tel:${listing.sellerPhone}`}
                        title="تواصل مع البائع"
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition border border-slate-700"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setCheckoutListing(listing);
                        }}
                        className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>طلب وشراء فوري</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ORDERS & SALES TRACKING (طلباتي ومبيعاتي) */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-amber-200 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <span>سجل المشتريات ومبيعات المتاجر الحقيقية</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                تتبع حالة الشحن، إيصالات الدفع ببريد موب، وتأكيد الاستلام
              </p>
            </div>
            <button
              onClick={() => setActiveTab("stores")}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition"
            >
              تصفح السوق والمتاجر 🏪
            </button>
          </div>

          <StoreOrdersManagementModal
            orders={marketOrders}
            currentUser={user}
            playerStore={myStore}
            onClose={() => setActiveTab("stores")}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ANCIENT COINS MARKET (سوق العملات القديمة) */}
      {/* ========================================================================= */}
      {activeTab === "market" && (
        <div className="space-y-5">
          {/* Search and Filters Bar */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم العملة، الحاكم (عبد الملك، قيصر، ماسينيسا...)، أو دار السك..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Era Selector */}
              <select
                value={selectedEra}
                onChange={(e) => setSelectedEra(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="all">جميع العصور والحضارات</option>
                <option value="أموي">الخلافة الأموية</option>
                <option value="عباسي">الخلافة العباسية</option>
                <option value="نوميدي وشمال إفريقيا">نوميديا وشمال إفريقيا</option>
                <option value="أندلسي ومرابطي">الأندلس والمرابطين</option>
                <option value="فاطمي وأيوبي">الفاطمي والأيوبي</option>
                <option value="عثماني">الدولة العثمانية</option>
                <option value="روماني">الإمبراطورية الرومانية</option>
                <option value="بيزنطي وإغريقي">البيزنطي والإغريقي</option>
              </select>

              {/* Metal Selector */}
              <select
                value={selectedMetal}
                onChange={(e) => setSelectedMetal(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="all">كل المعادن</option>
                <option value="ذهب">ذهب خالص 🪙</option>
                <option value="فضة">فضة أصلية ⚪</option>
                <option value="برونز">برونز عتيق 🟤</option>
              </select>
            </div>
          </div>

          {/* Market Coins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMarketCoins.map((coin) => {
              const isOwned = playerVault.some((p) => p.coin.id === coin.id);
              const canAfford = user.coins >= coin.priceCoins;

              return (
                <div
                  key={coin.id}
                  className="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between shadow-xl"
                >
                  {/* Top Era & Rarity Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-black bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      {coin.era}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          coin.rarity === "فريد ومتحفي"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : coin.rarity === "نادر جداً"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        {coin.rarity}
                      </span>
                      {coin.isCertified && (
                        <span
                          className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                          title="شهادة فحص وتوثيق أصلية"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          أصلي 100%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Coin Emblem and Main Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${coin.accentColor} p-1 shadow-lg shadow-amber-500/20 flex-shrink-0 flex items-center justify-center border-2 border-amber-300/40 transform group-hover:scale-105 transition-transform`}
                    >
                      <div className="w-full h-full rounded-full border border-black/20 flex flex-col items-center justify-center text-center p-1">
                        <span className="text-xl">{coin.badgeIcon}</span>
                        <span className="text-[8px] font-black text-slate-950 leading-tight">
                          {coin.metal}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                        {coin.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <span>🏛️ {coin.mintPlace}</span>
                        <span>•</span>
                        <span>👑 {coin.ruler}</span>
                      </p>
                    </div>
                  </div>

                  {/* Metal specs & description */}
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    {coin.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-950/80 p-2 rounded-xl border border-slate-800 mb-4">
                    <div>
                      <span className="text-slate-500 block">الوزن والقطر</span>
                      <span className="text-slate-200 font-bold">
                        {coin.weightGrams}g | {coin.diameterMm}mm
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">الحفظ (Grade)</span>
                      <span className="text-cyan-300 font-bold">{coin.grade}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">القيمة بالدولار</span>
                      <span className="text-emerald-400 font-bold">{coin.realEstimatedUsd}</span>
                    </div>
                  </div>

                  {/* Footer Price & Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">
                        سعر الاقتناء:
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 font-black text-base">
                        <Coins className="w-4 h-4" />
                        <span>{coin.priceCoins.toLocaleString()} عملة</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setInspectingCoin(coin);
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>فحص وتفاصيل</span>
                      </button>

                      <button
                        onClick={() => handleBuyCoin(coin)}
                        disabled={isOwned || !canAfford}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                          isOwned
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30 cursor-default"
                            : canAfford
                            ? "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95"
                            : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isOwned ? "في خزينتك ✓" : "شراء العملة"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI & EXPERT COIN APPRAISAL (معمل تقييم وفحص النقود) */}
      {/* ========================================================================= */}
      {activeTab === "appraisal" && (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="p-5 bg-gradient-to-br from-cyan-950/70 via-slate-900 to-blue-950/60 rounded-3xl border border-cyan-500/30 shadow-xl space-y-2">
            <h3 className="text-lg font-black text-cyan-200 flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              <span>معمل النميات الأثري لتقييم وتثمين العملات القديمة</span>
            </h3>
            <p className="text-xs text-slate-300">
              أدخل بيانات أو نقوش أي عملة قديمة حقيقية ليقوم النظام الذكي بفحص أصالتها، تحديد عصرها،
              وتقدير قيمتها في المزادات العالمية وفي اللعبة.
            </p>
          </div>

          {/* Appraisal Input Form */}
          <form
            onSubmit={handleRunAppraisal}
            className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl"
          >
            {/* Presets / Quick suggestions */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-2">
                نماذج عملات أثرية حقيقية للفحص السريع:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  "دينار عبد الملك بن مروان 77 هـ",
                  "عملة الملك ماسينيسا النوميدية",
                  "درهم هارون الرشيد الفضي",
                  "ديناريوس يوليوس قيصر الروماني",
                  "دينار يوسف بن تاشفين المرابطي",
                  "سلطاني سليمان القانوني العثماني",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setAppraisalQuery(sample);
                    }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  اسم العملة أو الوصف الظاهر:
                </label>
                <input
                  type="text"
                  value={appraisalQuery}
                  onChange={(e) => setAppraisalQuery(e.target.value)}
                  placeholder="مثال: فلس أموي قديم، درهم فضي عليه رسم بومة، قطعة ذهبية رومانية..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  النقوش أو الكلمات المكتوبة على الوجه والظهر:
                </label>
                <input
                  type="text"
                  value={appraisalInscriptions}
                  onChange={(e) => setAppraisalInscriptions(e.target.value)}
                  placeholder="مثال: لا إله إلا الله، CAESAR، بسم الله ضرب هذا الدرهم..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نوع المعدن:</label>
                <select
                  value={appraisalMetal}
                  onChange={(e) => setAppraisalMetal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="ذهب">ذهب خالص 🪙</option>
                  <option value="فضة">فضة خالصة ⚪</option>
                  <option value="برونز">برونز ملكي 🟤</option>
                  <option value="نحاس">نحاس أثري معتق</option>
                  <option value="إلكتروم">إلكتروم (مزيج ذهب وفضة)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  العصر أو الحضارة المتوقعة:
                </label>
                <select
                  value={appraisalEra}
                  onChange={(e) => setAppraisalEra(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="أموي">أموي إسلامي</option>
                  <option value="عباسي">عباسي إسلامي</option>
                  <option value="نوميدي وشمال إفريقيا">نوميدي أمازيغي</option>
                  <option value="أندلسي ومرابطي">أندلسي ومرابطي</option>
                  <option value="فاطمي وأيوبي">فاطمي وأيوبي</option>
                  <option value="عثماني">عثماني</option>
                  <option value="روماني">روماني قديم</option>
                  <option value="بيزنطي وإغريقي">بيزنطي وإغريقي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  مكان العثور أو المدينة:
                </label>
                <input
                  type="text"
                  value={appraisalLocation}
                  onChange={(e) => setAppraisalLocation(e.target.value)}
                  placeholder="مثال: دمشق، قسنطينة، روما، بغداد..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAppraising}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAppraising ? (
                <>
                  <RotateCw className="w-5 h-5 animate-spin text-slate-950" />
                  <span>جاري الفحص الميكروسكوبي وتدقيق نقوش السك والأصالة...</span>
                </>
              ) : (
                <>
                  <Scale className="w-5 h-5 text-slate-950" />
                  <span>بدء الفحص والتقييم الأثري وإصدار الشهادة 📜</span>
                </>
              )}
            </button>
          </form>

          {/* Appraisal Certificate Result */}
          {currentAppraisalResult && (
            <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/50 rounded-3xl space-y-5 shadow-2xl animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <Scroll className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">
                      شهادة فحص وتوثيق أثري معتمدة
                    </span>
                    <h4 className="text-lg font-black text-white">
                      {currentAppraisalResult.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl font-black flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    نسبة الثقة: {currentAppraisalResult.authenticityConfidence}%
                  </span>
                </div>
              </div>

              {/* Appraisal Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">العصر والحضارة</span>
                  <span className="text-xs font-bold text-amber-300">
                    {currentAppraisalResult.era}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">الحاكم أو دار السك</span>
                  <span className="text-xs font-bold text-slate-200">
                    {currentAppraisalResult.rulerOrEmpire}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">مؤشر الندرة الأثرية</span>
                  <span className="text-xs font-bold text-purple-300">
                    {currentAppraisalResult.rarity} ({currentAppraisalResult.rarityScore}/100)
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">حالة الحفظ (Grading)</span>
                  <span className="text-xs font-bold text-cyan-300">
                    {currentAppraisalResult.conditionGrade}
                  </span>
                </div>
              </div>

              {/* Valuation Box */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-300 block">
                    القيمة التقديرية المعتمدة:
                  </span>
                  <p className="text-xl font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
                    <Coins className="w-5 h-5" />
                    <span>
                      {currentAppraisalResult.estimatedValueCoins.toLocaleString()} عملة ذهبية
                    </span>
                    <span className="text-xs text-slate-400 font-normal mr-2">
                      (تعادل {currentAppraisalResult.estimatedValueUsd} في المزادات الدولية)
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleAddAppraisedToVault(currentAppraisalResult)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Landmark className="w-4 h-4" />
                    <span>إضافة لمتحفي 🏛️</span>
                  </button>

                  <button
                    onClick={() => handleSellAppraisedDirectly(currentAppraisalResult)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>بيع فوري للمتحف 💰</span>
                  </button>
                </div>
              </div>

              {/* Analysis and Historical Context */}
              <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p>
                  <strong className="text-cyan-400 font-bold">تحليل النقوش والسبك:</strong>{" "}
                  {currentAppraisalResult.inscriptionsAnalysis}
                </p>
                <p>
                  <strong className="text-amber-400 font-bold">الأهمية التاريخية:</strong>{" "}
                  {currentAppraisalResult.historicalContext}
                </p>
              </div>
            </div>
          )}

          {/* Appraisal Records History */}
          {appraisals.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" />
                <span>سجل التقييمات والفحوصات الأخيرة ({appraisals.length}):</span>
              </h4>

              <div className="space-y-2">
                {appraisals.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-200 block">{item.title}</span>
                      <span className="text-[11px] text-slate-400">
                        {item.era} • {item.metal} • {item.rarity}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-amber-400 block">
                        {item.estimatedValueCoins.toLocaleString()} عملة
                      </span>
                      <span className="text-[10px] text-slate-500">{item.appraisedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PLAYER'S VAULT & PERSONAL MUSEUM (متحفي ومقتنياتي) */}
      {/* ========================================================================= */}
      {activeTab === "vault" && (
        <div className="space-y-6">
          {/* Museum Dashboard Card */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-amber-950/60 via-slate-900 to-yellow-950/40 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30">
                  <Landmark className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-amber-200">
                    متحف العملات والمسكوكات الخاص بك 🏛️
                  </h3>
                  <p className="text-xs text-slate-300">
                    معرض المقتنيات النادرة التي تمتلكها مع إمكانية عرضها للزوار أو بيعها للمزاد.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold">
                  تصنيف المعرض: ملكي 👑
                </span>
              </div>
            </div>

            {/* Collection Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2 border-t border-amber-500/20">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">إجمالي القطع</span>
                <span className="text-base font-black text-amber-400">{playerVault.length}</span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">مسكوكات الذهب</span>
                <span className="text-base font-black text-yellow-300">{totalGoldCoins}</span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">مسكوكات الفضة</span>
                <span className="text-base font-black text-slate-200">{totalSilverCoins}</span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">القيمة الإجمالية</span>
                <span className="text-base font-black text-emerald-400">
                  {totalVaultValue.toLocaleString()} 🪙
                </span>
              </div>
            </div>
          </div>

          {/* Owned Coins Grid */}
          {playerVault.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Coins className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-300 text-sm">خزانتك ومتحفك فارغ حالياً</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                قم باقتناء عملات تاريخية نادرة من السوق أو تقييم عملة واكتشاف أصالتها لإضافتها إلى
                متحفك الشخصي.
              </p>
              <button
                onClick={() => setActiveTab("market")}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
              >
                تصفح سوق العملات الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playerVault.map((item) => (
                <div
                  key={item.inventoryId}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                        {item.coin.era}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.isExhibitedInMuseum
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {item.isExhibitedInMuseum ? "معروض في المتحف 🏛️" : "في الخزينة الخاصة 🔒"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${item.coin.accentColor} p-1 flex-shrink-0 flex items-center justify-center border border-amber-300/40`}
                      >
                        <span className="text-xl">{item.coin.badgeIcon}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-sm sm:text-base text-white">
                          {item.coin.name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {item.coin.mintPlace} • {item.coin.ruler}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 line-clamp-2">
                      {item.coin.description}
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block">المعدن</span>
                        <span className="text-amber-300 font-bold">{item.coin.metal}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">تاريخ الاقتناء</span>
                        <span className="text-slate-300 font-bold">{item.acquiredAt}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">القيمة التقديرية</span>
                        <span className="text-emerald-400 font-bold">
                          {item.coin.priceCoins} 🪙
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Details, Toggle Museum, Sell */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setInspectingCoin(item.coin);
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1 transition-colors"
                      title="فحص التفاصيل"
                    >
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>فحص</span>
                    </button>

                    <button
                      onClick={() => handleToggleExhibition(item.inventoryId)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                        item.isExhibitedInMuseum
                          ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                          : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                      }`}
                    >
                      {item.isExhibitedInMuseum ? "نقل للخزينة" : "عرض بالمتحف"}
                    </button>

                    <button
                      onClick={() => handleInstantSellToDealer(item)}
                      className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>بيع لتاجر الآثار</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COIN DETAIL INSPECTION MODAL (نافذة الفحص الميكروسكوبي ثلاثي الأبعاد) */}
      {/* ========================================================================= */}
      {inspectingCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setInspectingCoin(null)}
              className="absolute top-4 left-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-2">
              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {inspectingCoin.era} • {inspectingCoin.metal}
              </span>
              <h3 className="text-xl font-black text-white">{inspectingCoin.name}</h3>
              <p className="text-xs text-slate-400">
                دار السك: {inspectingCoin.mintPlace} | سنة الإصدار: {inspectingCoin.year}
              </p>
            </div>

            {/* 3D Realistic Coin Visual Display with Flip Interaction */}
            <div className="flex flex-col items-center justify-center py-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <div
                onClick={() => {
                  soundFx.playClick();
                  setCoinSide(coinSide === "obverse" ? "reverse" : "obverse");
                }}
                className="cursor-pointer group relative w-40 h-40 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 p-2 shadow-2xl shadow-amber-500/30 flex items-center justify-center border-4 border-amber-300/60 transform transition-transform duration-500 hover:scale-105"
              >
                <div className="w-full h-full rounded-full border-2 border-dashed border-black/30 flex flex-col items-center justify-center text-center p-2 bg-black/10">
                  <span className="text-4xl mb-1">{inspectingCoin.badgeIcon}</span>
                  <span className="text-[10px] font-black text-slate-950 px-2 bg-amber-200/80 rounded-full">
                    {coinSide === "obverse" ? "وجه المسكوك (Obverse)" : "ظهر المسكوك (Reverse)"}
                  </span>
                  <span className="text-[9px] text-slate-900 mt-1 font-bold">
                    انقر للقلب 🔄
                  </span>
                </div>
              </div>

              <div className="text-center px-4">
                <span className="text-[11px] font-bold text-amber-300 block mb-1">
                  {coinSide === "obverse" ? "📜 النقوش المنحوتة على الوجه:" : "📜 النقوش المنحوتة على الظهر:"}
                </span>
                <p className="text-xs text-slate-200 font-medium bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  {coinSide === "obverse" ? inspectingCoin.obverseText : inspectingCoin.reverseText}
                </p>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">درجة النقاء</span>
                <span className="text-slate-200 font-bold">{inspectingCoin.purity}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">الوزن الرسمي</span>
                <span className="text-slate-200 font-bold">{inspectingCoin.weightGrams} غرام</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">القطر</span>
                <span className="text-slate-200 font-bold">{inspectingCoin.diameterMm} ملم</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">درجة الحفظ</span>
                <span className="text-cyan-300 font-bold">{inspectingCoin.grade}</span>
              </div>
            </div>

            {/* Historical Significance */}
            <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
              <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400" />
                <span>الأهمية والسياق التاريخي:</span>
              </h5>
              <p className="text-slate-300 leading-relaxed">
                {inspectingCoin.historicalSignificance}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="text-amber-400 font-black text-lg flex items-center gap-1">
                <Coins className="w-5 h-5" />
                <span>{inspectingCoin.priceCoins.toLocaleString()} عملة</span>
              </div>

              <button
                onClick={() => {
                  handleBuyCoin(inspectingCoin);
                  setInspectingCoin(null);
                }}
                disabled={user.coins < inspectingCoin.priceCoins}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-transform disabled:opacity-50"
              >
                شراء واقتناء العملة الآن 🛒
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REAL COIN DETAIL & DUAL-SIDE PHOTO INSPECTION MODAL */}
      {/* ========================================================================= */}
      {inspectingRealListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto dir-rtl animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden my-6 max-h-[90vh] flex flex-col justify-between">
            
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-200">
                    معاينة وفحص القطعة النقدية الأثرية (الوجه والظهر)
                  </h3>
                  <p className="text-xs text-slate-400">
                    المتجر البائع: <span className="text-amber-300 font-bold">{inspectingRealListing.storeName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingRealListing(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {/* Title & Era */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {inspectingRealListing.era} • {inspectingRealListing.metal}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    درجة الحفظ: {inspectingRealListing.conditionGrade}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    شهادة: {inspectingRealListing.certificateNumber}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                  {inspectingRealListing.title}
                </h2>
              </div>

              {/* Dual-Side High-Res Photos Showcase */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/20 space-y-3">
                <span className="text-xs font-black text-amber-300 block text-center">
                  📸 صور التوثيق الميداني للقطعة (الوجه الأمامي والوجه الخلفي):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Obverse Box */}
                  <div className="flex flex-col items-center p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      الوجه الأمامي (Obverse)
                    </span>
                    <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-lg shadow-amber-500/20 bg-slate-950 flex items-center justify-center">
                      {inspectingRealListing.obverseImageUrl ? (
                        <img
                          src={inspectingRealListing.obverseImageUrl}
                          alt="الوجه الأمامي"
                          className="w-full h-full object-cover hover:scale-110 transition duration-300"
                        />
                      ) : (
                        <div className="text-4xl">{inspectingRealListing.badgeIcon}</div>
                      )}
                    </div>
                    {inspectingRealListing.obverseNotes && (
                      <p className="text-[10px] text-slate-300 text-center italic bg-slate-950 p-1.5 rounded-lg border border-slate-800 w-full">
                        "{inspectingRealListing.obverseNotes}"
                      </p>
                    )}
                  </div>

                  {/* Reverse Box */}
                  <div className="flex flex-col items-center p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      الوجه الخلفي / الظهر (Reverse)
                    </span>
                    <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-lg shadow-amber-500/20 bg-slate-950 flex items-center justify-center">
                      {inspectingRealListing.reverseImageUrl ? (
                        <img
                          src={inspectingRealListing.reverseImageUrl}
                          alt="الوجه الخلفي"
                          className="w-full h-full object-cover hover:scale-110 transition duration-300"
                        />
                      ) : (
                        <div className="text-4xl">{inspectingRealListing.badgeIcon}</div>
                      )}
                    </div>
                    {inspectingRealListing.reverseNotes && (
                      <p className="text-[10px] text-slate-300 text-center italic bg-slate-950 p-1.5 rounded-lg border border-slate-800 w-full">
                        "{inspectingRealListing.reverseNotes}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Specifications Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">تاريخ السك</span>
                  <span className="font-bold text-slate-200">{inspectingRealListing.year}</span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">الوزن الصافي</span>
                  <span className="font-bold text-amber-300">{inspectingRealListing.weightGrams} غرام</span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">القطر</span>
                  <span className="font-bold text-slate-200">{inspectingRealListing.diameterMm} ملم</span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">الموقع والتسليم</span>
                  <span className="font-bold text-emerald-400">{inspectingRealListing.cityLocation}</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-amber-300 block">وصف وتاريخ القطعة:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {inspectingRealListing.description}
                </p>
              </div>

              {/* Seller Contact Info */}
              <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-slate-200 block">{inspectingRealListing.storeName}</span>
                    <span className="text-[10px] text-slate-400">{inspectingRealListing.sellerPhone}</span>
                  </div>
                </div>
                <a
                  href={`tel:${inspectingRealListing.sellerPhone}`}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold transition flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال / واتساب</span>
                </a>
              </div>

            </div>

            {/* Modal Footer / Checkout Action */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">السعر الإجمالي:</span>
                <div className="text-lg font-black text-amber-300">
                  {inspectingRealListing.realPriceDzd.toLocaleString()}{" "}
                  <span className="text-xs font-bold text-slate-400">د.ج (DZD)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectingRealListing(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutListing(inspectingRealListing);
                    setInspectingRealListing(null);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>متابعة الشراء واختيار الدفع</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REAL COIN CHECKOUT MODAL (COD / BARIDIMOB / MASTERCARD) */}
      {/* ========================================================================= */}
      {checkoutListing && (
        <RealCoinCheckoutModal
          listing={checkoutListing}
          currentUser={user}
          onClose={() => setCheckoutListing(null)}
          onOrderCompleted={handleOrderCompleted}
        />
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT STORE MODAL */}
      {/* ========================================================================= */}
      {showCreateStoreModal && (
        <CreateStoreModal
          currentUser={user}
          existingStore={myStore}
          onClose={() => setShowCreateStoreModal(false)}
          onStoreSaved={handleStoreSaved}
        />
      )}

      {/* ========================================================================= */}
      {/* ADD REAL COIN LISTING MODAL */}
      {/* ========================================================================= */}
      {showAddListingModal && myStore && (
        <AddCoinListingModal
          playerStore={myStore}
          onClose={() => setShowAddListingModal(false)}
          onListingCreated={handleListingCreated}
        />
      )}

      {/* ========================================================================= */}
      {/* ORDERS & PURCHASES MODAL */}
      {/* ========================================================================= */}
      {showOrdersModal && (
        <StoreOrdersManagementModal
          orders={marketOrders}
          currentUser={user}
          playerStore={myStore}
          onClose={() => setShowOrdersModal(false)}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}
    </div>
  );
};
