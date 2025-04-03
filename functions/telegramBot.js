import { onRequest } from "firebase-functions/v2/https";
import TelegramBot from "node-telegram-bot-api";
import express from "express";
import {getApps, initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

if (!getApps().length) {
    initializeApp();
}
const db = getFirestore();

const app = express();
app.use(express.json());

const token = '7206155323:AAGccBSkHFc5GHLdFW0X9Y4zwJIBprzN8Ts';
const bot = new TelegramBot(token);

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

app.post("/", (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

export const telegramBot = onRequest(
    { region: "us-central1", serviceAccount: "predictions-tg@appspot.gserviceaccount.com" },
    app
);