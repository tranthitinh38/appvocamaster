import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Trophy, ArrowRight, Play, FastForward, Sliders } from 'lucide-react';
import { UnitData, SpeakingChallenge } from '../data/unitsData';
import { SpeakingFeedback, UserProgress } from '../types';
import { speakText, sounds } from '../utils/speechUtils';
import confetti from 'canvas-confetti';

interface SpeakingBuddyViewProps {
  currentUnit: UnitData;
  userProgress: UserProgress;
  onAddXp: (amount: number) => void;
  onCompleteSpeaking: () => void;
}

export const SpeakingBuddyView: React.FC<SpeakingBuddyViewProps> = ({
  currentUnit,
  userProgress,
  onAddXp,
  onCompleteSpeaking,
}) => {
  const challenges = currentUnit.speakingChallenges || [];
  const [selectedChallenge, setSelectedChallenge] = useState<SpeakingChallenge>(
    challenges[0] || {
      id: 'default',
      targetSentence: 'I adore hanging out with my classmates at the weekend.',
      ipa: '/aɪ əˈdɔːr ˈhæŋ.ɪŋ aʊt wɪð maɪ ˈklɑːs.meɪts æt ðə ˌwiːkˈend/',
      translationVi: 'Tớ cực kỳ thích đi chơi với bạn bè vào cuối tuần.',
      focusSound: 'Âm /ɔː/ trong adore',
      tip: 'Nhấn mạnh động từ adore và hạ giọng cuối câu.',
      roleplayContext: 'Hội thoại làm quen',
    }
  );

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.9);
  const [micSupported, setMicSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (challenges.length > 0) {
      setSelectedChallenge(challenges[0]);
      setFeedback(null);
      setTranscript('');
    }
  }, [currentUnit]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition init error', e);
      setMicSupported(false);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      // Fallback: prompt text or demo
      const userSpoken = prompt(
        'Trình duyệt chưa hỗ trợ micro tự động. Vui lòng gõ hoặc dán câu bạn vừa phát âm:',
        selectedChallenge.targetSentence
      );
      if (userSpoken) {
        setTranscript(userSpoken);
      }
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setFeedback(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleListenSample = (rate: number) => {
    setSpeechSpeed(rate);
    speakText(selectedChallenge.targetSentence, rate);
  };

  const handleAnalyze = async () => {
    const spoken = transcript.trim() || selectedChallenge.targetSentence;
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/speaking/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetText: selectedChallenge.targetSentence,
          spokenText: spoken,
          unitTitle: `Unit ${currentUnit.unitNumber}: ${currentUnit.title}`,
        }),
      });

      if (!response.ok) throw new Error('Lỗi chấm điểm phát âm');
      const data: SpeakingFeedback = await response.json();
      setFeedback(data);

      onAddXp(data.xpGained || 35);
      onCompleteSpeaking();
      sounds.playSuccess();

      if (data.overallScore >= 80) {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error(err);
      sounds.playError();
      alert('Không thể phân tích phát âm lúc này. Vui lòng thử lại!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/50 bg-rose-500/10';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-5">
      {/* Module Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 via-slate-900 to-pink-900/40 border border-purple-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Mic className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-white">
              AI Speaking Buddy • Chấm Điểm 3 Tiêu Chí
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Phân tích thời gian thực: (1) Độ chính xác IPA, (2) Trọng âm từ (Word stress), (3) Ngữ điệu câu (Intonation).
          </p>
        </div>

        {/* Challenge selector dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Chọn câu mẫu:</span>
          <select
            value={selectedChallenge.id}
            onChange={(e) => {
              const c = challenges.find((item) => item.id === e.target.value);
              if (c) {
                setSelectedChallenge(c);
                setFeedback(null);
                setTranscript('');
              }
            }}
            className="bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 border border-slate-700 cursor-pointer"
          >
            {challenges.map((c, i) => (
              <option key={c.id} value={c.id}>
                Câu {i + 1}: {c.targetSentence.slice(0, 35)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Sentence Card */}
      <div className="relative rounded-3xl bg-slate-800/90 border border-purple-500/30 p-6 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
          <Sparkles className="w-48 h-48 text-pink-500" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Unit {currentUnit.unitNumber} Practice • {selectedChallenge.roleplayContext}
            </span>

            {/* Audio speed controls */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => handleListenSample(0.75)}
                className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                title="Nghe chậm 0.75x"
              >
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>0.75x</span>
              </button>
              <button
                onClick={() => handleListenSample(1.0)}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                title="Nghe chuẩn 1.0x"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Mẫu Chuẩn</span>
              </button>
            </div>
          </div>

          {/* Big English sentence */}
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide leading-snug">
              "{selectedChallenge.targetSentence}"
            </h3>
            <p className="text-sm font-mono text-indigo-300 tracking-wider">
              {selectedChallenge.ipa}
            </p>
            <p className="text-sm text-slate-300 font-medium italic">
              Nghĩa: {selectedChallenge.translationVi}
            </p>
          </div>

          {/* Pronunciation & Stress Spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-700/60">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
              <span className="font-bold text-pink-400">🎯 Điểm nhấn âm:</span>{' '}
              <span className="text-slate-200">{selectedChallenge.focusSound}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs">
              <span className="font-bold text-amber-400">💡 Mẹo ngữ điệu:</span>{' '}
              <span className="text-slate-200">{selectedChallenge.tip}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recording & Input Action Zone */}
      <div className="rounded-3xl bg-slate-800/60 border border-slate-700 p-6 flex flex-col items-center justify-center text-center space-y-4">
        {/* Record Button with Pulse Waves */}
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 rounded-full bg-pink-500/30 animate-ping" />
          )}
          <button
            onClick={toggleRecording}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-2xl cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/30'
                : 'bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 text-white hover:scale-105 ring-4 ring-purple-500/30'
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        <div>
          <h4 className="text-base font-bold text-white">
            {isRecording ? 'Đang lắng nghe bạn nói... Nhấn lại để hoàn thành' : 'Nhấn Micro để bắt đầu luyện nói'}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {!micSupported
              ? 'Lưu ý: Bạn có thể nhập nội dung bạn nói vào ô bên dưới để AI chấm điểm'
              : 'Hãy nói rõ ràng, giữ nhịp điệu tự nhiên và chuẩn âm cuối.'}
          </p>
        </div>

        {/* Live speech transcript field */}
        <div className="w-full max-w-xl">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder='Giọng nói của bạn sẽ xuất hiện ở đây (hoặc nhập: "I adore hanging out...")'
            className="w-full bg-slate-900/90 text-slate-100 text-center text-sm sm:text-base font-medium rounded-2xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-purple-500 shadow-inner"
          />
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!transcript.trim() && !isRecording)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AI Buddy đang phân tích IPA & Ngữ điệu...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Chấm Điểm 3 Tiêu Chí (+35 XP)</span>
            </>
          )}
        </button>
      </div>

      {/* AI Speaking Feedback Dashboard (Rendered after analysis) */}
      {feedback && (
        <div className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header Score summary */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Kết Quả Phân Tích
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                Đánh Giá Kỹ Năng Nói Từ AI Speaking Buddy
              </h3>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-sm">
              <Trophy className="w-4 h-4" />
              <span>+{feedback.xpGained} XP Thưởng</span>
            </div>
          </div>

          {/* 3 Core Criteria Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Overall */}
            <div className={`p-4 rounded-2xl border flex flex-col items-center text-center ${getScoreColor(feedback.overallScore)}`}>
              <span className="text-xs font-bold uppercase">Tổng Thể</span>
              <span className="text-3xl font-black mt-1">{feedback.overallScore}%</span>
              <span className="text-[10px] mt-0.5 font-semibold">
                {feedback.overallScore >= 80 ? 'Xuất sắc! 🔥' : feedback.overallScore >= 65 ? 'Khá tốt! 👍' : 'Cần luyện thêm 💪'}
              </span>
            </div>

            {/* Criteria 1: IPA Accuracy */}
            <div className={`p-4 rounded-2xl border flex flex-col items-center text-center ${getScoreColor(feedback.ipaScore)}`}>
              <span className="text-xs font-bold uppercase">(1) Độ chuẩn IPA</span>
              <span className="text-3xl font-black mt-1">{feedback.ipaScore}%</span>
              <span className="text-[10px] mt-0.5 font-semibold">Phát âm âm tiết</span>
            </div>

            {/* Criteria 2: Word Stress */}
            <div className={`p-4 rounded-2xl border flex flex-col items-center text-center ${getScoreColor(feedback.stressScore)}`}>
              <span className="text-xs font-bold uppercase">(2) Trọng âm từ</span>
              <span className="text-3xl font-black mt-1">{feedback.stressScore}%</span>
              <span className="text-[10px] mt-0.5 font-semibold">Nhấn đúng âm tiết</span>
            </div>

            {/* Criteria 3: Intonation */}
            <div className={`p-4 rounded-2xl border flex flex-col items-center text-center ${getScoreColor(feedback.intonationScore)}`}>
              <span className="text-xs font-bold uppercase">(3) Ngữ điệu câu</span>
              <span className="text-3xl font-black mt-1">{feedback.intonationScore}%</span>
              <span className="text-[10px] mt-0.5 font-semibold">Lên/xuống giọng</span>
            </div>
          </div>

          {/* Word-by-word Phonetic Breakdown */}
          {feedback.phoneticBreakdown && feedback.phoneticBreakdown.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-slate-200">
                🔍 Bóc Tách Chi Tiết Từng Từ & Âm Tiết:
              </h4>
              <div className="flex flex-wrap gap-2">
                {feedback.phoneticBreakdown.map((item, idx) => {
                  const isPerfect = item.status === 'perfect';
                  const isWarning = item.status === 'warning';
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col ${
                        isPerfect
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : isWarning
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <span>{item.word}</span>
                        {isPerfect ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">{item.ipa}</span>
                      {item.tip && (
                        <span className="text-[10px] mt-1 text-slate-300 font-sans italic">
                          {item.tip}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actionable Feedback Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/70 space-y-1">
              <h5 className="text-xs font-bold text-indigo-400">1. Chỉnh sửa âm IPA:</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{feedback.feedbackIpa}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/70 space-y-1">
              <h5 className="text-xs font-bold text-purple-400">2. Chỉnh sửa trọng âm:</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{feedback.feedbackStress}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/70 space-y-1">
              <h5 className="text-xs font-bold text-pink-400">3. Chỉnh sửa ngữ điệu:</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{feedback.feedbackIntonation}</p>
            </div>
          </div>

          {/* Growth mindset encouragement */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Lời Nhắn Khích Lệ Từ AI Mentor
              </span>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">
                {feedback.encouragement}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
