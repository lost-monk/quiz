import React from 'react';

interface UserStatsProps {
    gamesPlayed: number;
    winPercentage: number;
    currentStreak: number;
    maxStreak: number;
    averageGuesses: string;
}

const UserStats: React.FC<UserStatsProps> = ({ 
    gamesPlayed, winPercentage, currentStreak, maxStreak, averageGuesses 
}) => {
    return (
        <div className="stats-dashboard-container">
            <StatBox label="Played" value={gamesPlayed} />
            <StatBox label="Win %" value={`${winPercentage}%`} />
            <StatBox label="Streak" value={currentStreak} />
            <StatBox label="Max" value={maxStreak} />
            <StatBox label="Avg Try" value={averageGuesses} />
        </div>
    );
};

const StatBox = ({ label, value }: { label: string; value: string | number }) => (
    <div className="stat-pill">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
    </div>
);

export default UserStats;