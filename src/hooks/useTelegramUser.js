import {useEffect, useState} from "react";

export function useTelegramUser() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const tg = window?.Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user) {
            setUser(tg.initDataUnsafe.user);
        }
    }, [user]);

    return user;
}