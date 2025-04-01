import {setDoc, doc, collection, getDocs, query, serverTimestamp, where} from "firebase/firestore";
import {db} from "../firebase/config.js";


const PREDICTIONS_COLLECTION = "predictions";

async function getPredictionByUser(userId) {
    const q = query(collection(db, PREDICTIONS_COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const predictions = {};
    snapshot.forEach((doc) => {
        const { matchId, scoreA, scoreB, points } = doc.data();
        predictions[matchId] = {
            scoreA: scoreA ?? '',
            scoreB: scoreB ?? '',
            points: points ?? null
        };
    });

    return predictions;
}

async function savePrediction(userId, userName, predictionsObject) {
    const batch = Object.entries(predictionsObject)
        .filter(([_, value]) =>
            value?.scoreA !== '' &&
            value?.scoreB !== '' &&
            !isNaN(value.scoreA) &&
            !isNaN(value.scoreB)
        )
        .map(async ([matchId, { scoreA, scoreB }]) => {
            const ref = doc(db, PREDICTIONS_COLLECTION, `${userId}_${matchId}`);
            await setDoc(ref, {
                matchId,
                userId,
                userName,
                scoreA: Number(scoreA),
                scoreB: Number(scoreB),
                updatedAt: serverTimestamp()
            }, { merge: true });
        });

    await Promise.all(batch);
}

export const firebaseService = {
    getPredictionByUser,
    savePrediction
};