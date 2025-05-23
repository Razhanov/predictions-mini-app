import React, {useRef} from 'react';
import './MatchCard.css';
import {useNavigate} from "react-router-dom";
import {calculatePoints} from "../../functions/scoreService.js";
import ScoreInput from "./ScoreInput.jsx";

export default function MatchCard({ match, value = {}, onChange, boostDisabled, isBoosted }) {
    const scoreA = value.scoreA;
    const scoreB = value.scoreB;
    const firstScorer = value.firstScorer;

    const inputARef = useRef(null);
    const inputBRef = useRef(null);

    const date = match.date ? new Date(match.date.seconds * 1000) : null;
    const formattedDate = date ? date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }) : '';
    const now = Date.now();
    const matchStart = match.date?.seconds ? match.date.seconds * 1000 : 0;
    const isStarted = now >= matchStart;
    const hasResult = match.result &&
        typeof match.result.scoreA === 'number' &&
        typeof match.result.scoreB === 'number'
    const navigate = useNavigate();

    const isLive = isStarted && !hasResult;
    let livePoints = 0;

    if (isLive) {
        const predicted = { scoreA: Number(scoreA), scoreB: Number(scoreB), firstScorer: firstScorer, isBoosted: isBoosted };
        const actual = { scoreA: match.liveScoreA ?? 0, scoreB: match.liveScoreB ?? 0, firstScorer: match.firstScorer ?? null };
        console.log("predicted", predicted);
        console.log("actual", actual);
        livePoints = calculatePoints(predicted, actual);
    }

    return (
        <div className="match-card">
            <div className="teams">
                <span>{match.teamA}</span>
                <span className="vs">vs</span>
                <span>{match.teamB}</span>
            </div>

            <div className="match-date">{formattedDate}</div>

            {hasResult && (
                <div className="result">
                    ✅ Финальный счёт: {match.result.scoreA} : {match.result.scoreB}
                </div>
            )}

            {hasResult && typeof value.points === 'number' && (
                <div className="points-earned">
                    🏅 Очки за матч: {value.points}
                </div>
            )}

            {isLive && (
                <div className="live-score">
                    🟡 Текущий счёт: {match.liveScoreA ?? 0} : {match.liveScoreB ?? 0}
                </div>
            )}

            {isLive && (
                <div className="live-points">
                    💡 Твои live-очки: {livePoints ?? 0}
                </div>
            )}

            <div className="inputs">
                <ScoreInput
                    value={scoreA ?? ''}
                    onChange={(value) => onChange('scoreA', value)}
                    disabled={isStarted}
                    nextRef={inputBRef}
                    ref={inputARef}
                />
                <ScoreInput
                    value={scoreB ?? ''}
                    onChange={(value) => onChange('scoreB', value)}
                    disabled={isStarted}
                    nextRef={inputARef}
                    ref={inputBRef}
                />
            </div>
            <div className="first-scorer">
                <div className="first-scorer-label">Какая команда откроет счёт?</div>
                <div className="first-scorer-options">
                    <button
                        className={`first-scorer-button ${firstScorer === 'teamA' ? 'selected' : ''}`}
                        onClick={() => onChange('firstScorer', 'teamA')}
                        disabled={isStarted}
                    >
                        {match.teamA}
                    </button>
                    <button
                        className={`first-scorer-button ${firstScorer === 'none' ? 'selected' : ''}`}
                        onClick={() => onChange('firstScorer', 'none')}
                        disabled={isStarted}
                    >
                        Никто
                    </button>
                    <button
                        className={`first-scorer-button ${firstScorer === 'teamB' ? 'selected' : ''}`}
                        onClick={() => onChange('firstScorer', 'teamB')}
                        disabled={isStarted}
                    >
                        {match.teamB}
                    </button>
                </div>
            </div>
            <button
                className={`boost-button ${isBoosted ? 'active' : ''}`}
                disabled={boostDisabled}
                onClick={() => onChange('isBoosted', !isBoosted)}
                title={
                    boostDisabled
                        ? "Буст уже использован на сыгранном матче или этот матч начался"
                        : "Удвоить очки в этом матче"
                }
            >
                🔥 Буст x2
            </button>
            {boostDisabled && !isBoosted && (
                <div className="boost-disabled-info">
                    Буст уже активирован на другом сыгранном матче
                </div>
            )}
            { isStarted && (
                <button
                    className="friends-predictions-button"
                    onClick={() => navigate(`/match/${match.id}/predictions`)}
                >
                    Посмотреть прогнозы от друзей
                </button>
            )}
        </div>
    );
}