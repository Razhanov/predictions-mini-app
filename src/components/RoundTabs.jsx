import React, {useEffect, useRef} from "react";
import './RoundTabs.css';

export default function RoundTabs({ rounds, selected, onSelect, current, pointsMap = {}}) {
    const tabRefs = useRef({});

    useEffect(() => {
        const selectedRef = tabRefs.current[selected];
        if (selectedRef) {
            selectedRef.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
            });
        }
    }, [selected]);

    return (
        <div className="round-tabs">
            {rounds.map((round) => (
                <button
                key={round}
                ref={(el) => { tabRefs.current[round] = el }}
                className={`tab ${round === selected ? 'active' : ''} ${round === current ? 'current' : ''}`}
                onClick={() => onSelect(round)}
                >
                    Тур {round}
                    {pointsMap[round] !== undefined && (
                        <span style={{ fontSize: "0.85em", color: "#888", marginLeft: 4 }}>
                            ({pointsMap[round]} pts)
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}