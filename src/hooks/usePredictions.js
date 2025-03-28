import { useEffect, useRef, useState } from "react";
import {firebaseService} from "../services/firebase.js";
import {telegramService} from "../services/telegram.js";

export function usePredictions() {
    const [predictions, setPredictions] = useState({});
    const predictionsRef = useRef(predictions);

    useEffect(() => {
        predictionsRef.current = predictions;

        telegramService.readyWebApp();
        telegramService.setMainButton();
        updateMainButtonVisibility();

        telegramService.setMainButtonClickHandler(handleSave);
        void fetchUserPredictions();

        return () => {
            telegramService.setMainButtonClickHandler(() => {});
        };
    }, [predictions]);

    const updateMainButtonVisibility = () => {
        if (Object.keys(predictions).length > 0) {
            telegramService.showMainButton();
        } else {
            telegramService.hideMainButton();
        }
    };

    const handleSave = async () => {
        const userId = telegramService.getUserId();
        const currentPredictions = predictionsRef.current;

        if (!userId) {
            alert('Ошибка: не удалось получить Telegram ID');
            return;
        }

        try {
            await firebaseService.savePrediction(userId, currentPredictions);
            telegramService.showAlert('Прогнозы сохранены ✅');
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