import TelegramBot from 'node-telegram-bot-api';

const token = '7206155323:AAGccBSkHFc5GHLdFW0X9Y4zwJIBprzN8Ts'
const bot = new TelegramBot(token, { polling: false });

const chatId = '141191904';
const webAppUrl = 'https://serene-muffin-b075ea.netlify.app';

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
    .catch(console.error);