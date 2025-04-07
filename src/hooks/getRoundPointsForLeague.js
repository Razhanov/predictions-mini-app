import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "../firebase/config.js";

export async function getRoundPointsForLeague(leagueId) {
    const q = query(collection(db, "roundPoints"), where("leagueId", "==", leagueId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}