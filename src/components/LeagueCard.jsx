import React from "react";
import "./LeagueCard.css";

const LeagueCard = ({ league, onClick, isLoading = false }) => {
    return (
        <button
            className={`league-card${isLoading ? " league-card-loading" : ""}`}
            onClick={onClick}
            disabled={isLoading}
            type="button"
        >
            <div className="league-header">
                <div className="league-title">{league.name}</div>
                <div className="view-all">{isLoading ? "Загрузка..." : "Перейти →"}</div>
            </div>
            <div className="league-users">
                {league.topUsers.map((user, index) => (
                    <div className="user-row" key={`${user.id}_${index}`}>
                        <span className="user-place">#{index + 1}</span>
                        <span className="user-name">{user.userName}</span>
                        <span className="user-score">{user.totalPoints} pts</span>
                    </div>
                ))}
            </div>
        </button>
    );
};

export default LeagueCard;
