import React from "react";
import LeagueCard from "./LeagueCard.jsx";
import "./LeagueSection.css";

function LeagueSection({ title, leagues, onViewAll, loadingLeagueId }) {
    return (
        <section className="league-section">
            <h2 className="league-section-title">{title}</h2>
            <div className="league-section-list">
                {leagues.map(league => (
                    <LeagueCard
                        key={league.id}
                        league={league}
                        onClick={() => onViewAll(league)}
                        isLoading={loadingLeagueId === league.id}
                    />
                ))}
            </div>
        </section>
    );
}

export default LeagueSection;
