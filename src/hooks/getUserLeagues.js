import {collection, doc, getDoc, getDocs, query, where} from "firebase/firestore";
import {db} from "../firebase/config.js";

export async function getUserLeagues(userId) {
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

            const membersSnap = await getDocs(
                query(collection(db, "leagueMembers"), where("leagueId", "==", leagueId))
            );
            const memberUserIds = membersSnap.docs.map(doc => doc.data().userId);

            return {
                id: leagueId,
                name: leagueData.name,
                members: memberUserIds
            };
        })
    );

    return privateLeagues.filter(Boolean);
}