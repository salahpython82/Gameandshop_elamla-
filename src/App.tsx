import React, { useState, useEffect } from "react";
import { GameView, UserProfile, PowerUpState, LevelData, Question } from "./types";
import {
  getStoredProfile,
  saveProfile,
  getStoredPowerUps,
  savePowerUps,
  getStoredLevels,
  saveLevels,
  getScoreHistory,
  saveScoreHistory,
  getStoredQuestions,
  isAdminEmail,
} from "./utils/storage";
import { soundFx } from "./utils/sound";

import { HeaderNavbar } from "./components/HeaderNavbar";
import { NavigationTabBar } from "./components/NavigationTabBar";
import { HomeView } from "./components/HomeView";
import { CategoryAndLevelSelect } from "./components/CategoryAndLevelSelect";
import { VersusModeView } from "./components/VersusModeView";
import { AiGeneratorView } from "./components/AiGeneratorView";
import { AnalyticsView } from "./components/AnalyticsView";
import { LeaderboardAndStoreView } from "./components/LeaderboardAndStoreView";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { AuthModal } from "./components/AuthModal";
import { QuizPlayerModal } from "./components/QuizPlayerModal";
import { DailyRewardModal } from "./components/DailyRewardModal";
import { FortuneWheelModal } from "./components/FortuneWheelModal";
import { SettingsModal } from "./components/SettingsModal";

