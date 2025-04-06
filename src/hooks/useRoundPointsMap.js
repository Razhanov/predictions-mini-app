import {useTelegramUser} from "./useTelegramUser.js";
import {useEffect, useState} from "react";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "../firebase/config.js"

export function useRoundPointsMap() {
    const telegramUser = useTelegramUser();
    const [pointsMap, setPointsMap] = useState({});

    useEffect(() => {
        async function fetchPoints() {
            if (!telegramUser?.id) return;

            const q = query(
                collection(db, "roundPoints"),
                where("userId", "==", telegramUser.id),
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
    }, [telegramUser?.id]);

    return pointsMap;
}