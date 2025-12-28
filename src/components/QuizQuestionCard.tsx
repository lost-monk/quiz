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

  useEffect(() => {
    const init = async () => {
      // Always fetch the correct index from the DB for this question
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
      <p className="question-text">{question.question}</p>

      <div className="options-list">
        {[1, 2, 3, 4].map((i) => {
          const isThisOptionSelected = selectedAnswer === i;
          const isActuallyCorrect = correctIndex === i;
          
          let stateClass = "";

          if (status === 'solved' || status === 'failed') {
            // REVEAL MODE: If the question is over, highlight the right one green
            if (isActuallyCorrect) {
              stateClass = "correct-choice";
            } else if (isThisOptionSelected && status === 'failed') {
              // If this was the user's final wrong pick, keep it red
              stateClass = "incorrect-choice";
            }
          } else {
            // PLAYING MODE
            if (isThisOptionSelected) {
              stateClass = isLastAttemptWrong ? "incorrect-choice" : "selected";
            }
          }

          return (
            <label key={i} className={`option ${stateClass} ${isLocked ? 'disabled' : ''}`}>
              <input 
                type="radio" 
                name={`quiz-${question.id}`} 
                checked={isThisOptionSelected} 
                onChange={() => {
                  if(!isLocked) {
                    setSelectedAnswer(i);
                    setIsLastAttemptWrong(false);
                  }
                }}
                disabled={isLocked}
              />
              {question[`option_${i}`]}
            </label>
          );
        })}
      </div>

      <div className="interaction-area">
        {status === 'playing' ? (
          <button className="submit-button" onClick={handleSubmit} disabled={selectedAnswer === null}>
            Submit Answer (Attempt {attempts + 1}/{MAX_ATTEMPTS})
          </button>
        ) : (
          <div className={`feedback ${status}`}>
            {status === 'solved' ? (
              <p>✅ Correct! Solved in {attempts} attempt(s).</p>
            ) : (
              <p>❌ The correct answer is highlighted in green.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizQuestionCard;