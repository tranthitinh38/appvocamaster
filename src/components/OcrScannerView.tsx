import React, { useState } from 'react';
import { Camera, Upload, Sparkles, RefreshCw, CheckCircle2, FileText, ArrowRight, Zap, BookOpen, Layers } from 'lucide-react';
import { SAMPLE_OCR_PAGES, OcrSample } from '../data/sampleOcrData';
import { ExtractedOcrResult, UserProgress } from '../types';
import { VocabularyItem } from '../data/unitsData';
import { sounds } from '../utils/speechUtils';
import confetti from 'canvas-confetti';

interface OcrScannerViewProps {
  userProgress: UserProgress;
  onAddCustomVocabularies: (words: VocabularyItem[]) => void;
  onAddXp: (amount: number) => void;
}

export const OcrScannerView: React.FC<OcrScannerViewProps> = ({
  userProgress,
  onAddCustomVocabularies,
  onAddXp,
}) => {
  const [selectedSample, setSelectedSample] = useState<OcrSample | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedOcrResult | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [index: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedSample(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: OcrSample) => {
    setSelectedSample(sample);
    setImagePreview(null);
    setTextInput(sample.sampleText);
    setExtractedData(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleScanAndExtract = async () => {
    if (!imagePreview && !textInput.trim()) {
      alert('Vui lòng tải ảnh lên hoặc chọn 1 trang SGK mẫu!');
      return;
    }

    setIsExtracting(true);
    setExtractedData(null);
    setQuizAnswers({});
    setQuizSubmitted(false);

    try {
      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview || undefined,
          textInput: textInput || undefined,
        }),
      });

      if (!response.ok) throw new Error('Lỗi bóc tách tài liệu OCR');

      const data: ExtractedOcrResult = await response.json();
      setExtractedData(data);
      onAddXp(40);
      sounds.playSuccess();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
      sounds.playError();
      alert('Không thể bóc tách ảnh lúc này. Vui lòng kiểm tra lại ảnh hoặc chọn mẫu SGK có sẵn!');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveToSrs = () => {
    if (!extractedData || !extractedData.extractedVocabulary) return;

    const newVocabs: VocabularyItem[] = extractedData.extractedVocabulary.map((v, i) => ({
      id: `ocr-${Date.now()}-${i}`,
      word: v.word,
      ipa: v.ipa || '/.../',
      partOfSpeech: v.partOfSpeech || 'noun',
      meaningVi: v.meaningVi,
      collocation: v.collocation || 'N/A',
      wordFamily: v.wordFamily || 'N/A',
      synonyms: v.synonyms,
      antonyms: v.antonyms,
      sgkContext: v.contextExample || 'Ví dụ từ trang SGK vừa quét.',
      extendedContext: v.contextExample || '',
      imagePrompt4k: v.imagePrompt4k || 'High detail 4k educational illustration.',
      difficulty: (v.difficulty as any) || 'Medium',
      dueStatus: 'due_now',
      srsInterval: 1,
    }));

    onAddCustomVocabularies(newVocabs);
    onAddXp(30);
    sounds.playStreak();
    alert(`🎉 Đã tự động tạo và lưu ${newVocabs.length} Flashcard SRS vào bộ thẻ học của bạn!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Module Title Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-cyan-900/40 border border-blue-500/30 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-cyan-400 border border-blue-500/30">
              <Camera className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-white">
              Bóc Tách Sách Giáo Khoa (OCR & Curriculum Extractor)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Quét ảnh trang SGK Tiếng Anh 8 Global Success hoặc dán đoạn văn bài học để AI tự động trích xuất từ mới và tạo Flashcard SRS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>Tải Ảnh SGK</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Preset SGK 1-click test pages */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>📚 Hoặc chọn nhanh trang SGK Global Success mẫu để trải nghiệm:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_OCR_PAGES.map((sample) => {
            const isSelected = selectedSample?.id === sample.id;
            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/60 border-cyan-400 ring-2 ring-cyan-500/30'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                  <span>{sample.thumbnailEmoji}</span>
                  <span className="truncate">{sample.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {sample.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Preview or Text Input Box */}
      <div className="rounded-3xl bg-slate-800/90 border border-slate-700 p-5 space-y-4">
        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 max-h-72 flex items-center justify-center">
            <img
              src={imagePreview}
              alt="SGK Preview"
              className="max-h-72 object-contain"
            />
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setImagePreview(null)}
                className="px-3 py-1 rounded-xl bg-slate-900/80 text-white text-xs font-bold hover:bg-rose-600 transition"
              >
                Xóa ảnh
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Nội dung bài học SGK (nhập hoặc dán đoạn văn):</span>
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Dán nội dung đoạn hội thoại hoặc văn bản SGK lớp 8 vào đây để AI bóc tách..."
              rows={4}
              className="w-full bg-slate-900 text-slate-100 text-xs sm:text-sm font-sans rounded-2xl p-3.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {/* Scan Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleScanAndExtract}
            disabled={isExtracting || (!imagePreview && !textInput.trim())}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI đang bóc tách thực thể SGK & Phân tích từ mới...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Quét & Trích Xuất Từ Vựng Bằng AI (+40 XP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extracted Results Display */}
      {extractedData && (
        <div className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Nhận Diện Thành Công
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                {extractedData.detectedUnit}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {extractedData.summary}
              </p>
            </div>

            <button
              onClick={handleSaveToSrs}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Lưu Tất Cả Vào Flashcard SRS</span>
            </button>
          </div>

          {/* Extracted Vocabulary Cards Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-200">
              💎 {extractedData.extractedVocabulary.length} Từ Vựng Trọng Tâm Được Trích Xuất:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {extractedData.extractedVocabulary.map((vocab, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2 hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white">{vocab.word}</span>
                      <span className="text-xs font-mono text-cyan-400">{vocab.ipa}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {vocab.partOfSpeech}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      {vocab.difficulty}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-amber-300">
                    {vocab.meaningVi}
                  </p>

                  <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-800">
                    <p>
                      <strong className="text-indigo-400">Collocation:</strong> {vocab.collocation}
                    </p>
                    <p>
                      <strong className="text-purple-400">Word family:</strong> {vocab.wordFamily}
                    </p>
                    {vocab.synonyms && (
                      <p>
                        <strong className="text-emerald-400">Đồng nghĩa:</strong> {vocab.synonyms}
                      </p>
                    )}
                    <p className="italic text-slate-400">
                      "{vocab.contextExample}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Quiz generated from scanned page */}
          {extractedData.quickQuiz && extractedData.quickQuiz.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm font-black text-white">
                  Thử Thách Nhanh Củng Cố Bài Quét (Quick Quiz)
                </h4>
              </div>

              <div className="space-y-4">
                {extractedData.quickQuiz.map((quiz, qIndex) => (
                  <div key={qIndex} className="space-y-2 text-xs">
                    <p className="font-bold text-slate-200">
                      Câu {qIndex + 1}: {quiz.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quiz.options.map((option, optIndex) => {
                        const isChosen = quizAnswers[qIndex] === optIndex;
                        const isCorrect = quiz.correctIndex === optIndex;
                        return (
                          <button
                            key={optIndex}
                            onClick={() => {
                              if (!quizSubmitted) {
                                setQuizAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
                              }
                            }}
                            className={`p-2.5 rounded-xl text-left font-medium transition cursor-pointer border ${
                              quizSubmitted
                                ? isCorrect
                                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                                  : isChosen
                                  ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                                : isChosen
                                ? 'bg-indigo-600 border-indigo-400 text-white'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <span className="font-bold mr-1.5">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-[11px] text-cyan-300 italic pt-1">
                        💡 Giải thích: {quiz.explanation}
                      </p>
                    )}
                  </div>
                ))}

                {!quizSubmitted && (
                  <button
                    onClick={() => {
                      setQuizSubmitted(true);
                      onAddXp(20);
                      sounds.playSuccess();
                    }}
                    disabled={Object.keys(quizAnswers).length === 0}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer disabled:opacity-40"
                  >
                    Nộp bài trắc nghiệm nhanh
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
