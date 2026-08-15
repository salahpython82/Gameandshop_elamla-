import React, { useState } from "react";
import { UserProfile, MultiplayerMode } from "../types";
import { SamePhoneDuel } from "./multiplayer/SamePhoneDuel";
import { OnlineMultiplayer } from "./multiplayer/OnlineMultiplayer";
import { BluetoothDuel } from "./multiplayer/BluetoothDuel";
import { AiBotDuel } from "./multiplayer/AiBotDuel";
import { soundFx } from "../utils/sound";
import {
  Swords,
  Smartphone,
  Globe,
  Bluetooth,
  Bot,
  Sparkles,
  Trophy,
  Zap,
  Users,
  Flame,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface VersusModeViewProps {
  user: UserProfile;
  onUpdateScore: (earnedCoins: number) => void;
}

export const VersusModeView: React.FC<VersusModeViewProps> = ({ user, onUpdateScore }) => {
  const [activeMode, setActiveMode] = useState<MultiplayerMode | null>(null);

  // If a specific multiplayer mode is active, render its screen
  if (activeMode === "same_phone") {
    return (
      <SamePhoneDuel
        user={user}
        onFinishDuel={(winner, s1, s2) => {
          onUpdateScore(250);
        }}
        onBack={() => setActiveMode(null)}
      />
    );
  }

  if (activeMode === "online") {
    return (
      <OnlineMultiplayer
        user={user}
        onRewardWinner={(earnedCoins) => {
          onUpdateScore(earnedCoins);
        }}
        onBack={() => setActiveMode(null)}
      />
    );
  }

  if (activeMode === "bluetooth") {
    return (
      <BluetoothDuel
        user={user}
        onFinishDuel={(earnedCoins) => {
          onUpdateScore(earnedCoins);
        }}
        onBack={() => setActiveMode(null)}
      />
    );
  }

  if (activeMode === "ai_bot") {
    return (
      <AiBotDuel
        user={user}
        onUpdateScore={(earnedCoins) => {
          onUpdateScore(earnedCoins);
        }}
        onBack={() => setActiveMode(null)}
      />
    );
  }

  // Master Multiplayer Hub (قائمة اختيار نمط التحدي)
  return (
    <div className="space-y-6 pb-20 dir-rtl animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-rose-950/80 to-slate-900 p-6 sm:p-8 rounded-3xl border border-rose-500/30 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 via-red-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-rose-500/30">
          <Swords className="w-8 h-8 text-slate-950" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-200 to-white">
          ساحة التحديات والمواجهات (Multiplayer Arena)
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
          اختر طريقة التحدي المناسبة وتنافس مع أصدقائك عبر الإنترنت أو البلوتوث أو مباشرة على نفس الشاشة!
        </p>

        {/* User quick stats badge */}
        <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-rose-500/20 text-xs">
          <span className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Trophy className="w-4 h-4" /> معدل ذكائك: {user.iqScore} IQ
          </span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1.5 text-rose-300 font-bold">
            <Flame className="w-4 h-4 fill-rose-400" /> الانتصارات: {user.totalCorrectAnswers}
          </span>
        </div>
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Same Phone Duel (نفس الهاتف) */}
        <div
          onClick={() => {
            soundFx.playClick();
            setActiveMode("same_phone");
          }}
          className="group bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/30 hover:border-indigo-400 p-5 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-indigo-500/20 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                بدون إنترنت ⚡
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-indigo-200 transition-colors">
                تحدي على نفس الهاتف (2 Players)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                شاشة مقسومة وجهاً لوجه أو نظام التمرير دور بدور. تفاعل فوري وسرعة بديهة فائقة!
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs font-bold text-indigo-400">
            <span>شاشة مقسومة / تمرير الهاتف</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 2. Online Multiplayer (أونلاين عبر الإنترنت) */}
        <div
          onClick={() => {
            soundFx.playClick();
            setActiveMode("online");
          }}
          className="group bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 border-2 border-sky-500/30 hover:border-sky-400 p-5 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-sky-500/20 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                غرف ومطابقة حية 🌐
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-sky-200 transition-colors">
                تحدي أونلاين عبر الإنترنت
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                أنشئ غرفة خاصة برمز سري وشاركه مع أصدقائك، أو العب مطابقة سريعة مع لاعبين من أي مكان بالعالم.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs font-bold text-sky-400">
            <span>رموز غرف / مطابقة سريعة</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 3. Bluetooth & Nearby (بلوتوث وأجهزة قريبة) */}
        <div
          onClick={() => {
            soundFx.playClick();
            setActiveMode("bluetooth");
          }}
          className="group bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border-2 border-cyan-500/30 hover:border-cyan-400 p-5 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-cyan-500/20 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                <Bluetooth className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                اقتران لاسلكي 📡
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-cyan-200 transition-colors">
                تحدي البلوتوث والأجهزة المجاورة
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                مسح راداري للأجهزة المجاورة والاقتران السريع عبر البلوتوث أو شبكة الواي فاي المحلية.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs font-bold text-cyan-400">
            <span>رادار مسح الأجهزة / اقتران فوري</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 4. AI Bot Opponents (روبوت الذكاء الاصطناعي) */}
        <div
          onClick={() => {
            soundFx.playClick();
            setActiveMode("ai_bot");
          }}
          className="group bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border-2 border-rose-500/30 hover:border-rose-400 p-5 rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-rose-500/20 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                مستويات ذكاء 🤖
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white group-hover:text-rose-200 transition-colors">
                تحدي الذكاء الاصطناعي (VS Bot)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                نافس خصوماً آليين بمستويات صعوبة متفاوتة وسرعات تفكير مختلفة لكسب الجوائز وتطوير مستواك.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs font-bold text-rose-400">
            <span>سهل • متوسط • صعب • خبير</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
