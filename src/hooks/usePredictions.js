import { useEffect, useRef, useState } from "react";
import {firebaseService} from "../services/firebase.js";
import {telegramService} from "../services/telegram.js";

function isValidPrediction(prediction) {
    return prediction &&
        prediction.scoreA !== '' &&
        prediction.scoreB !== '' &&
        !isNaN(prediction.scoreA) &&
        !isNaN(prediction.scoreB);
}

export function usePredictions() {
    const [predictions, setPredictions] = useState({});
    const [initialPredictions, setInitialPredictions] = useState({});
    const predictionsRef = useRef(predictions);

    useEffect(() => {
        telegramService.readyWebApp();
        telegramService.setMainButton();
        telegramService.setMainButtonClickHandler(handleSave);
        void fetchUserPredictions();

        return () => {
            telegramService.setMainButtonClickHandler(() => {});
        };
    }, []);

    const updateMainButtonVisibility = (updated) => {
        const hasChanges = Object.keys(updated).some((matchId) => {
            const currentPrediction = updated[matchId];
            const initialPrediction = initialPredictions[matchId] ?? {};
            return currentPrediction?.scoreA !== initialPrediction.scoreB ||
                currentPrediction?.scoreB !== initialPrediction.scoreB ||
                currentPrediction?.firstScorer !== initialPrediction.firstScorer;
        });

        const hasValid = Object.values(updated).some(isValidPrediction);

        if (hasChanges && hasValid) {
            telegramService.showMainButton();
        } else {
            telegramService.hideMainButton();
        }
    };

    const handleSave = async () => {
        const userId = telegramService.getUserId();
        const userName = telegramService.getUserName();
        const currentPredictions = predictionsRef.current;

        if (!userId) {
            alert('Ошибка: не удалось получить Telegram ID');
            return;
        }

        try {
            await firebaseService.savePrediction(userId, userName, currentPredictions);
            telegramService.showAlert('Прогнозы сохранены ✅');
            telegramService.hideMainButton();
        } catch (err) {
            console.error("Ошибка при сохранении:", err);
            telegramService.showAlert('Ошибка при сохранении прогнозов ❌');
        }
    };

    const fetchUserPredictions = async () => {
        const userId = telegramService.getUserId();
        if (!userId) return;

        try {
            const initialPredictions = await firebaseService.getPredictionByUser(userId);
            setPredictions(initialPredictions);
            setInitialPredictions(initialPredictions);
        } catch (error) {
            console.error('Ошибка при загрузке прогнозов:', error);
        }
    };

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
            updateMainButtonVisibility(updated);
            return updated;
        });
    };

    return {
        predictions,
        handleScoreChange,
        savePredictions: handleSave,
        isReadyToSave: Object.keys(predictions).length > 0
    };
}