import React, { useState } from 'react';
import { BookOpen, Volume2, Sparkles, Check, AlertCircle, RotateCcw, ChevronLeft, ChevronRight, Filter, Search, Award, Eye, Layers } from 'lucide-react';
import { UnitData, VocabularyItem, GLOBAL_SUCCESS_UNITS } from '../data/unitsData';
import { UserProgress } from '../types';
import { speakText, sounds } from '../utils/speechUtils';
import confetti from 'canvas-confetti';

interface SrsFlashcardsViewProps {
  currentUnit: UnitData;
  userProgress: UserProgress;
  onUpdateWordStatus: (wordId: string, status: 'due_now' | 'learning' | 'mastered', days: number) => void;
  onAddXp: (amount: number) => void;
}

export const SrsFlashcardsView: React.FC<SrsFlashcardsViewProps> = ({
  currentUnit,
  userProgress,
  onUpdateWordStatus,
  onAddXp,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<number>(currentUnit.id);
  const [filterMode, setFilterMode] = useState<'all' | 'due' | 'learning' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const activeUnit = GLOBAL_SUCCESS_UNITS.find((u) => u.id === selectedUnitId) || currentUnit;

  // Filter words
  const wordsToDisplay = activeUnit.vocabularies.filter((v) => {
    const matchesSearch =
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.meaningVi.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'due') return v.dueStatus === 'due_now';
    if (filterMode === 'learning') return v.dueStatus === 'learning';
    if (filterMode === 'mastered') return v.dueStatus === 'mastered';
    return true;
  });

  const currentWord: VocabularyItem | undefined = wordsToDisplay[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, wordsToDisplay.length));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + wordsToDisplay.length) % Math.max(1, wordsToDisplay.length));
  };

  const handleReview = (rating: 'again' | 'good' | 'easy') => {
    if (!currentWord) return;

    if (rating === 'again') {
      sounds.playError();
      onUpdateWordStatus(currentWord.id, 'due_now', 1);
    } else if (rating === 'good') {
      sounds.playSuccess();
      onUpdateWordStatus(currentWord.id, 'learning', 3);
      onAddXp(15);
    } else {
      sounds.playStreak();
      onUpdateWordStatus(currentWord.id, 'mastered', 7);
      onAddXp(25);
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 },
      });
    }

    handleNext();
  };

  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    speakText(text, 0.9);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-5">
      {/* Top Filter and Unit Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Unit Selector */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <select
            value={selectedUnitId}
            onChange={(e) => {
              setSelectedUnitId(Number(e.target.value));
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="bg-slate-800 text-slate-100 text-xs sm:text-sm font-bold rounded-xl px-3 py-2 border border-slate-700 cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            {GLOBAL_SUCCESS_UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                Unit {u.unitNumber}: {u.title} ({u.vocabularies.length} từ)
              </option>
            ))}
          </select>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => {
              setFilterMode('all');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterMode === 'all'
                ? 'bg-slate-700 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ({activeUnit.vocabularies.length})
          </button>
          <button
            onClick={() => {
              setFilterMode('due');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
              filterMode === 'due'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Thời Điểm Vàng</span>
          </button>
          <button
            onClick={() => {
              setFilterMode('learning');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterMode === 'learning'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-indigo-400 hover:bg-slate-700'
            }`}
          >
            Đang học
          </button>
          <button
            onClick={() => {
              setFilterMode('mastered');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              filterMode === 'mastered'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            }`}
          >
            Đã thuần thục
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-48">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
            }}
            placeholder="Tìm từ vựng..."
            className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {wordsToDisplay.length === 0 ? (
        <div className="rounded-3xl bg-slate-800/40 border border-slate-700 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">Không tìm thấy từ vựng nào</h3>
          <p className="text-xs text-slate-400">
            Hãy đổi bộ lọc hoặc chọn Unit khác để tiếp tục thám hiểm!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card index & Progress indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
            <span>
              Thẻ {currentIndex + 1} / {wordsToDisplay.length}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Chạm thẻ để lật mặt sau</span>
            </div>
            <span className="text-indigo-400">{currentWord?.difficulty}</span>
          </div>

          {/* 3D Interactive Flashcard */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[380px] rounded-3xl bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl relative cursor-pointer hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top pill badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Unit {activeUnit.unitNumber} • {currentWord?.partOfSpeech}
                </span>
                {currentWord?.dueStatus === 'due_now' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    🔥 Cần ôn hôm nay
                  </span>
                )}
              </div>

              <button
                onClick={(e) => currentWord && handleSpeak(currentWord.word, e)}
                className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition shadow-md shadow-indigo-600/30 cursor-pointer"
                title="Nghe phát âm chuẩn"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Main content depending on front / back */}
            {!isFlipped ? (
              /* FRONT OF CARD */
              <div className="text-center py-6 space-y-4">
                <div>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-wide">
                    {currentWord?.word}
                  </h3>
                  <p className="text-base sm:text-lg font-mono text-emerald-400 mt-2">
                    {currentWord?.ipa}
                  </p>
                </div>

                <div className="max-w-lg mx-auto p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{currentWord?.sgkContext}"
                </div>

                {/* 4K Visual Prompt imagery description */}
                <div className="max-w-lg mx-auto p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2 text-left">
                  <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-pink-300">Prompt liên tưởng 4K:</strong>{' '}
                    <span>{currentWord?.imagePrompt4k}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* BACK OF CARD: Rich Ecosystem */
              <div className="py-2 space-y-4 animate-in fade-in duration-300">
                {/* Vietnamese meaning */}
                <div className="text-center border-b border-slate-700/70 pb-3">
                  <span className="text-xs font-bold uppercase text-slate-400">Nghĩa Tiếng Việt</span>
                  <h4 className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">
                    {currentWord?.meaningVi}
                  </h4>
                </div>

                {/* Smart contextualization: Collocations & Word Family */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/70 space-y-1">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
                      🔗 Collocations (Từ hay đi kèm)
                    </span>
                    <p className="text-slate-200 font-semibold">{currentWord?.collocation}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/70 space-y-1">
                    <span className="font-bold text-purple-400 uppercase tracking-wider text-[10px]">
                      👨‍👩‍👧‍👦 Word Family (Gia đình từ)
                    </span>
                    <p className="text-slate-200 font-semibold">{currentWord?.wordFamily}</p>
                  </div>
                </div>

                {/* Synonyms & Antonyms */}
                {(currentWord?.synonyms || currentWord?.antonyms) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {currentWord.synonyms && (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
                        <strong className="text-emerald-400">Đồng nghĩa:</strong> {currentWord.synonyms}
                      </div>
                    )}
                    {currentWord.antonyms && (
                      <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200">
                        <strong className="text-rose-400">Trái nghĩa:</strong> {currentWord.antonyms}
                      </div>
                    )}
                  </div>
                )}

                {/* Extended sentence */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-xs text-slate-300 italic">
                  <strong>Ví dụ mở rộng:</strong> "{currentWord?.extendedContext}"
                </div>
              </div>
            )}

            {/* Bottom flip hint */}
            <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-700/50 flex items-center justify-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Chạm để {isFlipped ? 'xem mặt trước' : 'lật mặt sau (Nghĩa & Collocations)'}</span>
            </div>
          </div>

          {/* SRS Evaluation Buttons */}
          <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Thẻ trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Thẻ tiếp theo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* SRS Review Rating */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                onClick={() => handleReview('again')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
              >
                <span>🔴 Quên rồi</span>
                <span className="text-[10px] opacity-75">(1 ngày)</span>
              </button>

              <button
                onClick={() => handleReview('good')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition cursor-pointer"
              >
                <span>🟡 Tạm nhớ</span>
                <span className="text-[10px] opacity-75">(3 ngày)</span>
              </button>

              <button
                onClick={() => handleReview('easy')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition cursor-pointer shadow-md shadow-emerald-600/30"
              >
                <span>🟢 Thuộc làu!</span>
                <span className="text-[10px] opacity-90">(+25 XP)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
