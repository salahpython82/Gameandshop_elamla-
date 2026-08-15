import React, { useState, useEffect } from "react";
import { Question, PowerUpState } from "../types";
import { Clock, HelpCircle, Sparkles, CheckCircle2, XCircle, ArrowRight, Lightbulb, Zap, PlusCircle, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "../utils/sound";
import { generateAiHint } from "../utils/aiGenerator";

interface QuizPlayerModalProps {
  questions: Question[];
  title: string;
  powerUps: PowerUpState;
  onUsePowerUp: (type: keyof PowerUpState) => void;
  onFinishQuiz: (score: number, correctCount: number, totalCount: number, earnedCoins: number, earnedStars: number) => void;
  onClose: () => void;
}

export const QuizPlayerModal: React.FC<QuizPlayerModalProps> = ({
  questions,
  title,
  powerUps,
  onUsePowerUp,
  onFinishQuiz,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  // Scores
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Timer
  const QUESTION_TIME = 20;
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Quiz completion state
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex] || questions[0];

  // Countdown effect
  useEffect(() => {
    if (!isTimerRunning || isAnswered || isCompleted) return;

    if (timeLeft <= 0) {
      // Time expired -> wrong answer
      handleAnswerOption(-1);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 5 && prev > 0) {
          soundFx.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isTimerRunning, isAnswered, isCompleted]);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
    setSelectedOption(null);
    setIsAnswered(false);
    setDisabledOptions([]);
    setActiveHint(null);
    setIsTimerRunning(true);
  }, [currentIndex]);

  const handleAnswerOption = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);
    setIsTimerRunning(false);

    const isCorrect = index === currentQuestion.correctAnswer;

    if (isCorrect) {
      soundFx.playCorrect();
      setScore((prev) => prev + 100 + timeLeft * 5);
      setCorrectCount((prev) => prev + 1);
    } else {
      soundFx.playWrong();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all questions!
      soundFx.playVictory();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsCompleted(true);
    }
  };

  // Power Up 1: Remove 2 wrong choices
  const handleRemoveTwo = () => {
    if (powerUps.removeTwoCount <= 0 || isAnswered || disabledOptions.length > 0) return;

    onUsePowerUp("removeTwoCount");
    soundFx.playCoin();

    const wrongIndexes = [0, 1, 2, 3].filter(
      (idx) => idx !== currentQuestion.correctAnswer
    );
    // Randomly pick 2 wrong indexes to disable
    const shuffled = wrongIndexes.sort(() => Math.random() - 0.5).slice(0, 2);
    setDisabledOptions(shuffled);
  };

  // Power Up 2: Extra Time (+15 sec)
  const handleExtraTime = () => {
    if (powerUps.extraTimeCount <= 0 || isAnswered) return;

    onUsePowerUp("extraTimeCount");
    soundFx.playCoin();
    setTimeLeft((prev) => prev + 15);
  };

  // Power Up 3: AI Smart Hint
  const handleAIHint = async () => {
    if (powerUps.aiHintCount <= 0 || isAnswered) return;

    onUsePowerUp("aiHintCount");
    soundFx.playCoin();

    if (currentQuestion.hint) {
      setActiveHint(currentQuestion.hint);
      return;
    }

    try {
      setIsLoadingHint(true);
      const hint = await generateAiHint(currentQuestion.question, currentQuestion.options);
      setActiveHint(hint);
    } catch (e) {
      setActiveHint("تلميح: استبعد الخيارات البعيدة منطقياً عن السؤال.");
    } finally {
      setIsLoadingHint(false);
    }
  };

  // Calculate final stars & coins
  const earnedStars = Math.min(
    3,
    Math.round((correctCount / Math.max(1, questions.length)) * 3)
  );
  const earnedCoins = correctCount * 50 + score;

  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 dir-rtl">
        <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl border-2 border-amber-500/50 p-6 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          
          <div className="text-6xl animate-bounce">
            🏆
          </div>

          <div>
            <h2 className="text-3xl font-black text-amber-300">
              إنجاز رائع!
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              لقد أكملت اختبار {title} بنجاح!
            </p>
          </div>

          {/* Stars display */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map((starNum) => (
              <div
                key={starNum}
                className={`p-3 rounded-2xl border ${
                  starNum <= earnedStars
                    ? "bg-amber-500/20 border-amber-400 text-yellow-300 shadow-lg shadow-amber-500/20 scale-110"
                    : "bg-slate-800/50 border-slate-700 text-slate-600"
                }`}
              >
                <Sparkles className="w-8 h-8 fill-current" />
              </div>
            ))}
          </div>

          {/* Stats summary pill */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-right">
            <div>
              <span className="text-xs text-slate-400">الإجابات الصحيحة</span>
              <p className="text-xl font-extrabold text-emerald-400">
                {correctCount} / {questions.length}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">المكافأة النقدية</span>
              <p className="text-xl font-extrabold text-yellow-300">
                +{earnedCoins} 🪙
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onFinishQuiz(score, correctCount, questions.length, earnedCoins, earnedStars);
            }}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            استلام المكافأة والمتابعة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col justify-between p-4 dir-rtl overflow-y-auto">
      {/* Top Header & Progress */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-amber-500/30 mb-3">
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <span className="text-xs text-amber-400 font-bold block">{title}</span>
          <span className="text-xs text-slate-400 font-mono">
            سؤال {currentIndex + 1} من {questions.length}
          </span>
        </div>

        {/* Timer Pill */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
          timeLeft <= 5 ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse" : "bg-slate-800 border-amber-500/40 text-amber-300"
        }`}>
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{timeLeft}ث</span>
        </div>
      </div>

      {/* Main Question Card (Matches Image 2 Screen 3) */}
      <div className="max-w-2xl mx-auto w-full my-auto space-y-4">
        
        {/* Question Text Box */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 rounded-3xl border-2 border-amber-500/40 shadow-2xl text-center min-h-[140px] flex flex-col items-center justify-center">
          <span className="absolute -top-3 bg-amber-500 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full border border-slate-900 shadow">
            {currentQuestion.difficulty || "سؤال ذكاء"}
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-slate-100 leading-snug mt-2">
            {currentQuestion.question}
          </h3>
        </div>

        {/* AI Smart Hint Box if active */}
        {activeHint && (
          <div className="bg-amber-500/10 border border-amber-500/40 p-3.5 rounded-2xl text-amber-200 text-sm flex items-start gap-2.5 animate-in fade-in">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{activeHint}</p>
          </div>
        )}

        {/* Helper Power-ups Bar */}
        <div className="flex items-center justify-around bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
          {/* Power Up 1: Remove Two */}
          <button
            onClick={handleRemoveTwo}
            disabled={powerUps.removeTwoCount <= 0 || isAnswered || disabledOptions.length > 0}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 text-amber-300 border border-amber-500/30 disabled:opacity-40 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <span>❌ حذف 2</span>
            <span className="bg-amber-500 text-slate-950 text-[10px] px-1 rounded-full font-black">
              {powerUps.removeTwoCount}
            </span>
          </button>

          {/* Power Up 2: Extra Time */}
          <button
            onClick={handleExtraTime}
            disabled={powerUps.extraTimeCount <= 0 || isAnswered}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 text-cyan-300 border border-cyan-500/30 disabled:opacity-40 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <span>⏱️ +15ث</span>
            <span className="bg-cyan-500 text-slate-950 text-[10px] px-1 rounded-full font-black">
              {powerUps.extraTimeCount}
            </span>
          </button>

          {/* Power Up 3: AI Hint */}
          <button
            onClick={handleAIHint}
            disabled={powerUps.aiHintCount <= 0 || isAnswered || isLoadingHint}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 text-emerald-300 border border-emerald-500/30 disabled:opacity-40 hover:bg-slate-700 active:scale-95 transition-all"
          >
            {isLoadingHint ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <span>💡 تلميح AI</span>
            )}
            <span className="bg-emerald-500 text-slate-950 text-[10px] px-1 rounded-full font-black">
              {powerUps.aiHintCount}
            </span>
          </button>
        </div>

        {/* 4 Answer Choice Buttons (Matches Image 2 Screen 3) */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((optionText, idx) => {
            const isCorrect = idx === currentQuestion.correctAnswer;
            const isSelected = selectedOption === idx;
            const isDisabled = disabledOptions.includes(idx);

            let btnStyle = "bg-slate-900/90 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-800/90";

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "bg-gradient-to-r from-emerald-600 to-green-600 border-emerald-300 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]";
              } else if (isSelected && !isCorrect) {
                btnStyle = "bg-gradient-to-r from-rose-600 to-red-600 border-rose-300 text-white";
              } else {
                btnStyle = "bg-slate-900/50 border-slate-900 text-slate-600 opacity-50";
              }
            } else if (isDisabled) {
              btnStyle = "bg-slate-950 border-slate-900 text-slate-700 opacity-30 cursor-not-allowed";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered || isDisabled}
                onClick={() => handleAnswerOption(idx)}
                className={`w-full p-4 rounded-2xl border-2 font-bold text-right text-base transition-all duration-200 flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs font-mono text-amber-300 shrink-0">
                    {["أ", "ب", "ج", "د"][idx]}
                  </span>
                  <span>{optionText}</span>
                </div>

                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation Banner when answered */}
        {isAnswered && (
          <div className="bg-slate-900 p-4 rounded-2xl border border-amber-500/30 space-y-2 animate-in fade-in">
            <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>معلومة إضافية وشرح الإجابة:</span>
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentQuestion.explanation || "إجابة ممتازة! واصل التحدي وجمع المزيد من النقاط والنجوم."}
            </p>

            <button
              onClick={handleNextQuestion}
              className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>السؤال التالي</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-slate-500 py-1 font-mono">
        مجموع النقاط: {score}
      </div>
    </div>
  );
};
