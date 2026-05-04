import React, {useEffect, useState} from "react";
import "./UserProfile.css";
import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {useParams} from "react-router-dom";
import {
    collection,
    documentId,
    getDocs,
    getFirestore,
    query,
    where
} from "firebase/firestore";

const db = getFirestore();
const CURRENT_SEASON_ID = "2025-26";

function toNumberId(userId) {
    const numericId = Number(userId);
    return Number.isNaN(numericId) ? userId : numericId;
}

export default function UserProfile() {
    const { userId } = useParams();
    const normalizedUserId = toNumberId(userId);
    const [user, setUser] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const standingsQuery = query(
                collection(db, "standings"),
                where("leagueId", "==", "epl"),
                where("seasonId", "==", CURRENT_SEASON_ID),
                where("userId", "==", normalizedUserId)
            );

            const snapshot = await getDocs(standingsQuery);
            if (!snapshot.empty) {
                setUser(snapshot.docs[0].data());
                return;
            }

            console.warn("Профиль не найден в standings");
        };

        const loadRoundsPoints = async () => {
            const q = query(
                collection(db, "roundPoints"),
                where("userId", "==", normalizedUserId),
                where("seasonId", "==", CURRENT_SEASON_ID),
                where("leagueId", "==", "epl")
            );

            const snap = await getDocs(q);
            const data = snap.docs.map((entry) => {
                const roundData = entry.data();
                return {
                    round: roundData.round,
                    points: roundData.totalPoints ?? 0
                };
            });

            data.sort((a, b) => a.round - b.round);
            setRounds(data);
        };

        const loadPredictions = async () => {
            const predictionsQuery = query(
                collection(db, "predictions"),
                where("userId", "==", normalizedUserId)
            );

            const predictionSnap = await getDocs(predictionsQuery);
            const rawPredictions = predictionSnap.docs.map((entry) => entry.data());
            const matchIds = [...new Set(rawPredictions.map((prediction) => prediction.matchId).filter(Boolean))];

            let matchesById = {};
            if (matchIds.length > 0) {
                const matchChunks = [];
                for (let i = 0; i < matchIds.length; i += 10) {
                    matchChunks.push(matchIds.slice(i, i + 10));
                }

                const matchDocs = await Promise.all(
                    matchChunks.map((chunk) => getDocs(
                        query(collection(db, "matches"), where(documentId(), "in", chunk))
                    ))
                );

                matchesById = matchDocs.flatMap((chunk) => chunk.docs)
                    .reduce((acc, matchDoc) => {
                        acc[matchDoc.id] = matchDoc.data();
                        return acc;
                    }, {});
            }

            const mappedPredictions = rawPredictions.map((prediction) => {
                const match = matchesById[prediction.matchId] ?? {};
                return {
                    matchId: prediction.matchId,
                    round: match.round ?? null,
                    teamA: match.teamA ?? "–",
                    teamB: match.teamB ?? "–",
                    scoreA: prediction.scoreA,
                    scoreB: prediction.scoreB,
                    points: prediction.points ?? 0
                };
            });

            mappedPredictions.sort((a, b) => {
                if ((a.round ?? 0) !== (b.round ?? 0)) {
                    return (a.round ?? 0) - (b.round ?? 0);
                }
                return String(a.matchId).localeCompare(String(b.matchId));
            });

            setPredictions(mappedPredictions);
        };

        const load = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    loadUser(),
                    loadRoundsPoints(),
                    loadPredictions()
                ]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [normalizedUserId]);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Профиль не найден</div>;

    return (
        <div className="user-profile-container">
            <div className="user-profile-header">
                <div>
                    <h2>{user.userName ?? userId}</h2>
                    <p>Очки: {user.totalPoints ?? 0}</p>
                </div>
            </div>

            <div className="user-profile-section">
                <h3>График по турам</h3>
                <div className="user-profile-chart">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={rounds}>
                            <XAxis dataKey="round" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="points" stroke="#007aff" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="user-profile-section">
                <h3>Прогнозы</h3>
                <table className="user-profile-table">
                    <thead>
                        <tr>
                            <th>Тур</th>
                            <th>Матч</th>
                            <th>Счёт</th>
                            <th>Очки</th>
                        </tr>
                    </thead>
                    <tbody>
                    {predictions.map((item) => (
                        <tr key={item.matchId}>
                            <td>{item.round ?? "—"}</td>
                            <td>{item.teamA} – {item.teamB}</td>
                            <td>{item.scoreA}:{item.scoreB}</td>
                            <td>{item.points}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
