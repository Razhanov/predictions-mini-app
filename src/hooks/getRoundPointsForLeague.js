import {collection, doc, getDoc, getDocs, query, where} from "firebase/firestore";
import {db} from "../firebase/config.js";
import {getActiveSeasonId} from "../services/seasonCache.js";

export async function getRoundPointsForLeague(leagueId) {
    const seasonId = await getActiveSeasonId(leagueId || "epl");
    
    const q = query(
        collection(db, "roundPoints"),
        where("leagueId", "==", leagueId),
        where("seasonId", "==", seasonId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRoundPointsForPrivateLeague(leagueId) {
    const leagueDoc = await getDoc(doc(db, "leagues", leagueId));
    if (!leagueDoc.exists()) return [];

    const { tournamentId = "epl" } = leagueDoc.data();
    const seasonId = await getActiveSeasonId(tournamentId);

    const membersSnap = await getDocs(
        query(
            collection(db, "leagueMembers"),
            where("leagueId", "==", leagueId)
        )
    );
    const memberUserIds = membersSnap.docs.map(doc => doc.data().userId);

    if (memberUserIds.length === 0) return [];

    const allPointsSnap = await getDocs(
        query(
            collection(db, "roundPoints"),
            where("leagueId", "==", tournamentId),
            where("seasonId", "==", seasonId)
        )
    );

    return allPointsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(entry => memberUserIds.includes(entry.userId));
}