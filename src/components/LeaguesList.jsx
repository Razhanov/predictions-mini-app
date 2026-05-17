import React from "react";
import LeagueSection from "./LeagueSection.jsx";
import "./LeaguesList.css";

function LeaguesList({ leagues, onViewAll, loadingLeagueId }) {
    const privateLeagues = leagues.filter((league) => league.type === "private");
    const publicLeagues = leagues.filter((league) => league.type === "public");

    return (
        <div className="leagues-list">
            {privateLeagues.length > 0 && (
                <LeagueSection
                    title={"Приватные лиги"}
                    leagues={privateLeagues}
                    onViewAll={onViewAll}
                    loadingLeagueId={loadingLeagueId}
                />
            )}
            {publicLeagues.length > 0 && (
                <LeagueSection
                    title={"Публичные лиги"}
                    leagues={publicLeagues}
                    onViewAll={onViewAll}
                    loadingLeagueId={loadingLeagueId}
                />
            )}
        </div>
    );
}

export default LeaguesList;
