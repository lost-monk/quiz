import React, { useState } from 'react';
import { queryDatabase } from '../sqliteHelper';

interface QuizQuestionCardProps {
  question: any;
  alreadySolvedData: any; 
  onSolve: (stats: any) => void;
  activeDateStr: string;
}

const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({ question, alreadySolvedData, onSolve, activeDateStr }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(alreadySolvedData?.selectedAnswer || null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(alreadySolvedData ? true : null);
  const [retryCount, setRetryCount] = useState<number>(alreadySolvedData?.attempts - 1 || 0);

React.useEffect(() => {
    if (alreadySolvedData) {
      setSelectedAnswer(alreadySolvedData.selectedAnswer);
      setIsCorrect(true);
      setRetryCount(alreadySolvedData.attempts - 1);
    } else {
      // Reset if navigating to a date that hasn't been solved
      setSelectedAnswer(null);
      setIsCorrect(null);
      setRetryCount(0);
    }
  }, [alreadySolvedData, question.id]);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const handleSubmit = async () => {
    if (selectedAnswer === null || isCorrect) return;

    const res = await queryDatabase(`SELECT correct_answer FROM quiz_questions WHERE id = ${question.id}`);
    const correctAns = res[0].correct_answer;

    if (selectedAnswer === correctAns) {
      setIsCorrect(true);
      const stats = {
        attempts: retryCount + 1,
        solvedDate: activeDateStr,
        selectedAnswer: selectedAnswer
      };
      localStorage.setItem(`daily_quiz_${activeDateStr}`, JSON.stringify(stats));
      onSolve(stats);
    } else {
      setIsCorrect(false);
      setRetryCount(prev => prev + 1);
    }
  };

  const shareResults = () => {
    const attempts = retryCount + 1;
    const text = `🎯 I solved Today's Quiz in ${attempts} attempt(s)!\n\nQuestion: ${question.question}\n\nCan you beat me? Play here: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="question-box">
      {/* 1. RENDER THE QUESTION TEXT */}
      <p className="question-text">{question.question}</p>

      {/* 2. RENDER THE PILL OPTIONS */}
      <div className="options-list">
        {[1, 2, 3, 4].map((i) => {
          const isThisOptionSelected = selectedAnswer === i;
          const isCorrectChoice = isCorrect && isThisOptionSelected;

          return (
            <label 
              key={i} 
              className={`option ${isThisOptionSelected ? 'selected' : ''} 
                          ${isCorrectChoice ? 'correct-choice' : ''} 
                          ${isCorrect ? 'disabled' : ''}`}
            >
              <input 
                type="radio" 
                name="quiz" 
                checked={isThisOptionSelected} 
                onChange={() => !isCorrect && setSelectedAnswer(i)}
                disabled={isCorrect === true}
              />
              {question[`option_${i}`]}
            </label>
          );
        })}
      </div>

      {/* 3. RENDER SUBMIT OR SHARE ACTIONS */}
      <div className="interaction-area">
        {isCorrect ? (
          <div className="feedback correct">
            <p>✅ Correct! Solved in {retryCount + 1} attempt(s).</p>
            <button className="share-button" onClick={shareResults}>
              Share on WhatsApp 📱
            </button>
          </div>
        ) : (
          <>
            <button 
              className="submit-button" 
              onClick={handleSubmit} 
              disabled={selectedAnswer === null}
            >
              Submit Answer
            </button>
            {isCorrect === false && (
              <p className="feedback incorrect">❌ Incorrect. Try again! (Attempt {retryCount + 1})</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizQuestionCard;