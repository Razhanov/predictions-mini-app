import React, {useEffect, useState} from "react";
import {getStandingsForLeague} from "./hooks/getStandingsForLeague.js";
import StandingsTable from "./components/StandingsTable.jsx";
import LeaguesList from "./components/LeaguesList.jsx";
import {getRoundPointsForLeague, getRoundPointsForPrivateLeague} from "./hooks/getRoundPointsForLeague.js";
import {useLeaguesWithTopUsers} from "./hooks/useLeaguesWithTopUsers.js";
import {getStandingsForPrivateLeague} from "./hooks/getStandingsForPrivateLeague.js";
import {telegramService} from "./services/telegram.js";
import {getAllPredictions} from "./services/getPredictionsForMatch.js";

function LeagueTab() {
    const [userId, setUserId] = useState(() => telegramService.getUserId());
    const { leagues, loading, error } = useLeaguesWithTopUsers(userId);
    const [standings, setStandings] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [roundPoints, setRoundPoints] = useState([]);
    const [isLeagueLoading, setIsLeagueLoading] = useState(false);
    const [leagueLoadError, setLeagueLoadError] = useState("");
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        if (userId) return;

        const intervalId = window.setInterval(() => {
            const nextUserId = telegramService.getUserId();
            if (!nextUserId) return;

            setUserId(nextUserId);
            window.clearInterval(intervalId);
        }, 300);

        const timeoutId = window.setTimeout(() => {
            window.clearInterval(intervalId);
        }, 5000);

        return () => {
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutId);
        };
    }, [userId]);

    const handleViewAll = async (league) => {
        setSelectedLeague(league);
        setStandings([]);
        setRoundPoints([]);
        setPredictions([]);
        setLeagueLoadError("");
        setIsLeagueLoading(true);

        const isPrivate = league.type === "private";

        try {
            const [standingsData, roundPointsData, predictionsData] = await Promise.all([
                isPrivate ? getStandingsForPrivateLeague(league.id) : getStandingsForLeague(league.id),
                isPrivate ? getRoundPointsForPrivateLeague(league.id) : getRoundPointsForLeague(league.id),
                getAllPredictions()
            ]);

            setStandings(standingsData);
            setRoundPoints(roundPointsData);
            setPredictions(predictionsData);
        } catch (error) {
            console.error("Failed to load league standings", error);
            setLeagueLoadError("Не удалось загрузить таблицу лиги. Попробуйте еще раз.");
        } finally {
            setIsLeagueLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedLeague(null);
        setStandings([]);
        setRoundPoints([]);
        setPredictions([]);
        setLeagueLoadError("");
        setIsLeagueLoading(false);
    };

    if (selectedLeague) {
        return (
            <StandingsTable
                league={selectedLeague}
                standings={standings}
                roundPoints={roundPoints}
                onBack={handleBack}
                loading={isLeagueLoading}
                error={leagueLoadError}
                predictions={predictions}
            />
        );
    }

    if (loading) return <p>Загружаем лиги...</p>;
    if (error) return <p>Ошибка загрузки лиг 😢</p>;

    return (
        <LeaguesList
            leagues={leagues}
            onViewAll={handleViewAll}
            loadingLeagueId={isLeagueLoading ? selectedLeague?.id ?? null : null}
        />
    );
}

export default LeagueTab;
