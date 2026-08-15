import React from "react";
import { Gift, Coins, Star, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "../utils/sound";

interface DailyRewardModalProps {
  streakDays: number;
  onClaim: (coins: number, stars: number) => void;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  streakDays,
  onClaim,
  onClose,
}) => {
  const coinsReward = 200 + streakDays * 50;
  const starsReward = 5;

  const handleClaim = () => {
    soundFx.playVictory();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
    });
    onClaim(coinsReward, starsReward);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl animate-in fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 p-6 rounded-3xl border-2 border-amber-500/50 shadow-2xl text-center space-y-5">
        
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto text-4xl shadow-lg shadow-amber-500/30 animate-bounce">
          🎁
        </div>

        <div>
          <h2 className="text-2xl font-black text-amber-300">
            صندوق المكافأة اليومية!
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            لقد حافظت على الاستمرار لمدة <span className="text-amber-400 font-bold">{streakDays} أيام</span> متتالية!
          </p>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-500/30 flex justify-around items-center">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className="font-extrabold text-yellow-300 text-lg">+{coinsReward}</span>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <span className="font-extrabold text-amber-300 text-lg">+{starsReward}</span>
          </div>
        </div>

        <button
          onClick={handleClaim}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          استلام المكافأة الآن
        </button>
      </div>
    </div>
  );
};
