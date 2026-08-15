import React from "react";
import { UserProfile } from "../types";
import { Trophy, Sparkles, Medal, Crown, Star, Flame, Award, ShieldCheck } from "lucide-react";
import { getStoredAccounts } from "../utils/storage";

interface LeaderboardViewProps {
  user: UserProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ user }) => {
  const accounts = getStoredAccounts();

  // Combine stored accounts with leaderboard mock data and user profile
  const LEADERBOARD_USERS = [
    { rank: 1, name: "أمير المعرفة", iq: 185, stars: 240, coins: 14200, avatar: "👑", title: "مؤرخ نوميديا الأكبر", winStreak: 18 },
    { rank: 2, name: "د. سارة العبقرية", iq: 172, stars: 215, coins: 9800, avatar: "👩‍🔬", title: "باحثة النميات المعتمدة", winStreak: 12 },
    { rank: 3, name: user.name + " (أنت)", iq: user.iqScore, stars: user.stars, coins: user.coins, avatar: user.avatar, title: `خبير المستوى ${user.level}`, winStreak: user.currentStreak, isUser: true },
    { rank: 4, name: "فارس الألغاز", iq: 145, stars: 160, coins: 7400, avatar: "🥷", title: "صياد الدنانير الأثرية", winStreak: 7 },
    { rank: 5, name: "صائد المعرفة", iq: 132, stars: 125, coins: 5600, avatar: "🦁", title: "حارس سكة تاقدمت", winStreak: 5 },
    { rank: 6, name: "حكيم المسكوكات", iq: 120, stars: 95, coins: 3900, avatar: "🧙‍♂️", title: "دارس النقوش والخطوط", winStreak: 4 },
  ];

  return (
    <div className="space-y-6 pb-20 dir-rtl animate-fade-in">
      
      {/* Grand Header */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950/80 to-slate-900 p-6 sm:p-7 rounded-3xl border-2 border-amber-500/40 shadow-2xl text-center relative overflow-hidden">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-amber-500/30">
          <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-slate-950" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100">
          لوحة الشرف وتصنيف العباقرة
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-md mx-auto">
          ترتيب أبطال مسابقات النميات والآثار بحسب معدل الذكاء IQ والنجوم المحققة!
        </p>

        {/* User Rank Card */}
        <div className="mt-5 p-3.5 bg-slate-950/90 rounded-2xl border border-amber-500/30 inline-flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ترتيبك الحالي:</span>
            <span className="font-black text-amber-400 text-sm font-mono">المركز #3</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>معدل ذكائك: {user.iqScore} IQ</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-300 font-bold">
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
            <span>{user.stars} نجمة</span>
          </div>
        </div>
      </div>

      {/* Podium for Top 3 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
        {/* 2nd Place */}
        <div className="bg-slate-900/90 border border-slate-700 rounded-3xl p-3 sm:p-4 text-center space-y-2 order-1 shadow-lg relative">
          <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center mx-auto absolute -top-3 left-1/2 -translate-x-1/2 shadow">
            2
          </div>
          <div className="text-3xl pt-2">👩‍🔬</div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-200 line-clamp-1">د. سارة</h4>
          <div className="text-[10px] font-mono text-cyan-400">172 IQ</div>
          <div className="text-[10px] text-amber-300 font-bold">215 ⭐</div>
        </div>

        {/* 1st Place (Winner) */}
        <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 text-center space-y-2 order-2 shadow-2xl relative scale-105">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center mx-auto absolute -top-5 left-1/2 -translate-x-1/2 shadow-lg">
            👑 1
          </div>
          <div className="text-4xl pt-3">👑</div>
          <h4 className="font-black text-sm sm:text-base text-amber-200 line-clamp-1">أمير المعرفة</h4>
          <div className="text-xs font-mono font-bold text-cyan-300">185 IQ</div>
          <div className="text-xs text-yellow-300 font-black">240 ⭐</div>
          <div className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
            مؤرخ نوميديا الأكبر
          </div>
        </div>

        {/* 3rd Place */}
        <div className="bg-slate-900/90 border border-amber-700/50 rounded-3xl p-3 sm:p-4 text-center space-y-2 order-3 shadow-lg relative">
          <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center mx-auto absolute -top-3 left-1/2 -translate-x-1/2 shadow">
            3
          </div>
          <div className="text-3xl pt-2">{user.avatar}</div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-200 line-clamp-1">{user.name}</h4>
          <div className="text-[10px] font-mono text-cyan-400">{user.iqScore} IQ</div>
          <div className="text-[10px] text-amber-300 font-bold">{user.stars} ⭐</div>
        </div>
      </div>

      {/* Full Leaderboard List */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
          <Medal className="w-5 h-5 text-amber-400" />
          <span>جدول الترتيب العام</span>
        </h3>

        <div className="space-y-2.5">
          {LEADERBOARD_USERS.map((pl) => (
            <div
              key={pl.rank}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                pl.isUser
                  ? "bg-gradient-to-r from-amber-950/80 via-slate-900 to-yellow-950/60 border-amber-400 shadow-lg text-amber-200"
                  : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                    pl.rank === 1
                      ? "bg-amber-400 text-slate-950 shadow"
                      : pl.rank === 2
                      ? "bg-slate-300 text-slate-950 shadow"
                      : pl.rank === 3
                      ? "bg-amber-700 text-white shadow"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  #{pl.rank}
                </span>

                <span className="text-2xl">{pl.avatar}</span>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-100">{pl.name}</h4>
                    {pl.isUser && (
                      <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                        أنت
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{pl.title}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-mono font-bold">IQ: {pl.iq}</span>
                  </div>
                </div>
              </div>

              <div className="text-left font-mono text-xs font-bold space-y-0.5">
                <div className="text-yellow-300 flex items-center justify-end gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  <span>{pl.stars}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {pl.coins.toLocaleString('ar-EG')} 🪙
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
