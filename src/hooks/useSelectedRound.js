import { useEffect, useState } from "react";

export function useSelectedRound(matches, upcomingRound) {
    const roundList = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
    const [selectedRound, setSelectedRound] = useState(null);

    useEffect(() => {
        if (matches.length > 0) {
            const storedRound = sessionStorage.getItem("selectedRound");
            console.log("📦 Получено из sessionStorage:", storedRound);
            const parsedRound = storedRound ? parseInt(storedRound, 10) : null;
            console.log("🔢 Распарсили:", parsedRound);
            console.log("✅ Устанавливаем selectedRound:", parsedRound && roundList.includes(parsedRound) ? parsedRound : upcomingRound);
            setSelectedRound(parsedRound && roundList.includes(parsedRound) ? parsedRound : upcomingRound);
        }
    }, [matches]);

    useEffect(() => {
        if (selectedRound !== null) {
            console.log("💾 Сохраняем selectedRound в sessionStorage:", selectedRound);
            sessionStorage.setItem("selectedRound", selectedRound.toString());
        }
    }, [selectedRound]);

    return { selectedRound, setSelectedRound, roundList };
}