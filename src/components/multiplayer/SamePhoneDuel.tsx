import React, { useState, useEffect, useRef } from "react";
import { UserProfile, Question, SamePhoneSubMode, MultiplayerPlayer } from "../../types";
import { INITIAL_QUESTIONS, INITIAL_CATEGORIES } from "../../data/initialData";
import { soundFx } from "../../utils/sound";
import confetti from "canvas-confetti";
import {
  Smartphone,
  Swords,
  RotateCcw,
  Trophy,
  Zap,
  Users,
  Timer,
  CheckCircle2,
  XCircle,
  Play,
  Flame,
  Crown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  RefreshCw
} from "lucide-react";

interface SamePhoneDuelProps {
  user: UserProfile;
  onFinishDuel: (winner: "player1" | "player2" | "draw", score1: number, score2: number) => void;
  onBack: () => void;
}

const AVATAR_LIST = ["🦁", "🦅", "⚡", "👑", "🔥", "🚀", "🐺", "🎯", "🦊", "🐉", "💎", "⭐"];

export const SamePhoneDuel: React.FC<SamePhoneDuelProps> = ({ user, onFinishDuel, onBack }) => {
  const [subMode, setSubMode] = useState<SamePhoneSubMode>("split_screen");
  const [gameStarted, setGameStarted] = useState(false);
  const [roundCount, setRoundCount] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Player 1 & Player 2 state
  const [p1, setP1] = useState<MultiplayerPlayer>({
    id: "p1",
    name: user.name || "اللاعب 1",
    avatar: user.avatar || "🦁",
    score: 0,
    selectedOption: null,
    answeredTimeMs: null,
    streak: 0,
    isReady: true,
  });

  const [p2, setP2] = useState<MultiplayerPlayer>({
    id: "p2",
    name: "اللاعب 2",
    avatar: "🦅",
    score: 0,
    selectedOption: null,
    answeredTimeMs: null,
    streak: 0,
    isReady: true,
  });

  // Match progression
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundTimer, setRoundTimer] = useState(15);
  const [roundEnded, setRoundEnded] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isFlippedP2, setIsFlippedP2] = useState(true); // Flip Top player for face-to-face table mode

  // Pass & Play specific state
  const [activeTurnPlayer, setActiveTurnPlayer] = useState<"p1" | "p2">("p1");
  const [passScreenVisible, setPassScreenVisible] = useState(false);

  const roundStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Setup match questions
  const startMatch = () => {
    let pool = [...INITIAL_QUESTIONS];
    if (selectedCategory !== "all") {
      const filtered = pool.filter((q) => q.categoryId === selectedCategory);
      if (filtered.length >= roundCount) {
        pool = filtered;
      }
    }
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, roundCount);
    setQuestions(shuffled);
    setCurrentRound(0);
    setRoundTimer(15);
    setRoundEnded(false);
    setGameOver(false);
    setPassScreenVisible(false);
    setActiveTurnPlayer("p1");

    setP1((prev) => ({ ...prev, score: 0, selectedOption: null, answeredTimeMs: null, streak: 0 }));
    setP2((prev) => ({ ...prev, score: 0, selectedOption: null, answeredTimeMs: null, streak: 0 }));

    roundStartTimeRef.current = Date.now();
    setGameStarted(true);
    soundFx.playVictory();
  };

  // Timer Tick
  useEffect(() => {
    if (!gameStarted || roundEnded || gameOver || passScreenVisible) return;

    roundStartTimeRef.current = Date.now();
    setRoundTimer(15);

    timerIntervalRef.current = setInterval(() => {
      setRoundTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleRoundTimeout();
          return 0;
        }
        if (prev <= 5) soundFx.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameStarted, currentRound, roundEnded, gameOver, passScreenVisible, activeTurnPlayer]);

  // Round Timeout Handler
  const handleRoundTimeout = () => {
    if (roundEnded) return;
    soundFx.playWrong();
    setRoundEnded(true);
  };

  const currentQ = questions[currentRound] || INITIAL_QUESTIONS[0];

  // Handle Player Answer in Split Screen (Simultaneous)
  const handleSplitAnswer = (playerId: "p1" | "p2", optionIndex: number) => {
    if (roundEnded) return;

    const timeTaken = Date.now() - roundStartTimeRef.current;
    const isCorrect = optionIndex === currentQ.correctAnswer;
    const speedBonus = Math.max(10, Math.round((15000 - timeTaken) / 1000) * 10);
    const roundPoints = isCorrect ? 100 + speedBonus : 0;

    if (playerId === "p1") {
      if (p1.selectedOption !== null) return;
      if (isCorrect) soundFx.playCorrect();
      else soundFx.playWrong();

      setP1((prev) => ({
        ...prev,
        selectedOption: optionIndex,
        answeredTimeMs: timeTaken,
        score: prev.score + roundPoints,
        streak: isCorrect ? prev.streak + 1 : 0,
      }));

      // If other player already answered or timeout
      if (p2.selectedOption !== null) {
        setRoundEnded(true);
      }
    } else {
      if (p2.selectedOption !== null) return;
      if (isCorrect) soundFx.playCorrect();
      else soundFx.playWrong();

      setP2((prev) => ({
        ...prev,
        selectedOption: optionIndex,
        answeredTimeMs: timeTaken,
        score: prev.score + roundPoints,
        streak: isCorrect ? prev.streak + 1 : 0,
      }));

      if (p1.selectedOption !== null) {
        setRoundEnded(true);
      }
    }
  };

  // Handle Pass & Play answer
  const handlePassAnswer = (optionIndex: number) => {
    if (roundEnded) return;
    const isCorrect = optionIndex === currentQ.correctAnswer;
    const timeTaken = Date.now() - roundStartTimeRef.current;
    const roundPoints = isCorrect ? 100 + Math.max(10, Math.round((15000 - timeTaken) / 1000) * 10) : 0;

    if (isCorrect) soundFx.playCorrect();
    else soundFx.playWrong();

    if (activeTurnPlayer === "p1") {
      setP1((prev) => ({
        ...prev,
        selectedOption: optionIndex,
        score: prev.score + roundPoints,
        streak: isCorrect ? prev.streak + 1 : 0,
      }));
      setPassScreenVisible(true);
    } else {
      setP2((prev) => ({
        ...prev,
        selectedOption: optionIndex,
        score: prev.score + roundPoints,
        streak: isCorrect ? prev.streak + 1 : 0,
      }));
      setRoundEnded(true);
    }
  };

  // Switch Turn in Pass & Play
  const handlePassToP2 = () => {
    setPassScreenVisible(false);
    setActiveTurnPlayer("p2");
    roundStartTimeRef.current = Date.now();
  };

  // Advance to next round
  const handleNextRound = () => {
    if (currentRound + 1 < roundCount) {
      setCurrentRound((prev) => prev + 1);
      setP1((prev) => ({ ...prev, selectedOption: null, answeredTimeMs: null }));
      setP2((prev) => ({ ...prev, selectedOption: null, answeredTimeMs: null }));
      setRoundEnded(false);
      setActiveTurnPlayer("p1");
      setPassScreenVisible(false);
    } else {
      setGameOver(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const winner = p1.score > p2.score ? "player1" : p2.score > p1.score ? "player2" : "draw";
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      soundFx.playVictory();
      onFinishDuel(winner, p1.score, p2.score);
    }
  };

  // Setup / Lobby Screen
  if (!gameStarted) {
    return (
      <div className="space-y-6 dir-rtl animate-in fade-in duration-300">
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-indigo-100">
            تحدي على نفس الهاتف (2 Players)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            تنافس مع صديقك وجهاً لوجه على نفس الشاشة واختبروا سرعة البديهة والذكاء!
          </p>
        </div>

        {/* Sub-mode selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              setSubMode("split_screen");
            }}
            className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
              subMode === "split_screen"
                ? "bg-indigo-950/80 border-indigo-400 shadow-xl scale-[1.02]"
                : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <Swords className="w-6 h-6 text-indigo-400" />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                تفاعل فوري
              </span>
            </div>
            <h4 className="font-black text-slate-100 text-sm">شاشة مقسومة (وجهاً لوجه)</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              شاشة مقسومة لنصفين، كل لاعب يضغط إجابته مباشرة في نفس اللحظة.
            </p>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setSubMode("pass_and_play");
            }}
            className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
              subMode === "pass_and_play"
                ? "bg-indigo-950/80 border-indigo-400 shadow-xl scale-[1.02]"
                : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <RotateCcw className="w-6 h-6 text-purple-400" />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                دور بدور
              </span>
            </div>
            <h4 className="font-black text-slate-100 text-sm">تمرير الهاتف (دور بدور)</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              يجيب اللاعب الأول ثم يمرر الهاتف للاعب الثاني للإجابة على نفس السؤال.
            </p>
          </button>
        </div>

        {/* Player Customization Box */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>تخصيص اللاعبين:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Player 1 Config */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">اللاعب 1 (الأساسي)</span>
                <span className="text-2xl p-1 bg-amber-500/20 rounded-xl border border-amber-500/30">
                  {p1.avatar}
                </span>
              </div>
              <input
                type="text"
                value={p1.name}
                onChange={(e) => setP1((prev) => ({ ...prev, name: e.target.value || "اللاعب 1" }))}
                placeholder="اسم اللاعب 1"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              {/* Avatars */}
              <div className="flex flex-wrap gap-1.5">
                {AVATAR_LIST.slice(0, 6).map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      soundFx.playClick();
                      setP1((prev) => ({ ...prev, avatar: av }));
                    }}
                    className={`text-lg p-1.5 rounded-lg border ${
                      p1.avatar === av ? "bg-amber-500/30 border-amber-400 scale-110" : "bg-slate-900 border-slate-800"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Player 2 Config */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400">اللاعب 2 (المتحدي)</span>
                <span className="text-2xl p-1 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  {p2.avatar}
                </span>
              </div>
              <input
                type="text"
                value={p2.name}
                onChange={(e) => setP2((prev) => ({ ...prev, name: e.target.value || "اللاعب 2" }))}
                placeholder="اسم اللاعب 2"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
              {/* Avatars */}
              <div className="flex flex-wrap gap-1.5">
                {AVATAR_LIST.slice(6, 12).map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      soundFx.playClick();
                      setP2((prev) => ({ ...prev, avatar: av }));
                    }}
                    className={`text-lg p-1.5 rounded-lg border ${
                      p2.avatar === av ? "bg-indigo-500/30 border-indigo-400 scale-110" : "bg-slate-900 border-slate-800"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rounds & Category */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1.5">عدد الجولات:</label>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      soundFx.playClick();
                      setRoundCount(count);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                      roundCount === count
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-lg"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1.5">تصنيف الأسئلة:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="all">منوع (جميع التصنيفات)</option>
                {INITIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Start & Back Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-5 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl border border-slate-800 text-sm"
          >
            رجوع
          </button>
          <button
            onClick={startMatch}
            className="flex-1 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>بدء المواجهة الآن</span>
          </button>
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (gameOver) {
    const isP1Win = p1.score > p2.score;
    const isP2Win = p2.score > p1.score;
    const isDraw = p1.score === p2.score;

    return (
      <div className="space-y-6 dir-rtl text-center max-w-md mx-auto animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl border-2 border-indigo-500/40 shadow-2xl relative overflow-hidden">
          <div className="text-6xl mb-3 animate-bounce">{isDraw ? "🤝" : isP1Win ? p1.avatar : p2.avatar}</div>
          <h2 className="text-3xl font-black text-amber-300">
            {isDraw ? "تعادل بطولي!" : isP1Win ? `فوز ساحق لـ ${p1.name}!` : `فوز ساحق لـ ${p2.name}!`}
          </h2>
          <p className="text-xs text-slate-300 mt-1">انتهت المواجهة الحماسية بـ {roundCount} جولات</p>

          {/* Scores Comparison */}
          <div className="grid grid-cols-2 gap-4 my-6">
            <div
              className={`p-4 rounded-2xl border ${
                isP1Win ? "bg-amber-500/20 border-amber-400" : "bg-slate-900/90 border-slate-800"
              }`}
            >
              <span className="text-2xl block mb-1">{p1.avatar}</span>
              <span className="text-xs font-bold text-slate-300 block">{p1.name}</span>
              <span className="text-2xl font-black text-white">{p1.score}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">نقطة</span>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isP2Win ? "bg-indigo-500/20 border-indigo-400" : "bg-slate-900/90 border-slate-800"
              }`}
            >
              <span className="text-2xl block mb-1">{p2.avatar}</span>
              <span className="text-xs font-bold text-slate-300 block">{p2.name}</span>
              <span className="text-2xl font-black text-white">{p2.score}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">نقطة</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5">
            <button
              onClick={startMatch}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>جولة إعادة فورية (Rematch)</span>
            </button>
            <button
              onClick={() => setGameStarted(false)}
              className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-800"
            >
              تغيير الإعدادات
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PASS & PLAY Mode View
  if (subMode === "pass_and_play") {
    if (passScreenVisible) {
      return (
        <div className="space-y-6 dir-rtl text-center max-w-md mx-auto my-12 animate-in fade-in duration-200">
          <div className="bg-slate-900 p-8 rounded-3xl border border-purple-500/40 shadow-2xl space-y-4">
            <div className="text-5xl animate-pulse">📲</div>
            <h3 className="text-2xl font-black text-purple-300">مرر الهاتف إلى {p2.name}!</h3>
            <p className="text-xs text-slate-400">
              أجاب {p1.name} على سؤاله. دور {p2.name} الآن للإجابة على نفس السؤال بدون رؤية إجابة الخصم!
            </p>
            <button
              onClick={handlePassToP2}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-purple-500/30 hover:scale-105 transition-all"
            >
              أنا {p2.name} - جاهز للإجابة!
            </button>
          </div>
        </div>
      );
    }

    const currentPlayer = activeTurnPlayer === "p1" ? p1 : p2;

    return (
      <div className="space-y-4 dir-rtl max-w-xl mx-auto">
        {/* Pass & Play Header */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
              {currentPlayer.avatar}
            </div>
            <div>
              <span className="text-xs font-bold text-purple-400">دور اللاعب الحالي:</span>
              <h4 className="text-base font-black text-white">{currentPlayer.name}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-mono text-base font-bold text-amber-300">{roundTimer}s</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {currentRound + 1} / {roundCount}
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-purple-500/20 text-center">
          <h3 className="text-lg font-bold text-slate-100">{currentQ.question}</h3>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2.5">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              disabled={roundEnded}
              onClick={() => handlePassAnswer(idx)}
              className="p-4 rounded-xl border font-bold text-right text-sm bg-slate-900 border-slate-800 text-slate-200 hover:border-purple-400 active:scale-98 transition-all"
            >
              {opt}
            </button>
          ))}
        </div>

        {roundEnded && (
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
            <div className="text-xs text-slate-300">
              الإجابة الصحيحة هي:{" "}
              <span className="font-bold text-emerald-400">{currentQ.options[currentQ.correctAnswer]}</span>
            </div>
            <div className="flex justify-around text-xs font-bold pt-2 border-t border-slate-800">
              <span className={p1.selectedOption === currentQ.correctAnswer ? "text-emerald-400" : "text-rose-400"}>
                {p1.name}: {p1.selectedOption === currentQ.correctAnswer ? "✓ صحيحة (+100)" : "✗ خاطئة"}
              </span>
              <span className={p2.selectedOption === currentQ.correctAnswer ? "text-emerald-400" : "text-rose-400"}>
                {p2.name}: {p2.selectedOption === currentQ.correctAnswer ? "✓ صحيحة (+100)" : "✗ خاطئة"}
              </span>
            </div>
            <button
              onClick={handleNextRound}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl"
            >
              {currentRound + 1 < roundCount ? "الجولة التالية" : "عرض النتيجة النهائية"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // SPLIT SCREEN 1v1 Mode View (True Face-to-Face Dual Arena)
  return (
    <div className="flex flex-col h-[78vh] max-h-[820px] bg-slate-950 rounded-3xl border-2 border-indigo-500/30 overflow-hidden relative select-none">
      {/* Player 2 Top Half (Can be rotated 180deg for face-to-face table play) */}
      <div
        className={`flex-1 p-3 bg-gradient-to-b from-indigo-950/60 to-slate-900/90 flex flex-col justify-between transition-transform duration-200 ${
          isFlippedP2 ? "rotate-180" : ""
        }`}
      >
        {/* P2 Status Bar */}
        <div className="flex items-center justify-between text-xs pb-1 border-b border-indigo-500/20">
          <div className="flex items-center gap-2">
            <span className="text-xl">{p2.avatar}</span>
            <div>
              <span className="font-bold text-indigo-300 block">{p2.name}</span>
              <span className="font-black text-white">{p2.score} pts</span>
            </div>
          </div>
          {p2.streak > 1 && (
            <span className="flex items-center gap-0.5 text-amber-400 font-black text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3 fill-amber-400" /> {p2.streak} متتالية
            </span>
          )}
        </div>

        {/* P2 Question text */}
        <div className="text-center px-2 my-auto">
          <h4 className="text-sm sm:text-base font-bold text-slate-100 line-clamp-2">{currentQ.question}</h4>
        </div>

        {/* P2 Answer Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {currentQ.options.map((opt, idx) => {
            const isSelected = p2.selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswer;
            let btnClass = "bg-slate-900/90 border-slate-700 text-slate-200";

            if (p2.selectedOption !== null) {
              if (isSelected) {
                btnClass = isCorrect
                  ? "bg-emerald-600 border-emerald-400 text-white animate-pulse"
                  : "bg-rose-600 border-rose-400 text-white";
              } else if (roundEnded && isCorrect) {
                btnClass = "bg-emerald-900/70 border-emerald-500 text-emerald-200";
              }
            }

            return (
              <button
                key={idx}
                disabled={p2.selectedOption !== null}
                onClick={() => handleSplitAnswer("p2", idx)}
                className={`p-2.5 rounded-xl border text-center text-xs sm:text-sm font-bold transition-all active:scale-95 ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Central Divider Bar (Score, Round, Flip Toggle) */}
      <div className="h-12 bg-slate-900 border-y-2 border-indigo-500/40 flex items-center justify-between px-4 z-10 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFlippedP2(!isFlippedP2)}
            title="تدوير واجهة اللاعب العلوي للمواجهة المباشرة"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-400 font-mono">
            جولة {currentRound + 1}/{roundCount}
          </span>
        </div>

        {/* Live Timer or Next Button */}
        {roundEnded ? (
          <button
            onClick={handleNextRound}
            className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg animate-bounce"
          >
            {currentRound + 1 < roundCount ? "الجولة التالية ▶" : "النتيجة النهائية 🏆"}
          </button>
        ) : (
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-full border border-amber-500/30">
            <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-mono text-xs font-black text-amber-300">{roundTimer}s</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs font-black">
          <span className="text-indigo-400">{p2.score}</span>
          <span className="text-slate-600">:</span>
          <span className="text-amber-400">{p1.score}</span>
        </div>
      </div>

      {/* Player 1 Bottom Half */}
      <div className="flex-1 p-3 bg-gradient-to-t from-amber-950/60 to-slate-900/90 flex flex-col justify-between">
        {/* P1 Question text */}
        <div className="text-center px-2 my-auto">
          <h4 className="text-sm sm:text-base font-bold text-slate-100 line-clamp-2">{currentQ.question}</h4>
        </div>

        {/* P1 Answer Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {currentQ.options.map((opt, idx) => {
            const isSelected = p1.selectedOption === idx;
            const isCorrect = idx === currentQ.correctAnswer;
            let btnClass = "bg-slate-900/90 border-slate-700 text-slate-200";

            if (p1.selectedOption !== null) {
              if (isSelected) {
                btnClass = isCorrect
                  ? "bg-emerald-600 border-emerald-400 text-white animate-pulse"
                  : "bg-rose-600 border-rose-400 text-white";
              } else if (roundEnded && isCorrect) {
                btnClass = "bg-emerald-900/70 border-emerald-500 text-emerald-200";
              }
            }

            return (
              <button
                key={idx}
                disabled={p1.selectedOption !== null}
                onClick={() => handleSplitAnswer("p1", idx)}
                className={`p-2.5 rounded-xl border text-center text-xs sm:text-sm font-bold transition-all active:scale-95 ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* P1 Status Bar */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="text-xl">{p1.avatar}</span>
            <div>
              <span className="font-bold text-amber-300 block">{p1.name}</span>
              <span className="font-black text-white">{p1.score} pts</span>
            </div>
          </div>
          {p1.streak > 1 && (
            <span className="flex items-center gap-0.5 text-amber-400 font-black text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3 fill-amber-400" /> {p1.streak} متتالية
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
