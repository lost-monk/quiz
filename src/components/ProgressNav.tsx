import React from "react";

interface ProgressNavProps {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  quizProgress: any[];
}

const ProgressNav: React.FC<ProgressNavProps> = ({ currentIndex, setCurrentIndex, quizProgress }) => {
  return (
    <div className="progress-navigation">
      {Array.from({ length: 6 }).map((_, i) => {
        const isCurrent = currentIndex === i;
        const progress = quizProgress[i];
        const statusClass = progress ? progress.status : 'unsolved';

        return (
          <button
            key={i}
            // Combining the original classes: dot + active/inactive + status
            className={`dot ${isCurrent ? 'active' : 'inactive'} ${statusClass}`}
            onClick={() => setCurrentIndex(i)}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
};

export default ProgressNav;