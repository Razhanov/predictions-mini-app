/* eslint-disable indent */
/**
 * Обновляет очки за матч
 * @param {Object} prediction - прогноз пользователя
 * @param {Object} result - реальный результат матча
 * @return {number} - начисленные очки
 */
export function calculatePoints(prediction, result) {
    if (!prediction || !result) return 0;

    const {scoreA: pA, scoreB: pB} = prediction;
    const {scoreA: rA, scoreB: rB} = result;

    let points = 0;

    const getOutcome = (a, b) => (a > b ? "A" : a < b ? "B" : "D");
    if (getOutcome(pA, pB) === getOutcome(rA, pB)) points += 3;
    if (pA === rA) points += 2;
    if (pB === rB) points += 2;
    if ((pA - pB) === (rA - pB)) points += 3;

    return points;
}
