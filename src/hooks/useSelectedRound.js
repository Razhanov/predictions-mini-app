import {useEffect, useMemo, useState} from "react";

export function useSelectedRound(matches) {
    const roundList = useMemo(() => {
        return [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
    }, [matches]);

    const now = Date.now();

    const upcomingMatch = useMemo(() => {
        return matches.find(m => m.date?.seconds * 1000 > now);
    }, [matches]);

    const lastRound = useMemo(() => {
        return roundList.at(-1);
    }, [roundList]);

    const upcomingRound = useMemo(() => {
        return upcomingMatch?.round ?? lastRound;
    }, [upcomingMatch, lastRound]);

    const [selectedRound, setSelectedRound] = useState(null);

    useEffect(() => {
        if (matches.length > 0) {
            const storedRound = sessionStorage.getItem("selectedRound");
            console.log("📦 Получено из sessionStorage:", storedRound);
            const parsedRound = storedRound ? parseInt(storedRound, 10) : null;
            console.log("🔢 Распарсили:", parsedRound);
            const roundToUse = parsedRound && roundList.includes(parsedRound) ? parsedRound : upcomingRound;
            console.log("✅ Устанавливаем selectedRound:", roundToUse);
            setSelectedRound(roundToUse);
        }
    }, [matches, roundList, upcomingRound]);

    useEffect(() => {
        if (selectedRound !== null) {
            console.log("💾 Сохраняем selectedRound в sessionStorage:", selectedRound);
            sessionStorage.setItem("selectedRound", selectedRound.toString());
        }
    }, [selectedRound]);

    return { selectedRound, setSelectedRound, roundList, upcomingRound, lastRound };
}