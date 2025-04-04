import {ADMIN_USER_IDS} from "../adminConfig.js";

export function useIsAdmin(userId) {
    return ADMIN_USER_IDS.includes(Number(userId));
}
