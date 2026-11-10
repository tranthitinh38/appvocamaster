import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Volume2, VolumeX, RefreshCw, Zap, Trophy, ShieldAlert, BookOpen } from 'lucide-react';
import { UnitData } from '../data/unitsData';
import { ChatMessage, UserProgress } from '../types';
import { speakText, stopSpeech, sounds } from '../utils/speechUtils';
import confetti from 'canvas-confetti';

interface MentorChatViewProps {
  currentUnit: UnitData;
  userProgress: UserProgress;
  onAddXp: (amount: number) => void;
  onNavigateToTab: (tab: 'speaking' | 'flashcards' | 'pvp' | 'ocr') => void;
}

export const MentorChatView: React.FC<MentorChatViewProps> = ({
  currentUnit,
  userProgress,
  onAddXp,
  onNavigateToTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 🌟 1. Greeting & Status Update
Chào **Explorer ${userProgress.levelTitle}**! Chào mừng bạn bước vào hành trình thám hiểm **Unit ${currentUnit.unitNumber}: ${currentUnit.title}**!
Bạn đang duy trì chuỗi **🔥 Streak ${userProgress.streak} ngày**, còn **${Math.max(0, userProgress.dailyGoalWords - userProgress.wordsReviewedToday)} từ vựng** nữa để hoàn thành mục tiêu ngày hôm nay!

---

### 📖 2. Main Content (Trọng tâm bài học hôm nay)
Hôm nay chúng ta cùng chinh phục:
* **Ngữ pháp trọng tâm:** ${currentUnit.grammarFocus}
* **Quy tắc phát âm:** ${currentUnit.pronunciationFocus} (${currentUnit.pronunciationRule})

**Vocabulary Card mẫu của Unit ${currentUnit.unitNumber}:**
* **Từ vựng:** \`${currentUnit.vocabularies[0]?.word}\` - ${currentUnit.vocabularies[0]?.ipa} (${currentUnit.vocabularies[0]?.partOfSpeech})
* **Nghĩa tiếng Việt:** ${currentUnit.vocabularies[0]?.meaningVi}
* **Collocations:** *${currentUnit.vocabularies[0]?.collocation}*
* **Word Family:** *${currentUnit.vocabularies[0]?.wordFamily}*
* **Ví dụ SGK:** "${currentUnit.vocabularies[0]?.sgkContext}"
* **Visual Prompt 4K:** *"${currentUnit.vocabularies[0]?.imagePrompt4k}"*

---

### ⚔️ 3. Practice / Challenge
Bạn đã sẵn sàng cho thử thách đầu tiên chưa? Hãy trả lời câu hỏi nhanh này nhé:
👉 *${currentUnit.pvpQuestions[0]?.question}*
${currentUnit.pvpQuestions[0]?.options.map((opt, i) => `\n${String.fromCharCode(65 + i)}. ${opt}`).join('')}

---

### 💡 4. Feedback & Correction
Hãy gõ đáp án (A, B, C hoặc D) hoặc hỏi tớ bất kỳ câu hỏi nào về từ vựng, ngữ pháp, phát âm của SGK Global Success 8!

---

### 🏆 5. Gamification Rewards
Mỗi câu hỏi tương tác nhận ngay **+25 XP**! Nếu duy trì chuỗi tốt, bạn có thể tham gia **Đấu Trường PvP** để nhận danh hiệu Huyền thoại!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          currentUnit: `Unit ${currentUnit.unitNumber}: ${currentUnit.title}`,
          studentContext: {
            level: `${userProgress.levelTitle} (Lv.${userProgress.level})`,
            streak: userProgress.streak,
            xp: userProgress.xp,
            dueWords: currentUnit.vocabularies.map((v) => v.word),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi máy chủ AI');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        xpAwarded: data.xpAwarded || 25,
      };

      setMessages((prev) => [...prev, botMsg]);
      onAddXp(data.xpAwarded || 25);
      sounds.playSuccess();

      if (data.xpAwarded >= 30) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err: any) {
      console.error(err);
      sounds.playError();
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Có lỗi kết nối tạm thời đến hệ thống AI Mentor. Bạn vui lòng thử lại nhé!\n*Chi tiết: ${err.message || 'Network error'}*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakMessage = (msgId: string, content: string) => {
    if (isSpeakingId === msgId) {
      stopSpeech();
      setIsSpeakingId(null);
      return;
    }

    setIsSpeakingId(msgId);
    // Read only English sentences and key lines, strip markdown
    speakText(content, 0.95).finally(() => {
      setIsSpeakingId(null);
    });
  };

  const quickPrompts = [
    `Giải thích các từ vựng mới Unit ${currentUnit.unitNumber} kèm collocations`,
    `Hướng dẫn phát âm chuẩn: ${currentUnit.pronunciationFocus}`,
    `Cho em làm thử thách trắc nghiệm nhanh Unit ${currentUnit.unitNumber}`,
    `Cách dùng chi tiết ngữ pháp: ${currentUnit.grammarFocus}`,
    `Đưa ra 1 tình huống hội thoại để em luyện tập speaking`,
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-160px)] min-h-[550px]">
      {/* Unit Context Header Banner */}
      <div className={`p-4 rounded-2xl bg-gradient-to-r ${currentUnit.color} text-white shadow-lg mb-3 flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-2xl shadow-inner">
            {currentUnit.badge.split(' ')[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                Unit {currentUnit.unitNumber}
              </span>
              <h2 className="text-lg font-black">{currentUnit.title}</h2>
            </div>
            <p className="text-xs text-white/90 mt-0.5">
              Chủ đề: {currentUnit.theme} • {currentUnit.grammarFocus}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('speaking')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition backdrop-blur-sm cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Luyện Nói Unit {currentUnit.unitNumber}</span>
          </button>
          <button
            onClick={() => onNavigateToTab('flashcards')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition backdrop-blur-sm cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
            <span>Flashcards ({currentUnit.vocabularies.length} từ)</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                  : 'bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 shadow-md ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-700/50 pb-2 mb-2">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  {msg.role === 'user' ? (
                    'Bạn (Explorer)'
                  ) : (
                    <>
                      <span className="text-indigo-400">Global Success 8 AI Mentor</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                        Official SGK
                      </span>
                    </>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleSpeakMessage(msg.id, msg.content)}
                      title="Nghe phát âm chuẩn"
                      className={`p-1 rounded-lg transition cursor-pointer ${
                        isSpeakingId === msg.id
                          ? 'bg-pink-500 text-white animate-pulse'
                          : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-700'
                      }`}
                    >
                      {isSpeakingId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Message Content formatted with clean Markdown-style layout */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                {msg.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3
                        key={idx}
                        className="text-base font-extrabold text-indigo-300 mt-2 mb-1 flex items-center gap-1.5 border-l-2 border-indigo-400 pl-2"
                      >
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('**Vocabulary Card') || paragraph.startsWith('* **Từ vựng:')) {
                    return (
                      <div
                        key={idx}
                        className="my-2 p-3 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-xs sm:text-sm"
                      >
                        {paragraph}
                      </div>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>

              {msg.xpAwarded && (
                <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs font-bold text-amber-400">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    +{msg.xpAwarded} XP nhận được!
                  </span>
                  <span className="text-[11px] text-indigo-300">Tích lũy thăng hạng</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
              <span>AI Mentor đang bám sát SGK Global Success 8 và biên soạn phản hồi...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
        {quickPrompts.map((promptText, i) => (
          <button
            key={i}
            onClick={() => handleSend(promptText)}
            disabled={isLoading}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/50 transition whitespace-nowrap cursor-pointer shadow-sm disabled:opacity-50"
          >
            ⚡ {promptText}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="mt-1 flex items-center gap-2 bg-slate-900 border border-slate-700 focus-within:border-indigo-500 rounded-2xl p-2 shadow-xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Hỏi AI Mentor về từ vựng, ngữ pháp, quy tắc phát âm SGK 8..."
          rows={1}
          className="flex-1 bg-transparent text-slate-100 text-sm placeholder:text-slate-500 px-3 py-1.5 focus:outline-none resize-none max-h-24"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-md shadow-indigo-600/30"
        >
          <span>Gửi</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
