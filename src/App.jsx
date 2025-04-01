import React, {useEffect, useState} from 'react';
import { useMatches } from "./hooks/useMatches.js";
import MatchCard from "./components/MatchCard.jsx";
import './App.css'
import {usePredictions} from "./hooks/usePredictions.js";
import RoundTabs from "./components/RoundTabs.jsx";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "./components/ui/select";

const LEAGUES = [
    { id: "epl", name: "АПЛ"},
    { id: "laliga", name: "Ла Лига"}
]

function App() {
    const [selectedLeague, setSelectedLeague] = useState("epl");
    const { matches, loading } = useMatches();
    const {
        predictions,
        handleScoreChange
    } = usePredictions();

    const filteredByLeague = matches.filter((match) => match.leagueId === selectedLeague);
    const round = [...new Set(filteredByLeague.map((m) => m.round))].sort((a, b) => a - b);
    const [selectedRound, setSelectedRound] = useState(null);

    const now = Date.now();
    const upcomingMatch = filteredByLeague.find(m => m.date?.seconds * 1000 > now);
    const lastRound = round[round.length - 1];
    const upcomingRound = upcomingMatch?.round ?? lastRound;

    useEffect(() => {
        if (!loading && filteredByLeague.length > 0) {
            setSelectedRound(upcomingRound);
        }
    }, [loading, matches, selectedLeague]);

    const filteredMatches = filteredByLeague.filter((match) => match.round === selectedRound);

    return (
        <div className="container">
            <h1 className="title">Прогнозы на матчи</h1>
            <div className="league-select" style={{ marginBottom: "1rem", maxWidth: 200 }}>
                <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите лигу" />
                    </SelectTrigger>
                    <SelectContent>
                        {LEAGUES.map(league => (
                            <SelectItem key={league.id} value={league.id}>
                                {league.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {loading && <p>Загрузка матчей...</p>}

                {!loading && matches.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#777' }}>
                        Матчи скоро появятся ⚽️
                    </p>
                )}

            {!loading && filteredByLeague.length > 0 && (
                <>
                    <RoundTabs
                        rounds={round}
                        selected={selectedRound}
                        onSelect={setSelectedRound}
                        current={upcomingRound}
                    />
                    <div className="match-list">
                        {filteredMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                value={predictions[match.id]}
                                onChange={(field, value) => handleScoreChange(match.id, field, value)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default App;