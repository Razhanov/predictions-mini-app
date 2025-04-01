import {addDoc, collection, getDocs, query, serverTimestamp, where} from "firebase/firestore";
import {db} from "../firebase/config.js";


const PREDICTIONS_COLLECTION = "predictions";

async function getPredictionByUser(userId) {
    const q = query(collection(db, PREDICTIONS_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const predictions = {};
    snapshot.forEach((doc) => {
        const { matchId, scoreA, scoreB } = doc.data();
        predictions[matchId] = {
            scoreA: scoreA ?? '',
            scoreB: scoreB ?? ''
        };
    });

    return predictions;
}

async function savePrediction(userId, userName, predictionsObject) {
    const predictionsArray = Object.entries(predictionsObject)
        .filter(([_, value]) =>
            value?.scoreA !== '' &&
            value?.scoreB !== '' &&
            !isNaN(value.scoreA) &&
            !isNaN(value.scoreB)
        )
        .map(([matchId, { scoreA, scoreB }]) => ({
            matchId,
            userId,
            userName,
            scoreA: Number(scoreA),
            scoreB: Number(scoreB),
            updatedAt: serverTimestamp()
        }));

    const batch = predictionsArray.map((doc) => addDoc(collection(db, PREDICTIONS_COLLECTION), doc));
    await Promise.all(batch);
}

export const firebaseService = {
    getPredictionByUser,
    savePrediction
};