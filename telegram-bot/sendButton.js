import TelegramBot from 'node-telegram-bot-api';

const token = '7206155323:AAGccBSkHFc5GHLdFW0X9Y4zwJIBprzN8Ts'
const bot = new TelegramBot(token, { polling: false });

// const chatId = '141191904';
const eplchatId = '-1001628368275';
const webAppUrl = 'https://predictions-bot.netlify.app';

bot.sendMessage(eplchatId, 'Открой мини-приложение👇', {
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

// bot.sendMessage(eplchatId, 'ладно, щас вручную отправлю');