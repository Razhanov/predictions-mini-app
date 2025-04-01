import React from "react";
import "./StandingsTable.css"

const StandingsTable = ({ league, standings, onBack }) => {
    const sorted = standings
        .slice()
        .sort((a, b) => b.totalPoints - a.totalPoints);

    return (
        <div className="standings-container">
            <button className="back-button" onClick={onBack}>← Назад</button>
            <h2 className="standings-title">Таблица — {league.name}</h2>
            <div className="standings-table">
                {sorted.map((user, index) => (
                    <div className="standings-row" key={user.userId}>
                        <span className="place">#{index + 1}</span>
                        <span className="name">{user.name || user.userId}</span>
                        <span className="points">{user.totalPoints} pts</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StandingsTable;
