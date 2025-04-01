import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getStandingsForLeague} from "../hooks/getStandingsForLeague.js";
import StandingsTable from "../components/StandingsTable.jsx";

function LeagueStandings() {
    const { leagueId } = useParams();
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const snapshot = await getStandingsForLeague(leagueId);
            const data = snapshot.docs.map((doc) => doc.data());
            setStandings(data);
            setLoading(false);
        };

        fetch();
    }, [leagueId]);

    return (
        <div className="container">
            <h1 className="title">Таблица очков ({leagueId.toUpperCase()})</h1>
            {loading ? <p>Loading...</p> : <StandingsTable standings={standings} />}
        </div>
    );
}

export default LeagueStandings;
