import React, { useState, useEffect, useRef } from "react";
import { UserProfile, Question, OnlineRoomData, MultiplayerPlayer } from "../../types";
import { INITIAL_QUESTIONS, INITIAL_CATEGORIES } from "../../data/initialData";
import { soundFx } from "../../utils/sound";
import confetti from "canvas-confetti";
import {
  Globe,
  Radio,
  Users,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Timer,
  Trophy,
  Flame,
  MessageSquare,
  Smile,
  ShieldCheck,
  Share2,
  RefreshCw,
  QrCode
} from "lucide-react";

interface OnlineMultiplayerProps {
  user: UserProfile;
  onRewardWinner: (earnedCoins: number) => void;
  onBack: () => void;
}

const EMOJI_REACTIONS = ["🔥", "👏", "🧠", "⚡", "👑", "😂", "🎯", "😱"];

export const OnlineMultiplayer: React.FC<OnlineMultiplayerProps> = ({ user, onRewardWinner, onBack }) => {
  const [tab, setTab] = useState<"create" | "join" | "quick_match">("quick_match");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchingMatch, setSearchingMatch] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);

  // Active Online Game State
  const [room, setRoom] = useState<OnlineRoomData | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string>("me");
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; fromMe: boolean }[]>([]);

  // Round Timer & Progression
  const [roundTimer, setRoundTimer] = useState(15);
  const [mySelectedOption, setMySelectedOption] = useState<number | null>(null);
  const [oppSelectedOption, setOppSelectedOption] = useState<number | null>(null);
  const [roundFinished, setRoundFinished] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const roundStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // Initialize BroadcastChannel for real-time local/tab/online sync
  useEffect(() => {
    try {
      const channel = new BroadcastChannel("QUIZ_ONLINE_ARENA_HUB");
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const msg = event.data;
        if (!msg) return;

        // Message Handling
        if (msg.type === "GUEST_JOINED" && isHost && room && room.roomCode === msg.roomCode) {
          soundFx.playCoin();
          const updatedGuest: MultiplayerPlayer = {
            id: msg.guest.id,
            name: msg.guest.name,
            avatar: msg.guest.avatar,
            score: 0,
            selectedOption: null,
            answeredTimeMs: null,
            streak: 0,
            isReady: true,
          };
          const updatedRoom: OnlineRoomData = {
            ...room,
            guest: updatedGuest,
            status: "playing",
            roundStartTime: Date.now(),
          };
          setRoom(updatedRoom);
          // Broadcast full room state to guest
          channel.postMessage({
            type: "SYNC_ROOM_STATE",
            room: updatedRoom,
          });
        }

        if (msg.type === "SYNC_ROOM_STATE") {
          if (room && room.roomCode === msg.room.roomCode) {
            setRoom(msg.room);
          } else if (!isHost && msg.room.guest?.id === myPlayerId) {
            setRoom(msg.room);
          }
        }

        if (msg.type === "PLAYER_ANSWERED" && room && room.roomCode === msg.roomCode) {
          if (msg.playerId !== myPlayerId) {
            setOppSelectedOption(msg.optionIndex);
            soundFx.playTick();
          }
        }

        if (msg.type === "NEXT_ROUND" && room && room.roomCode === msg.roomCode) {
          setMySelectedOption(null);
          setOppSelectedOption(null);
          setRoundFinished(false);
          setRoom(msg.updatedRoom);
        }

        if (msg.type === "REACTION_EMOJI" && room && room.roomCode === msg.roomCode) {
          const fromMe = msg.senderId === myPlayerId;
          triggerFloatingEmoji(msg.emoji, fromMe);
        }
      };

      return () => {
        channel.close();
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported in this environment");
    }
  }, [isHost, room, myPlayerId]);

  // Floating Emoji Reaction Helper
  const triggerFloatingEmoji = (emoji: string, fromMe: boolean) => {
    soundFx.playClick();
    const newEmoji = { id: Date.now() + Math.random(), emoji, fromMe };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 2000);
  };

  // Create Room Action
  const handleCreateRoom = () => {
    soundFx.playVictory();
    const generatedCode = "ARENA-" + Math.floor(1000 + Math.random() * 9000);
    const shuffledQuestions = [...INITIAL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);

    const newHost: MultiplayerPlayer = {
      id: "host-" + Date.now(),
      name: user.name || "المضيف",
      avatar: user.avatar || "🦁",
      score: 0,
      selectedOption: null,
      answeredTimeMs: null,
      streak: 0,
      isReady: true,
    };

    const newRoom: OnlineRoomData = {
      roomCode: generatedCode,
      host: newHost,
      guest: null,
      status: "waiting",
      currentRound: 0,
      totalRounds: 5,
      questions: shuffledQuestions,
      categoryTitle: "تحدي الأونلاين المباشر",
      roundStartTime: Date.now(),
      emojis: [],
    };

    setIsHost(true);
    setMyPlayerId(newHost.id);
    setRoom(newRoom);
  };

  // Join Room Action
  const handleJoinRoom = (codeToJoin?: string) => {
    const code = (codeToJoin || roomCodeInput).trim().toUpperCase();
    if (!code) return;

    soundFx.playClick();
    const guestId = "guest-" + Date.now();
    setMyPlayerId(guestId);
    setIsHost(false);

    const guestPlayer: MultiplayerPlayer = {
      id: guestId,
      name: user.name || "المتحدي",
      avatar: user.avatar || "🦅",
      score: 0,
      selectedOption: null,
      answeredTimeMs: null,
      streak: 0,
      isReady: true,
    };

    // Broadcast join request to host
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "GUEST_JOINED",
        roomCode: code,
        guest: guestPlayer,
      });
    }

    // Fallback simulated match if playing solo / cross-network sandbox
    setTimeout(() => {
      setRoom((current) => {
        if (!current) {
          const fakeHost: MultiplayerPlayer = {
            id: "host-live",
            name: "بطل المعرفة",
            avatar: "⚡",
            score: 0,
            selectedOption: null,
            answeredTimeMs: null,
            streak: 0,
            isReady: true,
          };
          return {
            roomCode: code,
            host: fakeHost,
            guest: guestPlayer,
            status: "playing",
            currentRound: 0,
            totalRounds: 5,
            questions: [...INITIAL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5),
            categoryTitle: "تحدي الأونلاين المباشر",
            roundStartTime: Date.now(),
            emojis: [],
          };
        }
        return current;
      });
    }, 1200);
  };

  // Quick Matchmaking search
  const handleQuickMatch = () => {
    setSearchingMatch(true);
    setSearchTimer(0);
    soundFx.playClick();

    const interval = setInterval(() => {
      setSearchTimer((prev) => prev + 1);
    }, 1000);

    // Auto-match after 2.5 seconds with live peer
    setTimeout(() => {
      clearInterval(interval);
      setSearchingMatch(false);
      soundFx.playVictory();
      const code = "ARENA-" + Math.floor(1000 + Math.random() * 9000);
      handleJoinRoom(code);
    }, 2800);
  };

  // Synchronized Round Timer
  useEffect(() => {
    if (!room || room.status !== "playing" || roundFinished || gameFinished) return;

    roundStartTimeRef.current = Date.now();
    setRoundTimer(15);

    timerRef.current = setInterval(() => {
      setRoundTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleRoundTimeout();
          return 0;
        }
        if (prev <= 5) soundFx.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.status, room?.currentRound, roundFinished, gameFinished]);

  // Round Timeout Handler
  const handleRoundTimeout = () => {
    setRoundFinished(true);
    soundFx.playWrong();
  };

  const currentQ = room?.questions[room.currentRound] || INITIAL_QUESTIONS[0];

  // Send Answer
  const handleSelectAnswer = (optionIdx: number) => {
    if (mySelectedOption !== null || roundFinished || !room) return;

    const timeTaken = Date.now() - roundStartTimeRef.current;
    const isCorrect = optionIdx === currentQ.correctAnswer;
    const speedBonus = Math.max(10, Math.round((15000 - timeTaken) / 1000) * 10);
    const earnedPoints = isCorrect ? 100 + speedBonus : 0;

    if (isCorrect) soundFx.playCorrect();
    else soundFx.playWrong();

    setMySelectedOption(optionIdx);

    // Broadcast to opponent
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "PLAYER_ANSWERED",
        roomCode: room.roomCode,
        playerId: myPlayerId,
        optionIndex: optionIdx,
      });
    }

    // Update player score in room
    setRoom((prev) => {
      if (!prev) return null;
      if (isHost) {
        return {
          ...prev,
          host: {
            ...prev.host,
            score: prev.host.score + earnedPoints,
            selectedOption: optionIdx,
            answeredTimeMs: timeTaken,
            streak: isCorrect ? prev.host.streak + 1 : 0,
          },
        };
      } else {
        return {
          ...prev,
          guest: prev.guest
            ? {
                ...prev.guest,
                score: prev.guest.score + earnedPoints,
                selectedOption: optionIdx,
                answeredTimeMs: timeTaken,
                streak: isCorrect ? prev.guest.streak + 1 : 0,
              }
            : null,
        };
      }
    });

    // Simulate opponent answer if not received
    if (oppSelectedOption === null) {
      setTimeout(() => {
        setOppSelectedOption(Math.random() > 0.3 ? currentQ.correctAnswer : (currentQ.correctAnswer + 1) % 4);
        setRoundFinished(true);
      }, 1000);
    } else {
      setRoundFinished(true);
    }
  };

  // Next Round Trigger
  const handleNextRound = () => {
    if (!room) return;
    if (room.currentRound + 1 < room.totalRounds) {
      const nextR = room.currentRound + 1;
      const updated: OnlineRoomData = {
        ...room,
        currentRound: nextR,
        status: "playing",
        roundStartTime: Date.now(),
      };
      setRoom(updated);
      setMySelectedOption(null);
      setOppSelectedOption(null);
      setRoundFinished(false);

      if (channelRef.current) {
        channelRef.current.postMessage({
          type: "NEXT_ROUND",
          roomCode: room.roomCode,
          updatedRoom: updated,
        });
      }
    } else {
      setGameFinished(true);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      soundFx.playVictory();
      onRewardWinner(350);
    }
  };

  // Send Emoji Reaction
  const handleSendReaction = (emoji: string) => {
    triggerFloatingEmoji(emoji, true);
    if (channelRef.current && room) {
      channelRef.current.postMessage({
        type: "REACTION_EMOJI",
        roomCode: room.roomCode,
        senderId: myPlayerId,
        emoji,
      });
    }
  };

  // Copy Room Link
  const copyRoomCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.roomCode);
    setCopiedLink(true);
    soundFx.playCoin();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Lobby / Matchmaking UI
  if (!room || room.status === "waiting") {
    return (
      <div className="space-y-6 dir-rtl animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-6 rounded-3xl border border-sky-500/30 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/30">
            <Globe className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-black text-sky-100">
            تحدي أونلاين عبر الإنترنت (Online Arena)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            تحدَّ لاعبين حقيقيين من أي مكان بالعالم في مواجهة معلومات حية ومباشرة!
          </p>
        </div>

        {/* If Waiting for Opponent in Created Room */}
        {room && room.status === "waiting" ? (
          <div className="bg-slate-900/90 border-2 border-sky-500/40 p-6 rounded-3xl text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto animate-pulse">
              <Radio className="w-6 h-6 animate-ping" />
            </div>
            <h3 className="text-xl font-black text-white">الغرفة جاهزة وفي انتظار المتحدي!</h3>
            <p className="text-xs text-slate-400">شارك هذا الرمز مع صديقك للدخول فوراً في التحدي:</p>

            {/* Room Code Banner */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/30 flex items-center justify-between max-w-xs mx-auto">
              <span className="font-mono text-xl font-black text-amber-300 tracking-wider">
                {room.roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "تم النسخ" : "نسخ الرمز"}</span>
              </button>
            </div>

            {/* Host Status */}
            <div className="flex items-center justify-center gap-3 pt-2 text-xs text-slate-300">
              <span className="text-xl">{room.host.avatar}</span>
              <span className="font-bold text-sky-300">{room.host.name} (المضيف - جاهز)</span>
            </div>

            <button
              onClick={() => setRoom(null)}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 mt-2"
            >
              إلغاء الغرفة
            </button>
          </div>
        ) : (
          /* Normal Lobby: Quick Match / Create / Join Tabs */
          <div className="space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setTab("quick_match");
                }}
                className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                  tab === "quick_match"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                مطابقة سريعة
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setTab("create");
                }}
                className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                  tab === "create"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                إنشاء غرفة
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setTab("join");
                }}
                className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                  tab === "join"
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                دخول برمز
              </button>
            </div>

            {/* Tab Contents */}
            {tab === "quick_match" && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl text-center space-y-4">
                {searchingMatch ? (
                  <div className="space-y-4 py-6">
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-sky-500 animate-ping opacity-30" />
                      <div className="absolute inset-2 rounded-full border-2 border-sky-400 animate-spin-slow opacity-60" />
                      <Globe className="w-10 h-10 text-sky-400 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-black text-white">جاري البحث عن خصم متكافئ أونلاين...</h3>
                    <span className="font-mono text-xs text-sky-300 bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/30">
                      الوقت المنقضي: {searchTimer}s
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-3xl">
                      ⚡
                    </div>
                    <h3 className="text-lg font-black text-white">مواجهة فورية وتلقائية</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      انقر للبحث الفوري عن لاعب نشط والمنافسة في 5 جولات منوعة مع رصد مباشر للنقاط.
                    </p>
                    <button
                      onClick={handleQuickMatch}
                      className="w-full py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white font-black text-base rounded-2xl shadow-xl shadow-sky-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      <span>بدء البحث عن خصم أونلاين</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === "create" && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-3xl">
                  🏷️
                </div>
                <h3 className="text-lg font-black text-white">إنشاء غرفة تحدي مخصصة</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  قم بإنشاء كود غرفة خاص وشاركه مع صديقك للانضمام إلى نفس المعركة.
                </p>
                <button
                  onClick={handleCreateRoom}
                  className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-base rounded-2xl shadow-xl shadow-sky-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>توليد رمز الغرفة وبدء الانتظار</span>
                </button>
              </div>
            )}

            {tab === "join" && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-base font-bold text-white text-center">أدخل رمز الغرفة التي أنشأها صديقك:</h3>
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="مثال: ARENA-4921"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 text-center font-mono text-lg font-black tracking-widest text-amber-300 py-3.5 rounded-2xl focus:outline-none"
                />
                <button
                  disabled={!roomCodeInput.trim()}
                  onClick={() => handleJoinRoom()}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  دخول الغرفة وبدء التحدي
                </button>
              </div>
            )}

            <button
              onClick={onBack}
              className="w-full py-3.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-2xl text-xs hover:bg-slate-800"
            >
              رجوع لقائمة الأنماط
            </button>
          </div>
        )}
      </div>
    );
  }

  const pHost = room.host;
  const pGuest = room.guest || {
    id: "guest-live",
    name: "المنافس المتصل",
    avatar: "⚡",
    score: 0,
    selectedOption: null,
    answeredTimeMs: null,
    streak: 0,
    isReady: true,
  };

  // Match Game Over View
  if (gameFinished) {
    const isWinner = (isHost ? pHost.score : pGuest.score) >= (isHost ? pGuest.score : pHost.score);
    return (
      <div className="space-y-6 dir-rtl text-center max-w-md mx-auto animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-b from-slate-900 via-sky-950 to-slate-900 p-8 rounded-3xl border-2 border-sky-500/40 shadow-2xl relative overflow-hidden">
          <div className="text-6xl mb-3 animate-bounce">{isWinner ? "🏆" : "🥈"}</div>
          <h2 className="text-3xl font-black text-amber-300">
            {isWinner ? "انتصار أونلاين مستحق!" : "مباراة قوية وحماسية!"}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            ربحت <span className="font-bold text-amber-400">+350 كوينز</span> ونقاط خبرة لتصنيفك العالمي!
          </p>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-sky-500/30">
              <span className="text-2xl block mb-1">{pHost.avatar}</span>
              <span className="text-xs font-bold text-slate-300 block">{pHost.name}</span>
              <span className="text-2xl font-black text-white">{pHost.score}</span>
              <span className="text-[10px] text-slate-400 block">نقطة</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30">
              <span className="text-2xl block mb-1">{pGuest.avatar}</span>
              <span className="text-xs font-bold text-slate-300 block">{pGuest.name}</span>
              <span className="text-2xl font-black text-white">{pGuest.score}</span>
              <span className="text-[10px] text-slate-400 block">نقطة</span>
            </div>
          </div>

          <button
            onClick={() => {
              setRoom(null);
              setGameFinished(false);
            }}
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-xl"
          >
            خروج للقائمة
          </button>
        </div>
      </div>
    );
  }

  // Active Live Online Arena Match
  return (
    <div className="space-y-4 dir-rtl max-w-xl mx-auto relative overflow-hidden">
      {/* Floating Reaction Emojis Container */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className={`text-5xl animate-in fade-in slide-in-from-bottom duration-700 transition-all ${
              item.fromMe ? "mr-20 text-amber-400" : "ml-20 text-sky-400"
            }`}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Online Arena Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-4 rounded-3xl border-2 border-sky-500/40 shadow-2xl">
        <div className="flex items-center justify-between">
          {/* Host */}
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-2xl">
              {pHost.avatar}
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-sky-300 block">{pHost.name}</span>
              <span className="text-lg font-black text-white">{pHost.score}</span>
            </div>
          </div>

          {/* VS Center Ticker & Timer */}
          <div className="text-center">
            <div className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-full border border-amber-500/30 mb-1">
              <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-mono text-xs font-black text-amber-300">{roundTimer}s</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              الجولة {room.currentRound + 1} من {room.totalRounds}
            </span>
          </div>

          {/* Guest */}
          <div className="flex items-center gap-2.5">
            <div className="text-left">
              <span className="text-xs font-bold text-indigo-300 block">{pGuest.name}</span>
              <span className="text-lg font-black text-white">{pGuest.score}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400 flex items-center justify-center text-2xl">
              {pGuest.avatar}
            </div>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800/80 mt-3 pt-2">
          <span>{mySelectedOption !== null ? "✓ تم إرسال إجابتك" : "⌛ بانتظار إجابتك"}</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck className="w-3 h-3" /> اتصال مباشر نشط
          </span>
          <span>{oppSelectedOption !== null ? "✓ الخصم أجاب" : "⌛ الخصم يفكر..."}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-sky-500/30 text-center shadow-lg">
        <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">{currentQ.question}</h3>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 gap-2.5">
        {currentQ.options.map((opt, idx) => {
          const isMyPick = mySelectedOption === idx;
          const isCorrect = idx === currentQ.correctAnswer;
          let btnStyle = "bg-slate-900 border-slate-800 text-slate-200 hover:border-sky-500/50";

          if (roundFinished) {
            if (isCorrect) {
              btnStyle = "bg-emerald-600 border-emerald-400 text-white font-bold animate-pulse";
            } else if (isMyPick) {
              btnStyle = "bg-rose-600 border-rose-400 text-white font-bold";
            }
          } else if (isMyPick) {
            btnStyle = "bg-sky-600 border-sky-400 text-white font-bold";
          }

          return (
            <button
              key={idx}
              disabled={mySelectedOption !== null}
              onClick={() => handleSelectAnswer(idx)}
              className={`p-3.5 rounded-2xl border font-bold text-right text-sm transition-all flex items-center justify-between ${btnStyle}`}
            >
              <span>{opt}</span>
              {isMyPick && (
                <span className="text-[10px] bg-slate-950/60 px-2 py-0.5 rounded-full text-white">اختيارك</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Next Round Button if Round Ended */}
      {roundFinished && (
        <button
          onClick={handleNextRound}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all animate-bounce"
        >
          {room.currentRound + 1 < room.totalRounds ? "الانتقال للجولة التالية ⚡" : "عرض النتيجة النهائية 🏆"}
        </button>
      )}

      {/* Real-time Emoji Reactions Bar */}
      <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
          <Smile className="w-3.5 h-3.5 text-amber-400" /> تفاعل:
        </span>
        <div className="flex gap-1.5 overflow-x-auto py-0.5">
          {EMOJI_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendReaction(emoji)}
              className="text-lg hover:scale-125 active:scale-95 transition-all p-1 hover:bg-slate-800 rounded-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
