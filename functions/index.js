/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onDocumentUpdated, onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { getFirestore } from 'firebase-admin/firestore';
import { calculatePoints } from './scoreService.js';
import { CloudTasksClient } from '@google-cloud/tasks';
import {region} from "firebase-functions/v1";
const db = getFirestore();
const tasksClient = new CloudTasksClient();

export const onMatchResultUpdate = onDocumentUpdated(
    {
        document: "matches/{matchId}",
        region: "us-central1",
        serviceAccount: "predictions-tg@appspot.gserviceaccount.com"
    },
    async (event) => {
        const before = event.data?.before?.data();
        const after = event.data?.after?.data();

        if (!before?.result && after?.result) {
            const matchId = event.params.matchId;
            const result = after.result;
            const { round, leagueId } = after;

            const predictionsSnap = await db.collection("predictions")
                .where("matchId", "==", matchId)
                .get();

            const batch = db.batch();

            predictionsSnap.forEach((doc) => {
                const data = doc.data();
                const prediction = { scoreA: data.scoreA, scoreB: data.scoreB };
                const userId = data.userId;
                const userName = data.userName || userId;

                const points = calculatePoints(prediction, result);

                // Обновляем очки в predictions
                batch.update(doc.ref, { points });

                const roundPointsRef = db
                    .collection("roundPoints")
                    .doc(`${leagueId}_${round}_${userId}`);

                const matchPointsRef = roundPointsRef.collection("matches").doc(matchId);

                batch.set(roundPointsRef, {
                    userId,
                    userName,
                    round,
                    leagueId,
                    updatedAt: Date.now()
                }, { merge: true });

                batch.set(matchPointsRef, {
                    points
                });
            });

            await batch.commit();
            console.log(`Очки обновлены и сохранены в roundPoints/matches для матча ${matchId}`);
        }
    }
);

export const onMatchCreated = onDocumentCreated({
    document: "matches/{matchId}",
    region: "us-central1",
    serviceAccount: "predictions-tg@appspot.gserviceaccount.com"
}, async (event) => {
    const matchId = event.params.matchId;
    const match = event.data?.data();

    if (!match || !match.date?.seconds) return;

    const matchDate = new Date(match.date.seconds * 1000);
    const reminderDate = new Date(matchDate.getTime() - 60 * 60 * 1000);

    const queuePath = tasksClient.queuePath(
        "predictions-tg",
        "us-central1",
        "reminders"
    );

    const url = "https://sendreminder-7ybb36rzja-uc.a.run.app";
    const body = JSON.stringify({ matchId });
    const taskId = `match_${matchId}_${reminderDate.getTime()}`;

    const task = {
        name: `${queuePath}/tasks/${taskId}`,
        httpRequest: {
            httpMethod: "POST",
            url,
            headers: { "Content-Type": "application/json" },
            body: Buffer.from(body).toString("base64"),
        },
        scheduleTime: {
            seconds: Math.floor(reminderDate.getTime() / 1000),
        }
    };

    await tasksClient.createTask({ parent: queuePath, task });
    console.log(`📅 Reminder task created for match ${matchId} at ${reminderDate.toISOString()}`);
});

async function recalculateTotalPoints(userId, userName, leagueId) {
    const snapshot = await db.collection("roundPoints")
        .where("userId", "==", userId)
        .where("leagueId", "==", leagueId)
        .get();

    let total = 0;
    for (const doc of snapshot.docs) {
        const roundId = doc.id;
        const matchesSnap = await doc.ref.collection("matches").get();

        let roundTotal = 0;
        matchesSnap.forEach((doc) => {
            roundTotal += doc.data().points || 0;
        })

        await doc.ref.set({ totalPoints: roundTotal }, { merge: true });

        total += roundTotal;
    }

    await db.collection("standings")
        .doc(`${leagueId}_${userId}`)
        .set({
            userId,
            userName,
            leagueId,
            totalPoints: total
        });

    console.log(`Обновлена таблица standings для ${userId} в ${leagueId}: ${total} очков`);
}

export const onRoundPointsCreated = onDocumentCreated({
    document: "roundPoints/{docId}",
    region: "us-central1",
    serviceAccount: "predictions-tg@appspot.gserviceaccount.com"
}, async (event) => {
    const data = event.data?.data();
    if (!data.userId || !data.leagueId) return;
    console.log("userId:", data.userId, "leagueId:", data.leagueId);
    await recalculateTotalPoints(data.userId, data.userName, data.leagueId);
});

