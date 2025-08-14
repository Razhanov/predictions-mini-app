import {setDoc, doc, collection, getDocs, query, serverTimestamp, where} from "firebase/firestore";
import {db} from "../firebase/config.js";


const PREDICTIONS_COLLECTION = "predictions";

async function getPredictionByUser(userId) {
    const q = query(collection(db, PREDICTIONS_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const predictions = {};
    snapshot.forEach((doc) => {
        const { matchId, scoreA, scoreB, points, firstScorer, isBoosted } = doc.data();
        predictions[matchId] = {
            scoreA: scoreA ?? '',
            scoreB: scoreB ?? '',
            points: points ?? null,
            firstScorer: firstScorer ?? null,
            isBoosted: isBoosted ?? false,
            matchId: matchId,
            userId: userId
        };
    });

    return predictions;
}

async function savePrediction(userId, userName, predictionsObject) {
    const previousPredictions = await getPredictionByUser(userId);

    const batch = Object.entries(predictionsObject)
        .filter(([matchId, value]) => {
            if (!value) return false;

            const hasScore = !isNaN(value.scoreA) || !isNaN(value.scoreB);
            const hasFirstScorer = value.firstScorer !== undefined && value.firstScorer !== null;
            const hasBoost = value.isBoosted === true;

            if (!hasScore && !hasFirstScorer && !hasBoost) return false;

            const prev = previousPredictions[matchId];

            return (
                !prev ||
                prev.scoreA !== Number(value.scoreA) ||
                prev.scoreB !== Number(value.scoreB) ||
                prev.firstScorer !== value.firstScorer ||
                prev.isBoosted !== value.isBoosted);
        })
        .map(async ([matchId, { scoreA, scoreB, firstScorer, isBoosted }]) => {
            const ref = doc(db, PREDICTIONS_COLLECTION, `${userId}_${matchId}`);

            const prediction = {
                matchId,
                userId,
                userName,
                updatedAt: serverTimestamp()
            };

            if (scoreA !== '' && !isNaN(scoreA)) prediction.scoreA = Number(scoreA);
            if (scoreB !== '' && !isNaN(scoreB)) prediction.scoreB = Number(scoreB);
            if (firstScorer !== undefined) prediction.firstScorer = firstScorer;
            if (isBoosted !== undefined) prediction.isBoosted = isBoosted;

            console.log(`💾 Сохраняем прогноз на матч ${matchId}:`, prediction);

            await setDoc(ref, prediction, { merge: true });
        });

    await Promise.all(batch);
}

export const firebaseService = {
    getPredictionByUser,
    savePrediction
};