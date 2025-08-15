// seasonCache.js
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase/config.js";

const KEY = "activeSeason";
let inMemory = null; // кэш в рамках жизни вкладки

export async function getActiveSeasonId(tournamentId = "epl") {
    if (inMemory) return inMemory;

    const saved = localStorage.getItem(`${KEY}_${tournamentId}`);
    if (saved) {
        inMemory = saved;
        return inMemory;
    }

    const snap = await getDocs(query(
        collection(db, "seasons"),
        where("tournamentId", "==", tournamentId),
        where("isActive", "==", true),
        limit(1)
    ));
    const seasonId = snap.docs[0]?.data()?.seasonId || null;
    if (!seasonId) throw new Error("Active season not found");

    inMemory = seasonId;
    localStorage.setItem(`${KEY}_${tournamentId}`, seasonId);
    return seasonId;
}

export function clearSeasonCache(tournamentId = "epl") {
    localStorage.removeItem(`${KEY}_${tournamentId}`);
    inMemory = null;
}
