import {useEffect, useState} from "react";
import {getStandingsForLeague} from "./getStandingsForLeague.js";
import {collection, getDoc, getDocs, query, where, doc} from "firebase/firestore";
import {db} from "../firebase/config.js";
import {getStandingsForPrivateLeague} from "./getStandingsForPrivateLeague.js";
import {PUBLIC_LEAGUES} from "../constants/leagues.js";

export const useLeaguesWithTopUsers = (userId) => {
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeagues = async () => {
            try {
                setLoading(true);
                setError(null);

                const publicLeagues = await Promise.all(
                    PUBLIC_LEAGUES.map(async league => {
                        const standings = await getStandingsForLeague(league.id);
                        return {
                            ...league,
                            topUsers: standings.slice(0, 3)
                        };
                    })
                );

                if (!userId) {
                    setLeagues(publicLeagues);
                    return;
                }

                const leagueMemberQuery = query(
                    collection(db, "leagueMembers"),
                    where("userId", "==", userId)
                );

                const leagueMemberSnap = await getDocs(leagueMemberQuery);

                const privateLeagues = await Promise.all(
                    leagueMemberSnap.docs.map(async (memberDoc) => {
                        const { leagueId } = memberDoc.data();

                        const leagueRef = doc(db, "leagues", leagueId);
                        const leagueDoc = await getDoc(leagueRef);
                        if (!leagueDoc.exists()) return null;

                        const leagueData = leagueDoc.data();
                        const standings = await getStandingsForPrivateLeague(leagueId);

                        return {
                            id: leagueId,
                            name: leagueData.name,
                            type: leagueData.type || "private",
                            topUsers: standings.slice(0, 3)
                        };
                    })
                );

                setLeagues([
                    ...publicLeagues,
                    ...privateLeagues.filter(Boolean)
                ]);
            } catch (error) {
                console.error("Ошибка при загрузке лиг:", error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeagues();
    }, [userId]);

    return { leagues, loading, error };
};
