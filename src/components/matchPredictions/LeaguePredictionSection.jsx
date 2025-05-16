import React, {useState} from "react";
import UserPredictionCard from "./UserPredictionCard.jsx";
import "./LeaguePredictionSection.css";

function LeaguePredictionSection({ league, match }) {
    const [expanded, setExpanded] = useState(false);

    const visiblePredictions = expanded
        ? league.predictions
        : league.predictions.slice(0, 5);

    return (
        <div className="league-section">
            <h4>{league.name}</h4>
            {visiblePredictions.map(prediction => (
                <UserPredictionCard
                    key={prediction.userId}
                    prediction={prediction}
                    teamA={match.teamA}
                    teamB={match.teamB}
                    hasResult={!!match.result}
                />
            ))}
            {league.predictions.length > 5 && (
                <div className="prediction-card show-all-button" onClick={() => setExpanded(!expanded)}>
                    <span className="user-name">
                    {expanded ? "Скрыть" : "Показать все"}
                    </span>
                </div>
            )}
        </div>
    );
}

export default LeaguePredictionSection;
