import React from "react";
import { UserProfile, PowerUpState } from "../types";
import { Trophy, ShoppingBag, Coins, Sparkles, User, CheckCircle2 } from "lucide-react";
import { soundFx } from "../utils/sound";

interface LeaderboardAndStoreViewProps {
  user: UserProfile;
  powerUps: PowerUpState;
  onBuyPowerUp: (type: keyof PowerUpState, count: number, costCoins: number) => void;
  onChangeAvatar: (avatar: string) => void;
}

export const LeaderboardAndStoreView: React.FC<LeaderboardAndStoreViewProps> = ({
  user,
  powerUps,
  onBuyPowerUp,
  onChangeAvatar,
}) => {
  const AVATARS = ["👨‍🎓", "👩‍🔬", "🧙‍♂️", "🥷", "👑", "🦁", "🤖", "🦸"];

  const LEADERBOARD_USERS = [
    { rank: 1, name: "أمير المعرفة", iq: 185, stars: 240, avatar: "👑" },
    { rank: 2, name: "د. سارة العبقرية", iq: 172, stars: 215, avatar: "👩‍🔬" },
    { rank: 3, name: user.name + " (أنت)", iq: user.iqScore, stars: user.stars, avatar: user.avatar, isUser: true },
    { rank: 4, name: "فارس الألغاز", iq: 122, stars: 110, avatar: "🥷" },
    { rank: 5, name: "صائد المعرفة", iq: 118, stars: 95, avatar: "🦁" },
  ];

  return (
    <div className="space-y-6 pb-20 dir-rtl">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 p-6 rounded-3xl border border-amber-500/30 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
          <Trophy className="w-8 h-8 text-slate-950" />
        </div>
        <h2 className="text-2xl font-black text-amber-200">
          متجر المساعدات ولوحة المتصدرين
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
          اشترِ وسائب المساعدة بالنقاط النقدية، أو غيّر رمزك الشخصي ونافس المتصدرين!
        </p>
      </div>

      {/* Power Ups Store Section */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-yellow-300 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-yellow-400" />
          <span>متجر أدوات المساعدة (Power-ups)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Item 1: Remove Two */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 text-center space-y-2">
            <span className="text-3xl block">❌</span>
            <h4 className="font-bold text-slate-100 text-sm">حذف إجابتين الخاطئتين</h4>
            <p className="text-[11px] text-slate-400">حزمة من 3 مرات استخدام</p>
            <div className="text-xs font-mono text-amber-300">الرصيد لديك: {powerUps.removeTwoCount}</div>

            <button
              onClick={() => {
                soundFx.playCoin();
                onBuyPowerUp("removeTwoCount", 3, 200);
              }}
              disabled={user.coins < 200}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl disabled:opacity-40 flex items-center justify-center gap-1 mt-2"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>شراء بـ 200 🪙</span>
            </button>
          </div>

          {/* Item 2: Extra Time */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 text-center space-y-2">
            <span className="text-3xl block">⏱️</span>
            <h4 className="font-bold text-slate-100 text-sm">وقت إضافي +15 ثانية</h4>
            <p className="text-[11px] text-slate-400">حزمة من 3 مرات استخدام</p>
            <div className="text-xs font-mono text-cyan-300">الرصيد لديك: {powerUps.extraTimeCount}</div>

            <button
              onClick={() => {
                soundFx.playCoin();
                onBuyPowerUp("extraTimeCount", 3, 150);
              }}
              disabled={user.coins < 150}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl disabled:opacity-40 flex items-center justify-center gap-1 mt-2"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>شراء بـ 150 🪙</span>
            </button>
          </div>

          {/* Item 3: AI Smart Hint */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 text-center space-y-2">
            <span className="text-3xl block">💡</span>
            <h4 className="font-bold text-slate-100 text-sm">تلميح AI ذكي</h4>
            <p className="text-[11px] text-slate-400">حزمة من 3 مرات استخدام</p>
            <div className="text-xs font-mono text-emerald-300">الرصيد لديك: {powerUps.aiHintCount}</div>

            <button
              onClick={() => {
                soundFx.playCoin();
                onBuyPowerUp("aiHintCount", 3, 250);
              }}
              disabled={user.coins < 250}
              className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl disabled:opacity-40 flex items-center justify-center gap-1 mt-2"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>شراء بـ 250 🪙</span>
            </button>
          </div>

        </div>
      </div>

      {/* Avatar Selection Box */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          <span>اختر الرمز الشخصي (Avatar)</span>
        </h3>

        <div className="flex flex-wrap justify-center gap-3">
          {AVATARS.map((av, idx) => {
            const isSelected = user.avatar === av;
            return (
              <button
                key={idx}
                onClick={() => {
                  soundFx.playClick();
                  onChangeAvatar(av);
                }}
                className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center border transition-all ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 scale-110"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                {av}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>ترتيب العباقرة والمتصدرين</span>
        </h3>

        <div className="space-y-2">
          {LEADERBOARD_USERS.map((pl) => (
            <div
              key={pl.rank}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                pl.isUser
                  ? "bg-gradient-to-r from-amber-600/20 to-yellow-600/30 border-amber-400 text-amber-200"
                  : "bg-slate-950 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                  pl.rank === 1 ? "bg-amber-400 text-slate-950" :
                  pl.rank === 2 ? "bg-slate-300 text-slate-950" :
                  pl.rank === 3 ? "bg-amber-700 text-white" :
                  "bg-slate-800 text-slate-400"
                }`}>
                  #{pl.rank}
                </span>

                <span className="text-2xl">{pl.avatar}</span>

                <div>
                  <h4 className="font-bold text-sm text-slate-100">{pl.name}</h4>
                  <span className="text-[10px] text-slate-400">معدل IQ: {pl.iq}</span>
                </div>
              </div>

              <div className="text-left font-mono text-xs font-bold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{pl.stars} نجمة</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
