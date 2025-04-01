
const tg = window.Telegram.WebApp;

function getUserId() {
    return tg.initDataUnsafe?.user?.id;
}

function getUserName() {
    const user = tg.initDataUnsafe?.user;
    if (!user) return "Unknown";

    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return `${firstName} ${lastName}`.trim();
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
    getUserName,
    readyWebApp,
    setMainButtonClickHandler,
    showMainButton,
    hideMainButton,
    setMainButton,
    showAlert
};