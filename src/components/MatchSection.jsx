import React from "react";
import MatchCard from "./MatchCard.jsx";
import "./MatchSection.css"

export default function MatchSection({ title, matches, collapsed, onToggle, predictions, onChange }) {
    if (matches.length === 0) return null;

    return (
        <>
            <h3
                className="match-section-title clickable"
                onClick={onToggle}
            >
                {collapsed ? `⬇️ ${title}` : `➡️ ${title}`}
            </h3>
            {collapsed && matches.map((match) => (
                <MatchCard
                    key={match.id}
                    match={match}
                    value={predictions[match.id]}
                    onChange={(field, value) => onChange(match.id, field, value)}
                />
            ))}
        </>
    )
}