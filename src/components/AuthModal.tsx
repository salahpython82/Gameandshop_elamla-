import React, { useState } from "react";
import { UserProfile, AuthAccount } from "../types";
import {
  ADMIN_EMAIL,
  isAdminEmail,
  getStoredAccounts,
  registerOrLoginAccount,
} from "../utils/storage";
import { soundFx } from "../utils/sound";
import {
  X,
  Mail,
  ShieldCheck,
  User,
  KeyRound,
  Sparkles,
  ArrowRight,
  LogOut,
  CheckCircle2,
  Crown,
  Gamepad2,
  Lock,
} from "lucide-react";

interface AuthModalProps {
  currentUser: UserProfile;
  onLoginSuccess: (profile: UserProfile) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onLoginSuccess,
  onClose,
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const accounts = getStoredAccounts();
  const isAdmin = isAdminEmail(currentUser.email);

  const handleFastLogin = (targetEmail: string, targetName?: string) => {
    soundFx.playCorrect();
    const result = registerOrLoginAccount(targetEmail, targetName);
    const acc = result.account;

    const updatedProfile: UserProfile = {
      ...currentUser,
      email: acc.email,
      name: acc.name,
      avatar: acc.avatar,
      role: acc.role,
      coins: acc.coins,
      stars: acc.stars,
      iqScore: acc.iqScore,
      level: acc.level,
      xp: acc.xp,
    };

    setSuccessMsg(
      isAdminEmail(acc.email)
        ? "مرحباً بك يا مدير! تم تفعيل لوحة التحكم وصلاحيات الإدارة."
        : `أهلاً بك يا ${acc.name}! تم تسجيل الدخول بنجاح كلاعب.`
    );

    setTimeout(() => {
      onLoginSuccess(updatedProfile);
      onClose();
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!emailInput.trim() || !emailInput.includes("@")) {
      setErrorMsg("يرجى إدخال بريد إلكتروني صالح.");
      soundFx.playWrong();
      return;
    }

    handleFastLogin(emailInput.trim(), nameInput.trim() || undefined);
  };

  const handleLogout = () => {
    soundFx.playClick();
    const guestProfile: UserProfile = {
      ...currentUser,
      email: undefined,
      role: "player",
      name: "بطل الذكاء (ضيف)",
      avatar: "👨‍🎓",
    };
    onLoginSuccess(guestProfile);
    setSuccessMsg("تم تسجيل الخروج. أنت الآن في وضع الضيف.");
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fade-in dir-rtl">
      <div
        id="auth-modal-container"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/80 text-white relative overflow-hidden"
      >
        {/* Glow Header Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition-colors border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <KeyRound className="w-7 h-7 text-slate-950" />
          </div>
          <h2 className="text-xl font-black text-amber-100">
            {currentUser.email ? "حسابك الحالي" : "تسجيل الدخول / إنشاء حساب سريع"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تسجيل الدخول السريع بالبريد الإلكتروني للوصول إلى لوحة المدير أو حفظ تقدم اللعبة
          </p>
        </div>

        {/* Current Account Status if logged in */}
        {currentUser.email && (
          <div className="mb-5 p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{currentUser.avatar}</div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-200">{currentUser.name}</span>
                  {isAdmin ? (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      المدير العام
                    </span>
                  ) : (
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3 text-cyan-400" />
                      لاعب
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">{currentUser.email}</span>
              </div>
            </div>

            <button
              id="auth-logout-btn"
              onClick={handleLogout}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/30 text-xs font-semibold flex items-center gap-1"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-2.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs text-center font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </div>
        )}

        {/* Quick Fast Login Presets */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              الدخول السريع بنقرة واحدة:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Admin Preset */}
            <button
              id="fast-login-admin-btn"
              type="button"
              onClick={() => handleFastLogin(ADMIN_EMAIL, "صلاح بوعصبية (المدير)")}
              className="p-2.5 bg-gradient-to-r from-amber-950/80 to-yellow-950/60 hover:from-amber-900/80 hover:to-yellow-900/80 border border-amber-500/50 rounded-xl text-right flex items-center gap-2.5 transition-all group shadow-md"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40 text-lg group-hover:scale-105 transition-transform">
                👑
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-amber-200 flex items-center gap-1">
                  حساب المدير
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-[10px] text-amber-400/80 truncate font-mono">
                  {ADMIN_EMAIL}
                </div>
              </div>
            </button>

            {/* Player Preset */}
            <button
              id="fast-login-player-btn"
              type="button"
              onClick={() => handleFastLogin("player@quiz.com", "أحمد المنافس")}
              className="p-2.5 bg-gradient-to-r from-slate-800 to-slate-800/60 hover:from-slate-700 hover:to-slate-700/60 border border-slate-700 rounded-xl text-right flex items-center gap-2.5 transition-all group shadow-md"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/40 text-lg group-hover:scale-105 transition-transform">
                👨‍🎓
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-cyan-200 flex items-center gap-1">
                  حساب لاعب عادي
                  <Gamepad2 className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  player@quiz.com
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center mb-4">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400">أو إدخال بريد إلكتروني مخصص</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Manual Custom Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                dir="ltr"
              />
            </div>
            {emailInput.toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
              <p className="text-[11px] text-amber-400 font-medium mt-1 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400 inline" />
                هذا البريد يطابق حساب المدير! سيتم تفعيل لوحة تحكم المدير فوراً.
              </p>
            )}
          </div>

          {isSignUpMode && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">اسم اللاعب / المستخدم</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  id="auth-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="مثال: البطل عمر"
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">كلمة المرور (اختياري للدخول السريع)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                id="auth-password-input"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <button
              type="button"
              onClick={() => setIsSignUpMode(!isSignUpMode)}
              className="text-amber-400 hover:underline"
            >
              {isSignUpMode ? "لديك حساب بالفعل؟ تسجيل الدخول" : "مستخدم جديد؟ إنشاء حساب"}
            </button>
            <span className="text-[10px] text-slate-400 font-mono">سريع & آمن</span>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{isSignUpMode ? "إنشاء الحساب والمتابعة" : "دخول سريع إلى الحساب"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security / Admin Rule Note */}
        <div className="mt-4 p-2.5 bg-slate-800/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <p className="flex items-start gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>قاعدة الصلاحيات:</strong> إذا سجلت الدخول بحساب المدير (
              <span className="text-amber-300 font-mono">{ADMIN_EMAIL}</span>) تظهر لوحة التحكم الشاملة. وإذا سجلت كلاعب عادي يتم إخفاء لوحة التحكم تماماً لحماية أمان اللعبة.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
