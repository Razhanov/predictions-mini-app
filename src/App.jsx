import React, {useEffect, useState} from 'react';
import { useMatches } from "./hooks/useMatches.js";
import MatchCard from "./components/MatchCard.jsx";
import './App.css'
import {usePredictions} from "./hooks/usePredictions.js";
import RoundTabs from "./components/RoundTabs.jsx";

function App() {
    const { matches, loading } = useMatches();
    const {
        predictions,
        handleScoreChange,
        isReadyToSave
    } = usePredictions();

    const gameweeks = [...new Set(matches.map((m) => m.gameweek))].sort((a, b) => a - b);
    const [selectedGameweek, setSelectedGameweek] = useState(null);

    const now = Date.now();
    const upcomingMatch = matches.find(m => m.date?.seconds * 1000 > now);
    const lastGameweek = gameweeks[gameweeks.length - 1];
    const upcomingGameweek = upcomingMatch?.gameweek ?? lastGameweek;

    useEffect(() => {
        if (!loading && matches.length > 0 && selectedGameweek === null) {
            setSelectedGameweek(upcomingGameweek);
        }
    }, [loading, matches, selectedGameweek, gameweeks]);

    const filteredMatches = matches.filter((match) => match.gameweek === selectedGameweek);

    return (
        <div className="container">
            <h1 className="title">Прогнозы на матчи</h1>
            {loading && <p>Загрузка матчей...</p>}

            {!loading && matches.length === 0 && (
                <p style={{ textAlign: 'center', color: '#777' }}>
                    Матчи скоро появятся ⚽️
                </p>
            )}

            {!loading && matches.length > 0 && (
                <>
                    <RoundTabs
                        rounds={gameweeks}
                        selected={selectedGameweek}
                        onSelect={setSelectedGameweek}
                        current={upcomingGameweek}
                    />
                    <div className="match-list">
                        {filteredMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                value={predictions[match.id]}
                                onChange={(field, value) => handleScoreChange(match.id, field, value)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default App;