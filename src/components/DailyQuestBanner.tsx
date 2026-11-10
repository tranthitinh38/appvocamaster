import React from 'react';
import { Target, Clock, CheckCircle2, ChevronRight, Gift, Zap } from 'lucide-react';
import { UserProgress } from '../types';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/speechUtils';

interface DailyQuestBannerProps {
  userProgress: UserProgress;
  dueWordsCount: number;
  onOpenSrs: () => void;
  onOpenSpeaking: () => void;
  onClaimQuestReward?: () => void;
}

export const DailyQuestBanner: React.FC<DailyQuestBannerProps> = ({
  userProgress,
  dueWordsCount,
  onOpenSrs,
  onOpenSpeaking,
}) => {
  const isGoalReached = userProgress.wordsReviewedToday >= userProgress.dailyGoalWords;

  const handleClaim = () => {
    sounds.playStreak();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#eab308'],
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-3 pb-1">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Quest 1: SRS Golden Review Time */}
        <div
          onClick={onOpenSrs}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-indigo-900/40 border border-indigo-500/30 p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition shadow-lg hover:shadow-indigo-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Thời Điểm Vàng (SRS)
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">
                {dueWordsCount > 0 ? (
                  <>
                    <strong className="text-amber-300">{dueWordsCount} từ</strong> đến hạn ôn tập hôm nay
                  </>
                ) : (
                  'Đã ôn tập sạch sẽ các từ vựng!'
                )}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition" />
        </div>

        {/* Quest 2: Daily Target Progress */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3 flex-1 mr-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Nhiệm vụ Ngày: Mục tiêu từ vựng</span>
                <span className="text-emerald-400">
                  {userProgress.wordsReviewedToday}/{userProgress.dailyGoalWords}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (userProgress.wordsReviewedToday / userProgress.dailyGoalWords) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
          {isGoalReached ? (
            <button
              onClick={handleClaim}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold hover:bg-emerald-400 transition cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>+50 XP</span>
            </button>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
              Còn {Math.max(0, userProgress.dailyGoalWords - userProgress.wordsReviewedToday)}
            </span>
          )}
        </div>

        {/* Quest 3: AI Speaking Buddy Challenge */}
        <div
          onClick={onOpenSpeaking}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-pink-950/40 border border-purple-500/30 p-3.5 flex items-center justify-between cursor-pointer hover:border-purple-400 transition shadow-lg hover:shadow-purple-500/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition">
              <Zap className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
                  Thử thách Phát âm IPA
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/40 text-purple-200">
                  +35 XP
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">
                {userProgress.completedSpeakingToday > 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 inline" /> Đã hoàn thành 1 lượt luyện nói!
                  </span>
                ) : (
                  'Luyện nói 1 câu đối thoại với AI Buddy'
                )}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition" />
        </div>
      </div>
    </div>
  );
};
