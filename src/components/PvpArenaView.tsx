import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Shield, Zap, Flame, Heart, RefreshCw, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { UnitData, GLOBAL_SUCCESS_UNITS } from '../data/unitsData';
import { UserProgress } from '../types';
import { sounds } from '../utils/speechUtils';
import confetti from 'canvas-confetti';

interface PvpArenaViewProps {
  currentUnit: UnitData;
  userProgress: UserProgress;
  onAddXp: (amount: number) => void;
  onRecordPvpResult: (won: boolean) => void;
}

interface Opponent {
  name: string;
  avatar: string;
  school: string;
  rank: string;
  level: number;
}

const OPPONENT_POOL: Opponent[] = [
  { name: 'Minh Khôi', avatar: '⚡', school: 'THCS Giảng Võ, Hà Nội', rank: 'Chiến binh Kim Cương', level: 5 },
  { name: 'Hương Giang', avatar: '🌸', school: 'THCS Lê Quý Đôn, TP.HCM', rank: 'Bậc thầy Global Success', level: 6 },
  { name: 'Hoàng Long', avatar: '🦁', school: 'THCS Chu Văn An, Hải Phòng', rank: 'Thợ săn Collocation', level: 4 },
  { name: 'AI Bot-8000', avatar: '🤖', school: 'Học viện AI Global Success', rank: 'Đấu sĩ Bất bại', level: 5 },
];

