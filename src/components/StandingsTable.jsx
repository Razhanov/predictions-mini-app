import React, {useMemo} from "react";
import "./StandingsTable.css"
import { motion, AnimatePresence } from "framer-motion";

const StandingsTable = ({ league, standings, roundPoints, onBack }) => {
    const [selectedRound, setSelectedRound] = React.useState(0);

    const sorted = useMemo(() => {
        if (selectedRound === 0) {
            return standings
                .slice()
                .sort((a, b) => b.totalPoints - a.totalPoints);
        } else {
            const roundData = roundPoints.filter((point) => point.round === selectedRound);
            return roundData
                .slice()
                .sort((a, b) => b.totalPoints - a.totalPoints);
        }
    }, [selectedRound, standings, roundPoints]);

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
            </div>
            <div className="standings-table">
                <AnimatePresence>
                    {sorted.map((user, index) => (
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
                            <span className="points">{user.totalPoints} pts</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StandingsTable;
