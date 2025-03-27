import React from 'react';
import './MatchCard.css';

export default function MatchCard({ match, value = {}, onChange }) {
    const scoreA = value.scoreA;
    const scoreB = value.scoreB;

    const isScoreAValid = scoreA !== '' && !isNaN(scoreA);
    const isScoreBValid = scoreB !== '' && !isNaN(scoreB);

    const date = match.date ? new Date(match.date.seconds * 1000) : null;
    const formattedDate = date ? date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }) : '';

    return (
        <div className="match-card">
            <div className="teams">
                <span>{match.teamA}</span>
                <span className="vs">vs</span>
                <span>{match.teamB}</span>
            </div>

            <div className="match-date">{formattedDate}</div>

            <div className="inputs">
                <input
                    type="number"
                    placeholder="0"
                    value={scoreA}
                    onChange={(e) => onChange(match.id, 'scoreA', e.target.value)}
                    className={!isScoreAValid ? 'invalid' : ''}
                />
                <input
                    type="number"
                    placeholder="0"
                    value={scoreB}
                    onChange={(e) => onChange(match.id, 'scoreB', e.target.value)}
                    className={!isScoreBValid ? 'invalid' : ''}
                />
            </div>
        </div>
    );
}