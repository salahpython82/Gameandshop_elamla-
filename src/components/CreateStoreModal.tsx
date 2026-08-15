import React, { useState } from "react";
import { PlayerStore, UserProfile } from "../types";
import { soundFx } from "../utils/sound";
import { X, Building2, ShieldCheck, Sparkles, Phone, MapPin, CreditCard, Award, CheckCircle } from "lucide-react";

interface CreateStoreModalProps {
  currentUser: UserProfile;
  existingStore?: PlayerStore | null;
  onClose: () => void;
  onStoreSaved: (store: PlayerStore) => void;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({
  currentUser,
  existingStore,
  onClose,
  onStoreSaved,
}) => {
  const [storeName, setStoreName] = useState(existingStore?.storeName || `خزانة ${currentUser.name || "الهاوي"} للمسكوكات`);
  const [ownerName, setOwnerName] = useState(existingStore?.ownerName || currentUser.name || "صاحب المتجر");
  const [description, setDescription] = useState(
    existingStore?.description ||
      "متجر متخصص في بيع وعرض القطع النقدية القديمة النادرة والموثقة مع التوصيل لجميع الولايات وضمان المعاينة."
  );
  const [wilayaCity, setWilayaCity] = useState(existingStore?.wilayaCity || "الجزائر العاصمة (16)");
  const [phoneWhatsApp, setPhoneWhatsApp] = useState(existingStore?.phoneWhatsApp || "+213 555 00 00 00");
  const [baridiMobRip, setBaridiMobRip] = useState(existingStore?.baridiMobRip || "00799999000123456789");
  const [bannerGradient, setBannerGradient] = useState(
    existingStore?.bannerGradient || "from-amber-600 via-yellow-600 to-amber-700"
  );

  const THEMES = [
    { label: "الذهب الملكي (Royal Gold)", value: "from-amber-600 via-yellow-600 to-amber-700" },
    { label: "الزمرد النوميدي (Numidian Emerald)", value: "from-emerald-700 via-teal-600 to-cyan-800" },
    { label: "البنفسجي الأندلسي (Andalusian Violet)", value: "from-purple-700 via-indigo-700 to-slate-900" },
    { label: "الياقوت العثماني (Ottoman Ruby)", value: "from-rose-700 via-red-600 to-amber-900" },
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !phoneWhatsApp.trim()) {
      soundFx.playWrong();
      alert("يرجى إدخال اسم المتجر ورقم الهاتف للتواصل.");
      return;
    }

    soundFx.playVictory();

    const store: PlayerStore = {
      id: existingStore?.id || `store-${Date.now()}`,
      ownerEmail: currentUser.email || "player@quiz.com",
      ownerName: ownerName.trim(),
      storeName: storeName.trim(),
      description: description.trim(),
      wilayaCity,
      phoneWhatsApp: phoneWhatsApp.trim(),
      baridiMobRip: baridiMobRip.trim() || undefined,
      rating: existingStore?.rating || 5.0,
      totalReviews: existingStore?.totalReviews || 1,
      totalSales: existingStore?.totalSales || 0,
      isVerified: true,
      bannerGradient,
      createdAt: existingStore?.createdAt || new Date().toISOString().split("T")[0],
      isActive: true,
    };

    onStoreSaved(store);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto dir-rtl">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden my-6">
        
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${bannerGradient} text-white flex items-center justify-between border-b border-white/20`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center text-2xl shadow-lg border border-white/20">
              🏛️
            </div>
            <div>
              <h2 className="text-xl font-black">
                {existingStore ? "تعديل بيانات متجري" : "إنشاء متجر مسكوكات ونقود قديمة"}
              </h2>
              <p className="text-xs text-white/80">
                اعرض قطعك النقدية الحقيقية للبيع لجميع اللاعبين مع خيارات الدفع المحلية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم المتجر أو الخزانة *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="مثال: دار سيرتا للمسكوكات النوميدية"
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                اسم المسؤول / البائع *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              وصف المتجر والضمانات المقدمة للمشترين
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة عن مقتنياتك الأثرية، وطريقة التغليف والشحن..."
              className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                الولاية / المدينة الرئيسية *
              </label>
              <select
                value={wilayaCity}
                onChange={(e) => setWilayaCity(e.target.value)}
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
                رقم الهاتف / واتساب لتواصل المشترين *
              </label>
              <input
                type="tel"
                required
                value={phoneWhatsApp}
                onChange={(e) => setPhoneWhatsApp(e.target.value)}
                placeholder="+213 555 12 34 56"
                className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              رقم حساب بريد موب (BaridiMob RIP) لاستقبال المدفوعات (اختياري):
            </label>
            <input
              type="text"
              value={baridiMobRip}
              onChange={(e) => setBaridiMobRip(e.target.value)}
              placeholder="00799999000xxxxxxxxx"
              className="w-full bg-slate-950/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-300 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              طابع وتصميم لافتة المتجر:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((theme) => (
                <button
                  type="button"
                  key={theme.value}
                  onClick={() => {
                    soundFx.playClick();
                    setBannerGradient(theme.value);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between bg-gradient-to-r ${theme.value} text-white ${
                    bannerGradient === theme.value
                      ? "ring-2 ring-amber-400 border-white"
                      : "opacity-75 hover:opacity-100 border-white/20"
                  }`}
                >
                  <span className="truncate">{theme.label}</span>
                  {bannerGradient === theme.value && <CheckCircle className="w-4 h-4 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              <span>{existingStore ? "حفظ التعديلات" : "تفعيل وإطلاق المتجر"}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
