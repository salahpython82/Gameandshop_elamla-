import React, { useState } from "react";
import { QuizCategory, LevelData } from "../types";
import { INITIAL_CATEGORIES } from "../data/initialData";
import { Lock, Star, Play, ChevronLeft, Brain, BookOpen, Castle, Atom, Globe, Quote, Sparkles } from "lucide-react";
import { soundFx } from "../utils/sound";

interface CategoryAndLevelSelectProps {
  levelsMap: Record<string, LevelData>;
  onSelectLevel: (categoryId: string, levelNumber: number) => void;
  userStars: number;
}

// Icon helper map
const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  BookOpen,
  Castle,
  Atom,
  Globe,
  Quote,
};

export const CategoryAndLevelSelect: React.FC<CategoryAndLevelSelectProps> = ({
  levelsMap,
  onSelectLevel,
  userStars,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>(INITIAL_CATEGORIES[0]);

  // Generate 10 levels for the selected category
  const levels = Array.from({ length: selectedCategory.totalLevels }, (_, i) => {
    const levelNumber = i + 1;
    const levelKey = `${selectedCategory.id}_lvl_${levelNumber}`;
    const stored = levelsMap[levelKey];

    // Level 1 is always unlocked by default; others require previous level or stars
    const isUnlocked = levelNumber === 1 || (stored && stored.isUnlocked) || (levelNumber <= 3);
    const starsEarned = stored ? stored.starsEarned : (levelNumber === 1 ? 2 : 0);
    const highScore = stored ? stored.highScore : 0;

    return {
      levelNumber,
      isUnlocked,
      starsEarned,
      highScore,
    };
  });

  return (
    <div className="space-y-6 pb-20 dir-rtl">
      
      {/* Categories Horizontal Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black text-amber-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>إدارة المستويات والأقسام</span>
          </h2>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
            6 أقسام متاحة
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {INITIAL_CATEGORIES.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Brain;
            const isSelected = selectedCategory.id === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat);
                }}
                className={`p-3 rounded-2xl text-right border transition-all duration-200 flex items-center gap-3 ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-600/30 to-yellow-600/40 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10 scale-[1.02]"
                    : "bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-bold bg-gradient-to-br ${cat.gradient} shrink-0`}>
                  <IconComponent className="w-5 h-5 text-slate-950" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-sm truncate">{cat.name}</h3>
                  <p className="text-[11px] text-slate-400 truncate">{cat.totalLevels} مستويات</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Category Banner (Matches Image 1 Screen 2) */}
      <div className={`p-5 rounded-3xl bg-gradient-to-r ${selectedCategory.gradient} border border-amber-300/30 shadow-xl text-slate-950 relative overflow-hidden`}>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold bg-slate-950/20 text-slate-950 px-3 py-1 rounded-full backdrop-blur-sm">
              قسم {selectedCategory.name}
            </span>
            <h3 className="text-2xl font-black mt-2 text-slate-950">
              {selectedCategory.description}
            </h3>
          </div>
          <div className="text-5xl opacity-80">
            🏆
          </div>
        </div>
      </div>

      {/* Level List Cards (Matches Image 1 Screen 3 "إدارة المستويات") */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <span>مستويات {selectedCategory.name}</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {levels.map((lvl) => {
            return (
              <div
                key={lvl.levelNumber}
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                  lvl.isUnlocked
                    ? "bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 shadow-md"
                    : "bg-slate-950/70 border-slate-900 opacity-60"
                }`}
              >
                {/* Level Number & Badges */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${
                      lvl.isUnlocked
                        ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 shadow-amber-500/20"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {lvl.isUnlocked ? lvl.levelNumber : <Lock className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-100 text-base">
                      المستوى {lvl.levelNumber}
                    </h4>
                    
                    {/* Stars Rating Display */}
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3].map((starNum) => (
                        <Star
                          key={starNum}
                          className={`w-4 h-4 ${
                            starNum <= lvl.starsEarned
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-700"
                          }`}
                        />
                      ))}
                      {lvl.highScore > 0 && (
                        <span className="text-[11px] text-amber-300 font-mono mr-2 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          أعلى نتيجة: {lvl.highScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Play Button (Matches Image 1 Screen 3 Green/Golden button) */}
                {lvl.isUnlocked ? (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onSelectLevel(selectedCategory.id, lvl.levelNumber);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                  >
                    <span>ابدأ الآن</span>
                    <Play className="w-4 h-4 fill-slate-950" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                    <Lock className="w-3.5 h-3.5" />
                    <span>مغلق</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
