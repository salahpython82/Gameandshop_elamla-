import React, { useState, useRef } from "react";
import { RealCoinListing, PlayerStore, CoinEra, CoinMetal, RealPaymentMethod } from "../types";
import { soundFx } from "../utils/sound";
import {
  scanAndExtractCoinInfoFromImage,
  ExtractedCoinInfo,
  FAMOUS_COIN_PRESETS,
} from "../utils/coinAppraiser";
import {
  X,
  Coins,
  Plus,
  ShieldCheck,
  Tag,
  FileText,
  Check,
  Upload,
  Camera,
  Sparkles,
  RefreshCw,
  Eye,
  Trash2,
  HelpCircle,
  Sliders,
  Info,
  Layers,
  ArrowRightLeft,
} from "lucide-react";

interface AddCoinListingModalProps {
  playerStore: PlayerStore;
  onClose: () => void;
  onListingCreated: (listing: RealCoinListing) => void;
}

export const AddCoinListingModal: React.FC<AddCoinListingModalProps> = ({
  playerStore,
  onClose,
  onListingCreated,
}) => {
  // Coin Images State
  const [obverseImage, setObverseImage] = useState<string | undefined>(undefined);
  const [reverseImage, setReverseImage] = useState<string | undefined>(undefined);
  const [activePreviewSide, setActivePreviewSide] = useState<"obverse" | "reverse">("obverse");

  // AI Scanner & Autofill State
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [scanResult, setScanResult] = useState<ExtractedCoinInfo | null>(null);
  const [showAiBanner, setShowAiBanner] = useState(false);

  // Form Fields (Editable both manually or auto-filled)
  const [title, setTitle] = useState("");
  const [era, setEra] = useState<CoinEra>("نوميدي وشمال إفريقيا");
  const [metal, setMetal] = useState<CoinMetal>("فضة");
  const [year, setYear] = useState("150 ق.م");
  const [weightGrams, setWeightGrams] = useState(3.5);
  const [diameterMm, setDiameterMm] = useState(22);
  const [conditionGrade, setConditionGrade] = useState("AU-55 (حفظ ممتاز جداً)");
  const [certificateNumber, setCertificateNumber] = useState(
    `DZ-NUMIS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [realPriceDzd, setRealPriceDzd] = useState(35000);
  const [cityLocation, setCityLocation] = useState(playerStore.wilayaCity);
  const [description, setDescription] = useState("");
  const [obverseNotes, setObverseNotes] = useState("");
  const [reverseNotes, setReverseNotes] = useState("");
  const [badgeIcon, setBadgeIcon] = useState("🪙");

  const [supportedPayments, setSupportedPayments] = useState<RealPaymentMethod[]>([
    "cod",
    "baridimob",
    "mastercard",
  ]);

  // Input file refs
  const obverseInputRef = useRef<HTMLInputElement>(null);
  const reverseInputRef = useRef<HTMLInputElement>(null);

  const ERAS: CoinEra[] = [
    "نوميدي وشمال إفريقيا",
    "أموي",
    "عباسي",
    "أندلسي ومرابطي",
    "فاطمي وأيوبي",
    "عثماني",
    "روماني",
    "بيزنطي وإغريقي",
  ];

  const METALS: CoinMetal[] = ["ذهب", "فضة", "برونز", "نحاس", "إلكتروم"];
  const ICONS = ["🪙", "👑", "🐎", "🕌", "⚔️", "🏛️", "✨", "🛡️"];

  // Handle Image File Upload
  const handleImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "obverse" | "reverse"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (side === "obverse") {
        setObverseImage(base64);
        setActivePreviewSide("obverse");
        // Trigger smart scan automatically if title is empty
        triggerSmartScan(base64, reverseImage, file.name);
      } else {
        setReverseImage(base64);
        setActivePreviewSide("reverse");
        if (!obverseImage) {
          triggerSmartScan(obverseImage, base64, file.name);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Smart AI Image Scanning & Extraction
  const triggerSmartScan = async (
    obv?: string,
    rev?: string,
    fileName?: string,
    hintText?: string
  ) => {
    setIsScanningImage(true);
    soundFx.playCoin();

    try {
      const result = await scanAndExtractCoinInfoFromImage(obv, rev, fileName, hintText);
      setScanResult(result);

      // Auto-fill all fields with extracted values
      setTitle(result.title);
      setEra(result.era as CoinEra);
      setMetal(result.metal as CoinMetal);
      setYear(result.year);
      setWeightGrams(result.weightGrams);
      setDiameterMm(result.diameterMm);
      setConditionGrade(result.conditionGrade);
      setCertificateNumber(result.certificateNumber);
      setRealPriceDzd(result.suggestedPriceDzd);
      setDescription(result.description);
      setObverseNotes(result.obverseNotes);
      setReverseNotes(result.reverseNotes);
      setBadgeIcon(result.badgeIcon);

      setShowAiBanner(true);
      soundFx.playVictory();
    } catch (err) {
      console.error("Scan error", err);
    } finally {
      setIsScanningImage(false);
    }
  };

  // Apply a Famous Preset
  const handleApplyPreset = (preset: ExtractedCoinInfo) => {
    soundFx.playCoin();
    setTitle(preset.title);
    setEra(preset.era as CoinEra);
    setMetal(preset.metal as CoinMetal);
    setYear(preset.year);
    setWeightGrams(preset.weightGrams);
    setDiameterMm(preset.diameterMm);
    setConditionGrade(preset.conditionGrade);
    setCertificateNumber(preset.certificateNumber);
    setRealPriceDzd(preset.suggestedPriceDzd);
    setDescription(preset.description);
    setObverseNotes(preset.obverseNotes);
    setReverseNotes(preset.reverseNotes);
    setBadgeIcon(preset.badgeIcon);
    setScanResult(preset);
    setShowAiBanner(true);
  };

  const togglePaymentMethod = (method: RealPaymentMethod) => {
    soundFx.playClick();
    if (supportedPayments.includes(method)) {
      if (supportedPayments.length === 1) {
        alert("يجب اختيار طريقة دفع واحدة على الأقل!");
        return;
      }
      setSupportedPayments(supportedPayments.filter((m) => m !== method));
    } else {
      setSupportedPayments([...supportedPayments, method]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || realPriceDzd <= 0) {
      soundFx.playWrong();
      alert("يرجى ملء اسم القطعة وتحديد السعر بالدينار الجزائري.");
      return;
    }

    soundFx.playVictory();

    const newListing: RealCoinListing = {
      id: `listing-${Date.now()}`,
      storeId: playerStore.id,
      storeName: playerStore.storeName,
      sellerEmail: playerStore.ownerEmail,
      sellerPhone: playerStore.phoneWhatsApp,
      title: title.trim(),
      era,
      metal,
      year: year.trim(),
      weightGrams: Number(weightGrams) || 3.5,
      diameterMm: Number(diameterMm) || 20,
      conditionGrade: conditionGrade.trim(),
      certificateNumber: certificateNumber.trim(),
      realPriceDzd: Number(realPriceDzd),
      realPriceUsd: Math.round(Number(realPriceDzd) / 200),
      supportedPayments,
      description: description.trim() || "قطعة نقدية أثرية أصلية موثقة ومعروضة للبيع.",
      obverseNotes: obverseNotes.trim(),
      reverseNotes: reverseNotes.trim(),
      obverseImageUrl: obverseImage,
      reverseImageUrl: reverseImage,
      cityLocation: cityLocation.trim(),
      badgeIcon,
      isAvailable: true,
      createdAt: new Date().toISOString().split("T")[0],
      viewsCount: 1,
    };

    onListingCreated(newListing);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto dir-rtl">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-amber-200">
                عرض قطعة نقدية حقيقية للبيع في متجرك
              </h2>
              <p className="text-xs text-slate-400">
                المتجر: <span className="text-amber-300 font-bold">{playerStore.storeName}</span> • يدعم فحص واستخراج البيانات من الصور ذكياً
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* ========================================================================= */}
          {/* 1. DUAL COIN IMAGE UPLOAD SECTION (رفع صورة الوجه والظهر) */}
          {/* ========================================================================= */}
          <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-amber-200">
                  رفع صور القطعة النقدية من الجهتين (الوجه الأمامي والخلفي):
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">
                يرجى رفع صور واضحة تحت إضاءة جيدة لدقة الفحص وجذب المشترين
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Obverse Side (الوجه الأمامي) */}
              <div className="relative border-2 border-dashed border-amber-500/30 hover:border-amber-400 rounded-2xl p-4 bg-slate-900/60 flex flex-col items-center justify-center text-center transition min-h-[160px] group">
                <input
                  type="file"
                  accept="image/*"
                  ref={obverseInputRef}
                  onChange={(e) => handleImageFile(e, "obverse")}
                  className="hidden"
                />

                {obverseImage ? (
                  <div className="relative w-full flex flex-col items-center">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/10 relative group/img">
                      <img
                        src={obverseImage}
                        alt="الوجه الأمامي"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => obverseInputRef.current?.click()}
                          className="p-1.5 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-bold"
                          title="تغيير الصورة"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setObverseImage(undefined)}
                          className="p-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-300 mt-2 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      الوجه الأمامي (Obverse)
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => obverseInputRef.current?.click()}
                    className="cursor-pointer flex flex-col items-center space-y-2 py-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-300 block">
                        صورة الوجه الأمامي *
                      </span>
                      <span className="text-[10px] text-slate-400">
                        انقر للرفع أو اسحب الصورة هنا
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reverse Side (الوجه الخلفي / الظهر) */}
              <div className="relative border-2 border-dashed border-amber-500/30 hover:border-amber-400 rounded-2xl p-4 bg-slate-900/60 flex flex-col items-center justify-center text-center transition min-h-[160px] group">
                <input
                  type="file"
                  accept="image/*"
                  ref={reverseInputRef}
                  onChange={(e) => handleImageFile(e, "reverse")}
                  className="hidden"
                />

                {reverseImage ? (
                  <div className="relative w-full flex flex-col items-center">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/10 relative group/img">
                      <img
                        src={reverseImage}
                        alt="الوجه الخلفي"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => reverseInputRef.current?.click()}
                          className="p-1.5 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-bold"
                          title="تغيير الصورة"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReverseImage(undefined)}
                          className="p-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-300 mt-2 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      الوجه الخلفي / الظهر (Reverse)
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => reverseInputRef.current?.click()}
                    className="cursor-pointer flex flex-col items-center space-y-2 py-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-300 block">
                        صورة الوجه الخلفي (الظهر)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        انقر للرفع أو اسحب الصورة هنا
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Smart AI Scan & Trigger Controls */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                disabled={isScanningImage}
                onClick={() => triggerSmartScan(obverseImage, reverseImage, title)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-2 disabled:opacity-50"
              >
                {isScanningImage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري مسح وتحليل الصورة واستخراج البيانات...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>🔍 استخراج وقراءة بيانات العملة من الصورة آلياً (AI Scan)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>يمكنك دائماً تعديل أي حقل يدوياً في حال تعذر القراءة بدقة</span>
              </div>
            </div>

            {/* Quick Presets Picker (إذا تعذر التصوير أو رغب في تجربة نماذج مشهورة) */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5">
                أو اختر نموذجاً تاريخياً شهيراً للتعبئة السريعة:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {FAMOUS_COIN_PRESETS.map((p) => (
                  <button
                    key={p.title}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-lg text-[10px] text-slate-300 font-semibold transition flex items-center gap-1"
                  >
                    <span>{p.badgeIcon}</span>
                    <span className="truncate max-w-[140px]">{p.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Banner feedback if scan succeeded */}
          {showAiBanner && scanResult && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-200">
                    تم قراءة واستخراج بيانات المسكوك بنجاح (دقة: {scanResult.confidenceScore}%)
                  </h4>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5">
                    السمات المكتشفة: {scanResult.detectedFeatures.join(" • ")}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    ✍️ جميع الحقول أدناه قابلة للتعديل اليدوي الكامل حسب رغبتك.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiBanner(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. EDITABLE COIN DETAILS (تعديل يدوي أو مراجعة البيانات المستخرجة) */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-black text-amber-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>بيانات ومعلومات القطعة النقدية (قابلة للتعديل يدوياً):</span>
              </h3>
              <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                تعديل يدوي حر ✍️
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                عنوان واسم القطعة النقدية *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: دينار ذهبي أموي - ضرب دمشق (85 هـ)"
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الحقبة التاريخية</label>
                <select
                  value={era}
                  onChange={(e) => setEra(e.target.value as CoinEra)}
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                >
                  {ERAS.map((eItem) => (
                    <option key={eItem} value={eItem} className="bg-slate-900">
                      {eItem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نوع المعدن</label>
                <select
                  value={metal}
                  onChange={(e) => setMetal(e.target.value as CoinMetal)}
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                >
                  {METALS.map((mItem) => (
                    <option key={mItem} value={mItem} className="bg-slate-900">
                      {mItem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">تاريخ / سنة السك</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="مثال: 77 هـ أو 200 ق.م"
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الوزن التقريبي (غرام)</label>
                <input
                  type="number"
                  step="0.01"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">القطر (ملم)</label>
                <input
                  type="number"
                  value={diameterMm}
                  onChange={(e) => setDiameterMm(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">درجة الحفظ والسك</label>
                <input
                  type="text"
                  value={conditionGrade}
                  onChange={(e) => setConditionGrade(e.target.value)}
                  placeholder="MS-63, AU-55, XF-40"
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  السعر المعروض للبيع بالدينار الجزائري (د.ج DZD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="500"
                    step="500"
                    value={realPriceDzd}
                    onChange={(e) => setRealPriceDzd(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-base font-black text-amber-300 focus:outline-none"
                  />
                  <span className="absolute left-3 top-3 text-xs text-slate-400 font-bold">د.ج DZD</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  رقم شهادة التوثيق والأصالة
                </label>
                <input
                  type="text"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Platform Fee & Net Payout Calculation Card */}
            <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 rounded-2xl border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>اقتطاع خدمة المنصة الثابت لمالك التطبيق:</span>
                </span>
                <span className="font-mono text-amber-400 font-black bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  - 100 د.ج (ثابت)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold border-t border-slate-800 pt-1.5">
                <span className="text-emerald-300">صافي أرباحك المقدرة عند إتمام البيع:</span>
                <span className="font-mono text-sm font-black text-emerald-400">
                  {Math.max(0, realPriceDzd - 100).toLocaleString()} د.ج
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                * تطبق المنصة رسماً موحداً وثابتاً قدره 100 دينار جزائري فقط لكل عملية بيع لحساب مالك التطبيق لتغطية حماية المعاملات ومتابعة الشحن والمعاينة.
              </p>
            </div>

            {/* Inscriptions / Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  نقوش وملاحظات الوجه الأمامي (Obverse)
                </label>
                <input
                  type="text"
                  value={obverseNotes}
                  onChange={(e) => setObverseNotes(e.target.value)}
                  placeholder="مثال: طوق الشهادة، رأس الملك ماسينيسا، صورة قيصر..."
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  نقوش وملاحظات الوجه الخلفي (Reverse)
                </label>
                <input
                  type="text"
                  value={reverseNotes}
                  onChange={(e) => setReverseNotes(e.target.value)}
                  placeholder="مثال: حصان نوميدي يعدو، آية التوحيد، دار السك..."
                  className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                الوصف الأثري والتاريخي للقطعة
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب تفاصيل عن حالة القطعة، ندرتها، وطريقة الحصول عليها..."
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none"
              />
            </div>

            {/* Payment Methods Supported */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                طرق الدفع المقبولة لهذه القطعة في متجرك:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => togglePaymentMethod("cod")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                    supportedPayments.includes("cod")
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-slate-950/60 border-slate-800 text-slate-500"
                  }`}
                >
                  <span>🤝 عند الاستلام COD</span>
                  {supportedPayments.includes("cod") && <Check className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => togglePaymentMethod("baridimob")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                    supportedPayments.includes("baridimob")
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-slate-950/60 border-slate-800 text-slate-500"
                  }`}
                >
                  <span>📲 بريد موب BaridiMob</span>
                  {supportedPayments.includes("baridimob") && <Check className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => togglePaymentMethod("mastercard")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                    supportedPayments.includes("mastercard")
                      ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                      : "bg-slate-950/60 border-slate-800 text-slate-500"
                  }`}
                >
                  <span>💳 ماستر كارد / فيزا</span>
                  {supportedPayments.includes("mastercard") && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Badge Icon selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رمز الشارة التعبيرية للقطعة:
              </label>
              <div className="flex items-center gap-2">
                {ICONS.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => {
                      soundFx.playClick();
                      setBadgeIcon(ic);
                    }}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition ${
                      badgeIcon === ic
                        ? "bg-amber-500 text-slate-950 font-black scale-110 shadow"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <span>نشر القطعة بالصور في المتجر والسوق العام</span>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
