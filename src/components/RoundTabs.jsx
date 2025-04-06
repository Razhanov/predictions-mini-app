import React from "react";
import './RoundTabs.css';

export default function RoundTabs({ rounds, selected, onSelect, current, pointsMap = {}}) {
    return (
        <div className="round-tabs">
            {rounds.map((round) => (
                <button
                key={round}
                className={`tab ${round === selected ? 'active' : ''} ${round === current ? 'current' : ''}`}
                onClick={() => onSelect(round)}
                >
                    Тур {round}
                    {pointsMap[round] !== undefined && (
                        <span style={{ fontSize: "0.85em", color: "#888", marginLeft: 4 }}>
                            ({pointsMap[round]} очков)
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}