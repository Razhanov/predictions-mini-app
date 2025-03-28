
const tg = window.Telegram.WebApp;

function getUserId() {
    return tg.initDataUnsafe?.user?.id;
}

function readyWebApp() {
    tg.ready();
    tg.expand();
}

function setMainButton(text = 'Сохранить прогнозы') {
    tg.MainButton.setParams({ text });
}

function showMainButton() {
    tg.MainButton.show();
}

function hideMainButton() {
    tg.MainButton.hide();
}

function setMainButtonClickHandler(handler) {
    tg.MainButton.offClick();
    tg.MainButton.onClick(handler);
}

function showAlert(message) {
    tg.showAlert(message);
}

export const telegramService = {
    getUserId,
    readyWebApp,
    setMainButtonClickHandler,
    showMainButton,
    hideMainButton,
    setMainButton,
    showAlert
};