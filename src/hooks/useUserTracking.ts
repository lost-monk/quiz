import { useState, useEffect, useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';

export interface QuizStats {
    currentStreak: number;
    maxStreak: number;
    gamesPlayed: number;
    gamesWon: number;
    totalGuesses: number;
    lastRecordedDate?: string;
}

export const useUserTracking = () => {
    const posthog = usePostHog();
    const [isSyncing, setIsSyncing] = useState(true);

    // 1. Initial State from LocalStorage (for immediate UI)
    const [stats, setStats] = useState<QuizStats>(() => {
        const saved = localStorage.getItem('quiz_stats');
        if (saved) return JSON.parse(saved);
        return {
            currentStreak: 0,
            maxStreak: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            totalGuesses: 0
        };
    });

    // 2. PostHog Sync Logic
    useEffect(() => {
        if (!posthog) return;

        // PostHog fetches person properties asynchronously
        posthog.onFeatureFlags(() => {
            const personProps = posthog.get_property('$set'); // Gets properties sent via setPersonProperties
            if (personProps && personProps.gamesPlayed !== undefined) {
                const cloudStats: QuizStats = {
                    currentStreak: Number(personProps.currentStreak || 0),
                    maxStreak: Number(personProps.maxStreak || 0),
                    gamesPlayed: Number(personProps.gamesPlayed || 0),
                    gamesWon: Number(personProps.gamesWon || 0),
                    totalGuesses: Number(personProps.totalGuesses || 0),
                    lastRecordedDate: personProps.lastRecordedDate || ''
                };

                // Compare cloud vs local: usually we trust the one with more gamesPlayed
                const localSaved = localStorage.getItem('quiz_stats');
                const localStats = localSaved ? JSON.parse(localSaved) : stats;

                if (cloudStats.gamesPlayed >= localStats.gamesPlayed) {
                    setStats(cloudStats);
                    localStorage.setItem('quiz_stats', JSON.stringify(cloudStats));
                }
            }
            setIsSyncing(false);
        });
    }, [posthog]);

    // 3. Daily Streak & Visit Logic
    useEffect(() => {
        if (isSyncing) return; // Wait for cloud sync before calculating resets

        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem('lastVisitDate');

        if (lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            const missedADay = lastVisit !== yesterdayStr && lastVisit !== null;

            if (missedADay) {
                setStats(prev => {
                    const updated = { ...prev, currentStreak: 0 };
                    localStorage.setItem('quiz_stats', JSON.stringify(updated));
                    return updated;
                });
            }

            localStorage.setItem('lastVisitDate', today);
            posthog?.setPersonProperties({ last_active: today });
        }
    }, [posthog, isSyncing]);

    // 4. Record Completion
    const recordCompletion = useCallback((isWin: boolean, totalAttempts: number, dateStr: string) => {
        setStats(prev => {
            // STRONG GUARD: If we already have a record for this date, stop immediately.
            if (prev.lastRecordedDate === dateStr) {
                console.log("Stats already recorded for this date, skipping.");
                return prev;
            }

            const newStreak = isWin ? prev.currentStreak + 1 : 0;
            const updated = {
                ...prev,
                gamesPlayed: prev.gamesPlayed + 1,
                gamesWon: isWin ? prev.gamesWon + 1 : prev.gamesWon,
                currentStreak: newStreak,
                maxStreak: Math.max(newStreak, prev.maxStreak),
                totalGuesses: prev.totalGuesses + (isWin ? totalAttempts : 0),
                lastRecordedDate: dateStr
            };

            localStorage.setItem('quiz_stats', JSON.stringify(updated));

            posthog?.capture('quiz_completed', {
                ...updated,
                win_percentage: updated.gamesPlayed > 0 ? Math.round((updated.gamesWon / updated.gamesPlayed) * 100) : 0
            });

            posthog?.setPersonProperties({
                ...updated,
                avg_guesses: updated.gamesWon > 0 ? (updated.totalGuesses / updated.gamesWon).toFixed(1) : 0
            });

            return updated;
        });
    }, [posthog]);

    const winPercentage = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
    const averageGuesses = stats.gamesWon > 0 ? (stats.totalGuesses / stats.gamesWon).toFixed(1) : "0.0";

    return {
        stats,
        isSyncing,
        userStreak: stats.currentStreak,
        recordCompletion,
        winPercentage,
        averageGuesses,
        trackEvent: (name: string, props?: any) => posthog?.capture(name, props)
    };
};