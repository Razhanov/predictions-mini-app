import TelegramBot from 'node-telegram-bot-api';

const token = '7869673831:AAGHqfYt45LIhjlT-a35aZgYSQjbQdYkE1s'
const bot = new TelegramBot(token, { polling: false });

const chatId = '141191904';
const webAppUrl = 'https://predictions-bot-test.netlify.app';

bot.sendMessage(chatId, 'Открой мини-приложение👇', {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'Открыть Mini App',
                    web_app: {
                        url: webAppUrl
                    }
                }
            ]
        ]
    }
})
    .then(() => console.log('Кнопка отправлена!'))
