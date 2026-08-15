import React from "react";
import { GameView, UserProfile } from "../types";
import { Play, HelpCircle, Layers, BarChart3, Gift, Trophy, Swords, Sparkles, Award, Flame, Disc } from "lucide-react";
import { soundFx } from "../utils/sound";

interface HomeViewProps {
  user: UserProfile;
  onNavigate: (view: GameView) => void;
  onStartQuickQuiz: () => void;
  onOpenDailyChest: () => void;
  onOpenWheel: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
  onStartQuickQuiz,
  onOpenDailyChest,
  onOpenWheel,
}) => {
  return (
    <div className="space-y-6 pb-20 dir-rtl">
      
      {/* Hero Game Start Section (Matches Image 2 Screen 1 "لعبة ذكاء وتحدي") */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-amber-950 p-6 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 text-center">
        {/* Background glow effects */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>تحدَّ قدرات عقلك اليوم</span>
          </div>

          <button
            onClick={() => {
              soundFx.playCoin();
              onOpenWheel();
            }}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-black px-3 py-1 rounded-full text-xs shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            <Disc className="w-3.5 h-3.5 animate-spin" />
            <span>عجلة الحظ</span>
          </button>
        </div>

        {/* Game Title & Treasure Illustration */}
        <div className="my-4">
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 drop-shadow-sm mb-2">
            لعبة ذكاء وتحدي
          </h1>
          <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
            اختبر ثقافتك وأبحر في عالم الألغاز، التاريخ، والعلوم مع مساعد الذكاء الاصطناعي الذكي!
          </p>
        </div>

        {/* Treasure Chest Graphic Container */}
        <div className="my-6 relative flex justify-center items-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-amber-600/30 to-yellow-500/20 border border-amber-400/50 p-3 shadow-inner flex items-center justify-center backdrop-blur-sm animate-pulse">
            <span className="text-6xl sm:text-7xl filter drop-shadow-[0_10px_10px_rgba(245,158,11,0.5)]">
              👑
            </span>
          </div>
          {/* Floating Coin Accents */}
          <span className="absolute top-2 right-1/4 text-2xl animate-bounce">🪙</span>
          <span className="absolute bottom-2 left-1/4 text-2xl animate-bounce delay-150">⭐</span>
        </div>

        {/* Primary Start Game Button */}
        <button
          onClick={() => {
            soundFx.playVictory();
            onStartQuickQuiz();
          }}
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-amber-500/30 border-2 border-yellow-200 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 mx-auto"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>ابدأ اللعب الآن</span>
        </button>
      </div>

      {/* Main Menu Action Grid (Matches Screen 1 of Image 1) */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>أقسام المسابقة والمهام</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Card 1: Quick Quiz & Riddles */}
          <div
            onClick={() => {
              soundFx.playClick();
              onStartQuickQuiz();
            }}
            className="group cursor-pointer p-4 bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl border border-amber-500/30 hover:border-amber-400/70 shadow-lg transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 text-base group-hover:text-amber-300 transition-colors">
                الأسئلة والألغاز
              </h3>
              <p className="text-xs text-slate-400">لعب سريع مع أسئلة عشوائية متنوعة</p>
            </div>
          </div>

          {/* Card 2: Levels Directory */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigate("levels");
            }}
            className="group cursor-pointer p-4 bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl border border-blue-500/30 hover:border-blue-400/70 shadow-lg transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 text-base group-hover:text-blue-300 transition-colors">
                إدارة المستويات
              </h3>
              <p className="text-xs text-slate-400">فتح الـ 10 مستويات لكل تصنيف بحسب النجوم</p>
            </div>
          </div>

          {/* Card 3: AI Challenge (VS Mode) */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigate("vs_mode");
            }}
            className="group cursor-pointer p-4 bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl border border-rose-500/30 hover:border-rose-400/70 shadow-lg transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform">
              <Swords className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 text-base group-hover:text-rose-300 transition-colors">
                تحدي الذكاء الاصطناعي VS
              </h3>
              <p className="text-xs text-slate-400">منافسة مباشرة ضد خصوم آليين أذكياء</p>
            </div>
          </div>

          {/* Card 4: Leaderboard & Store */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigate("leaderboard");
            }}
            className="group cursor-pointer p-4 bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl border border-amber-500/30 hover:border-amber-400/70 shadow-lg transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 text-base group-hover:text-amber-300 transition-colors">
                لوحة المتصدرين والمتجر
              </h3>
              <p className="text-xs text-slate-400">شراء التعزيزات ومنافسة نخبة الأذكياء</p>
            </div>
          </div>

          {/* Card 5: Analytics & Stats */}
          <div
            onClick={() => {
              soundFx.playClick();
              onNavigate("analytics");
            }}
            className="group cursor-pointer p-4 bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl border border-purple-500/30 hover:border-purple-400/70 shadow-lg transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100 text-base group-hover:text-purple-300 transition-colors">
                إحصائيات الأداء و IQ
              </h3>
              <p className="text-xs text-slate-400">رسوم بيانية لتطور معدل ذكائك ودقة إجاباتك</p>
            </div>
          </div>

          {/* Card 6: Daily Chest Reward */}
          <div
            onClick={() => {
              soundFx.playCoin();
              onOpenDailyChest();
            }}
            className="group cursor-pointer p-4 bg-gradient-to-r from-amber-950/60 to-yellow-950/60 hover:from-amber-900/80 hover:to-yellow-900/80 rounded-2xl border border-yellow-500/50 hover:border-yellow-300 shadow-lg transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-yellow-500/20 group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6 text-slate-950" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-200 text-base group-hover:text-yellow-100 transition-colors">
                المكافأة اليومية
              </h3>
              <p className="text-xs text-amber-300/80">احصل على 200 قطعة نقدية ونجوم مجانية</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
