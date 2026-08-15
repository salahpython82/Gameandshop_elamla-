import React, { useState } from "react";
import { Disc, Sparkles, Coins, X } from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "../utils/sound";

interface FortuneWheelModalProps {
  onWinReward: (coins: number) => void;
  onClose: () => void;
}

export const FortuneWheelModal: React.FC<FortuneWheelModalProps> = ({
  onWinReward,
  onClose,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonCoins, setWonCoins] = useState<number | null>(null);

  const PRIZES = [100, 250, 50, 500, 150, 300, 1000, 200];

  const spinWheel = () => {
    if (isSpinning || wonCoins !== null) return;

    setIsSpinning(true);
    soundFx.playCoin();

    const randomIndex = Math.floor(Math.random() * PRIZES.length);
    const selectedPrize = PRIZES[randomIndex];
    const degreesPerSlice = 360 / PRIZES.length;
    const totalRotation = 360 * 5 + (360 - randomIndex * degreesPerSlice - degreesPerSlice / 2);

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonCoins(selectedPrize);
      soundFx.playVictory();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      onWinReward(selectedPrize);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl animate-in fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-amber-950 p-6 rounded-3xl border-2 border-amber-500/50 shadow-2xl text-center space-y-5 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-2xl font-black text-amber-300">
            عجلة الحظ والمكافآت
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            أدر العجلة واحصل على قطع نقدية مجانية فورياً!
          </p>
        </div>

        {/* Wheel graphic */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center my-4">
          {/* Pointer */}
          <div className="absolute -top-3 z-20 text-3xl text-amber-400 filter drop-shadow">
            ▼
          </div>

          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl overflow-hidden relative transition-transform duration-[4000ms] ease-out bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {PRIZES.map((prize, idx) => {
              const angle = idx * (360 / PRIZES.length);
              return (
                <div
                  key={idx}
                  className="absolute w-full h-full flex items-center justify-center text-xs font-black text-slate-950"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span className="transform -translate-y-20 font-mono font-bold bg-amber-200/90 px-1.5 py-0.5 rounded shadow">
                    +{prize}🪙
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {wonCoins ? (
          <div className="space-y-3">
            <p className="text-lg font-black text-emerald-400">
              مبروك! فزت بـ +{wonCoins} قطعة نقدية 🪙
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-amber-500 text-slate-950 font-black rounded-xl"
            >
              متابعة اللعب
            </button>
          </div>
        ) : (
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSpinning ? "جاري تدوير العجلة..." : "إدارة العجلة الآن"}
          </button>
        )}

      </div>
    </div>
  );
};
