import TelegramBot from 'node-telegram-bot-api';

const token = '7206155323:AAGccBSkHFc5GHLdFW0X9Y4zwJIBprzN8Ts'
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/predict/, (msg) => {
    const chatId = msg.chat.id;

    const isPrivate = msg.chat.type === 'private';

    if (!isPrivate) {
        const keyboard = {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "Открыть Mini App 🔗",
                        url: "https://t.me/tg_predictor_bot" // замени на username твоего бота
                    }
                ]]
            }
        };

        bot.sendMessage(chatId, '⚠️ Мини-приложение работает только в личке. Нажми кнопку ниже 👇', keyboard);
        return;
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

    bot.sendMessage(chatId, 'Открой мини-приложение 👇', keyboard);
})