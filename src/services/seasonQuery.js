// seasonQuery.js
import { query, where } from "firebase/firestore";

export function withSeason(baseRefOrQuery, { tournamentId, seasonId, extra = [] }) {
    return query(
        baseRefOrQuery,
        where("tournamentId", "==", tournamentId),
        where("seasonId", "==", seasonId),
        ...extra
    );
}
