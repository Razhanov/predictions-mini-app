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
        handleScoreChange
    } = usePredictions();

    const round = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
    const [selectedRound, setSelectedRound] = useState(null);

    const [showUpcoming, setShowUpcoming] = useState(true);
    const [showFinished, setShowFinished] = useState(true);

    const now = Date.now();
    const upcomingMatch = matches.find(m => m.date?.seconds * 1000 > now);
    const lastRound = round[round.length - 1];
    const upcomingRound = upcomingMatch?.round ?? lastRound;

    useEffect(() => {
        if (!loading && matches.length > 0) {
            const storedRound = sessionStorage.getItem("selectedRound");
            console.log("📦 Получено из sessionStorage:", storedRound);
            const parsedRound = storedRound ? parseInt(storedRound, 10) : null;
            console.log("🔢 Распарсили:", parsedRound);
            console.log("✅ Устанавливаем selectedRound:", parsedRound && round.includes(parsedRound) ? parsedRound : upcomingRound);
            setSelectedRound(parsedRound && round.includes(parsedRound) ? parsedRound : upcomingRound);
        }
    }, [loading, matches]);

    useEffect(() => {
        if (selectedRound !== null) {
            console.log("💾 Сохраняем selectedRound в sessionStorage:", selectedRound);
            sessionStorage.setItem("selectedRound", selectedRound.toString());
        }
    }, [selectedRound]);

    const filteredMatches = matches.filter((match) => match.round === selectedRound);
    const upcomingMatches = filteredMatches.filter(match => !match.result);
    const finishedMatches = filteredMatches.filter(match => match.result);

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
                        rounds={round}
                        selected={selectedRound}
                        onSelect={setSelectedRound}
                        current={upcomingRound}
                    />
                    <div className="match-list">
                        {upcomingMatches.length > 0 && (
                            <>
                                <h3
                                    className="match-section-title clickable"
                                    onClick={() => setShowUpcoming(prev => !prev)}
                                >
                                    {showUpcoming ? "⬇️ Предстоящие матчи" : "➡️ Предстоящие матчи"}
                                </h3>
                                {showUpcoming && upcomingMatches.map((match) => (
                                    <MatchCard
                                        key={match.id}
                                        match={match}
                                        value={predictions[match.id]}
                                        onChange={(field, value) => handleScoreChange(match.id, field, value)}
                                    />
                                ))}
                            </>
                        )}

                        {finishedMatches.length > 0 && (
                            <>
                                <h3
                                    className="match-section-title clickable"
                                    onClick={() => setShowFinished(prev => !prev)}
                                >
                                    {showFinished ? "⬇️ Сыгранные матчи" : "➡️ Сыгранные матчи"}
                                </h3>
                                {showFinished && finishedMatches.map((match) => (
                                    <MatchCard
                                        key={match.id}
                                        match={match}
                                        value={predictions[match.id]}
                                        onChange={(field, value) => handleScoreChange(match.id, field, value)}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default App;