import React from "react";
import LeagueCard from "./LeagueCard.jsx";
import "./LeagueSection.css";

function LeagueSection({ title, leagues, onViewAll }) {
    return (
        <section className="league-section">
            <h2 className="league-section-title">{title}</h2>
            <div className="league-section-list">
                {leagues.map(league => (
                    <LeagueCard
                    key={league.id}
                    league={league}
                    onClick={() => onViewAll(league)}
                    />
                ))}
            </div>
        </section>
    );
}

export default LeagueSection;