import {collection, doc, getDoc, getDocs, query, where} from "firebase/firestore";
import {db} from "../firebase/config.js";

export async function getRoundPointsForLeague(leagueId) {
    const q = query(collection(db, "roundPoints"), where("leagueId", "==", leagueId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRoundPointsForPrivateLeague(leagueId) {
    const leagueDoc = await getDoc(doc(db, "leagues", leagueId));
    if (!leagueDoc.exists()) return [];

    const { tournamentId } = leagueDoc.data();

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
            where("leagueId", "==", tournamentId ?? "epl")
        )
    );

    return allPointsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(entry => memberUserIds.includes(entry.userId));
}