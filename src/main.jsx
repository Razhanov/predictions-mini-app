import MatchPredictionsPage from "./components/MatchPredictionsPage.jsx";

console.log('main.jsx работает');
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import {Navigate, Routes, Route, Link, useLocation, BrowserRouter as Router} from "react-router-dom";
import LeagueTab from "./LeagueTab.jsx";

function TabBar() {
    const location = useLocation();

    return (
        <div style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-around",
            padding: "10px 0",
            borderTop: "1px solid #ccc",
            backgroundColor: "#fff"
        }}>
            <Link style={{ textDecoration: "none", color: location.pathname === '/' ? '#000' : '#888' }} to="/">Прогнозы</Link>
            <Link style={{ textDecoration: "none", color: location.pathname === '/leagues' ? "#000" : '#888' }} to="/leagues">Лиги</Link>
        </div>
    );
}

function Root() {
    return (
        <Router>
            <div style={{ paddingBottom: "60px" }}>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/leagues" element={<LeagueTab />} />
                    <Route path="/match/:matchId/predictions" element={<MatchPredictionsPage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <TabBar />
            </div>
        </Router>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>
);