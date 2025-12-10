import {collection, getDocs, query, where, getDoc, doc} from "firebase/firestore";
import {db} from "../firebase/config.js";
import {getActiveSeasonId} from "../services/seasonCache.js";

export const getStandingsForPrivateLeague = async (leagueId) => {
    // узнаём, к какому турниру привязана приватная лига
    const leagueSnap = await getDoc(doc(db, "leagues", leagueId));
    const tournamentId = leagueSnap.exists() ? (leagueSnap.data().tournamentId || "epl") : "epl";

    // берём активный сезон этого турнира
    const seasonId = await getActiveSeasonId(tournamentId);

    const usersRef = collection(db, `leagueStandings/${leagueId}/users`);

    let snap = await getDocs(query(usersRef, where("seasonId", "==", seasonId)));

    if (snap.empty) snap = await getDocs(usersRef);

    const rows = snap.docs.map(d => {
        const data = d.data();
        return {
            userId: data.userId,
            userName: data.userName || String(data.userId),
            totalPoints: data.totalPoints || 0,
        };
    });

    // сортировка здесь, чтобы не требовать композитного индекса
    rows.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    return rows;
};