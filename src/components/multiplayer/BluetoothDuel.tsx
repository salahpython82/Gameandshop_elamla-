import React, { useState, useEffect, useRef } from "react";
import { UserProfile, Question, MultiplayerPlayer } from "../../types";
import { INITIAL_QUESTIONS } from "../../data/initialData";
import { soundFx } from "../../utils/sound";
import confetti from "canvas-confetti";
import {
  Bluetooth,
  Radio,
  Wifi,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Timer,
  Trophy,
  Shield,
  Search,
  RefreshCw
} from "lucide-react";

interface BluetoothDuelProps {
  user: UserProfile;
  onFinishDuel: (earnedCoins: number) => void;
  onBack: () => void;
}

interface NearbyDevice {
  id: string;
  name: string;
  rssi: number; // Signal strength -30 to -90
  type: "phone" | "tablet" | "laptop";
  avatar: string;
}

export const BluetoothDuel: React.FC<BluetoothDuelProps> = ({ user, onFinishDuel, onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanRadarAngle, setScanRadarAngle] = useState(0);
  const [discoveredDevices, setDiscoveredDevices] = useState<NearbyDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<NearbyDevice | null>(null);
  const [bluetoothSupported, setBluetoothSupported] = useState(true);
  const [connectionMethod, setConnectionMethod] = useState<"bluetooth" | "nearby_wifi">("bluetooth");

  // Duel Match State
  const [inMatch, setInMatch] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [mySelectedOption, setMySelectedOption] = useState<number | null>(null);
  const [oppSelectedOption, setOppSelectedOption] = useState<number | null>(null);
  const [roundTimer, setRoundTimer] = useState(15);
  const [roundEnded, setRoundEnded] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const timerRef = useRef<any>(null);

  // Check Web Bluetooth Support
  useEffect(() => {
    if (!("bluetooth" in navigator)) {
      setBluetoothSupported(false);
      setConnectionMethod("nearby_wifi");
    }
  }, []);

  // Scan Radar animation
  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setScanRadarAngle((prev) => (prev + 10) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // Request Bluetooth Device or Simulated Local Discovery
  const handleStartScan = async () => {
    setIsScanning(true);
    soundFx.playClick();
    setDiscoveredDevices([]);

    if (bluetoothSupported && connectionMethod === "bluetooth") {
      try {
        // Request real Web Bluetooth device
        const nav = navigator as any;
        if (nav.bluetooth && nav.bluetooth.requestDevice) {
          const device = await nav.bluetooth.requestDevice({
            acceptAllDevices: true,
          });
          if (device) {
            const found: NearbyDevice = {
              id: device.id || "bt-dev-" + Date.now(),
              name: device.name || "جهاز بلوتوث مجاور",
              rssi: -45,
              type: "phone",
              avatar: "📱",
            };
            setDiscoveredDevices([found]);
            setIsScanning(false);
            return;
          }
        }
      } catch (err) {
        console.log("Bluetooth device picker cancelled or not paired:", err);
      }
    }

    // Nearby Simulated / Wi-Fi Peer fallback
    setTimeout(() => {
      setDiscoveredDevices([
        { id: "dev-1", name: "Galaxy S24 Ultra (صلاح)", rssi: -42, type: "phone", avatar: "🦅" },
        { id: "dev-2", name: "iPhone 15 Pro (أحمد)", rssi: -58, type: "phone", avatar: "⚡" },
        { id: "dev-3", name: "iPad Air (المنافس)", rssi: -72, type: "tablet", avatar: "🦁" },
      ]);
      setIsScanning(false);
      soundFx.playCoin();
    }, 2500);
  };

  // Connect to Device
  const handleConnectDevice = (device: NearbyDevice) => {
    soundFx.playVictory();
    setConnectedDevice(device);
  };

  // Start Bluetooth Match
  const handleStartBluetoothMatch = () => {
    soundFx.playVictory();
    const shuffled = [...INITIAL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setCurrentRound(0);
    setMyScore(0);
    setOppScore(0);
    setMySelectedOption(null);
    setOppSelectedOption(null);
    setRoundEnded(false);
    setGameOver(false);
    setInMatch(true);
  };

  // Round Timer
  useEffect(() => {
    if (!inMatch || roundEnded || gameOver) return;
    setRoundTimer(15);
    timerRef.current = setInterval(() => {
      setRoundTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setRoundEnded(true);
          soundFx.playWrong();
          return 0;
        }
        if (prev <= 5) soundFx.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inMatch, currentRound, roundEnded, gameOver]);

  const currentQ = questions[currentRound] || INITIAL_QUESTIONS[0];

  // Handle Answer
  const handleSelectOption = (idx: number) => {
    if (mySelectedOption !== null || roundEnded) return;

    const isCorrect = idx === currentQ.correctAnswer;
    setMySelectedOption(idx);

    if (isCorrect) {
      soundFx.playCorrect();
      setMyScore((prev) => prev + 120);
    } else {
      soundFx.playWrong();
    }

    // Opponent wireless answer simulation
    setTimeout(() => {
      const oppCorrect = Math.random() > 0.35;
      const oppPick = oppCorrect ? currentQ.correctAnswer : (currentQ.correctAnswer + 1) % 4;
      setOppSelectedOption(oppPick);
      if (oppCorrect) {
        setOppScore((prev) => prev + 110);
      }
      setRoundEnded(true);
    }, 900);
  };

  // Next Round
  const handleNextRound = () => {
    if (currentRound + 1 < 5) {
      setCurrentRound((prev) => prev + 1);
      setMySelectedOption(null);
      setOppSelectedOption(null);
      setRoundEnded(false);
    } else {
      setGameOver(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      soundFx.playVictory();
      onFinishDuel(300);
    }
  };

  // Device Discovery & Pairing Screen
  if (!inMatch) {
    return (
      <div className="space-y-6 dir-rtl animate-in fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl border border-blue-500/30 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            <Bluetooth className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-blue-100">
            تحدي البلوتوث والأجهزة القريبة
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
            تحدَّ صديقك القريب منك عبر البلوتوث أو شبكة الواي فاي المحلية بدون استهلاك للإنترنت!
          </p>
        </div>

        {/* Connection Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              soundFx.playClick();
              setConnectionMethod("bluetooth");
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              connectionMethod === "bluetooth"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>بلوتوث (Web Bluetooth)</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setConnectionMethod("nearby_wifi");
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              connectionMethod === "nearby_wifi"
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>شبكة قريبة / نقطة اتصال</span>
          </button>
        </div>

        {/* If Paired with Device */}
        {connectedDevice ? (
          <div className="bg-slate-900 border-2 border-emerald-500/40 p-6 rounded-3xl text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl border border-emerald-500/30">
              {connectedDevice.avatar}
            </div>
            <h3 className="text-xl font-black text-white">متصل بنجاح مع {connectedDevice.name}!</h3>
            <p className="text-xs text-slate-300">
              قوة الإشارة: <span className="text-emerald-400 font-bold">ممتازة ({connectedDevice.rssi} dBm)</span>
            </p>

            <button
              onClick={handleStartBluetoothMatch}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-base rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>بدء جولات التحدي اللاسلكي</span>
            </button>

            <button
              onClick={() => setConnectedDevice(null)}
              className="text-xs text-slate-400 hover:text-slate-200 underline pt-2"
            >
              إلغاء الاقتران واختيار جهاز آخر
            </button>
          </div>
        ) : (
          /* Radar & Scanner Area */
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl text-center space-y-5">
            {/* Animated Radar */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-blue-500/30" />
              <div className="absolute inset-4 rounded-full border border-blue-500/20" />
              <div className="absolute inset-8 rounded-full border border-blue-500/10" />

              {isScanning && (
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-blue-500/20 to-cyan-400/40 pointer-events-none"
                  style={{ transform: `rotate(${scanRadarAngle}deg)` }}
                />
              )}

              <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-300">
                <Radio className={`w-6 h-6 ${isScanning ? "animate-pulse" : ""}`} />
              </div>
            </div>

            <button
              disabled={isScanning}
              onClick={handleStartScan}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{isScanning ? "جاري مسح الأجهزة القريبة..." : "البحث عن الأجهزة المجاورة"}</span>
            </button>

            {/* Discovered Devices List */}
            {discoveredDevices.length > 0 && (
              <div className="space-y-2 text-right pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 block">الأجهزة المكتشفة بالقرب منك:</span>
                {discoveredDevices.map((dev) => (
                  <div
                    key={dev.id}
                    onClick={() => handleConnectDevice(dev)}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-400 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{dev.avatar}</span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{dev.name}</h4>
                        <span className="text-[10px] text-slate-400">إشارة لاسلكية قوية</span>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl">
                      اقتران وتحدي
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onBack}
          className="w-full py-3.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-2xl text-xs hover:bg-slate-800"
        >
          رجوع لقائمة الأنماط
        </button>
      </div>
    );
  }

  // Active Wireless Match
  if (gameOver) {
    const isWinner = myScore >= oppScore;
    return (
      <div className="space-y-6 dir-rtl text-center max-w-md mx-auto animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 p-8 rounded-3xl border-2 border-blue-500/40 shadow-2xl relative">
          <div className="text-6xl mb-3">{isWinner ? "🏆" : "🤝"}</div>
          <h2 className="text-3xl font-black text-amber-300">
            {isWinner ? "فزت في التحدي اللاسلكي!" : "مواجهة متقاربة ورائعة!"}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            ربحت <span className="font-bold text-amber-400">+300 كوينز</span> في رصيدك!
          </p>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/30">
              <span className="text-2xl block mb-1">{user.avatar}</span>
              <span className="text-xs font-bold text-slate-300 block">{user.name}</span>
              <span className="text-2xl font-black text-white">{myScore}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30">
              <span className="text-2xl block mb-1">{connectedDevice?.avatar || "📱"}</span>
              <span className="text-xs font-bold text-slate-300 block">{connectedDevice?.name || "الخصم"}</span>
              <span className="text-2xl font-black text-white">{oppScore}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setInMatch(false);
              setGameOver(false);
            }}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 font-black rounded-xl"
          >
            العودة للقائمة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 dir-rtl max-w-xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-4 rounded-3xl border-2 border-blue-500/40 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{user.avatar}</span>
          <div className="text-right">
            <span className="text-xs font-bold text-blue-300 block">{user.name}</span>
            <span className="text-lg font-black text-white">{myScore} pts</span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center gap-1 bg-slate-950 px-3 py-1 rounded-full border border-amber-500/30 mb-1">
            <Timer className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-mono text-xs font-black text-amber-300">{roundTimer}s</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">الجولة {currentRound + 1} من 5</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-left">
            <span className="text-xs font-bold text-cyan-300 block">{connectedDevice?.name}</span>
            <span className="text-lg font-black text-white">{oppScore} pts</span>
          </div>
          <span className="text-2xl">{connectedDevice?.avatar}</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-blue-500/30 text-center shadow-lg">
        <h3 className="text-base sm:text-lg font-bold text-slate-100">{currentQ.question}</h3>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2.5">
        {currentQ.options.map((opt, idx) => {
          const isMyPick = mySelectedOption === idx;
          const isCorrect = idx === currentQ.correctAnswer;
          let style = "bg-slate-900 border-slate-800 text-slate-200 hover:border-blue-500/50";

          if (roundEnded) {
            if (isCorrect) style = "bg-emerald-600 border-emerald-400 text-white font-bold animate-pulse";
            else if (isMyPick) style = "bg-rose-600 border-rose-400 text-white font-bold";
          } else if (isMyPick) {
            style = "bg-blue-600 border-blue-400 text-white font-bold";
          }

          return (
            <button
              key={idx}
              disabled={mySelectedOption !== null}
              onClick={() => handleSelectOption(idx)}
              className={`p-3.5 rounded-2xl border font-bold text-right text-sm transition-all flex items-center justify-between ${style}`}
            >
              <span>{opt}</span>
              {isMyPick && <span className="text-[10px] bg-slate-950/60 px-2 py-0.5 rounded-full text-white">إجابتك</span>}
            </button>
          );
        })}
      </div>

      {roundEnded && (
        <button
          onClick={handleNextRound}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl animate-bounce"
        >
          {currentRound + 1 < 5 ? "الجولة التالية ⚡" : "عرض النتيجة النهائية 🏆"}
        </button>
      )}
    </div>
  );
};
