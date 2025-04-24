import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {getMatchById, getPredictionsForMatch} from "../services/getPredictionsForMatch.js";
import './MatchPredictionsPage.css';
import {calculatePoints} from "../../functions/scoreService.js";

function MatchPredictionsPage() {
    const { matchId } = useParams();
    const navigate = useNavigate();

    const [match, setMatch] = useState(null);
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const [matchData, predictionData] = await Promise.all([
                getMatchById(matchId),
                getPredictionsForMatch(matchId)
            ]);
            setMatch(matchData);
            setPredictions(predictionData);
        }

        fetchData();
    }, [matchId]);

    const hasResult = match?.result && typeof match.result.scoreA === "number";

    return (
        <div className="container">
            <button className="back-button" onClick={() => navigate(-1)}>← Назад</button>
            <h2 className="heading">Прогнозы на матч</h2>
            {match && (
                <p className="match-title">
                    {match.teamA} vs {match.teamB}
                </p>
            )}
            <div className="prediction-list">
                {predictions.map((prediction, index) => {
                    const points = hasResult ? prediction.points : calculatePoints(prediction, {
                        scoreA: match.liveScoreA ?? 0,
                        scoreB: match.liveScoreB ?? 0,
                        firstScorer: match.firstScorer ?? null
                    });
                    return (
                        <div key={index} className="prediction-card">
                            <div className="user-name">{prediction.userName || prediction.userId}</div>
                            <div className="score">
                                {prediction.scoreA}–{prediction.scoreB}
                            </div>
                            <span className="points">
                                ({points ?? "-"} очков{!hasResult && " LIVE"})
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default MatchPredictionsPage;
