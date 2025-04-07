import {collection, getDocs} from "firebase/firestore";
import {db} from "../firebase/config.js";

export const getStandingsForPrivateLeague = async (leagueId) => {
    const usersRef = collection(db, `leagueStandings/${leagueId}/users`);
    const snapshot = await getDocs(usersRef);

    const standings = snapshot.docs.map(doc => doc.data());

    return standings.sort((a, b) => b.totalPoints - a.totalPoints );
};