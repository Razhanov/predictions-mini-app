import {collection, getDocs, query, orderBy, where, doc, setDoc, updateDoc} from "firebase/firestore";
import { db } from '../firebase/config.js';
import { getActiveSeasonId } from "./seasonCache.js";

const MATCHES_COLLECTION = 'matches';

async function getAllMatches(tournamentId = "epl") {
    const seasonId = await getActiveSeasonId(tournamentId);

    console.log("seasonId: ", seasonId);
    const q = query(
        collection(db, MATCHES_COLLECTION),
        where("tournamentId", "==", tournamentId),
        where("seasonId", "==", seasonId),
        // orderBy("date", "asc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

function buildMatchId({ round, teamA, teamB, date }) {
    const d = new Date(date);
    const month = d.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const year = d.getFullYear();
    return `${round}_${teamA.trim().toLowerCase()}_${teamB.trim().toLowerCase()}_${month}_${year}`.replace(/\s+/g, "_");
}

async function createMatch({ teamA, teamB, round, date }, tournamentId = "epl") {
    const seasonId = await getActiveSeasonId(tournamentId);
    const matchId = buildMatchId({ round, teamA, teamB, date });

    const ref = doc(db, "matches", matchId);
    await setDoc(ref, {
        teamA,
        teamB,
        round: Number(round),
        tournamentId,
        seasonId,
        isFinished: false,
        date: new Date(date),
        createdAt: new Date()
    }, { merge: false });

    return matchId;
}

async function saveResult(matchId, { scoreA, scoreB, firstScorer }) {
    const ref = doc(db, "matches", matchId);
    await updateDoc(ref, {
        result: {
            scoreA: Number(scoreA),
            scoreB: Number(scoreB),
            firstScorer: firstScorer || null
        },
        isFinished: true
    });
}

export const matchService = {
    getAllMatches,
    createMatch,
    saveResult
};