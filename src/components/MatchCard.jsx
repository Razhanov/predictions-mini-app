import React from 'react';
import './MatchCard.css';

export default function MatchCard({ match, value = {}, onChange }) {
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
                    value={value?.scoreA || ''}
                    onChange={(e) => onChange(match.id, 'scoreA', e.target.value)}
                />
                <input
                    type="number"
                    placeholder="0"
                    value={value?.scoreB || ''}
                    onChange={(e) => onChange(match.id, 'scoreB', e.target.value)}
                />
            </div>
        </div>
    );
}