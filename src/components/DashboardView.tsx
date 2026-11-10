import React from 'react';
import { BarChart3, Trophy, Flame, Target, BookOpen, Mic, CheckCircle2, Award, Zap, Shield, Sparkles } from 'lucide-react';
import { GLOBAL_SUCCESS_UNITS } from '../data/unitsData';
import { UserProgress } from '../types';

interface DashboardViewProps {
  userProgress: UserProgress;
  onNavigateTab: (tab: 'mentor' | 'speaking' | 'flashcards' | 'ocr' | 'pvp') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProgress,
  onNavigateTab,
}) => {
  // Count total words across 12 units
  const totalCurriculumWords = GLOBAL_SUCCESS_UNITS.reduce((acc, u) => acc + u.vocabularies.length, 0);

  // Compute unit progress
  const unitStats = GLOBAL_SUCCESS_UNITS.map((u) => {
    const mastered = u.vocabularies.filter((v) => v.dueStatus === 'mastered').length;
    const learning = u.vocabularies.filter((v) => v.dueStatus === 'learning').length;
    const due = u.vocabularies.filter((v) => v.dueStatus === 'due_now').length;
    const total = u.vocabularies.length;
    const percent = Math.round(((mastered * 1 + learning * 0.5) / total) * 100);
    return {
      unitNumber: u.unitNumber,
      title: u.title,
      badge: u.badge,
      total,
      mastered,
      percent,
      color: u.color,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Hero Level & Profile Card */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-6 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-400/20 text-3xl font-black">
            🌟
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Level {userProgress.level} Explorer
              </span>
              <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                Chuỗi {userProgress.streak} ngày
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              {userProgress.levelTitle}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Hành trình bám sát 12 Units SGK Tiếng Anh 8 Global Success
            </p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full sm:w-72 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Tiến trình thăng hạng</span>
            <span className="text-indigo-400">{userProgress.xp} / {userProgress.xpToNextLevel} XP</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (userProgress.xp / userProgress.xpToNextLevel) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Từ Vựng Đã Học</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{userProgress.wordsReviewedToday} từ</p>
          <span className="text-[11px] text-emerald-400 font-semibold">Mục tiêu {userProgress.dailyGoalWords} từ/ngày</span>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Độ Chính Xác IPA</span>
            <Mic className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">88%</p>
          <span className="text-[11px] text-purple-300 font-semibold">Theo chuẩn Cambridge / SGK</span>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Ghi Nhớ SRS</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">92%</p>
          <span className="text-[11px] text-cyan-300 font-semibold">Đường cong lãng quên tối ưu</span>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Đấu Trường PvP</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{userProgress.pvpWins}/{userProgress.pvpTotal}</p>
          <span className="text-[11px] text-amber-300 font-semibold">Trận thắng xếp hạng</span>
        </div>
      </div>

      {/* 12 Units Mastery Matrix */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-black text-white">
              Bản Đồ Thám Hiểm 12 Units Global Success 8
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Tổng cộng {totalCurriculumWords} từ vựng chuẩn SGK
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {unitStats.map((stat) => (
            <div
              key={stat.unitNumber}
              className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/70 hover:border-indigo-500/40 transition space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-white">
                  Unit {stat.unitNumber}: {stat.title}
                </span>
                <span className="font-mono font-bold text-indigo-300">{stat.percent}%</span>
              </div>

              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stat.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{stat.badge}</span>
                <span>{stat.mastered}/{stat.total} từ thuần thục</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Collection & Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Badges */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <h3 className="text-base font-black text-white">Bộ Sưu Tập Huy Hiệu Explorer</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {userProgress.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center gap-2.5"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-white">{badge.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Items */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-black text-white">Túi Đồ Vật Phẩm & Bổ Trợ</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {userProgress.items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[10px] text-slate-400">{item.description}</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-700 text-indigo-300">
                  x{item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
