import React from "react";
import "./UserProfile.css";
import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {getDoc, doc, getFirestore, query, collection, where, getDocs} from "firebase/firestore";

const db = getFirestore();

export default function UserProfile() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        const loadUser = async () => {
            const docId = `epl_2025-26_${userId}`; // Добавить из сервиса
            const docRef = doc(db, "standings", docId);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                setUser(snapshot.data());
            } else {
                console.warn("Профиль не найден в standings");
            }
        };

        const loadRoundsPoints = async () => {
            const q = query(
                collection(db, "roundPoints"),
                where("userId", "==", Number(userId))
            );

            const snap = await getDocs(q);
            const data = snap.docs.map((doc) => {
              const d = doc.data();
              return {
                  round: d.round,
                  points: d.totalPoints
              };
            });

            data.sort((a, b) => a.round - b.round);
            console.log("Загруженные очки по турам:", data);
            setRounds(data);
        };

        const loadPredictions = async () => {
            const q = query(
                collection(db, "predictions"),
                where("userId", "==", Number(userId))
            );

            const snap = await getDocs(q);
            const data = snap.docs.map((doc) => {
                const d = doc.data();
                return {
                    round: d.round ?? null,
                    teamA: d.teamA ?? "–",
                    teamB: d.teamB ?? "–",
                    scoreA: d.scoreA,
                    scoreB: d.scoreB,
                    points: d.points ?? 0
                };
            });

            data.sort((a, b) => a.round - b.round);
            setPredictions(data);
        };

        loadUser();
        loadRoundsPoints();
        loadPredictions();
    }, [userId]);

    if (!user) return <div>Loading...</div>;

    return (
        <div className="user-profile-container">
            <div className="user-profile-header">
                <div>
                    <h2>{user.userName ?? userId}</h2>
                    <p>Очки: {user.totalPoints}</p>
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
                    {predictions.map((item, i) => (
                        <tr key={i}>
                            <td>{item.round}</td>
                            <td>{item.teamA} – {item.teamB}</td>
                            <td>{item.scoreA}:{item.scoreB}</td>
                            <td>{item.points}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}