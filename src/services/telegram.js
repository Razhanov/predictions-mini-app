const tg = window.Telegram?.WebApp;

function getUserId() {
    const telegramUserId = tg?.initDataUnsafe?.user?.id;
    if (telegramUserId) return telegramUserId;

    const fallbackUserId = import.meta.env.VITE_TELEGRAM_USER_ID;
    return fallbackUserId ? Number(fallbackUserId) : null;
}

function getUserName() {
    const user = tg?.initDataUnsafe?.user;
    if (!user) {
        return import.meta.env.VITE_TELEGRAM_USER_NAME || "Unknown";
    }

    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return `${firstName} ${lastName}`.trim();
}

function readyWebApp() {
    if (!tg) return;
    tg.ready();
    tg.expand();
}

function setMainButton(text = 'Сохранить прогнозы') {
    if (!tg) return;
    tg.MainButton.setParams({ text });
}

function showMainButton() {
    if (!tg) return;
    tg.MainButton.show();
}

function hideMainButton() {
    if (!tg) return;
    tg.MainButton.hide();
}

function setMainButtonClickHandler(handler) {
    if (!tg) return;
    tg.MainButton.offClick();
    tg.MainButton.onClick(handler);
}

function showAlert(message) {
    if (!tg) {
        window.alert(message);
        return;
    }
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
