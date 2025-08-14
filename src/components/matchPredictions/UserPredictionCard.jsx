import React from "react";
import "./UserPredictionCard.css";

function UserPredictionCard({ prediction, isCurrentUser = false, teamA, teamB, hasResult, onClick }) {
    const firstScorerText =
        prediction.firstScorer === "teamA"
            ? `(${teamA})`
            : prediction.firstScorer === "teamB"
            ? `(${teamB})`
            : "(—)";

    const boosted = prediction.isBoosted === true;
    const isLive = !hasResult;

    return (
        <div
            className={`prediction-card ${isCurrentUser ? "my-prediction" : ""}`}
            onClick={() => {
                console.log("Клик на карточку:", prediction.userId);
                onClick(prediction.userId);
            }}
        >
            <div className="user-name">{prediction.userName ?? prediction.userId}</div>
            <div className="score-block">
                <div className="score">{prediction.scoreA} – {prediction.scoreB}</div>
                <div className="first-scorer">{firstScorerText}</div>
            </div>
            <div className="points">
                {prediction.points} очков{isLive ? " LIVE" : ""}
                {boosted && <span className="boost-label">⚡ x2</span>}
            </div>
        </div>
    );
}

export default UserPredictionCard;
