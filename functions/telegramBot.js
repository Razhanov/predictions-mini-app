import { onRequest } from "firebase-functions/v2/https";
import TelegramBot from "node-telegram-bot-api";
import express from "express";
import {getApps, initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";

if (!getApps().length) {
    initializeApp();
}
const db = getFirestore();

const app = express();
app.use(express.json());

const token = '7206155323:AAGccBSkHFc5GHLdFW0X9Y4zwJIBprzN8Ts';
const bot = new TelegramBot(token);

const userStates = new Map();

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const message = "👋 *Привет!*  \nДобро пожаловать в *предиктор матчей*!  \nСоревнуйся с друзьями, предсказывай результаты, набирай очки и поднимайся в таблице лидеров.  \n\n*Нажми на кнопку ниже, чтобы сделать первый прогноз 👇*";

    if (msg.chat.type !== 'private') {
        const keyboard = {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "Открыть Mini App 🔗",
                        url: "https://t.me/tg_predictor_bot"
                    }
                ]]
            }
        };
        return bot.sendMessage(chatId, message, keyboard);
    }

    const keyboard = {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: "Сделать прогноз 🔮",
                    web_app: { url: 'https://predictions-bot.netlify.app' }
                }
            ]]
        }
    };

    return bot.sendMessage(chatId,
        message,
        { ...keyboard, parse_mode: 'Markdown' }
    );
});


bot.onText(/\/predict/, async (msg) => {
    const chatId = msg.chat.id;

    const isPrivate = msg.chat.type === 'private';

    if (!isPrivate) {
        const keyboard = {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "Открыть Mini App 🔗",
                        url: "https://t.me/tg_predictor_bot"
                    }
                ]]
            }
        };

        return  bot.sendMessage(chatId, '⚠️ Мини-приложение работает только в личке. Нажми кнопку ниже 👇', keyboard);
    }

    const keyboard = {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: "Сделать прогноз",
                    web_app: { url: 'https://predictions-bot.netlify.app' }
                }
            ]]
        }
    };

    return  bot.sendMessage(chatId, 'Открой мини-приложение 👇', keyboard);
});

bot.onText(/\/my_points/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const userName = msg.from.username;

    console.log(`Запрос на получение очков от пользователя: ${userName} (userId: ${userId})`);

    try {
        const userDocRef = db.collection("standings").where("leagueId", "==", "epl");
        const docSnapshot = await userDocRef.get();

        if (docSnapshot.empty) {
            console.log(`Очки для пользователя ${userName} не найдены.`);
            return bot.sendMessage(chatId, 'У тебя пока нет очков. Сделай прогноз и попробуй ещё раз!');
        }

        const standingsData = docSnapshot.docs.map((doc) => {
            return { userId: doc.data().userId, totalPoints: doc.data().totalPoints, userName: doc.data().userName };
        });
        standingsData.sort((a, b) => b.totalPoints - a.totalPoints);
        console.log(`Найденные данные для ${userName}:`, standingsData);

        const userStandings = standingsData.find((entry) => entry.userId.toString() === userId.toString());
        const userRank = standingsData.indexOf(userStandings) + 1;
        console.log(`Найденные данные для ${userName}:`, `userStandings: ${userStandings}, userRank: ${userRank}`);

        if (userStandings) {
            bot.sendMessage(chatId, `@${userName}, Ваши очки: ${userStandings.totalPoints}\nВаше место в лиге: ${userRank}`);
        } else {
            bot.sendMessage(chatId, 'Не удалось найти ваши данные в лиге.');
        }
    } catch (error) {
        console.error('Ошибка при получении очков:', error);
        return bot.sendMessage(chatId, 'Произошла ошибка. Попробуй позже.');
    }
});

