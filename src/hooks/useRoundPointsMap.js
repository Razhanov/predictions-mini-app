import {useEffect, useState} from "react";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "../firebase/config.js"
import {telegramService} from "../services/telegram.js";

export function useRoundPointsMap() {
    const tgUserId = telegramService.getUserId();
    const [pointsMap, setPointsMap] = useState({});

    useEffect(() => {
        async function fetchPoints() {
            if (!tgUserId) return;

            const q = query(
                collection(db, "roundPoints"),
                where("userId", "==", tgUserId),
                where("leagueId", "==", "epl")
            )
            const snap = await getDocs(q);
            const map = {};

            snap.forEach((doc) => {
                const data = doc.data();
                console.log("totalPoints", data.totalPoints);
                map[data.round] = data.totalPoints ?? 0;
            })
            console.log("map", map);
            setPointsMap(map);
        }

        fetchPoints();
    }, [tgUserId]);

    return pointsMap;
}