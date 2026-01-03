import { useState, useEffect } from "react";
import { queryDatabase } from "../sqliteHelper";

const QUESTIONS_PER_DAY = 6;
const APP_LAUNCH_DATE = new Date("2025-12-01");

export const useQuizLogic = (selectedDate: Date, userStreak: number, trackEvent: any) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizProgress, setQuizProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dateStr = selectedDate.toLocaleDateString('en-CA');

  useEffect(() => {
    const loadDailySet = async () => {
      setIsLoading(true);
      const saved = localStorage.getItem(`quiz_set_${dateStr}`);
      const initialProgress = saved ? JSON.parse(saved) : Array(QUESTIONS_PER_DAY).fill(null);
      setQuizProgress(initialProgress);

      try {
        const countRes = await queryDatabase("SELECT COUNT(*) as total FROM quiz_questions");
        const totalCount = countRes[0]?.total || 0;

        if (totalCount > 0) {
          const diffInDays = Math.round((selectedDate.setHours(0,0,0,0) - APP_LAUNCH_DATE.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
          const startOffset = (diffInDays * QUESTIONS_PER_DAY) % totalCount;

          let dailySet = await queryDatabase(`
            SELECT q.*, c.name as category FROM quiz_questions q
            LEFT JOIN categories c ON q.category_id = c.id
            ORDER BY q.id ASC LIMIT ${QUESTIONS_PER_DAY} OFFSET ${startOffset}
          `);

          setQuestions(dailySet);
          setCurrentIndex(0);
          trackEvent('daily_set_loaded', { date: dateStr, streak: userStreak });
        }
      } catch (error) {
        trackEvent('db_error', { error: String(error) });
      } finally {
        setIsLoading(false);
      }
    };
    loadDailySet();
  }, [dateStr]);

  return { questions, currentIndex, setCurrentIndex, quizProgress, setQuizProgress, isLoading, dateStr };
};