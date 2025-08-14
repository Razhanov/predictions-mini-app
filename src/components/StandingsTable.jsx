import React, {useMemo, useState} from "react";
import "./StandingsTable.css"
import { motion, AnimatePresence } from "framer-motion";
import {calculatePoints} from "../../functions/scoreService.js";
import {useMatches} from "../hooks/useMatches.js";
import {usePredictions} from "../hooks/usePredictions.js";
import {getAllPredictions} from "../services/getPredictionsForMatch.js";

const getModifiedStandings = (standings, matches, predictions) => {
    const now = Date.now();
    const liveMatches = matches.filter(match => match.date <= now && !match.isFinished);
    const extraPoints = {};

    liveMatches.forEach(match => {
        const matchPredictions = Object.values(predictions).filter(prediction => prediction.matchId === match.id);
        matchPredictions.forEach(prediction => {
            const liveResult = { scoreA: match.liveScoreA ?? 0, scoreB: match.liveScoreB ?? 0, firstScorer: match.firstScorer ?? null };
            const points = calculatePoints(prediction, liveResult);
            if (!extraPoints[prediction.userId]) extraPoints[prediction.userId] = 0;
            extraPoints[prediction.userId] += points;
        });
        console.log("extraPoints", extraPoints);
    });

    return standings.map(row => ({
        ...row,
        totalPoints: row.totalPoints + (extraPoints[row.userId] || 0),
        liveAddedPoints: extraPoints[row.userId] || 0
    }));
};

const StandingsTable = ({ league, standings, roundPoints, onBack, predictions }) => {
    const [selectedRound, setSelectedRound] = useState(0);
    const [liveEnabled, setLiveEnabled] = useState(false);
    const { matches, loading } = useMatches();

    const modifiedStandings = useMemo(() => {
        if (selectedRound !== 0) {
            const roundData = roundPoints.filter((p) => p.round === selectedRound);
            return roundData.slice().sort((a, b) => b.totalPoints - a.totalPoints);
        }

        const base = liveEnabled
            ? getModifiedStandings(standings, matches, predictions)
            : standings;

        return base.slice().sort((a, b) => b.totalPoints - a.totalPoints);
    }, [selectedRound, standings, roundPoints, matches, predictions, liveEnabled]);

    // const sorted = useMemo(() => {
    //     if (selectedRound === 0) {
    //         return standings
    //             .slice()
    //             .sort((a, b) => b.totalPoints - a.totalPoints);
    //     } else {
    //         const roundData = roundPoints.filter((point) => point.round === selectedRound);
    //         return roundData
    //             .slice()
    //             .sort((a, b) => b.totalPoints - a.totalPoints);
    //     }
    // }, [selectedRound, standings, roundPoints]);

    const uniqueRounds = useMemo(() => {
        const rounds = new Set(roundPoints.map((point) => point.round));
        return Array.from(rounds).sort((a, b) => a - b);
    }, [roundPoints]);

    return (
        <div className="standings-container">
            <button className="back-button" onClick={onBack}>← Назад</button>
            <h2 className="standings-title">Таблица — {league.name}</h2>

            <div className="round-select">
                <select
                    value={selectedRound}
                    onChange={(e) => setSelectedRound(Number(e.target.value))}
                >
                    <option value="0">Общая таблица</option>
                    {uniqueRounds.map((round) => (
                        <option key={round} value={round}>
                            Тур {round}
                        </option>
                    ))}
                </select>

                {selectedRound === 0 && (
                    <label className="live-toggle">
                        <input
                            type="checkbox"
                            checked={liveEnabled}
                            onChange={() => setLiveEnabled(!liveEnabled)}
                        />
                        <span>Live-режим</span>
                    </label>
                )}
            </div>
            <div className="standings-table">
                <AnimatePresence>
                    {modifiedStandings.map((user, index) => (
                        <motion.div
                            key={user.userId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="standings-row"
                        >
                            <span className="place">#{index + 1}</span>
                            <span className="name">{user.userName || user.userId}</span>
                            <span className="points">
                                {user.totalPoints} pts
                                {liveEnabled && user.liveAddedPoints > 0 && (
                                    <span className="live-bonus">(+{user.liveAddedPoints})</span>
                                )}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StandingsTable;
