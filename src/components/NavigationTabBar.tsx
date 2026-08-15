import React from "react";
import { GameView } from "../types";
import { Home, Layers, Swords, Bot, BarChart3, Trophy, Crown } from "lucide-react";
import { soundFx } from "../utils/sound";

interface NavigationTabBarProps {
  currentView: GameView;
  onSelectView: (view: GameView) => void;
  isAdmin?: boolean;
}

export const NavigationTabBar: React.FC<NavigationTabBarProps> = ({
  currentView,
  onSelectView,
  isAdmin = false,
}) => {
  const tabs = [
    { id: "home" as GameView, label: "الرئيسية", icon: Home },
    { id: "levels" as GameView, label: "المستويات", icon: Layers },
    { id: "vs_mode" as GameView, label: "تحدي VS", icon: Swords },
    { id: "analytics" as GameView, label: "الإحصائيات", icon: BarChart3 },
    { id: "leaderboard" as GameView, label: "المتصدرين", icon: Trophy },
    ...(isAdmin
      ? [{ id: "admin" as GameView, label: "لوحة التحكم", icon: Crown, isAdminTab: true }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-amber-500/30 px-2 py-1.5 shadow-2xl">
      <div className="max-w-xl mx-auto flex items-center justify-around dir-rtl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          const isSpecialAdmin = (tab as any).isAdminTab;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                onSelectView(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? isSpecialAdmin
                    ? "bg-gradient-to-b from-amber-500 to-yellow-600 text-slate-950 font-black scale-105 shadow-md shadow-amber-500/30 border border-amber-400"
                    : "bg-gradient-to-b from-amber-500/20 to-yellow-600/30 text-amber-300 border border-amber-500/50 scale-105 shadow-md shadow-amber-500/20"
                  : isSpecialAdmin
                  ? "text-amber-400/90 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20"
                  : "text-slate-400 hover:text-slate-200 active:scale-95"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive
                    ? isSpecialAdmin
                      ? "text-slate-950"
                      : "text-amber-400 animate-pulse"
                    : isSpecialAdmin
                    ? "text-amber-400"
                    : "text-slate-400"
                }`}
              />
              <span
                className={`text-[10px] font-bold mt-1 whitespace-nowrap ${
                  isActive
                    ? isSpecialAdmin
                      ? "text-slate-950 font-black"
                      : "text-amber-300"
                    : isSpecialAdmin
                    ? "text-amber-300"
                    : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

