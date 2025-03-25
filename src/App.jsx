import { useEffect, useState } from 'react';
import { db} from "./firebase/config.js";
import { collection, getDocs } from "./firebase/firestore.js";

function App() {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const fetchMatches = async () => {
            const querySnapshot = await getDocs(collection(db, "matches"));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}));
            setMatches(data);
        };
        fetchMatches();
    }, []);

    return (
        <div>
            <h1>Прогнозы на матчи</h1>
            {matches.map(match => (
                <div key={match.id}>
                    {match.teamA} vs {match.teamB}
                </div>
            ))}
        </div>
    );
}

export default App;