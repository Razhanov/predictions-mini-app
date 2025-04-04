import React, { useState } from 'react';
import { useMatches } from "./hooks/useMatches.js";
import { useSelectedRound } from "./hooks/useSelectedRound.js";
import './App.css'
import {usePredictions} from "./hooks/usePredictions.js";
import RoundTabs from "./components/RoundTabs.jsx";
import MatchSection from "./components/MatchSection.jsx";
import MenuDropdown from "./components/MenuDropdown.jsx";

function App() {
    const { matches, loading } = useMatches();
    const {
        predictions,
        handleScoreChange
    } = usePredictions();

    const [showUpcoming, setShowUpcoming] = useState(true);
    const [showFinished, setShowFinished] = useState(true);

    const now = Date.now();
    const upcomingMatch = matches.find(m => m.date?.seconds * 1000 > now);
    const lastRound = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b).at(-1);
    const upcomingRound = upcomingMatch?.round ?? lastRound;

    const { selectedRound, setSelectedRound, roundList } = useSelectedRound(matches, upcomingRound);

    const filteredMatches = matches.filter((match) => match.round === selectedRound);
    const upcomingMatches = filteredMatches.filter(match => !match.result);
    const finishedMatches = filteredMatches.filter(match => match.result);

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
                    />
                    <div className="match-list">
                        <MatchSection
                            title="Предстоящие матчи"
                            matches={upcomingMatches}
                            collapsed={showUpcoming}
                            onToggle={() => setShowUpcoming(prev => !prev)}
                            predictions={predictions}
                            onChange={handleScoreChange}
                        />
                        <MatchSection
                            title="Сыгранные матчи"
                            matches={finishedMatches}
                            collapsed={showFinished}
                            onToggle={() => setShowFinished(prev => !prev)}
                            predictions={predictions}
                            onChange={handleScoreChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default App;