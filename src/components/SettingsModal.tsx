import React, { useState } from "react";
import { UserProfile } from "../types";
import { Settings, Volume2, VolumeX, RotateCcw, X, Check, HelpCircle } from "lucide-react";
import { soundFx } from "../utils/sound";

interface SettingsModalProps {
  user: UserProfile;
  onUpdateName: (newName: string) => void;
  onToggleSound: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  onUpdateName,
  onToggleSound,
  onResetProgress,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(user.name);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      soundFx.playCoin();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl animate-in fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 p-6 rounded-3xl border-2 border-amber-500/50 shadow-2xl space-y-5 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-black text-amber-200">إعدادات اللعبة</h2>
        </div>

        {/* Change Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">اسم اللاعب:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleSaveName}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400"
            >
              {isSaved ? <Check className="w-4 h-4 text-slate-950" /> : "حفظ"}
            </button>
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <span className="text-xs font-bold text-slate-200">مؤثرات الصوت:</span>
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleSound();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
              user.soundEnabled
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}
          >
            {user.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{user.soundEnabled ? "مُشغل" : "متوقف"}</span>
          </button>
        </div>

        {/* Reset Progress */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (window.confirm("هل أنت تأكد من إعادة تعيين كافة البيانات والنتائج؟")) {
                onResetProgress();
              }
            }}
            className="w-full py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تعيين التقدم بالكامل</span>
          </button>
        </div>

      </div>
    </div>
  );
};
