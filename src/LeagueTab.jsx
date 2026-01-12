import React, {useState} from "react";
import {getStandingsForLeague} from "./hooks/getStandingsForLeague.js";
import StandingsTable from "./components/StandingsTable.jsx";
import LeaguesList from "./components/LeaguesList.jsx";
import {getRoundPointsForLeague, getRoundPointsForPrivateLeague} from "./hooks/getRoundPointsForLeague.js";
import {useLeaguesWithTopUsers} from "./hooks/useLeaguesWithTopUsers.js";
import {getStandingsForPrivateLeague} from "./hooks/getStandingsForPrivateLeague.js";
import {telegramService} from "./services/telegram.js";
import {getAllPredictions} from "./services/getPredictionsForMatch.js";

function LeagueTab() {
    const userId = telegramService.getUserId();
    const { leagues, loading, error } = useLeaguesWithTopUsers(userId);
    const [standings, setStandings] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [roundPoints, setRoundPoints] = useState([]);
    const [predictions, setPredictions] = useState([]);

    const handleViewAll = async (league) => {
        const isPrivate = league.id !== "epl";
        const [standingsData, roundPointsData] = await Promise.all([
            isPrivate ? getStandingsForPrivateLeague(league.id) : getStandingsForLeague(league.id),
            isPrivate ? getRoundPointsForPrivateLeague(league.id) : getRoundPointsForLeague(league.id)
        ]);
        const [predictionsData] = await Promise.all([getAllPredictions()]);

        setSelectedLeague(league);
        setStandings(standingsData);
        setRoundPoints(roundPointsData);
        setPredictions(predictionsData);
    };

    const handleBack = () => {
        setSelectedLeague(null);
        setStandings([])
    };

    if (selectedLeague) {
        return (
            <StandingsTable
                league={selectedLeague}
                standings={standings}
                roundPoints={roundPoints}
                onBack={handleBack}
                predictions={predictions}
            />
        );
    }

    if (loading) return <p>Загружаем лиги...</p>;
    if (error) return <p>Ошибка загрузки лиг 😢</p>;

    return <LeaguesList leagues={leagues} onViewAll={handleViewAll} />;
}

export default LeagueTab;
