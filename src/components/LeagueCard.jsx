import React from "react";
import "./LeagueCard.css";

const LeagueCard = ({ league, onClick }) => {
    return (
        <div className="league-card" onClick={onClick}>
            <div className="league-header">
                <div className="league-title">{league.name}</div>
                <div className="view-all">Перейти →</div>
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
        </div>
    );
};

export default LeagueCard;