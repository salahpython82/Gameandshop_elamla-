import React, { useState } from "react";
import { Question } from "../types";
import { Bot, Sparkles, Wand2, RefreshCw, Tag } from "lucide-react";
import { soundFx } from "../utils/sound";
import { generateQuizQuestions } from "../utils/aiGenerator";

interface AiGeneratorViewProps {
  onStartGeneratedQuiz: (questions: Question[], title: string) => void;
}

export const AiGeneratorView: React.FC<AiGeneratorViewProps> = ({ onStartGeneratedQuiz }) => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("متوسط");
  const [count, setCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const QUICK_TOPICS = [
    "تاريخ الأندلس والحضارة الإسلامية",
    "ألغاز وفوازير صعبة جداً",
    "كرة القدم والرياضة العربية",
    "اختراعات وتكنولوجيا المستقبل",
    "عجائب وغرائب الطبيعة",
    "شخصيات وأحداث تاريخية",
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMsg("الرجاء كتابة أو اختيار موضوع المسابقة أولاً");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    soundFx.playCoin();

    try {
      const questions = await generateQuizQuestions(topic, count);
      if (questions && questions.length > 0) {
        soundFx.playVictory();
        onStartGeneratedQuiz(questions, `مسابقة AI: ${topic}`);
      } else {
        throw new Error("تعذر إنشاء الأسئلة");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. الرجاء المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 dir-rtl max-w-2xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-3xl border border-emerald-500/30 shadow-2xl text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <Bot className="w-8 h-8 text-slate-950" />
        </div>

        <h2 className="text-2xl font-black text-emerald-200">
          مولد المسابقات الذكي (Gemini AI)
        </h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          اكتب أي موضوع يخطر ببالك، وسيقوم الذكاء الاصطناعي بتوليد أسئلة وألغاز مبتكرة وممتعة فورياً!
        </p>
      </div>

      {/* Main Input Form */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
        
        {/* Topic Input Field */}
        <div>
          <label className="block text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>موضوع المسابقة (أو السؤال التوجيهي):</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: أسئلة في علم الفلك والنجوم، تاريخ الدولة العباسية..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-2xl p-3.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-colors"
          />
        </div>

        {/* Quick Topic Tags */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 block mb-2 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>مقترحات سريعة:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((tagText, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundFx.playClick();
                  setTopic(tagText);
                }}
                className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
              >
                {tagText}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty & Count Options */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">المستوى:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="سهل">سهل</option>
              <option value="متوسط">متوسط</option>
              <option value="صعب">صعب</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">عدد الأسئلة:</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value={3}>3 أسئلة</option>
              <option value={5}>5 أسئلة</option>
              <option value={10}>10 أسئلة</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
            {errorMsg}
          </p>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
              <span>جاري توليد الأسئلة بواسطة Gemini AI...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 text-slate-950" />
              <span>إنشاء وبدء المسابقة الآن</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
};
