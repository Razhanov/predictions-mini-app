import React from "react";
import "./UserPredictionCard.css";

function UserPredictionCard({ prediction, isCurrentUser = false }) {
    return (
        <div className={`prediction-card ${isCurrentUser ? "my-prediction" : ""}`}>
            <div className="user-name">{prediction.userName ?? prediction.userId}</div>
            <div className="score">{prediction.scoreA} – {prediction.scoreB}</div>
            <div className="points">{prediction.points ?? "0"} очков</div>
        </div>
    );
}

export default UserPredictionCard;
