import React from "react";
import { UserProfile } from "../types";
import { Sparkles, Coins, Star, Trophy, Settings, Volume2, VolumeX, Flame, Crown, User, ShieldCheck } from "lucide-react";
import { soundFx } from "../utils/sound";
import { isAdminEmail } from "../utils/storage";

interface HeaderNavbarProps {
  user: UserProfile;
  onOpenSettings: () => void;
  onOpenStore: () => void;
  onToggleSound: () => void;
  onOpenAuth: () => void;
  onNavigateAdmin: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  user,
  onOpenSettings,
  onOpenStore,
  onToggleSound,
  onOpenAuth,
  onNavigateAdmin,
}) => {
  // Calculate IQ bar percentage (e.g. IQ 128 / 200 = ~64%)
  const iqProgressPercent = Math.min(Math.round((user.iqScore / 200) * 100), 100);
  const isAdmin = isAdminEmail(user.email) || user.role === "admin";

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-amber-500/30 px-3 py-2.5 shadow-xl text-white">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 dir-rtl">
        
        {/* Left / Start: User Profile & IQ Badge */}
        <div className="flex items-center gap-2.5">
          <div className="relative group cursor-pointer" onClick={onOpenAuth} title="حسابي / تسجيل الدخول">
            <div className={`w-11 h-11 rounded-2xl p-0.5 shadow-lg ${
              isAdmin
                ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-amber-500/30 animate-pulse"
                : "bg-gradient-to-br from-amber-500 to-yellow-600 shadow-amber-500/20"
            }`}>
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl">
                {user.avatar}
              </div>
            </div>
            {isAdmin ? (
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-black text-[9px] px-1 rounded-full border border-slate-900 flex items-center">
                👑 مدير
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full border border-slate-900">
                رتبة {user.level}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAuth}
                className="font-bold text-sm tracking-wide text-amber-100 hover:text-amber-300 transition-colors flex items-center gap-1"
                title="تعديل الحساب أو تبديله"
              >
                <span>{user.name}</span>
                {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-400 inline fill-amber-400" />}
              </button>
              <div className="flex items-center text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Flame className="w-3 h-3 text-orange-400 ml-1 animate-pulse" />
                <span>{user.currentStreak} أيام</span>
              </div>
            </div>

            {/* IQ Progress Bar */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-bold text-cyan-300">معدل IQ: {user.iqScore}</span>
              <div className="w-20 sm:w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30 relative">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${iqProgressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{iqProgressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Center / Right: Currency Stats, Admin Quick Tab, and Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Admin Dashboard Quick Access Pill - ONLY visible if Admin! */}
          {isAdmin && (
            <button
              id="header-admin-dashboard-btn"
              onClick={() => {
                soundFx.playCorrect();
                onNavigateAdmin();
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 px-2.5 sm:px-3 py-1.5 rounded-xl font-black text-xs shadow-lg shadow-amber-500/30 active:scale-95 transition-all animate-bounce"
              title="فتح لوحة تحكم المدير"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>لوحة التحكم</span>
            </button>
          )}

          {/* Login / Switch Account Button */}
          <button
            id="header-auth-btn"
            onClick={() => {
              soundFx.playClick();
              onOpenAuth();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-colors"
            title="تسجيل الدخول / الحساب"
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{user.email ? "حسابي" : "دخول"}</span>
          </button>

          {/* Stars Pill */}
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-950/80 to-slate-900 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-inner">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-extrabold text-amber-300 text-xs sm:text-sm">{user.stars}</span>
          </div>

          {/* Coins Pill -> Opens Store */}
          <div
            onClick={() => {
              soundFx.playCoin();
              onOpenStore();
            }}
            className="flex items-center gap-1 bg-gradient-to-r from-yellow-950/90 to-amber-900/60 px-2.5 sm:px-3 py-1.5 rounded-xl border border-yellow-400/50 cursor-pointer hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-yellow-500/10"
          >
            <Coins className="w-3.5 h-3.5 text-yellow-300 fill-yellow-400" />
            <span className="font-extrabold text-yellow-200 text-xs sm:text-sm">{user.coins.toLocaleString('ar-EG')}</span>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleSound();
            }}
            className="p-1.5 sm:p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
            title={user.soundEnabled ? "إيقاف الصوت" : "تشغيل الصوت"}
          >
            {user.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenSettings();
            }}
            className="p-1.5 sm:p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
            title="الإعدادات"
          >
            <Settings className="w-4 h-4 text-amber-400" />
          </button>
        </div>

      </div>
    </header>
  );
};
