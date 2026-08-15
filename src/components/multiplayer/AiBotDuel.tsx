import React, { useState, useEffect } from "react";
import { UserProfile, AIOpponent, Question } from "../../types";
import { AI_OPPONENTS, INITIAL_QUESTIONS } from "../../data/initialData";
import { Swords, Bot, Play, Trophy, Zap, ShieldAlert, Sparkles, RotateCcw } from "lucide-react";
import { soundFx } from "../../utils/sound";
import confetti from "canvas-confetti";

interface AiBotDuelProps {
  user: UserProfile;
  onUpdateScore: (earnedCoins: number) => void;
  onBack: () => void;
}

export const AiBotDuel: React.FC<AiBotDuelProps> = ({ user, onUpdateScore, onBack }) => {
  const [selectedOpponent, setSelectedOpponent] = useState<AIOpponent>(AI_OPPONENTS[0]);
  const [inMatch, setInMatch] = useState(false);

  // Match State
  const [currentRound, setCurrentRound] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [matchQuestions, setMatchQuestions] = useState<Question[]>([]);

  // Round turn state
  const [playerAnswered, setPlayerAnswered] = useState<number | null>(null);
  const [aiAnswered, setAiAnswered] = useState<number | null>(null);
  const [roundFinished, setRoundFinished] = useState(false);
  const [matchFinished, setMatchFinished] = useState(false);

  const TOTAL_ROUNDS = 5;

  const startMatch = () => {
    soundFx.playVictory();
    const shuffled = [...INITIAL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
    setMatchQuestions(shuffled);
    setCurrentRound(0);
    setPlayerScore(0);
    setAiScore(0);
    setPlayerAnswered(null);
    setAiAnswered(null);
    setRoundFinished(false);
    setMatchFinished(false);
    setInMatch(true);
  };

  const currentQ = matchQuestions[currentRound] || INITIAL_QUESTIONS[0];

  // Trigger AI response timer in round
  useEffect(() => {
    if (!inMatch || roundFinished || matchFinished || !currentQ) return;

    const timer = setTimeout(() => {
      const isCorrect = Math.random() <= selectedOpponent.accuracy;
      let aiChoice = currentQ.correctAnswer;
      if (!isCorrect) {
        const wrongOpts = [0, 1, 2, 3].filter((i) => i !== currentQ.correctAnswer);
        aiChoice = wrongOpts[Math.floor(Math.random() * wrongOpts.length)];
      }

      setAiAnswered(aiChoice);
      if (aiChoice === currentQ.correctAnswer) {
        setAiScore((prev) => prev + 100);
      }
    }, selectedOpponent.answerSpeedSeconds * 1000);

    return () => clearTimeout(timer);
  }, [inMatch, currentRound, roundFinished, matchFinished, currentQ, selectedOpponent]);

  const handlePlayerChoice = (idx: number) => {
    if (playerAnswered !== null || roundFinished) return;

    setPlayerAnswered(idx);
    const isCorrect = idx === currentQ.correctAnswer;

    if (isCorrect) {
      soundFx.playCorrect();
      setPlayerScore((prev) => prev + 100);
    } else {
      soundFx.playWrong();
    }

    setRoundFinished(true);
  };

  const handleNextRound = () => {
    if (currentRound + 1 < TOTAL_ROUNDS) {
      setCurrentRound((prev) => prev + 1);
      setPlayerAnswered(null);
      setAiAnswered(null);
      setRoundFinished(false);
    } else {
      setMatchFinished(true);
      const isWinner = playerScore > aiScore;
      if (isWinner) {
        soundFx.playVictory();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        onUpdateScore(300);
      } else {
        soundFx.playWrong();
        onUpdateScore(50);
      }
    }
  };

  if (!inMatch) {
    return (
      <div className="space-y-6 dir-rtl animate-in fade-in duration-300">
        {/* Header */}
        <div className="text-center bg-gradient-to-br from-slate-900 to-rose-950 p-6 rounded-3xl border border-rose-500/30 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-500/30">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-rose-200">
            تحدي الذكاء الاصطناعي (AI Bot Arena)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            اختر الخصم الآلي بمستويات ذكاء وسرعة مختلفة للفوز بالنقاط والجوائز!
          </p>
        </div>

        {/* AI Opponents List */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Bot className="w-5 h-5 text-rose-400" />
            <span>اختر المنافس الآلي:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_OPPONENTS.map((opp) => {
              const isSelected = selectedOpponent.id === opp.id;
              return (
                <div
                  key={opp.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedOpponent(opp);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-gradient-to-r from-rose-950/80 to-slate-900 border-rose-400 shadow-xl scale-[1.02]"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl border border-slate-700">
                      {opp.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{opp.name}</h4>
                      <span className="text-[11px] text-rose-400 font-semibold">{opp.title}</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        نسبة الصحة: {Math.round(opp.accuracy * 100)}% • السرعة: {opp.answerSpeedSeconds} ثوان
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      opp.difficulty === "سهل"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : opp.difficulty === "متوسط"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {opp.difficulty}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-5 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl border border-slate-800 text-sm"
          >
            رجوع
          </button>
          <button
            onClick={startMatch}
            className="flex-1 py-4 bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-rose-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>بدء التحدي ضد {selectedOpponent.name}</span>
          </button>
        </div>
      </div>
    );
  }

  // Live Match
  return (
    <div className="space-y-5 dir-rtl max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-4 rounded-3xl border-2 border-rose-500/40 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl">
              {user.avatar}
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-300 block">{user.name}</span>
              <span className="text-xl font-black text-white">{playerScore}</span>
            </div>
          </div>

          <div className="px-3 py-1 bg-rose-500 text-slate-950 font-black text-sm rounded-full shadow-lg border border-rose-300 animate-pulse">
            VS
          </div>

          <div className="flex items-center gap-2 text-center">
            <div className="text-left">
              <span className="text-xs font-bold text-rose-300 block">{selectedOpponent.name}</span>
              <span className="text-xl font-black text-white">{aiScore}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-2xl">
              {selectedOpponent.avatar}
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-xs font-mono text-slate-400 border-t border-rose-500/20 pt-2">
          الجولة {currentRound + 1} من {TOTAL_ROUNDS}
        </div>
      </div>

      {matchFinished ? (
        <div className="bg-slate-900 p-6 rounded-3xl border-2 border-amber-500/50 text-center space-y-4 animate-in zoom-in-95">
          <div className="text-5xl">{playerScore > aiScore ? "👑" : "💔"}</div>
          <h3 className="text-2xl font-black text-amber-300">
            {playerScore > aiScore ? "انتصار ساحق على الروبوت!" : "خسارة الجولة أمام الروبوت"}
          </h3>
          <p className="text-sm text-slate-300">
            النتيجة النهائية: {playerScore} مقابل {aiScore}
          </p>

          <button
            onClick={() => setInMatch(false)}
            className="w-full py-3 bg-amber-500 text-slate-950 font-black rounded-xl"
          >
            العودة لقائمة التحديات
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 text-center">
            <h3 className="text-lg font-bold text-slate-100">{currentQ.question}</h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {currentQ.options.map((optText, idx) => {
              const isCorrect = idx === currentQ.correctAnswer;
              const isPlayerChoice = playerAnswered === idx;
              const isAiChoice = aiAnswered === idx;

              let style = "bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500/50";

              if (roundFinished) {
                if (isCorrect) {
                  style = "bg-emerald-600 border-emerald-400 text-white font-bold";
                } else if (isPlayerChoice) {
                  style = "bg-rose-600 border-rose-400 text-white font-bold";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={playerAnswered !== null}
                  onClick={() => handlePlayerChoice(idx)}
                  className={`p-3.5 rounded-2xl border font-bold text-right text-sm transition-all flex items-center justify-between ${style}`}
                >
                  <span>{optText}</span>
                  <div className="flex items-center gap-1">
                    {isPlayerChoice && (
                      <span className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">اختيارك</span>
                    )}
                    {isAiChoice && (
                      <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">
                        {selectedOpponent.name}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {roundFinished && (
            <button
              onClick={handleNextRound}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl mt-3"
            >
              الجولة التالية
            </button>
          )}
        </div>
      )}
    </div>
  );
};
