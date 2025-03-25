import React from 'react';
import { useEffect, useState } from 'react';
import { useMatches} from "./hooks/useMatches.js";
console.log('useMatches ===>', useMatches);
import MatchCard from "./components/MatchCard.jsx";
import './App.css'

const tg = window.Telegram.WebApp;

// const dummyMatches = [
//     { id: "1", teamA: 'Arsenal', teamB: 'Chelsea' },
//     { id: "2", teamA: 'Barcelona', teamB: 'Real Madrid' }
// ];

function App() {
    const { matches, loading } = useMatches();
    const [predictions, setPredictions] = useState({});

    useEffect(() => {
        tg.ready();
        tg.expand();

        tg.MainButton.setParams({ text: 'Сохранить прогнозы' });

        if (Object.keys(predictions).length > 0) {
            tg.MainButton.show();
        } else {
            tg.MainButton.hide();
        }

        tg.MainButton.onClick(() => {
            tg.sendData(JSON.stringify(predictions));
        });

        return () => {
            tg.MainButton.offClick();
        };
    }, [predictions]);

    const handleScoreChange = (matchId, field, value) => {
        setPredictions(prev => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                [field]: value
            }
        }));
    }

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
                <div className="match-list">
                    {matches.map((match) => (
                        <MatchCard
                            key={match.id}
                            match={match}
                            value={predictions[match.id]}
                            onChange={(field, value) => handleScoreChange(match.id, field, value)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;