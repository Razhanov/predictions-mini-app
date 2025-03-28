import React from 'react';
import './MatchCard.css';

export default function MatchCard({ match, value = {}, onChange }) {
    const scoreA = value.scoreA;
    const scoreB = value.scoreB;

    const isScoreAValid = scoreA === '' || scoreA === undefined || !isNaN(scoreA);
    const isScoreBValid = scoreB === '' || scoreB === undefined || !isNaN(scoreB);

    const date = match.date ? new Date(match.date.seconds * 1000) : null;
    const formattedDate = date ? date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }) : '';
    const now = Date.now();
    const matchStart = match.date?.seconds ? match.date.seconds * 1000 : 0;
    const isStarted = now >= matchStart;
    const hasResult = match.result &&
        typeof match.result.scoreA === 'number' &&
        typeof match.result.scoreB === 'number'

    return (
        <div className="match-card">
            <div className="teams">
                <span>{match.teamA}</span>
                <span className="vs">vs</span>
                <span>{match.teamB}</span>
            </div>

            <div className="match-date">{formattedDate}</div>

            {hasResult && (
                <div className="result">
                    ✅ Финальный счёт: {match.result.scoreA} : {match.result.scoreB}
                </div>
            )}

            {isStarted && !hasResult && (
                <div className="live-status">🔴 Матч LIVE</div>
            )}

            <div className="inputs">
                <input
                    type="number"
                    placeholder="0"
                    value={scoreA !== undefined ? scoreA : ''}
                    onChange={(e) => onChange('scoreA', e.target.value)}
                    className={!isScoreAValid ? 'invalid' : ''}
                    inputMode="numeric"
                    min="0"
                    step="1"
                    disabled={isStarted}
                />
                <input
                    type="number"
                    placeholder="0"
                    value={scoreB !== undefined ? scoreB : ''}
                    onChange={(e) => onChange('scoreB', e.target.value)}
                    className={!isScoreBValid ? 'invalid' : ''}
                    inputMode="numeric"
                    min="0"
                    step="1"
                    disabled={isStarted}
                />
            </div>
        </div>
    );
}