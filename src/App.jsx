import React from 'react';
import { useEffect, useState } from 'react';
import { useMatches } from "./hooks/useMatches.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from './firebase/config.js';
import MatchCard from "./components/MatchCard.jsx";
import './App.css'

const tg = window.Telegram.WebApp;

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

        tg.MainButton.offClick();
        tg.MainButton.onClick(handleSave());

        return () => {
            tg.MainButton.offClick();
        };
    }, [predictions]);

    const handleSave = async () => {
        const userId = tg.initDataUnsafe?.user?.id;

        if (!userId) {
            alert("Ошибка: не удалось получить Telegram ID");
            return;
        }

        try {
            const predictionssArray = Object.entries(predictions).map(
                ([matchId, {scoreA, scoreB}]) => ({
                    matchId,
                    scoreA: Number(scoreA),
                    scoreB: Number(scoreB),
                    userId,
                    createdAt: serverTimestamp()
                })
            );

            const batchSaves = predictionssArray.map((prediction) =>
                addDoc(collection(db, "predictions"), prediction)
            );

            await Promise.all(batchSaves);

            tg.showAlert("Прогнозы сохранены ✅");
        } catch (err) {
            console.error("Ошибка при сохранении:", err);
            tg.showAlert("Ошибка при сохранении прогнозов ❌");
        }
    }

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