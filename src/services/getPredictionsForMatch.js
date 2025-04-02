import {collection, getDocs, query, where, getDoc, doc} from "firebase/firestore";
import {db} from "../firebase/config.js";

export async function getPredictionsForMatch(matchId) {
    const ref = collection(db, 'predictions');
    const q = query(ref, where("matchId", "==", matchId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data());
}

export async function getMatchById(matchId) {
    const ref = doc(db, 'matches', matchId);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
}