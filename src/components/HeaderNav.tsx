import React from 'react';
import { Sparkles, Flame, Trophy, BookOpen, Mic, Camera, Swords, BarChart3, MessageSquare } from 'lucide-react';
import { GLOBAL_SUCCESS_UNITS, UnitData } from '../data/unitsData';
import { User, UserProgress } from '../types';

/** Header navigation bar with user info and tab switching */
interface HeaderNavProps {
  currentUnit: UnitData;
  onSelectUnit: (unit: UnitData) => void;
  /** Tabs: mentor, speaking, flashcards, ocr, pvp, dashboard, optional manage for teachers */
  activeTab: 'mentor' | 'speaking' | 'flashcards' | 'ocr' | 'pvp' | 'dashboard' | 'manage';
  setActiveTab: (tab: HeaderNavProps['activeTab']) => void;
  /** Logged‑in user */
  user: User;
  userProgress: UserProgress;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentUnit,
  onSelectUnit,
  activeTab,
  setActiveTab,
  user,
  userProgress,
}) => {
  const xpPercent = Math.min(100, Math.round((userProgress.xp / userProgress.xpToNextLevel) * 100));

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top status bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Mascot */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-bold rounded-full border border-slate-900 text-[10px]">8th</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                Global Success 8
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Mentor
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              SGK Tiếng Anh 8 • NXB Giáo dục Việt Nam
            </p>
          </div>
          {/* User badge */}
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <span className="font-medium">{user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}:</span>
            <span className="font-semibold">{user.name || 'Chưa đăng nhập'}</span>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 hidden md:inline">Đang học:</span>
          <select
            value={currentUnit.id}
            onChange={(e) => {
              const selected = GLOBAL_SUCCESS_UNITS.find((u) => u.id === Number(e.target.value));
              if (selected) onSelectUnit(selected);
            }}
            className="bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold rounded-lg px-3 py-1.5 border border-slate-700/80 focus:outline-none focus:border-indigo-500 cursor-pointer transition shadow-inner"
          >
            {GLOBAL_SUCCESS_UNITS.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100 py-1">
                Unit {u.unitNumber}: {u.title}
              </option>
            ))}
          </select>
        </div>

        {/* Gamification Stats: Streak, Level & XP */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold shadow-sm">
            <Flame className="w-4 h-4 fill-amber-400 text-orange-500 animate-bounce" />
            <span>{userProgress.streak} ngày</span>
          </div>
          {/* Level & XP */}
          <div className="hidden xs:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/80">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-200">
                <span>Lv.{userProgress.level}</span>
                <span className="text-slate-400 font-normal">({userProgress.levelTitle})</span>
              </div>
              <div className="w-16 sm:w-20 bg-slate-700 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-indigo-400 pl-1">{userProgress.xp} XP</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/80 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1.5">
          <button
            onClick={() => setActiveTab('mentor')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'mentor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Mentor Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('speaking')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'speaking'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Mic className="w-4 h-4 text-pink-300" />
            <span>AI Speaking Buddy</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-pink-500 text-white">IPA 3D</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span>12 Units & SRS</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ocr'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-4 h-4 text-cyan-300" />
            <span>Quét SGK (OCR)</span>
          </button>

          <button
            onClick={() => setActiveTab('pvp')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pvp'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/30 animate-pulse'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Swords className="w-4 h-4 text-amber-300" />
            <span>Đấu Trường PvP</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-300" />
            <span>Dashboard</span>
          </button>

          {/* Teacher‑only Manage tab */}
          {user.role === 'teacher' && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'manage'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-300" />
              <span>Quản lý lớp</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