export default function App() {
  const [currentView, setCurrentView] = useState<GameView>("home");

  // State
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredProfile());
  const [powerUps, setPowerUps] = useState<PowerUpState>(getStoredPowerUps());
  const [levelsMap, setLevelsMap] = useState<Record<string, LevelData>>(getStoredLevels());

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<{
    questions: Question[];
    title: string;
    categoryId?: string;
    levelNumber?: number;
  } | null>(null);

  // Popup Modals State
  const [showDailyChest, setShowDailyChest] = useState(false);
  const [showFortuneWheel, setShowFortuneWheel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if current user is Admin (salahbousbia82@gmail.com)
  const isAdmin = isAdminEmail(userProfile.email) || userProfile.role === "admin";

  // Sync sound manager with profile
  useEffect(() => {
    soundFx.setEnabled(userProfile.soundEnabled);
    saveProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    savePowerUps(powerUps);
  }, [powerUps]);

  useEffect(() => {
    saveLevels(levelsMap);
  }, [levelsMap]);

  // Handle Quick Quiz start (uses stored questions including custom ones added by admin)
  const handleStartQuickQuiz = () => {
    const allQuestions = getStoredQuestions();
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    setActiveQuiz({
      questions: shuffled,
      title: "تحدي الألغاز السريع",
    });
  };

  // Handle Level Quiz start
  const handleSelectLevel = (categoryId: string, levelNumber: number) => {
    const allQuestions = getStoredQuestions();
    let catQuestions = allQuestions.filter(
      (q) => q.categoryId === categoryId && (q.levelNumber === levelNumber || !q.levelNumber)
    );
    if (catQuestions.length === 0) {
      catQuestions = allQuestions.filter((q) => q.categoryId === categoryId);
    }
    if (catQuestions.length === 0) {
      catQuestions = allQuestions;
    }
    const levelQuestions = catQuestions.sort(() => Math.random() - 0.5).slice(0, 5);

    setActiveQuiz({
      questions: levelQuestions,
      title: `المستوى ${levelNumber}`,
      categoryId,
      levelNumber,
    });
  };

  // Handle Quiz completion
  const handleFinishQuiz = (
    earnedScore: number,
    correctCount: number,
    totalCount: number,
    earnedCoins: number,
    earnedStars: number
  ) => {
    setUserProfile((prev) => {
      const newIq = prev.iqScore + (correctCount >= 3 ? 3 : -1);
      const newXp = prev.xp + earnedScore;
      const newLevel = newXp >= prev.xpToNextLevel ? prev.level + 1 : prev.level;

      return {
        ...prev,
        coins: prev.coins + earnedCoins,
        stars: prev.stars + earnedStars,
        iqScore: Math.max(90, newIq),
        xp: newXp,
        level: newLevel,
        totalQuizzesPlayed: prev.totalQuizzesPlayed + 1,
        totalCorrectAnswers: prev.totalCorrectAnswers + correctCount,
      };
    });

    // Save level stars if playing level
    if (activeQuiz?.categoryId && activeQuiz?.levelNumber) {
      const key = `${activeQuiz.categoryId}_lvl_${activeQuiz.levelNumber}`;
      setLevelsMap((prev) => ({
        ...prev,
        [key]: {
          levelNumber: activeQuiz.levelNumber!,
          categoryId: activeQuiz.categoryId!,
          starsEarned: Math.max(prev[key]?.starsEarned || 0, earnedStars),
          isUnlocked: true,
          highScore: Math.max(prev[key]?.highScore || 0, earnedScore),
          totalQuestions: totalCount,
        },
      }));
    }

    // Append to score history for charts
    const history = getScoreHistory();
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}`;
    history.push({
      date: dateStr,
      iq: userProfile.iqScore + 2,
      accuracy: Math.round((correctCount / totalCount) * 100),
      quizzes: userProfile.totalQuizzesPlayed + 1,
    });
    saveScoreHistory(history.slice(-8));

    setActiveQuiz(null);
  };

  // Power Up usage
  const handleUsePowerUp = (type: keyof PowerUpState) => {
    setPowerUps((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1),
    }));
  };

  // Power Up buy
  const handleBuyPowerUp = (type: keyof PowerUpState, count: number, costCoins: number) => {
    if (userProfile.coins >= costCoins) {
      setUserProfile((prev) => ({ ...prev, coins: prev.coins - costCoins }));
      setPowerUps((prev) => ({ ...prev, [type]: prev[type] + count }));
    }
  };

  // Claim Achievement reward
  const handleClaimReward = (id: string, coins: number, stars: number) => {
    setUserProfile((prev) => ({
      ...prev,
      coins: prev.coins + coins,
      stars: prev.stars + stars,
    }));
  };

  // Reset Progress
  const handleResetProgress = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Sticky Header Navbar */}
      <HeaderNavbar
        user={userProfile}
        onOpenSettings={() => setShowSettings(true)}
        onOpenStore={() => setCurrentView("leaderboard")}
        onToggleSound={() =>
          setUserProfile((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onOpenAuth={() => setShowAuthModal(true)}
        onNavigateAdmin={() => setCurrentView("admin")}
      />

      {/* Main View Area */}
      <main className="max-w-4xl mx-auto px-3 pt-4 pb-24">
        {currentView === "home" && (
          <HomeView
            user={userProfile}
            onNavigate={(view) => setCurrentView(view)}
            onStartQuickQuiz={handleStartQuickQuiz}
            onOpenDailyChest={() => setShowDailyChest(true)}
            onOpenWheel={() => setShowFortuneWheel(true)}
          />
        )}

        {currentView === "levels" && (
          <CategoryAndLevelSelect
            levelsMap={levelsMap}
            onSelectLevel={handleSelectLevel}
            userStars={userProfile.stars}
          />
        )}

        {currentView === "vs_mode" && (
          <VersusModeView
            user={userProfile}
            onUpdateScore={(earnedCoins) =>
              setUserProfile((prev) => ({ ...prev, coins: prev.coins + earnedCoins }))
            }
          />
        )}

        {/* AI Generator is strictly Admin-only inside Admin Dashboard */}
        {currentView === "ai_generator" && (
          isAdmin ? (
            <AdminDashboardView
              currentUser={userProfile}
              onUpdateCurrentUser={(updated) => setUserProfile(updated)}
              onNavigateHome={() => setCurrentView("home")}
              onStartGeneratedQuiz={(questions, title) =>
                setActiveQuiz({ questions, title })
              }
            />
          ) : (
            <HomeView
              user={userProfile}
              onNavigate={(view) => setCurrentView(view)}
              onStartQuickQuiz={handleStartQuickQuiz}
              onOpenDailyChest={() => setShowDailyChest(true)}
              onOpenWheel={() => setShowFortuneWheel(true)}
            />
          )
        )}

        {currentView === "analytics" && (
          <AnalyticsView user={userProfile} onClaimReward={handleClaimReward} />
        )}

        {currentView === "leaderboard" && (
          <LeaderboardAndStoreView
            user={userProfile}
            powerUps={powerUps}
            onBuyPowerUp={handleBuyPowerUp}
            onChangeAvatar={(av) => setUserProfile((prev) => ({ ...prev, avatar: av }))}
          />
        )}

        {/* Admin Dashboard View - accessible only if Admin */}
        {currentView === "admin" && (
          <AdminDashboardView
            currentUser={userProfile}
            onUpdateCurrentUser={(updated) => setUserProfile(updated)}
            onNavigateHome={() => setCurrentView("home")}
            onStartGeneratedQuiz={(questions, title) =>
              setActiveQuiz({ questions, title })
            }
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Tab Bar (Admin tab shown ONLY if user is admin) */}
      <NavigationTabBar
        currentView={currentView}
        onSelectView={(view) => setCurrentView(view)}
        isAdmin={isAdmin}
      />

      {/* Active Quiz Player Overlay */}
      {activeQuiz && (
        <QuizPlayerModal
          questions={activeQuiz.questions}
          title={activeQuiz.title}
          powerUps={powerUps}
          onUsePowerUp={handleUsePowerUp}
          onFinishQuiz={handleFinishQuiz}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {/* Daily Reward Chest Popup */}
      {showDailyChest && (
        <DailyRewardModal
          streakDays={userProfile.currentStreak}
          onClaim={(coins, stars) => {
            setUserProfile((prev) => ({
              ...prev,
              coins: prev.coins + coins,
              stars: prev.stars + stars,
            }));
            setShowDailyChest(false);
          }}
          onClose={() => setShowDailyChest(false)}
        />
      )}

      {/* Fortune Wheel Modal */}
      {showFortuneWheel && (
        <FortuneWheelModal
          onWinReward={(coins) =>
            setUserProfile((prev) => ({ ...prev, coins: prev.coins + coins }))
          }
          onClose={() => setShowFortuneWheel(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          user={userProfile}
          onUpdateName={(newName) =>
            setUserProfile((prev) => ({ ...prev, name: newName }))
          }
          onToggleSound={() =>
            setUserProfile((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
          }
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Fast Email Login & Registration Modal */}
      {showAuthModal && (
        <AuthModal
          currentUser={userProfile}
          onLoginSuccess={(newProfile) => {
            setUserProfile(newProfile);
            // If admin just logged in, take them straight to admin panel or stay on current view
            if (isAdminEmail(newProfile.email)) {
              setCurrentView("admin");
            } else if (currentView === "admin") {
              setCurrentView("home");
            }
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

    </div>
  );
}
