import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {getMatchById, getPredictionsForMatch} from "../services/getPredictionsForMatch.js";

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
        <div style={{ padding: "1rem" }}>
            <button onClick={() => navigate(-1)}>← Назад</button>
            <h2>Прогнозы на матч</h2>
            {match && (
                <p>
                    {match.teamA} vs {match.teamB}
                </p>
            )}
            <div>
                {predictions.map((prediction, index) => (
                    <div key={index} style={{ marginBottom: 10, borderBottom: "1px solid #eee", padding: 8 }}>
                        <strong>{prediction.userName}</strong>: {prediction.scoreA}–{prediction.scoreB}
                        {hasResult && <> ({prediction.points ?? "-"} очков)</>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MatchPredictionsPage;
