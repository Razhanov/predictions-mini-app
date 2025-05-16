import React from "react";
import {useNavigate, useParams} from "react-router-dom";
import './MatchPredictionsPage.css';
import {telegramService} from "../../services/telegram.js";
import MatchHeader from "./MatchHeader.jsx";
import {useMatchPredictions} from "../../hooks/useMatchPredictions.js";
import UserPredictionCard from "./UserPredictionCard.jsx";
import LeaguePredictionSection from "./LeaguePredictionSection.jsx";

function MatchPredictionsPage() {
    const { matchId } = useParams();
    const userId = telegramService.getUserId();
    const { match, myPrediction, leagues } = useMatchPredictions(matchId, userId);
    const navigate = useNavigate();

    if (!match) return <p>Загрузка...</p>;

    return (
        <div className="container">
            <button className="back-button" onClick={() => navigate(-1)}>← Назад</button>
            <MatchHeader match={match} />
            {myPrediction && <UserPredictionCard
                prediction={myPrediction}
                isCurrentUser
                teamA={match.teamA}
                teamB={match.teamB}
                hasResult={!!match.result}
            />}
            {leagues.map(league => (
                <LeaguePredictionSection key={league.id} league={league} match={match} />
            ))}
        </div>
    );
}

export default MatchPredictionsPage;
