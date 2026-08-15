import React, { useState } from "react";
import { RealCoinListing, MarketOrder, RealPaymentMethod, UserProfile } from "../types";
import { soundFx } from "../utils/sound";
import {
  X,
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Phone,
  MapPin,
  FileText,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Download,
  Building,
} from "lucide-react";

interface RealCoinCheckoutModalProps {
  listing: RealCoinListing;
  currentUser: UserProfile;
  onClose: () => void;
  onOrderCompleted: (order: MarketOrder) => void;
}

export const RealCoinCheckoutModal: React.FC<RealCoinCheckoutModalProps> = ({
  listing,
  currentUser,
  onClose,
  onOrderCompleted,
}) => {
  // Step: 1 = Buyer Info & Delivery, 2 = Payment Method & Details, 3 = Confirmation / Invoice
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Buyer Form Details
  const [buyerName, setBuyerName] = useState(currentUser.name || "");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerWilaya, setBuyerWilaya] = useState("الجزائر العاصمة (16)");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerNotes, setBuyerNotes] = useState("");

  // Payment Selection
  const [selectedPayment, setSelectedPayment] = useState<RealPaymentMethod>(
    listing.supportedPayments[0] || "baridimob"
  );

  // BaridiMob details
  const [baridiMobTxnRef, setBaridiMobTxnRef] = useState(
    `BM-${Math.floor(10000000 + Math.random() * 90000000)}`
  );
  const [copiedRip, setCopiedRip] = useState(false);

  // Mastercard Details
  const [cardNumber, setCardNumber] = useState("5399 •••• •••• 4128");
  const [cardExpiry, setCardExpiry] = useState("08/28");
  const [cardCvv, setCardCvv] = useState("784");
  const [cardHolder, setCardHolder] = useState(currentUser.name || "MEMBER HOLDER");
  const [cardOtp, setCardOtp] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Completed Order State
  const [createdOrder, setCreatedOrder] = useState<MarketOrder | null>(null);

  // Algerian Wilayas list for delivery
  const ALGERIAN_WILAYAS = [
    "01 - أدرار", "02 - الشلف", "03 - الأغواط", "04 - أم البواقي", "05 - باتنة",
    "06 - بجاية", "07 - بسكرة", "08 - بشار", "09 - البليدة", "10 - البويرة",
    "11 - تمنراست", "12 - تبسة", "13 - تلمسان", "14 - تيارت", "15 - تيزي وزو",
    "16 - الجزائر العاصمة", "17 - الجلفة", "18 - جيجل", "19 - سطيف", "20 - سعيدة",
    "21 - سكيكدة", "22 - سيدي بلعباس", "23 - عنابة", "24 - قالمة", "25 - قسنطينة",
    "26 - المدية", "27 - مستغانم", "28 - المسيلة", "29 - معسكر", "30 - ورقلة",
    "31 - وهران", "32 - البيض", "33 - إليزي", "34 - برج بوعريريج", "35 - بومرداس",
    "36 - الطارف", "37 - تندوف", "38 - تسمسيلت", "39 - الوادي", "40 - خنشلة",
    "41 - سوق أهراس", "42 - تيبازة", "43 - ميلة", "44 - عين الدفلى", "45 - النعامة",
    "46 - عين تموشنت", "47 - غرداية", "48 - غليزان", "49 - تيميمون", "50 - برج باجي مختار",
    "51 - أولاد جلال", "52 - بني عباس", "53 - عين صالح", "54 - عين قزام", "55 - تقرت",
    "56 - جانت", "57 - المغير", "58 - المنيعة"
  ];

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim() || !buyerAddress.trim()) {
      soundFx.playWrong();
      alert("يرجى ملء جميع بيانات التوصيل ورقم الهاتف لمتابعة الطلب.");
      return;
    }
    soundFx.playClick();
    setStep(2);
  };

  const handleConfirmOrder = () => {
    if (selectedPayment === "mastercard" && !showOtpScreen) {
      setIsProcessingPayment(true);
      setTimeout(() => {
        setIsProcessingPayment(false);
        setShowOtpScreen(true);
      }, 900);
      return;
    }

    // Process completion
    soundFx.playVictory();

    const orderId = `ORD-DZ-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingCode = `DZ-EXP-${Math.floor(100000 + Math.random() * 900000)}`;
    const platformFee = 100;
    const sellerPayout = Math.max(0, listing.realPriceDzd - platformFee);

    const newOrder: MarketOrder = {
      id: orderId,
      listingId: listing.id,
      listingTitle: listing.title,
      storeName: listing.storeName,
      sellerEmail: listing.sellerEmail,
      buyerEmail: currentUser.email || "guest@quiz.com",
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerAddressWilaya: `${buyerWilaya} - ${buyerAddress.trim()}`,
      priceDzd: listing.realPriceDzd,
      platformFeeDzd: platformFee,
      sellerPayoutDzd: sellerPayout,
      paymentMethod: selectedPayment,
      paymentStatus:
        selectedPayment === "cod"
          ? "cod_on_delivery"
          : selectedPayment === "mastercard"
          ? "confirmed_paid"
          : "confirmed_paid",
      orderStatus:
        selectedPayment === "cod"
          ? "قيد المراجعة"
          : "تم الدفع وتجهيز الطرد",
      trackingNumber: trackingCode,
      createdAt: new Date().toISOString().split("T")[0],
      baridiMobTransactionRef:
        selectedPayment === "baridimob" ? baridiMobTxnRef : undefined,
      cardLast4: selectedPayment === "mastercard" ? "4128" : undefined,
      notes: buyerNotes.trim() || undefined,
    };

    setCreatedOrder(newOrder);
    onOrderCompleted(newOrder);
    setStep(3);
  };

  const handleCopyRip = (rip: string) => {
    navigator.clipboard.writeText(rip);
    setCopiedRip(true);
    soundFx.playCoin();
    setTimeout(() => setCopiedRip(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto dir-rtl">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 p-5 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              🛒
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-200">
                إتمام شراء قطعة نقدية حقيقية
              </h2>
              <p className="text-xs text-slate-400">
                المتجر: <span className="text-amber-300 font-bold">{listing.storeName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-around bg-slate-950/60 px-6 py-3 border-b border-slate-800 text-xs font-bold">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-amber-400" : "text-slate-500"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"}`}>
              1
            </span>
            <span>بيانات التوصيل</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-800" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-amber-400" : "text-slate-500"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"}`}>
              2
            </span>
            <span>طريقة الدفع (بريد موب / عند الاستلام / كارد)</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-800" />
          <div className={`flex items-center gap-2 ${step === 3 ? "text-emerald-400" : "text-slate-500"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? "bg-emerald-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"}`}>
              3
            </span>
            <span>الفاتورة والتتبع</span>
          </div>
        </div>

        {/* Coin Quick Summary Card */}
        <div className="m-5 p-4 bg-slate-950/80 rounded-2xl border border-amber-500/20 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {listing.obverseImageUrl ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shadow-amber-500/20 relative">
                    <img
                      src={listing.obverseImageUrl}
                      alt="وجه القطعة"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {listing.reverseImageUrl && (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 opacity-80 shadow relative">
                      <img
                        src={listing.reverseImageUrl}
                        alt="ظهر القطعة"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/30 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {listing.badgeIcon || "🪙"}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{listing.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>الحقبة: {listing.era}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{listing.conditionGrade}</span>
                </div>
                {listing.certificateNumber && (
                  <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                    شهادة: {listing.certificateNumber}
                  </div>
                )}
              </div>
            </div>
            <div className="text-left shrink-0 self-end sm:self-center">
              <div className="text-xs text-slate-400">إجمالي قيمة الصفقة</div>
              <div className="text-lg font-black text-amber-300">
                {listing.realPriceDzd.toLocaleString()} <span className="text-xs">د.ج (DZD)</span>
              </div>
            </div>
          </div>

          {/* Platform Fee Breakdown Notice */}
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>رسوم المنصة والتوثيق (اقتطاع لصالح مالك التطبيق): <strong>100 د.ج</strong></span>
            </div>
            <div className="text-slate-400">
              صافي استحقاق المتجر البائع: <strong className="text-emerald-400">{Math.max(0, listing.realPriceDzd - 100).toLocaleString()} د.ج</strong>
            </div>
          </div>
        </div>

        {/* STEP 1: Buyer Information & Delivery */}
        {step === 1 && (
          <form onSubmit={handleNextToPayment} className="p-5 space-y-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الاسم الكامل للمشتري *
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="مثال: كريم بن مسعود"
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رقم الهاتف (للتواصل وتأكيد الشحن) *
                </label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="مثال: 0550 12 34 56"
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الولاية *
                </label>
                <select
                  value={buyerWilaya}
                  onChange={(e) => setBuyerWilaya(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                >
                  {ALGERIAN_WILAYAS.map((w) => (
                    <option key={w} value={w} className="bg-slate-900 text-slate-100">
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  البلدية والحي والعنوان بالتفصيل *
                </label>
                <input
                  type="text"
                  required
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="مثال: دالي إبراهيم، حي النصر عمارة 4"
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                ملاحظات أو توجيهات خاصة بالتسليم (اختياري)
              </label>
              <textarea
                rows={2}
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة، ووضع شهادة الأصالة داخل الظرف المبطن..."
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none transition"
              />
            </div>

            {/* Delivery Guarantee notice */}
            <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ضمان أصالة ومعاينة:</span> يحق لك فحص القطعة النقدية والتأكد من مطابقتها للصور والشهادة المرفقة قبل استلامها النهائي.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
              >
                <span>المتابعة لاختيار طريقة الدفع</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Payment Method Selection */}
        {step === 2 && (
          <div className="p-5 space-y-5 pt-0">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2.5">
                اختر طريقة الدفع المناسبة لك:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1: الدفع عند الاستلام */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedPayment("cod");
                    setShowOtpScreen(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    selectedPayment === "cod"
                      ? "bg-amber-500/15 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-lg">
                      🤝
                    </span>
                    {selectedPayment === "cod" && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">الدفع عند الاستلام</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      يداً بيد مع إمكانية المعاينة قبل الدفع
                    </p>
                  </div>
                </button>

                {/* 2: بريد موب BaridiMob */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedPayment("baridimob");
                    setShowOtpScreen(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    selectedPayment === "baridimob"
                      ? "bg-emerald-500/15 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/10"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-lg">
                      📲
                    </span>
                    {selectedPayment === "baridimob" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">بريد موب (BaridiMob)</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      تحويل فوري عبر رقم RIP بريد الجزائر
                    </p>
                  </div>
                </button>

                {/* 3: ماستر كارد / فيزا كارد */}
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedPayment("mastercard");
                  }}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    selectedPayment === "mastercard"
                      ? "bg-indigo-500/15 border-indigo-400 text-indigo-200 shadow-md shadow-indigo-500/10"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-lg">
                      💳
                    </span>
                    {selectedPayment === "mastercard" && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">ماستر كارد / فيزا</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      دفع إلكتروني آمن مع تشفير 3D Secure
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* DETAILS ACCORDING TO SELECTED PAYMENT */}

            {/* A: الدفع عند الاستلام */}
            {selectedPayment === "cod" && (
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-300">
                      خدمة الدفع بعد المعاينة اليدوية
                    </h4>
                    <p className="text-xs text-slate-400">
                      سيصلك المندوب إلى العنوان المحدد: {buyerWilaya}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
                  <p>• سيتم تسليم القطعة داخل علبة حماية شفافة ومغلفة بأمان مع وثيقة التقييم الأصلية.</p>
                  <p>• المبلغ المطلوب سداده نقداً للمندوب عند الاستلام: <strong className="text-amber-300">{listing.realPriceDzd.toLocaleString()} د.ج</strong>.</p>
                </div>
              </div>
            )}

            {/* B: بريد موب BaridiMob */}
            {selectedPayment === "baridimob" && (
              <div className="p-4 bg-gradient-to-br from-emerald-950/60 to-slate-950 rounded-2xl border border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇩🇿</span>
                    <h4 className="text-sm font-black text-emerald-300">
                      بيانات التحويل عبر تطبيق BaridiMob بريد الجزائر
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    حساب تاجر معتمد
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">رقم الحساب البريدي (RIP بريد موب):</div>
                      <div className="text-base font-mono font-black text-amber-300 tracking-wider">
                        00799999000123456789
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyRip("00799999000123456789")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        copiedRip
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300"
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedRip ? "تم النسخ بنجاح!" : "نسخ RIP"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400">اسم صاحب الحساب:</span>
                      <p className="font-bold text-slate-100 mt-0.5">صلاح بوعصبية (دار المسكوكات)</p>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400">المبلغ الدقيق للتحويل:</span>
                      <p className="font-black text-emerald-400 mt-0.5">
                        {listing.realPriceDzd.toLocaleString()} د.ج
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      رقم العملية أو المرجع (من إشعار تطبيق BaridiMob)
                    </label>
                    <input
                      type="text"
                      value={baridiMobTxnRef}
                      onChange={(e) => setBaridiMobTxnRef(e.target.value)}
                      placeholder="TXN-BM-xxxxxxxx"
                      className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* C: ماستر كارد / فيزا كارد */}
            {selectedPayment === "mastercard" && (
              <div className="space-y-4">
                {!showOtpScreen ? (
                  <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-2xl border border-indigo-500/40 space-y-4">
                    {/* Simulated Card Graphic */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-900 p-5 border border-indigo-500/30 text-white shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-5 h-5 text-amber-400" />
                          <span className="font-bold text-xs tracking-wider text-slate-300">
                            SECURE PAYMENT GATEWAY
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-black text-sm italic text-amber-400">
                          MasterCard / Visa
                        </div>
                      </div>

                      <div className="my-3 font-mono text-lg font-bold tracking-widest text-slate-200">
                        {cardNumber}
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                        <div>
                          <span className="text-[9px] text-slate-400 block">CARDHOLDER</span>
                          <span className="font-bold">{cardHolder}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block">EXPIRES</span>
                          <span className="font-bold">{cardExpiry}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card inputs */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          رقم البطاقة (16 رقم)
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          اسم صاحب البطاقة
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-indigo-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          تاريخ الانتهاء (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          رمز الأمان CVV
                        </label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 3D Secure OTP Confirmation */
                  <div className="p-4 bg-slate-950 rounded-2xl border-2 border-indigo-500/50 space-y-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-100">
                      تأكيد الحماية الثلاثية 3D Secure
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      تم إرسال رمز التحقق (OTP) في رسالة نصية SMS إلى هاتفك المسجل لدى البنك.
                    </p>
                    <div className="max-w-xs mx-auto">
                      <input
                        type="text"
                        placeholder="أدخل رمز التحقق (مثال: 849201)"
                        value={cardOtp}
                        onChange={(e) => setCardOtp(e.target.value)}
                        className="w-full text-center bg-slate-900 border border-indigo-500 rounded-xl py-2 px-3 text-base font-mono tracking-widest text-indigo-300 font-bold focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      (يمكنك الضغط مباشرة على تأكيد الشراء لإتمام العملية)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition"
              >
                الرجوع لتعديل العنوان
              </button>

              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmOrder}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-sm font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span>جاري معالجة الدفع الآمن...</span>
                ) : (
                  <>
                    <span>تأكيد الطلب والشراء</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Order Invoice & Tracking */}
        {step === 3 && createdOrder && (
          <div className="p-6 space-y-5 pt-2 text-right">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg border border-emerald-500/40">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-black text-emerald-300">
                تهانينا! تم تسجيل طلب الشراء بنجاح
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                تم إرسال إشعار فوري إلى البائع لتجهيز القطعة النقدية الأثرية وشحنها إلى عنوانك.
              </p>
            </div>

            {/* Printable/formal invoice layout */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">رقم الفاتورة الرسمية</span>
                  <span className="text-base font-mono font-black text-amber-300">{createdOrder.id}</span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block font-bold">رقم التتبع (Tracking Code)</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30">
                    {createdOrder.trackingNumber}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">القطعة المشتراة:</span>
                  <p className="font-bold text-slate-100 mt-0.5">{createdOrder.listingTitle}</p>
                </div>
                <div>
                  <span className="text-slate-400">المتجر البائع:</span>
                  <p className="font-bold text-amber-200 mt-0.5">{createdOrder.storeName}</p>
                </div>
                <div>
                  <span className="text-slate-400">طريقة الدفع المختارة:</span>
                  <p className="font-bold text-slate-100 mt-0.5">
                    {createdOrder.paymentMethod === "baridimob"
                      ? "بريد موب (BaridiMob RIP)"
                      : createdOrder.paymentMethod === "cod"
                      ? "الدفع عند الاستلام (يد بيد)"
                      : "ماستر كارد / فيزا كارد"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">إجمالي المبلغ المسدد:</span>
                  <p className="font-black text-amber-300 text-sm mt-0.5">
                    {createdOrder.priceDzd.toLocaleString()} د.ج
                  </p>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>سعر المسكوكة الأصلي:</span>
                  <span className="font-mono">{createdOrder.priceDzd.toLocaleString()} د.ج</span>
                </div>
                <div className="flex items-center justify-between text-amber-300">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>رسم توثيق وخدمة منصة التطبيق (مقتطع لمالك التطبيق):</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400">100 د.ج</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 pt-1 border-t border-slate-800 font-bold">
                  <span>صافي التحويل المستحق للبائع:</span>
                  <span className="font-mono font-black">
                    {(createdOrder.sellerPayoutDzd || Math.max(0, createdOrder.priceDzd - 100)).toLocaleString()} د.ج
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">عنوان الشحن والتسليم:</span>
                <p className="font-semibold text-slate-200 mt-0.5">
                  {createdOrder.buyerName} - {createdOrder.buyerPhone} ({createdOrder.buyerAddressWilaya})
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <a
                href={`https://wa.me/${listing.sellerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `مرحباً، قمت بطلب القطعة النقدية [${createdOrder.listingTitle}] برقم طلب ${createdOrder.id}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>مراسلة البائع عبر واتساب</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-sm font-black transition"
              >
                إغلاق والعودة للسوق
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
