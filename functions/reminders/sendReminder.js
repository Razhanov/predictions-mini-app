
import TelegramBot from "node-telegram-bot-api";
import {getFirestore} from "firebase-admin/firestore";
import admin from "firebase-admin";
import {getApps, initializeApp} from "firebase-admin/app";
import express from "express";
import {onRequest} from "firebase-functions/v2/https";

if (!getApps()) {
    initializeApp();
}

const app = express();
app.use(express.json());

const db = getFirestore();

const token = '7206155323:AAGccBSkHFc5GHLdFW0X9Y4zwJIBprzN8Ts';
const bot = new TelegramBot(token);

app.post("/", async (req, res) => {
    const { matchId } = req.body;

    if (!matchId) return res.status(404).send("Missing matchId");

    const matchSnap = await admin.firestore().collection("matches").doc(matchId).get();
    const matchData = matchSnap.data();

    if (!matchData) return res.status(404).send("Match not found");

    const predictionsSnap = await admin.firestore()
        .collection("predictions")
        .where("matchId", "==", matchId)
        .get();
    const predictedUserIds = new Set(predictionsSnap.docs.map((doc) => doc.data().userId));

    const leagueMembersSnap = await db.collection('leagueMembers').get();

    const allMembers = leagueMembersSnap.docs.map((doc) => doc.data())

    const userMap = new Map();
    for (const member of allMembers) {
        if (!userMap.has(member.userId)) {
            userMap.set(member.userId, member);
        }
    }

    const usersToNotify = Array.from(userMap.values())
        .filter((member) => !predictedUserIds.has(member.userId));

    for (const user of usersToNotify) {
        if (user.userId && user.userName) {
            try {
                await bot.sendMessage(
                    user.userId,
                    `⏰ Через час начинается матч ${matchData.teamA} – ${matchData.teamB}. Сделай прогноз прямо сейчас!`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "Сделать прогноз ⚽",
                                        web_app: { url: 'https://predictions-bot.netlify.app/predict?startapp=match_${matchId}' }
                                    }
                                ]
                            ]
                        }
                    }
                );
                console.log(`✅ Напоминание отправлено ${user.userName} (${user.userId})`);
            } catch (err) {
                console.error(`Не удалось отправить сообщение пользователю ${user.userId}:`, err.message);
            }
        }
    }

    res.send(`Напоминания отправлены ${usersToNotify.length} пользователям.`);
});

export const sendReminder = onRequest({
        region: "us-central1",
        serviceAccount: "predictions-tg@appspot.gserviceaccount.com"
    },
    app
);
