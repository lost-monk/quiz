import React, { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import { queryDatabase } from "./sqliteHelper";
import QuizQuestionCard from "./components/QuizQuestionCard";

import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

const QUESTIONS_PER_DAY = 6;
const APP_LAUNCH_DATE = new Date("2025-12-01");

const App: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizProgress, setQuizProgress] = useState<any[]>([]); // Stores results for all 6 questions
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  const dateStr = selectedDate.toLocaleDateString('en-CA');

  useEffect(() => {
    const loadDailySet = async () => {
      setIsLoading(true);

      // 1. Load progress array from localStorage (daily_set_YYYY-MM-DD)
      const saved = localStorage.getItem(`quiz_set_${dateStr}`);
      const initialProgress = saved ? JSON.parse(saved) : Array(QUESTIONS_PER_DAY).fill(null);
      setQuizProgress(initialProgress);

      try {
        // 2. Calculate day offset for deterministic selection
        const countRes = await queryDatabase("SELECT COUNT(*) as total FROM quiz_questions");
        const totalCount = countRes[0]?.total || 0;

        if (totalCount > 0) {
          const normalizedSelected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
          const normalizedLaunch = new Date(APP_LAUNCH_DATE.getFullYear(), APP_LAUNCH_DATE.getMonth(), APP_LAUNCH_DATE.getDate());

          const diffInMs = normalizedSelected.getTime() - normalizedLaunch.getTime();
          const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

          // 3. Calculate start index (shifts by 6 every day)
          const startOffset = (diffInDays * QUESTIONS_PER_DAY) % totalCount;

          // 4. Fetch 6 questions using LIMIT and OFFSET
          let dailySet = await queryDatabase(`
            SELECT q.*, c.name as category 
            FROM quiz_questions q
            LEFT JOIN categories c ON q.category_id = c.id
            ORDER BY q.id ASC 
            LIMIT ${QUESTIONS_PER_DAY} OFFSET ${startOffset}
          `);

          // Handle wrap-around if there aren't enough questions at the end of the table
          if (dailySet.length < QUESTIONS_PER_DAY) {
            const needed = QUESTIONS_PER_DAY - dailySet.length;
            const wrapRes = await queryDatabase(`SELECT * FROM quiz_questions ORDER BY id ASC LIMIT ${needed} OFFSET 0`);
            dailySet = [...dailySet, ...wrapRes];
          }

          setQuestions(dailySet);
          setCurrentIndex(0); // Reset to first question when date changes
        }
      } catch (error) {
        console.error("Error loading quiz set:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDailySet();
  }, [selectedDate, dateStr]);

  const handleSolve = (index: number, stats: any) => {
    const newProgress = [...quizProgress];
    newProgress[index] = stats;
    setQuizProgress(newProgress);
    localStorage.setItem(`quiz_set_${dateStr}`, JSON.stringify(newProgress));

    //AUTO-MOVE TO NEXT QUESTION
    if (stats.status === 'solved' && index < QUESTIONS_PER_DAY - 1) {
      setTimeout(() => {
        setCurrentIndex(index + 1);
      }, 800); // 800ms delay gives the user time to see the green "Correct" state
    }
  };

  const shareResults = () => {
    // We use Hex codes to define the emojis so the compiler cannot break them
    const GREEN = '\u{1F7E9}'; // 🟩
    const ORANGE = '\u{1F7E7}'; // 🟧
    const RED = '\u{1F7E5}'; // 🟥
    const WHITE = '\u{2B1C}';   // ⬜
    const TROPHY = '\u{1F3AF}'; // 🎯

    let grid = "";

    quizProgress.forEach((p) => {
      if (p) {
        let row = "";
        if (p.status === 'solved') {
          if (p.attempts === 1) row = GREEN + WHITE + WHITE;
          else if (p.attempts === 2) row = ORANGE + GREEN + WHITE;
          else if (p.attempts === 3) row = ORANGE + ORANGE + GREEN;
        } else {
          row = RED + RED + RED;
        }
        grid += row + "\n";
      }
    });

    // Constructing the final string using .concat style for safety
    const header = TROPHY + " Daily Quiz - " + dateStr + "\n\n";
    const footer = "\nPlay here: " + window.location.href;
    const fullMessage = header + grid.trimEnd() + footer;

    // IMPORTANT: WhatsApp requires encodeURIComponent for emojis to work via URL
    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  const isQuizComplete = quizProgress.every(p => p !== null);
  const solvedCount = quizProgress.filter(p => p?.status === 'solved').length;

  return (
    <div className="quiz-container">
      <header className="header-section">
        <h1>Daily Quiz</h1>

        <div className="history-control">
          <button className="toggle-calendar-btn" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
            {isCalendarOpen ? "Close History ✕" : "History 📅"}
          </button>

          {isCalendarOpen && (
            <div className="calendar-dropdown">
              <ReactDatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => { if (date) { setSelectedDate(date); setIsCalendarOpen(false); } }}
                minDate={APP_LAUNCH_DATE}
                maxDate={new Date()}
                inline
              />
            </div>
          )}
        </div>

        {/* Progress Dots Navigation */}
        <div className="progress-navigation">
          {Array.from({ length: QUESTIONS_PER_DAY }).map((_, i) => {
            // This is the check that was failing
            const isCurrent = currentIndex === i;

            // Check if we have progress data for this specific index
            const progress = quizProgress[i];
            const statusClass = progress ? progress.status : 'unsolved';

            return (
              <button
                key={i}
                // We combine the classes: dot + active/inactive + solved/failed/unsolved
                className={`dot ${isCurrent ? 'active' : 'inactive'} ${statusClass}`}
                onClick={() => setCurrentIndex(i)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </header>

      <main className="questions-container">
        {isLoading ? (
          <div className="loading-state"><p>Loading questions...</p></div>
        ) : questions.length > 0 ? (
          <>
            <QuizQuestionCard
              key={questions[currentIndex].id}
              question={questions[currentIndex]}
              alreadySolvedData={quizProgress[currentIndex]}
              onSolve={(stats) => handleSolve(currentIndex, stats)}
              activeDateStr={dateStr}
            />

            {/* Standard Navigation */}
            <div className="quiz-nav-buttons">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="nav-btn"
              >
                ← Previous
              </button>

              {isQuizComplete && (
                <button className="share-btn-compact pulse-animation" onClick={shareResults}>
                  Share 📱
                </button>
              )}

              <button
                disabled={currentIndex === QUESTIONS_PER_DAY - 1}
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="nav-btn"
              >
                Next →
              </button>
            </div>

            {isQuizComplete && (
              <div className="score-display-container">
                <p className="score-text">
                  Today's Score: <strong>{solvedCount} / {QUESTIONS_PER_DAY}</strong>
                </p>
                <p className="score-subtext">
                  {solvedCount === QUESTIONS_PER_DAY ? "Perfect! 🌟" : "Great job for today!"}
                </p>
              </div>
            )}
          </>
        ) : (
          <p>No questions found for this date.</p>
        )}
      </main>
    </div>
  );
};

export default App;