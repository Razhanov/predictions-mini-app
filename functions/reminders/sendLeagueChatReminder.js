import TelegramBot from "node-telegram-bot-api";
import { getFirestore } from "firebase-admin/firestore";
import { getApps, initializeApp } from "firebase-admin/app";
import express from "express";
import { onRequest } from "firebase-functions/v2/https";

if (!getApps().length) {
    initializeApp();
}

const app = express();
app.use(express.json());

const db = getFirestore();

const token = '7206155323:AAGccBSkHFc5GHLdFW0X9Y4zwJIBprzN8Ts';
const bot = new TelegramBot(token);

app.post("/", async (req, res) => {
    const { matchId } = req.body;

    if (!matchId) return res.status(400).send("Missing matchId");

    const matchSnap = await db.collection("matches").doc(matchId).get();
    const matchData = matchSnap.data();

    if (!matchData) return res.status(404).send("Match not found");

    const predictionsSnap = await db.collection("predictions")
        .where("matchId", "==", matchId)
        .get();
    const predictedUserIds = new Set(predictionsSnap.docs.map(doc => doc.data().userId));

    const leaguesSnap = await db.collection("leagues").get();
    const leagues = leaguesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    for (const league of leagues) {
        if (!league.chatId) continue;

        const membersSnap = await db.collection(`leagues/${league.id}/members`).get();
        const members = membersSnap.docs.map(doc => doc.data());

        const usersWithoutPrediction = members.filter(
            m => m.userId && m.userName && !predictedUserIds.has(m.userId)
        );

        if (usersWithoutPrediction.length === 0) continue;

        const userMentions = usersWithoutPrediction.map(u => `@${u.userName}`).join("\n");

        const message = `⚠️ Через 30 минут начнётся матч: ${matchData.teamA} vs ${matchData.teamB}!\n\n` +
            `Следующие участники пока не сделали прогноз:\n${userMentions}\n\n` +
            `Скорее делайте свой прогноз! ⚽`;

        try {
            await bot.sendMessage(league.chatId, message);
            console.log(`✅ Напоминание отправлено в чат лиги: ${league.name}`);
        } catch (err) {
            console.error(`❌ Ошибка отправки в чат ${league.chatId}:`, err.message);
        }
    }

    res.send("Чат-напоминания отправлены.");
});

export const sendLeagueChatReminder = onRequest({
    region: "us-central1",
    serviceAccount: "predictions-tg@appspot.gserviceaccount.com"
}, app);