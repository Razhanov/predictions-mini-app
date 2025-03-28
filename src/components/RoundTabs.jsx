import React from "react";
import './RoundTabs.css';

export default function RoundTabs({ rounds, selected, onSelect, current}) {
    return (
        <div className="round-tabs">
            {rounds.map((round) => (
                <button
                key={round}
                className={`tab ${round === selected ? 'active' : ''} ${round === current ? 'current' : ''}`}
                onClick={() => onSelect(round)}
                >
                    Тур {round}
                </button>
            ))}
        </div>
    );
}