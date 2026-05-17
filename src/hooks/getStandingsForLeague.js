import {collection, getDocs, getFirestore, orderBy, query, where} from "firebase/firestore";
import {getActiveSeasonId} from "../services/seasonCache.js";

const db = getFirestore();

export async function getStandingsForLeague(leagueId) {
    const seasonId = await getActiveSeasonId(leagueId || "epl");
    const standingsRef = collection(db, "standings");
    const q = query(
        standingsRef,
        where("leagueId", "==", leagueId),
        where("seasonId", "==", seasonId),
        orderBy("totalPoints", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        userId: doc.data().userId,
        userName: doc.data().userName || doc.data().userId,
        totalPoints: doc.data().totalPoints || 0
    }));
}