import React, {useMemo, useState} from 'react';
import { useMatches } from "./hooks/useMatches.js";
import { useSelectedRound } from "./hooks/useSelectedRound.js";
import './App.css'
import {usePredictions} from "./hooks/usePredictions.js";
import RoundTabs from "./components/RoundTabs.jsx";
import MatchSection from "./components/MatchSection.jsx";
import MenuDropdown from "./components/MenuDropdown.jsx";
import {useRoundPointsMap} from "./hooks/useRoundPointsMap.js";

function App() {
    const { matches, loading } = useMatches();
    const {
        predictions,
        handleScoreChange
    } = usePredictions();
    const roundPointsMap = useRoundPointsMap();

    const [showUpcoming, setShowUpcoming] = useState(true);
    const [showFinished, setShowFinished] = useState(true);

    const { selectedRound, setSelectedRound, roundList, upcomingRound } = useSelectedRound(matches);

    const filteredMatches = useMemo(() => {
        return matches.filter((match) => match.round === selectedRound);
    }, [matches, selectedRound]);

    const { upcomingMatches, finishedMatches } = filteredMatches.reduce((acc, match) => {
        if (match.result) {
            acc.finishedMatches.push(match);
        } else {
            acc.upcomingMatches.push(match);
        }
        return acc;
    }, { upcomingMatches: [], finishedMatches: [] });

    const allMatches = useMemo(() => [...upcomingMatches, ...finishedMatches], [upcomingMatches, finishedMatches]);

    const boostedMatch = useMemo(() => {
        return Object.entries(predictions).find(([_, value]) => value?.isBoosted);
    }, [predictions]);

    const boostedMatchId = boostedMatch?.[0] ?? null;

    const boostedMatchStarted = useMemo(() => {
        if (!boostedMatchId) return false;

        const match = allMatches.find(m => m.id === boostedMatchId);
        if (!match?.date) return false;

        const start = match.date instanceof Date
            ? match.date.getTime()
            : (match.date.seconds ?? 0) * 1000;

        return start <= Date.now();
    }, [boostedMatchId, allMatches]);

    const boostAvailabilityMap = useMemo(() => {
        const map = {};
        const now = Date.now();

        allMatches.forEach((match) => {
            const matchStart = match.date instanceof Date
                ? match.date.getTime()
                : (match.date?.seconds ?? 0) * 1000;

            const thisMatchStarted = matchStart <= now;
            const isThisMatchBoosted = boostedMatchId === match.id;
            const disabled = thisMatchStarted || (!isThisMatchBoosted && boostedMatchId && boostedMatchStarted);

            map[match.id] = {
                disabled,
                isThisMatchBoosted
            };
        });

        return map;
    }, [allMatches, boostedMatchId, boostedMatchStarted]);

    return (
        <div className="container">
            <div className="app-header">
                <h1 className="title">Прогнозы на матчи</h1>
                <MenuDropdown />
            </div>
            {loading && <p>Загрузка матчей...</p>}

                {!loading && matches.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#777' }}>
                        Матчи скоро появятся ⚽️
                    </p>
                )}

            {!loading && matches.length > 0 && (
                <>
                    <RoundTabs
                        rounds={roundList}
                        selected={selectedRound}
                        onSelect={setSelectedRound}
                        current={upcomingRound}
                        pointsMap={roundPointsMap}
                    />
                    <div className="match-list">
                        <MatchSection
                            title="Предстоящие матчи"
                            matches={upcomingMatches}
                            collapsed={showUpcoming}
                            onToggle={() => setShowUpcoming(prev => !prev)}
                            predictions={predictions}
                            onChange={handleScoreChange}
                            boostAvailabilityMap={boostAvailabilityMap}
                        />
                        <MatchSection
                            title="Сыгранные матчи"
                            matches={finishedMatches}
                            collapsed={showFinished}
                            onToggle={() => setShowFinished(prev => !prev)}
                            predictions={predictions}
                            onChange={handleScoreChange}
                            boostAvailabilityMap={boostAvailabilityMap}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default App;