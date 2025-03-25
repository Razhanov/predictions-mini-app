console.log('App loaded');
import { useEffect, useState } from 'react';
import MatchCard from "./components/MatchCard.jsx";
import './App.css'

const tg = window.Telegram.WebApp;

const dummyMatches = [
    { id: "1", teamA: 'Arsenal', teamB: 'Chelsea' },
    { id: "2", teamA: 'Barcelona', teamB: 'Real Madrid' }
];

function App() {
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
            <div className="match-list">
                {dummyMatches.map((match) => (
                    <MatchCard
                        key={match.id}
                        match={match}
                        value={predictions[match.id]}
                        onChange={handleScoreChange}
                    />
                ))}
            </div>
        </div>
    );
}

export default App;