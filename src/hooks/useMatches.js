import { useEffect, useState } from 'react';
import {matchService} from "../services/matchService.js";

export function useMatches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const allMatches = await matchService.getAllMatches();

                setMatches(allMatches);
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