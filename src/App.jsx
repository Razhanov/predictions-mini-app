import React, {useRef} from 'react';
import { useEffect, useState } from 'react';
import { useMatches } from "./hooks/useMatches.js";
import { collection, query, where, setDoc, doc, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from './firebase/config.js';
import MatchCard from "./components/MatchCard.jsx";
import './App.css'

const tg = window.Telegram.WebApp;

function App() {
    const { matches, loading } = useMatches();
    const [predictions, setPredictions] = useState({});
    const predictionsRef = useRef(predictions);

    useEffect(() => {
        predictionsRef.current = predictions;

        tg.ready();
        tg.expand();

        tg.MainButton.setParams({ text: 'Сохранить прогнозы' });

        if (Object.keys(predictions).length > 0) {
            tg.MainButton.show();
        } else {
            tg.MainButton.hide();
        }

        tg.MainButton.offClick();
        tg.MainButton.onClick(handleSave);

        const fetchUserPredictions = async () => {
            const userId = tg.initDataUnsafe?.user?.id;
            if (!userId) return;

            try {
                const q = query(
                    collection(db, "predictions"),
                    where("userId", "==", userId)
                );
                const snapshot = await getDocs(q);

                const initialPredictions = {};
                snapshot.forEach((doc) => {
                    const { matchId, scoreA, scoreB } = doc.data();
                    initialPredictions[matchId] = {
                        scoreA: scoreA ?? "",
                        scoreB: scoreB ?? ""
                    };
                });
                setPredictions(initialPredictions);
            } catch (error) {
                console.error("Ошибка при загрузке прогнозов:", error);
            }
        };

        fetchUserPredictions();

        return () => {
            tg.MainButton.offClick();
        };
    }, []);

    const handleSave = async () => {
        const userId = tg.initDataUnsafe?.user?.id;
        const currentPredictions = predictionsRef.current;

        const predictionsArray = Object.entries(currentPredictions)
            .filter(([_, value]) =>
                value?.scoreA !== '' &&
                value?.scoreB !== '' &&
                !isNaN(value.scoreA) &&
                !isNaN(value.scoreB)
            )
            .map(([matchId, { scoreA, scoreB }]) => ({
                docId: `${userId} ${matchId}`,
                data: {
                    matchId,
                    userId,
                    scoreA: Number(scoreA),
                    scoreB: Number(scoreB),
                    updatedAt: serverTimestamp()
                }
            }));

        if (!userId) {
            alert("Ошибка: не удалось получить Telegram ID");
            return;
        }

        if (predictionsArray.length === 0) {
            tg.showAlert("Введите хотя бы один прогноз 🙏");
            return;
        }

        try {
            const batch = predictionsArray.map((doc) =>
                addDoc(collection(db, "predictions"), doc)
            );

            await Promise.all(batch);

            tg.showAlert("Прогнозы сохранены ✅");
        } catch (err) {
            console.error("Ошибка при сохранении:", err);
            tg.showAlert("Ошибка при сохранении прогнозов ❌");
        }
    }

    const handleScoreChange = (matchId, field, value) => {
        setPredictions(prev => {
            const updated = {
                ...prev,
                [matchId]: {
                    ...prev[matchId],
                    [field]: value
                }
            }

            predictionsRef.current = updated;
            return updated;
        });
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