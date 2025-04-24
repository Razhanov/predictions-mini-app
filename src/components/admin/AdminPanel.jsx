import React, {useEffect, useState} from "react";
import {collection, doc, getDocs, serverTimestamp, setDoc, updateDoc} from "firebase/firestore"
import {db} from "../../firebase/config.js";
import {useNavigate} from "react-router-dom";
import {useIsAdmin} from "../../hooks/useIsAdmin.js";
import {format} from "date-fns";
import "./AdminPanel.css";
import {telegramService} from "../../services/telegram.js";

function AdminPanel() {
    const [matches, setMatches] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [results, setResults] = useState({});

    const [teamA, setTeamA] = useState("");
    const [teamB, setTeamB] = useState("");
    const [round, setRound] = useState("");
    const leagueId = "epl";
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);

    const tgUserId = telegramService.getUserId();
    const isAdmin = useIsAdmin(tgUserId);
    const navigate = useNavigate();

    const fetchMatches = async () => {
        const snapshot = await getDocs(collection(db, "matches"));
        const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMatches(result.sort((a, b) => a.date?.seconds - b.date?.seconds));
    };

    const handleResultChange = (matchId, team, value) => {
        setResults((prevState) => ({
            ...prevState,
            [matchId]: {
                ...prevState[matchId],
                [team]: value
            }
        }));
    };

    const saveResult = async (matchId) => {
        const { scoreA, scoreB, firstScorer } = results[matchId] || {};
        if (scoreA === "" || scoreB === "" || isNaN(scoreA) || isNaN(scoreB)) {
            return alert("Введите корректный счёт");
        }

        const ref = doc(db, "matches", matchId);
        await updateDoc(ref, {
            result: {
                scoreA: Number(scoreA),
                scoreB: Number(scoreB),
                firstScorer: firstScorer
            },
            isFinished: true
        });

        alert("Результат сохранён");
        fetchMatches();
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!teamA || !teamB || !round || !date) return;
        setLoading(true);

        try {
            const matchDate = new Date(date);
            const month = format(matchDate, 'LLLL').toLowerCase();
            const year = matchDate.getFullYear();

            const matchId = `${round}_${teamA.trim().toLowerCase()}_${teamB.trim().toLowerCase()}_${month}_${year}`.replace(/\s+/g, "_");

            const matchRef = doc(db, "matches", matchId);

            await setDoc(matchRef, {
                teamA,
                teamB,
                round: Number(round),
                leagueId,
                isFinished: false,
                date: new Date(date),
                createdAt: serverTimestamp()
            });
            setTeamA("");
            setTeamB("");
            setRound("");
            setDate("");
            alert("Матч успешно создан!");
        } catch (error) {
            console.error("Ошибка при создании матча:", error);
            alert("Ошибка при создании матча.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tgUserId && isAdmin === false) {
            navigate("/");
        }
    }, [isAdmin, tgUserId, navigate]);

    useEffect(() => {
        if (isAdmin) fetchMatches();
    }, [isAdmin]);

    if (!isAdmin) return null;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Управление матчами</h2>
                <div>
                    <button className="exit-button" onClick={() => navigate("/")}>
                        Выйти
                    </button>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Закрыть" : "Создать матч"}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="admin-form">
                    <label>
                        Команда A
                        <input value={teamA} onChange={(e) => setTeamA(e.target.value)} required />
                    </label>

                    <label>
                        Команда B
                        <input value={teamB} onChange={(e) => setTeamB(e.target.value)} required />
                    </label>

                    <label>
                        Дата и время
                        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </label>

                    <label>
                        Тур
                        <input type="number" value={round} onChange={(e) => setRound(e.target.value)} required />
                    </label>

                    <button type="submit" disabled={loading}>
                        {loading ? "Создание..." : "Создать матч"}
                    </button>
                </form>
            )}

            <div className="match-list">
                {matches.map((match) => (
                    <div key={match.id} className="match-item">
                        <strong>{match.teamA} vs {match.teamB}</strong> — Тур {match.round}<br />
                        🕒 {new Date(match.date.seconds * 1000).toLocaleString()}<br />

                        {match.result ? (
                            <span>Результат: {match.result.scoreA}–{match.result.scoreB}</span>
                        ) : (
                            <div className="result-inputs">
                                <input
                                    type="number"
                                    placeholder="A"
                                    value={results[match.id]?.scoreA || ""}
                                    onChange={(e) => handleResultChange(match.id, "scoreA", e.target.value)}
                                />
                                <span>–</span>
                                <input
                                    type="number"
                                    placeholder="B"
                                    value={results[match.id]?.scoreB || ""}
                                    onChange={(e) => handleResultChange(match.id, "scoreB", e.target.value)}
                                />
                                <div className="first-scorer-select">
                                    <label>Кто забил первым:</label>
                                    <select
                                        value={results[match.id]?.firstScorer || ""}
                                        onChange={(e) => handleResultChange(match.id, "firstScorer", e.target.value)}
                                    >
                                        <option value="">— Не выбрано —</option>
                                        <option value="teamA">{match.teamA}</option>
                                        <option value="teamB">{match.teamB}</option>
                                        <option value="none">Никто</option>
                                    </select>
                                </div>
                                <button onClick={() => saveResult(match.id)}>Сохранить</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPanel;
