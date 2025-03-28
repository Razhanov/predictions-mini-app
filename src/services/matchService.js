import {collection, getDocs, query, orderBy} from "firebase/firestore";
import { db } from '../firebase/config.js';

const MATCHES_COLLECTION = 'matches';

async function getAllMatches() {
    const q = query(collection(db, MATCHES_COLLECTION), orderBy('date'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

export const matchService = {
    getAllMatches
};