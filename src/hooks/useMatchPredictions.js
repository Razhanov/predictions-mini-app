import {useEffect, useState} from 'react';
import {getMatchById, getPredictionsForMatch} from "../services/getPredictionsForMatch.js";
import {getUserLeagues} from "./getUserLeagues.js";
import {calculatePoints} from "../../functions/scoreService.js";

export function useMatchPredictions(matchId, userId) {
    const [match, setMatch] = useState(null);
    const [myPrediction, setMyPrediction] = useState(null);
    const [leagues, setLeagues] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const [matchData, allPredictions, userLeagues] = await Promise.all([
                getMatchById(matchId),
                getPredictionsForMatch(matchId),
                getUserLeagues(userId)
            ]);

            setMatch(matchData);
            const userPrediction = allPredictions.find(pred => String(pred.userId) === String(userId));
            setMyPrediction(userPrediction);

            const leagueSections = userLeagues.map((league) => {
                const leaguePredictions = allPredictions
                    .filter(prediction => league.members.includes(prediction.userId) && prediction.userId !== userId)
                    .map(prediction => ({
                        ...prediction,
                        points: matchData?.result
                            ? prediction.points
                            : calculatePoints(prediction, {
                                scoreA: matchData.liveScoreA ?? 0,
                                scoreB: matchData.liveScoreB ?? 0,
                                firstScorer: matchData.firstScorer ?? null
                            })
                    }))
                    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))

                return leaguePredictions.length > 0
                    ? { id: league.id, name: league.name, predictions: leaguePredictions }
                    : null;
            });

            setLeagues(leagueSections.filter(Boolean));
        }

        fetchData();
    }, [matchId, userId]);

    return { match, myPrediction, leagues };
}