export const PvpArenaView: React.FC<PvpArenaViewProps> = ({
  currentUnit,
  userProgress,
  onAddXp,
  onRecordPvpResult,
}) => {
  const [gameState, setGameState] = useState<'lobby' | 'matching' | 'playing' | 'ended'>('lobby');
  const [opponent, setOpponent] = useState<Opponent>(OPPONENT_POOL[0]);
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [currentRound, setCurrentRound] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [battleQuestions, setBattleQuestions] = useState<any[]>([]);

  // Prepare questions for battle
  const startMatchmaking = () => {
    setGameState('matching');
    sounds.playXpGain();

    // Randomize opponent
    const opp = OPPONENT_POOL[Math.floor(Math.random() * OPPONENT_POOL.length)];
    setOpponent(opp);

    // Collect questions from current unit and neighboring units
    const pool = [
      ...currentUnit.pvpQuestions,
      ...(GLOBAL_SUCCESS_UNITS[(currentUnit.id % 12)]?.pvpQuestions || []),
      ...(GLOBAL_SUCCESS_UNITS[(currentUnit.id + 1) % 12]?.pvpQuestions || []),
    ];

    // Shuffle and pick 5
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
    setBattleQuestions(shuffled);

    setTimeout(() => {
      setGameState('playing');
      setPlayerHp(100);
      setOpponentHp(100);
      setCurrentRound(0);
      setCombo(0);
      setTimeLeft(15);
      setSelectedOption(null);
      setIsAnswered(false);
    }, 2000);
  };

  // Timer countdown during playing state
  useEffect(() => {
    if (gameState !== 'playing' || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isAnswered, currentRound]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    sounds.playError();
    setCombo(0);
    setPlayerHp((prev) => Math.max(0, prev - 25));
    checkEndRound(playerHp - 25, opponentHp);
  };

  const handleAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const currentQ = battleQuestions[currentRound];
    const isCorrect = optionIdx === currentQ.correctIndex;

    // Simulate opponent response (75% correct chance)
    const opponentCorrect = Math.random() < 0.75;

    let newPlayerHp = playerHp;
    let newOpponentHp = opponentHp;

    if (isCorrect) {
      sounds.playSuccess();
      const newCombo = combo + 1;
      setCombo(newCombo);
      const damage = 25 + newCombo * 5;
      newOpponentHp = Math.max(0, opponentHp - damage);
      setOpponentHp(newOpponentHp);
    } else {
      sounds.playError();
      setCombo(0);
      newPlayerHp = Math.max(0, playerHp - 25);
      setPlayerHp(newPlayerHp);
    }

    if (!opponentCorrect && isCorrect) {
      // Opponent missed
    } else if (opponentCorrect && !isCorrect) {
      newPlayerHp = Math.max(0, newPlayerHp - 10);
      setPlayerHp(newPlayerHp);
    }

    checkEndRound(newPlayerHp, newOpponentHp);
  };

  const checkEndRound = (pHealth: number, oHealth: number) => {
    setTimeout(() => {
      if (pHealth <= 0 || oHealth <= 0 || currentRound >= battleQuestions.length - 1) {
        setGameState('ended');
        const won = pHealth > oHealth;
        onRecordPvpResult(won);
        if (won) {
          sounds.playStreak();
          onAddXp(80 + (userProgress.streak >= 3 ? 20 : 0));
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.5 },
          });
        } else {
          sounds.playError();
          onAddXp(20);
        }
      } else {
        setCurrentRound((prev) => prev + 1);
        setTimeLeft(15);
        setSelectedOption(null);
        setIsAnswered(false);
      }
    }, 1800);
  };

  const currentQ = battleQuestions[currentRound];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-5">
      {/* Lobby Screen */}
      {gameState === 'lobby' && (
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 p-8 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-600 via-amber-500 to-pink-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-rose-600/30 animate-bounce">
            <Swords className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Chế độ Thách Đấu Online (PvP)
              </span>
              {userProgress.streak >= 3 && (
                <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  +20% XP Streak Bonus!
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Đấu Trường Trí Tuệ Global Success 8
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Thi đấu đối kháng thời gian thực 5 câu hỏi nhanh về từ vựng, ngữ pháp và phát âm SGK 8. Mỗi câu trả lời đúng sẽ gây sát thương lên đối thủ!
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400">Tỉ Lệ Thắng</span>
              <p className="text-lg font-black text-emerald-400">
                {userProgress.pvpTotal > 0
                  ? `${Math.round((userProgress.pvpWins / userProgress.pvpTotal) * 100)}%`
                  : '100%'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] font-bold uppercase text-slate-400">Tổng Trận</span>
              <p className="text-lg font-black text-white">{userProgress.pvpTotal} trận</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Phần Thưởng</span>
              <p className="text-lg font-black text-amber-400">+100 XP / Thắng</p>
            </div>
          </div>

          <button
            onClick={startMatchmaking}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-base shadow-2xl shadow-rose-600/40 transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            ⚔️ Ghép Trận Ngay Lập Tức
          </button>
        </div>
      )}

      {/* Matchmaking Screen */}
      {gameState === 'matching' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
            <Swords className="w-10 h-10 text-rose-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Đang tìm đối thủ lớp 8...</h3>
            <p className="text-xs text-slate-400 mt-1">Hệ thống đang kết nối người chơi cùng trình độ</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Đã tìm thấy: {opponent.name} ({opponent.school})</span>
          </div>
        </div>
      )}

      {/* Active Battle Playing Screen */}
      {gameState === 'playing' && currentQ && (
        <div className="space-y-4">
          {/* Health Bars & Opponent vs Player Ticker */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            {/* Player Info */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span>Bạn (Explorer)</span>
                  {combo > 1 && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[10px]">
                      x{combo} Combo!
                    </span>
                  )}
                </span>
                <span className="text-white">{playerHp} HP</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${playerHp}%` }}
                />
              </div>
            </div>

            {/* Opponent Info */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-white">{opponentHp} HP</span>
                <span className="text-rose-400 flex items-center gap-1">
                  <span>{opponent.avatar} {opponent.name}</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex justify-end">
                <div
                  className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${opponentHp}%` }}
                />
              </div>
            </div>
          </div>

          {/* Battle Question Box */}
          <div className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Hiệp {currentRound + 1} / {battleQuestions.length}
              </span>
              {/* Countdown circle */}
              <div className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                timeLeft <= 5 ? 'bg-rose-500 text-white animate-ping' : 'bg-slate-900 text-amber-400'
              }`}>
                <span>⏱️ {timeLeft}s</span>
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-white text-center py-2">
              {currentQ.question}
            </h3>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((opt: string, idx: number) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-750 hover:border-slate-600';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(idx)}
                    className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all cursor-pointer flex items-center gap-3 ${btnStyle}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs shrink-0 font-extrabold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 italic animate-in fade-in">
                💡 <strong>Giải thích SGK:</strong> {currentQ.explanation}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Battle Ended Screen */}
      {gameState === 'ended' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
          {playerHp > opponentHp ? (
            <div className="space-y-3">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                <Trophy className="w-10 h-10 animate-bounce text-yellow-400" />
              </div>
              <h3 className="text-3xl font-black text-emerald-400">VICTORY! CHIẾN THẮNG</h3>
              <p className="text-sm text-slate-300">
                Bạn đã xuất sắc đánh bại <strong>{opponent.name}</strong> với phong độ tuyệt vời!
              </p>
              <div className="inline-block px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-sm">
                +{80 + (userProgress.streak >= 3 ? 20 : 0)} XP Thưởng Đấu Trường 🏆
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-20 h-20 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
                <Shield className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-rose-400">DEFEAT! CẦN CỐ GẮNG HƠN</h3>
              <p className="text-sm text-slate-300">
                {opponent.name} đã nhanh tay hơn một chút. Đừng nản lòng, hãy ôn lại từ vựng SRS rồi tái đấu nhé!
              </p>
              <div className="inline-block px-4 py-2 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs">
                +20 XP Khích lệ tinh thần Explorer
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setGameState('lobby')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Về Sảnh Đấu
            </button>
            <button
              onClick={startMatchmaking}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition cursor-pointer"
            >
              Tái Đấu Ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
