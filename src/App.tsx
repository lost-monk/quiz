import React, { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import { queryDatabase } from "./sqliteHelper";
import QuizQuestionCard from "./components/QuizQuestionCard";

import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

interface Question {
  id: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  category?: string;
  display_date?: string;
}

const App: React.FC = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userResult, setUserResult] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // --- Configuration ---
  // Adjust this date so that "Day 0" is when you want your Question #1 to appear.
  const APP_LAUNCH_DATE = new Date("2025-12-01"); 

  useEffect(() => {
    const loadDailyChallenge = async () => {
      setIsLoading(true);
      
      // 1. Normalize dates to local midnight (prevents daylight savings/timezone bugs)
      const normalizedSelected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const normalizedLaunch = new Date(APP_LAUNCH_DATE.getFullYear(), APP_LAUNCH_DATE.getMonth(), APP_LAUNCH_DATE.getDate());
      
      const dateStr = normalizedSelected.toISOString().split("T")[0];

      // 2. Check local solved status
      const savedData = localStorage.getItem(`daily_quiz_${dateStr}`);
      setUserResult(savedData ? JSON.parse(savedData) : null);

      try {
        // 3. Get count and calculate deterministic Modulo ID
        const countRes = await queryDatabase("SELECT COUNT(*) as total FROM quiz_questions");
        const totalCount = countRes[0]?.total || 0;

        if (totalCount > 0) {
          const diffInMs = normalizedSelected.getTime() - normalizedLaunch.getTime();
          const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
          
          // The Modulo logic: wraps around 1 to totalCount infinitely
          const fallbackId = ((diffInDays % totalCount) + totalCount) % totalCount + 1;

          // 4. Fetch Question (Priority: Dated Entry > Sequence Entry)
          const query = `
            SELECT q.*, c.name as category 
            FROM quiz_questions q
            LEFT JOIN categories c ON q.category_id = c.id
            WHERE q.display_date = '${dateStr}' 
            OR (q.display_date IS NULL AND q.id = ${fallbackId})
            ORDER BY q.display_date DESC 
            LIMIT 1
          `;
          
          const result = await queryDatabase(query);
          setQuestion(result && result.length > 0 ? result[0] : null);
        }
      } catch (error) {
        console.error("Error loading challenge:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDailyChallenge();
  }, [selectedDate]);

  const handleSolve = (stats: any) => setUserResult(stats);

  return (
    <div className="quiz-container">
      <header className="header-section">
        <h1>Daily Quiz</h1>

        <div className="history-control">
          <button className="toggle-calendar-btn" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
            {isCalendarOpen ? "Close History ✕" : "View Past Quizzes 📅"}
          </button>
          
          {isCalendarOpen && (
            <div className="calendar-dropdown">
              <ReactDatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => { if (date) { setSelectedDate(date); setIsCalendarOpen(false); } }}
                minDate={APP_LAUNCH_DATE}
                maxDate={new Date()} // Users can't play tomorrow's quiz yet
                inline
              />
            </div>
          )}
        </div>

        <p className="current-date-label">
          {selectedDate.toDateString() === new Date().toDateString() 
            ? "Today's Challenge" 
            : `Challenge for ${selectedDate.toLocaleDateString()}`}
        </p>
      </header>

      <main className="questions-container">
        {isLoading ? (
          <div className="loading-state"><p>Loading...</p></div>
        ) : question ? (
          <QuizQuestionCard 
            key={`${question.id}-${selectedDate.toDateString()}`} 
            question={question} 
            alreadySolvedData={userResult} 
            onSolve={handleSolve}
          />
        ) : (
          <p>No question found for this date.</p>
        )}
      </main>
    </div>
  );
};

export default App;