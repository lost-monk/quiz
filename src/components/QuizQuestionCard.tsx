import React, { useState, useEffect } from 'react';
import { queryDatabase } from '../sqliteHelper';

interface QuizQuestionCardProps {
  question: any;
  alreadySolvedData: any;
  onSolve: (stats: any) => void;
  activeDateStr: string;
}

const MAX_ATTEMPTS = 3;

const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({ question, alreadySolvedData, onSolve, activeDateStr }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing');
  const [isLastAttemptWrong, setIsLastAttemptWrong] = useState(false);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  console.log(activeDateStr);
  useEffect(() => {
    const init = async () => {
      const res = await queryDatabase(`SELECT correct_answer FROM quiz_questions WHERE id = ${question.id}`);
      if (res && res.length > 0) setCorrectIndex(res[0].correct_answer);

      if (alreadySolvedData) {
        setSelectedAnswer(alreadySolvedData.selectedAnswer);
        setAttempts(alreadySolvedData.attempts);
        setStatus(alreadySolvedData.status);
      } else {
        setSelectedAnswer(null);
        setAttempts(0);
        setStatus('playing');
        setIsLastAttemptWrong(false);
      }
    };
    init();
  }, [alreadySolvedData, question?.id]);

  const handleSubmit = async () => {
    if (selectedAnswer === null || status !== 'playing' || !correctIndex) return;
    const currentAttempt = attempts + 1;

    if (selectedAnswer === correctIndex) {
      setIsLastAttemptWrong(false);
      setStatus('solved');
      onSolve({ attempts: currentAttempt, status: 'solved', selectedAnswer });
    } else {
      if (currentAttempt >= MAX_ATTEMPTS) {
        setStatus('failed');
        onSolve({ attempts: MAX_ATTEMPTS, status: 'failed', selectedAnswer });
      } else {
        setAttempts(currentAttempt);
        setIsLastAttemptWrong(true);
      }
    }
  };

  const isLocked = status !== 'playing';

  return (
    <div className={`question-box ${status === 'solved' ? 'animate-success' : ''}`}>
      {/* Category Tag: Adds a professional touch if available */}
      {question.category && <span className="category-tag">{question.category}</span>}

      <p className="question-text">{question.question}</p>

      <div className="options-list">
        {[1, 2, 3, 4].map((i) => {
          const isThisOptionSelected = selectedAnswer === i;
          const isActuallyCorrect = correctIndex === i;

          let stateClass = "";
          if (status === 'solved' || status === 'failed') {
            if (isActuallyCorrect) stateClass = "correct-choice";
            else if (isThisOptionSelected && status === 'failed') stateClass = "incorrect-choice";
          } else {
            if (isThisOptionSelected) stateClass = isLastAttemptWrong ? "incorrect-choice" : "selected";
          }

          return (
            <button
              key={i}
              className={`option ${stateClass} ${isLocked ? 'disabled' : ''}`}
              onClick={() => {
                if (!isLocked) {
                  setSelectedAnswer(i);
                  setIsLastAttemptWrong(false);
                }
              }}
              disabled={isLocked}
            >
              <span className="option-label">{String.fromCharCode(64 + i)}</span>
              <span className="option-content">{question[`option_${i}`]}</span>
            </button>
          );
        })}
      </div>

      <div className="interaction-area">
        {status === 'playing' ? (
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
          >
            {/* Show Attempt 1/6, 2/6, etc. */}
            Submit Answer (Attempt {attempts + 1}/{MAX_ATTEMPTS})
          </button>
        ) : (
          <div className={`feedback-card ${status}`}>
            {status === 'solved' ? (
              <p>
                ✨ <strong>Excellent!</strong> Correct in {attempts} {attempts === 1 ? 'attempt' : 'attempts'}.
              </p>
            ) : (
              <p>🏁 <strong>Quiz Over.</strong> Better luck tomorrow!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizQuestionCard;