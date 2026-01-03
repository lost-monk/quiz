import React, { useState, useEffect, useRef } from "react";
import QuizHeader from "./components/QuizHeader";
import QuizQuestionCard from "./components/QuizQuestionCard";
import ProgressNav from "./components/ProgressNav"
import UserStats from "./components/UserStats";
import { useQuizLogic } from "./hooks/useQuizLogic";
import { useUserTracking } from "./hooks/useUserTracking";
import ShareModal from "./components/ShareModal";
import { useShareResults } from "./hooks/useShareResults";
import "./App.css";

const App: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Unified Hook Call
  const {
    stats,
    isSyncing,
    winPercentage,
    averageGuesses,
    recordCompletion,
    trackEvent
  } = useUserTracking();

  const { generateShareMessage, shareToWhatsApp } = useShareResults();

  const {
    questions, currentIndex, setCurrentIndex,
    quizProgress, setQuizProgress, isLoading, dateStr
  } = useQuizLogic(selectedDate, stats.currentStreak, trackEvent);

  const hasProcessedRecording = useRef<string | null>(null);

  // AUTO-OPEN & STATS RECORDING
  useEffect(() => {
    const isComplete = quizProgress.every(p => p !== null);

    if (!isLoading && !isSyncing && questions.length > 0 && isComplete) {

      // Check our "Session Lock" instead of the stats object
      if (hasProcessedRecording.current !== dateStr) {
        const isWin = quizProgress.every(p => p?.status === 'solved');
        const totalAttempts = quizProgress.reduce((sum, p) => sum + (p?.attempts || 0), 0);

        // Record stats ONLY once
        recordCompletion(isWin, totalAttempts, dateStr);

        // Mark as done for this session/date
        hasProcessedRecording.current = dateStr;
      }

      // The Modal logic stays OUTSIDE the 'if' guard or follows it
      // so that if the component re-renders, the timer still has a chance to fire
      const timer = setTimeout(() => {
        setIsShareModalOpen(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [quizProgress, isLoading, isSyncing, questions.length, recordCompletion, dateStr]);

  const handleSolve = (index: number, stats: any) => {
    const newProgress = [...quizProgress];
    newProgress[index] = stats;
    setQuizProgress(newProgress);
    localStorage.setItem(`quiz_set_${dateStr}`, JSON.stringify(newProgress));

    // Auto-advance logic
    if (stats.status === 'solved' && index < 5) {
      setTimeout(() => setCurrentIndex(index + 1), 800);
    }
  };

  const isQuizComplete = quizProgress.every(p => p !== null);

  return (
    <div className="quiz-container">
      <QuizHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
      />
      <div style={{ opacity: isSyncing ? 0.5 : 1, transition: 'opacity 0.3s' }}>
        <UserStats
          gamesPlayed={stats.gamesPlayed}
          winPercentage={winPercentage}
          currentStreak={stats.currentStreak}
          maxStreak={stats.maxStreak}
          averageGuesses={averageGuesses}
        />
      </div>
      <ProgressNav
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        quizProgress={quizProgress}
      />

      <main className="questions-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Daily Set...</p>
          </div>
        ) : questions.length > 0 ? (
          <>
            <QuizQuestionCard
              key={questions[currentIndex]?.id}
              question={questions[currentIndex]}
              alreadySolvedData={quizProgress[currentIndex]}
              onSolve={(stats) => handleSolve(currentIndex, stats)}
              activeDateStr={dateStr}
            />

            {/* Classic Navigation Menu */}
            <div className="quiz-nav-buttons">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="nav-btn"
              >
                ← Previous
              </button>

              {isQuizComplete && (
                <button className="open-share-btn" onClick={() => setIsShareModalOpen(true)}>
                  See Results & Share 📱
                </button>
              )}

              <button
                disabled={currentIndex === 5}
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="nav-btn"
              >
                Next →
              </button>
            </div>
          </>
        ) : (
          <p className="error-text">No questions found for this date.</p>
        )}
      </main>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        quizProgress={quizProgress}
        dateStr={dateStr}
        onShare={shareToWhatsApp}
        generateMessage={generateShareMessage}
      />
    </div>
  );
};

export default App;