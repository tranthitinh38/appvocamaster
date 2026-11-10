import React, { useState } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { DailyQuestBanner } from './components/DailyQuestBanner';
import { MentorChatView } from './components/MentorChatView';
import { SpeakingBuddyView } from './components/SpeakingBuddyView';
import { SrsFlashcardsView } from './components/SrsFlashcardsView';
import { OcrScannerView } from './components/OcrScannerView';
import { PvpArenaView } from './components/PvpArenaView';
import { DashboardView } from './components/DashboardView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherManagement } from './components/TeacherManagement';
import { GLOBAL_SUCCESS_UNITS, UnitData, VocabularyItem } from './data/unitsData';
import { useAuth } from './utils/AuthContext';
import { StudentLogin } from './components/StudentLogin';
import { sounds } from './utils/speechUtils';
import confetti from 'canvas-confetti';

export default function App() {
  const { user, userProgress, setUser, setUserProgress } = useAuth();
  if (!user.name) {
    return <StudentLogin />;
  }
  const [currentUnit, setCurrentUnit] = useState<UnitData>(GLOBAL_SUCCESS_UNITS[0]);
  const [activeTab, setActiveTab] = useState<'mentor' | 'speaking' | 'flashcards' | 'ocr' | 'pvp' | 'dashboard' | 'manage'>('mentor');

  // Calculate due words across all units
  const dueWordsCount = GLOBAL_SUCCESS_UNITS.reduce(
    (acc, u) => acc + u.vocabularies.filter((v) => v.dueStatus === 'due_now').length,
    0
  );

  // Handlers that modify userProgress via context
  const handleAddXp = (amount: number) => {
    setUserProgress((prev) => {
      const newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;
      let newTitle = prev.levelTitle;

      if (newXp >= prev.xpToNextLevel) {
        newLevel += 1;
        newXpToNext = Math.round(prev.xpToNextLevel * 1.5);
        sounds.playStreak();
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.4 } });
        if (newLevel >= 5) newTitle = 'Bậc Thầy Global Success 8';
        else if (newLevel >= 4) newTitle = 'Chuyên Gia Ngữ Pháp & IPA';
        else newTitle = 'Chiến Binh Từ Vựng 8';
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        levelTitle: newTitle,
        xpToNextLevel: newXpToNext,
        wordsReviewedToday: prev.wordsReviewedToday + 1,
      };
    });
  };

  const handleUpdateWordStatus = (wordId: string, status: 'due_now' | 'learning' | 'mastered', days: number) => {
    // Update local unit vocabulary status
    for (const unit of GLOBAL_SUCCESS_UNITS) {
      const word = unit.vocabularies.find((v) => v.id === wordId);
      if (word) {
        word.dueStatus = status;
        word.srsInterval = days;
        break;
      }
    }
    setUserProgress((prev) => ({ ...prev, wordsReviewedToday: prev.wordsReviewedToday + 1 }));
  };

  const handleAddCustomVocabularies = (newWords: VocabularyItem[]) => {
    currentUnit.vocabularies.unshift(...newWords);
    setCurrentUnit({ ...currentUnit });
  };

  const handleCompleteSpeaking = () => {
    setUserProgress((prev) => ({ ...prev, completedSpeakingToday: prev.completedSpeakingToday + 1 }));
  };

  const handleRecordPvpResult = (won: boolean) => {
    setUserProgress((prev) => ({
      ...prev,
      pvpTotal: prev.pvpTotal + 1,
      pvpWins: won ? prev.pvpWins + 1 : prev.pvpWins,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <HeaderNav
        currentUnit={currentUnit}
        onSelectUnit={setCurrentUnit}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        userProgress={userProgress}
      />

      {/* Daily Quest & Golden Review Banner */}
      <DailyQuestBanner
        userProgress={userProgress}
        dueWordsCount={dueWordsCount}
        onOpenSrs={() => setActiveTab('flashcards')}
        onOpenSpeaking={() => setActiveTab('speaking')}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'mentor' && (
          <MentorChatView
            currentUnit={currentUnit}
            userProgress={userProgress}
            onAddXp={handleAddXp}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'speaking' && (
          <SpeakingBuddyView
            currentUnit={currentUnit}
            userProgress={userProgress}
            onAddXp={handleAddXp}
            onCompleteSpeaking={handleCompleteSpeaking}
          />
        )}

        {activeTab === 'flashcards' && (
          <SrsFlashcardsView
            currentUnit={currentUnit}
            userProgress={userProgress}
            onUpdateWordStatus={handleUpdateWordStatus}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'ocr' && (
          <OcrScannerView
            userProgress={userProgress}
            onAddCustomVocabularies={handleAddCustomVocabularies}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'pvp' && (
          <PvpArenaView
            currentUnit={currentUnit}
            userProgress={userProgress}
            onAddXp={handleAddXp}
            onRecordResult={handleRecordPvpResult}
          />
        )}

        {activeTab === 'dashboard' && <DashboardView userProgress={userProgress} />}

        {activeTab === 'manage' && <TeacherManagement />}
      </main>
    </div>
  );
}