bot.onText(/\/create_league/, async (msg) => {
    const chatId = msg.chat.id;
    const isPrivate = msg.chat.type === 'private';
    const userId = msg.from.id;

    if (isPrivate) {
        userStates.set(userId, true);
        return bot.sendMessage(chatId, "🏷 Введи название лиги, которую хочешь создать:");
    }

    const existingLeagueSnap = await db.collection("leagues")
        .where("chatId", "==", chatId)
        .limit(1)
        .get();

    if (!existingLeagueSnap.empty) {
        const existingLeague = existingLeagueSnap.docs[0].data();

        return bot.sendMessage(chatId, `⚠️ Лига уже создана: <b>${existingLeague.name}</b>`, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "👥 Присоединиться",
                        callback_data: `join_${existingLeague.inviteCode}`
                    }
                ]]
            }
        });
    }

    const leagueName = msg.chat.title;
    const creatorName = msg.from.userName || `${msg.from.first_name} ${msg.from.last_name || ""}`.trim();

    await createLeagueAndSend(chatId, userId, creatorName, leagueName, chatId);
});

bot.on("message", async (msg) => {
    const userId = msg.from.id;
    const isPrivate = msg.chat.type === 'private';
    const text = msg.text?.trim();

    if (!isPrivate || !text || !userStates.has(userId)) return;

    userStates.delete(userId);

    const chatId = msg.chat.id;
    const creatorName = msg.from.userName || `${msg.from.first_name} ${msg.from.last_name || ""}`.trim();

    await createLeagueAndSend(chatId, userId, creatorName, text);
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const userName = query.from.username || `${query.from.first_name} ${query.from.last_name || ''}`.trim();
    const data = query.data;

    if (data.startsWith("join_")) {
        const inviteCode = data.split("join_")[1];

        try {
            const leagueSnap = await db.collection("leagues")
                .where("inviteCode", "==", inviteCode)
                .limit(1)
                .get();

            if (leagueSnap.empty) {
                return bot.answerCallbackQuery(query.id, { text: "Лига не найдена ❌", show_alert: true });
            }

            const league = leagueSnap.docs[0];
            const leagueId = league.id;
            const leagueData = league.data();

            const memberRef = db.collection("leagueMembers").doc(`${leagueId}_${userId}`);
            const memberSnap = await memberRef.get();

            if (memberSnap.exists) {
                return bot.answerCallbackQuery(query.id, {
                    text: "Вы уже в этой лиге ✅",
                    show_alert: true
                });
            }

            await memberRef.set({
                userId,
                userName,
                leagueId,
                joinedAt: Date.now()
            });

            await db.collection("leagues")
                .doc(leagueId)
                .collection("members")
                .doc(userId.toString())
                .set({
                    userId,
                    userName,
                    joinedAt: Date.now()
                });

            bot.answerCallbackQuery(query.id, { text: "✅ Вы присоединились к лиге!" });
            bot.sendMessage(chatId, `🎉 ${userName} присоединился к лиге "${league.data().name}"`)
        } catch (error) {
            console.error("Ошибка при присоединении к лиге:", error);
            bot.answerCallbackQuery(query.id, { text: "Ошибка. Попробуйте позже.", show_alert: true });
        }
    }
});

async function createLeagueAndSend(chatId, creatorId, creatorName, leagueName, chatIdForStorage = null) {
    const leagueId = uuidv4();
    const inviteCode = `league_${Math.random().toString(36).substring(2, 8)}`;

    await db.collection("leagues").doc(leagueId).set({
        id: leagueId,
        name: leagueName,
        inviteCode,
        createdBy: creatorId,
        chatId: chatIdForStorage,
        createdAt: Date.now()
    });

    await db.collection("leagueMembers").doc(`${leagueId}_${creatorId}`).set({
        userId: creatorId,
        userName: creatorName,
        leagueId,
        joinedAt: Date.now()
    });

    await bot.sendMessage(chatId, `✅ Лига <b>${leagueName}</b> создана! Нажми кнопку ниже, чтобы вступить 👇`, {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [[
                { text: "👥 Присоединиться", callback_data: `join_${inviteCode}` }
            ]]
        }
    });
}

app.post("/", (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

export const telegramBot = onRequest(
    { region: "us-central1", serviceAccount: "predictions-tg@appspot.gserviceaccount.com" },
    app
);