import React from "react";
import "./MatchHeader.css";

function MatchHeader({ match }) {
    return (
        <div className="match-header">
            <div className="teams">
                <span>{match.teamA}</span>
                <strong>{match.result?.scoreA ?? match.liveScoreA ?? "0"}</strong>
                <span>:</span>
                <strong>{match.result?.scoreB ?? match.liveScoreB ?? "0"}</strong>
                <span>{match.teamB}</span>
            </div>
        </div>
    );
}

export default MatchHeader;
