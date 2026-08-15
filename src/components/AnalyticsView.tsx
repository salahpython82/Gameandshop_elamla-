import React from "react";
import { UserProfile, Achievement } from "../types";
import { INITIAL_ACHIEVEMENTS } from "../data/initialData";
import { getScoreHistory } from "../utils/storage";
import { BarChart3, PieChart as PieIcon, Award, Zap, Flame, Trophy, CheckCircle2, Sparkles } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { soundFx } from "../utils/sound";

interface AnalyticsViewProps {
  user: UserProfile;
  onClaimReward: (achievementId: string, coins: number, stars: number) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ user, onClaimReward }) => {
  const historyData = getScoreHistory();

  // Pie chart data for accuracy breakdown (Matches Screen 4 Image 1)
  const pieData = [
    { name: "إجابات صحيحة", value: user.totalCorrectAnswers, color: "#10b981" },
    { name: "إجابات خاطئة", value: Math.max(10, user.totalQuizzesPlayed * 4 - user.totalCorrectAnswers), color: "#f43f5e" },
    { name: "أسئلة الذكاء الاصطناعي", value: 25, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6 pb-20 dir-rtl">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/30 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
          <BarChart3 className="w-8 h-8 text-slate-950" />
        </div>
        <h2 className="text-2xl font-black text-indigo-200">
          إحصائيات الأداء وتطور معدل الذكاء (IQ)
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
          تابع تطور حصيلتك الثقافية ونمو معدل ذكائك مع كل اختبار تجتازه!
        </p>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Stat 1: Current IQ */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-cyan-500/30 shadow-lg text-center">
          <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-1 animate-pulse" />
          <span className="text-xs text-slate-400 font-bold block">معدل IQ الحالى</span>
          <span className="text-2xl font-black text-cyan-300 font-mono">{user.iqScore}</span>
        </div>

        {/* Stat 2: Accuracy Rate */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-500/30 shadow-lg text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <span className="text-xs text-slate-400 font-bold block">نسبة الإجابات الصحيحة</span>
          <span className="text-2xl font-black text-emerald-300 font-mono">
            {Math.min(100, Math.round((user.totalCorrectAnswers / Math.max(1, user.totalQuizzesPlayed * 4)) * 100))}%
          </span>
        </div>

        {/* Stat 3: Quizzes Completed */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-amber-500/30 shadow-lg text-center">
          <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
          <span className="text-xs text-slate-400 font-bold block">الاختبارات المكتملة</span>
          <span className="text-2xl font-black text-amber-300 font-mono">{user.totalQuizzesPlayed}</span>
        </div>

        {/* Stat 4: Streak */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-orange-500/30 shadow-lg text-center">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
          <span className="text-xs text-slate-400 font-bold block">السلسلة اليومية</span>
          <span className="text-2xl font-black text-orange-300 font-mono">{user.currentStreak} أيام</span>
        </div>

      </div>

      {/* IQ Growth Chart (Matches Screen 4 Image 1 Line Chart) */}
      <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>تطور معدل الذكاء (IQ) بمرور الوقت:</span>
        </h3>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[90, 160]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="iq"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: "#38bdf8", r: 5 }}
                activeDot={{ r: 8, fill: "#38bdf8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accuracy Pie Chart (Matches Screen 4 Image 1 Pie Chart) */}
      <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-emerald-400" />
          <span>توزيع الإجابات والأداء العام:</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs font-bold">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name}:</span>
                <span className="text-slate-100 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Collection */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>قائمة الأوسمة والإنجازات</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {INITIAL_ACHIEVEMENTS.map((ach) => (
            <div
              key={ach.id}
              className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                  ach.isUnlocked ? "bg-amber-500/20 border-amber-400 text-yellow-300" : "bg-slate-800 border-slate-700 text-slate-600"
                }`}>
                  🏆
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{ach.title}</h4>
                  <p className="text-xs text-slate-400">{ach.description}</p>
                  
                  {/* Progress bar */}
                  <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                      style={{ width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {ach.isUnlocked ? (
                <button
                  onClick={() => {
                    soundFx.playCoin();
                    onClaimReward(ach.id, ach.rewardCoins, ach.rewardStars);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow"
                >
                  استلام +{ach.rewardCoins}🪙
                </button>
              ) : (
                <span className="text-xs text-slate-500 font-mono">
                  {ach.progress}/{ach.maxProgress}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
