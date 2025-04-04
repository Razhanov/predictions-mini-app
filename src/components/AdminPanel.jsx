import React, {useEffect, useState} from "react";
import {addDoc, collection, serverTimestamp} from "firebase/firestore"
import {db} from "../firebase/config.js";
import {useTelegramUser} from "../hooks/useTelegramUser.js";
import {useNavigate} from "react-router-dom";
import {useIsAdmin} from "../hooks/useIsAdmin.js";
import "./AdminPanel.css";

function AdminPanel() {
    const [teamA, setTeamA] = useState("");
    const [teamB, setTeamB] = useState("");
    const [round, setRound] = useState("");
    const [leagueId, setLeagueId] = useState("epl");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);

    const telegramUser = useTelegramUser();
    const isAdmin = useIsAdmin(telegramUser?.id);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!teamA || !teamB || !round || !date) return;
        setLoading(true);

        try {
            await addDoc(collection(db, "matches"), {
                teamA,
                teamB,
                round: Number(round),
                leagueId,
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
        if (telegramUser && isAdmin === false) {
            navigate("/");
        }
    }, [isAdmin, telegramUser, navigate]);

    if (!isAdmin) return null;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Создание нового матча</h2>
                <button className="exit-button" onClick={() => navigate("/")}>
                    Выйти
                </button>
            </div>

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
        </div>
    );
}

export default AdminPanel;
