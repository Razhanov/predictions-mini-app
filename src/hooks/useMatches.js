import { useEffect, useState } from 'react';
import {matchService} from "../services/matchService.js";

export function useMatches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const allMatches = await matchService.getAllMatches();

                setMatches(sortMatches(allMatches));
            } catch (err) {
                console.error("Ошибка загрузки матчей:", err);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return { matches, loading };
}

function sortMatches(matches) {
    return matches.sort((a, b) => {
        const isFinishedA = !!a.result;
        const isFinishedB = !!b.result;

        if (isFinishedA !== isFinishedB) {
            return isFinishedA ? 1 : -1;
        }

        return new Date(a.timestamp) - new Date(b.timestamp);
    });
}