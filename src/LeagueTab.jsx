import React, {useEffect, useState} from "react";
import {getStandingsForLeague} from "./hooks/getStandingsForLeague.js";
import StandingsTable from "./components/StandingsTable.jsx";
import LeaguesList from "./components/LeaguesList.jsx";
import {getRoundPointsForLeague} from "./hooks/getRoundPointsForLeague.js";

const LEAGUES = [
    { id: "epl", name: "АПЛ", type: "public" }
];

function LeagueTab() {
    const [standings, setStandings] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [leaguesWithTopUsers, setLeaguesWithTopUsers] = useState([]);
    const [roundPoints, setRoundPoints] = useState([]);

    useEffect(() => {
        const fetchTopUsers = async () => {
            const updatedLeagues = await Promise.all(
                LEAGUES.map(async (league) => {
                    const data = await getStandingsForLeague(league.id);
                    return {
                        ...league,
                        topUsers: data.slice(0, 3)
                    };
                })
            );
            setLeaguesWithTopUsers(updatedLeagues);
        };

        fetchTopUsers();
    }, []);

    const handleViewAll = async (league) => {
        const [standingsData, roundPointsData] = await Promise.all([
            getStandingsForLeague(league.id),
            getRoundPointsForLeague(league.id)
        ]);

        setSelectedLeague(league);
        setStandings(standingsData);
        setRoundPoints(roundPointsData);
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
            />
        );
    }

    return <LeaguesList leagues={leaguesWithTopUsers} onViewAll={handleViewAll} />;
}

export default LeagueTab;