export const onRoundPointsUpdated = onDocumentUpdated({
    document: "roundPoints/{docId}",
    region: "us-central1",
    serviceAccount: "predictions-tg@appspot.gserviceaccount.com"
}, async (event) => {
    const data = event.data?.after?.data();
    if (!data.userId || !data.leagueId) return;
    console.log("userId:", data.userId, "leagueId:", data.leagueId);
    await recalculateTotalPoints(data.userId, data.userName, data.leagueId);
});

export const onRoundPointsDeleted = onDocumentDeleted({
    document: "roundPoints/{docId}",
    region: "us-central1",
    serviceAccount: "predictions-tg@appspot.gserviceaccount.com"
}, async (event) => {
    const data = event.data?.data();
    if (!data.userId || !data.leagueId) return;
    console.log("userId:", data.userId, "leagueId:", data.leagueId);
    await recalculateTotalPoints(data.userId, data.userName, data.leagueId);
});

export const onJoinLeague = onDocumentCreated({
    document: "leagueMembers/{docId}",//"leagueMembers/{leagueId}_{userId}",
    region: "us-central1",
    serviceAccount: "predictions-tg@appspot.gserviceaccount.com"
}, async (event) => {
    const docId = event.params.docId;
    const [leagueId, userId] = docId.split("_");
    console.log(`🟢 onJoinLeague triggered for ${leagueId}_${userId}`);

    const leagueDoc = await db.collection("leagues").doc(leagueId).get();
    if (!leagueDoc.exists) {
        console.warn(`⚠️ Лига ${leagueId} не найдена`);
        return;
    }
    const league = leagueDoc.data();
    const tournamentId = league.tournamentId || "epl";

    const standingRef = db.collection("standings").doc(`${tournamentId}_${userId}`);
    const standingSnap = await standingRef.get();

    const standingData = standingSnap.exists
        ? standingSnap.data()
        : { userName: userId, totalPoints: 0 };

    await db.collection("leagueStandings")
        .doc(leagueId)
        .collection("users")
        .doc(userId)
        .set({
            userId,
            userName: standingData.userName,
            totalPoints: standingData.totalPoints || 0,
            updatedAt: Date.now()
        });

    console.log(`✅ Пользователь ${userId} добавлен в standings лиги ${leagueId}`);
});

export const onStandingsUpdated = onDocumentUpdated({
    document: "standings/{docId}",
    region: "us-central1",
    serviceAccount: "predictions-tg@appspot.gserviceaccount.com"
}, async (event) => {
    const after = event.data?.after?.data();
    if (!after) return;

    const docId = event.params.docId;
    if (!docId) {
        console.error("❌ docId не передан в params");
        return;
    }
    const [tournamentId, userId] = docId.split("_");
    if (!tournamentId || !userId) {
        console.error(`❌ Не удалось распарсить tournamentId и userId из docId: ${docId}`);
        return;
    }

    const userName = after.userName ?? userId;
    const totalPoints = after.totalPoints ?? 0;

    console.log(`🔔 standings обновлены для пользователя ${userId} (${userName}), ${totalPoints} очков`);

    const leaguesSnap = await db.collection("leagueMembers")
        .where("userId", "==", Number(userId))
        .get();

    console.log(`🔎 Найдено лиг для пользователя ${userId}: ${leaguesSnap.size}`);

    const batch = db.batch();

    leaguesSnap.forEach((doc) => {
        const data = doc.data();
        const leagueId = data.leagueId;
        if (!leagueId) {
            console.warn(`⚠️ Документ ${doc.id} не содержит поля leagueId`);
            return;
        }

        const ref = db.collection("leagueStandings")
            .doc(leagueId)
            .collection("users")
            .doc(userId);

        console.log(`📦 Обновляем standings в лиге ${leagueId} для ${userName}`);

        batch.set(ref,{
                userId,
                userName,
                totalPoints,
                updatedAt: Date.now()
        },{ merge: true });
    });

    await batch.commit();
    console.log(`🔄 Обновлены standings пользователя ${userId} в лигах (${leaguesSnap.size} шт.)`);
});

export { telegramBot } from "./telegramBot.js";
export { sendReminder } from "./reminders/sendReminder.js";