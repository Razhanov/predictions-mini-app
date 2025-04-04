import {ADMIN_USER_IDS} from "../adminConfig.js";

export function useIsAdmin(userId) {
    return true;// ADMIN_USER_IDS.includes(Number(userId));
}
