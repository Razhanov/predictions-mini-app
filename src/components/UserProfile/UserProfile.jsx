import React from "react";
import "./UserProfile.css";
import {Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

const mockUser = {
    userName: "Karim Razhanov",
    totalPoints: 228
};
const mockPointsByRound = [
    { round: 1, points: 5 },
    { round: 2, points: 8 },
    { round: 3, points: 12 },
    { round: 4, points: 6 },
];
const mockPredictions = [
    { round: 1, match: "ARS – MUN", score: "2:1", points: 3 },
    { round: 1, match: "CHE – WHU", score: "1:1", points: 1 },
    { round: 2, match: "TOT – LIV", score: "0:2", points: 5 },
];

export default function UserProfile() {
    return (
        <div className="user-profile-container">
            <div className="user-profile-header">
                <div>
                    <p>Очки: {mockUser.totalPoints}</p>
                </div>
            </div>

            <div className="user-profile-section">
                <h3>График по турам</h3>
                <div className="user-profile-chart">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={mockPointsByRound}>
                            <XAxis dataKey="round" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="points" stroke="#007aff" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="user-profile-section">
                <h3>Прогнозы</h3>
                <table className="user-profile-table">
                    <thead>
                        <tr>
                            <th>Тур</th>
                            <th>Матч</th>
                            <th>Счёт</th>
                            <th>Очки</th>
                        </tr>
                    </thead>
                    <tbody>
                    {mockPredictions.map((item, i) => (
                        <tr key={i}>
                            <td>{item.round}</td>
                            <td>{item.match}</td>
                            <td>{item.score}</td>
                            <td>{item.points}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}