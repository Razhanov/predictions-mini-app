import { useEffect, useState } from 'react';
import {collection, getDocs, getFirestore} from 'firebase/firestore';
import { db } from "../firebase/config.js";

export function useMatches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "matches"));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMatches(data);
                setLoading(false);
            } catch (err) {
                console.error("Ошибка загрузки матчей:", err);
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    return { matches, loading };
}