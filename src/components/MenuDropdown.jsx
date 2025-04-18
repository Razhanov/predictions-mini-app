import React, { useState } from "react";
import {useNavigate} from "react-router-dom";
import "./MenuDropdown.css"
import {useIsAdmin} from "../hooks/useIsAdmin.js";
import {telegramService} from "../services/telegram.js";

function MenuDropdown() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const tgUserId = telegramService.getUserId();
    const isAdmin = useIsAdmin(tgUserId);

    const toggleMenu = () => setOpen(!open);
    const goTo = (path) => {
        navigate(path);
        setOpen(false);
    };

    return (
        <div className="menu-container">
            <button className="menu-button" onClick={toggleMenu}>☰</button>
            {open && isAdmin && (
                <div className="menu-dropdown">
                    <button onClick={() => goTo("/admin")}>Админка</button>
                </div>
            )}
        </div>
    );
}

export default MenuDropdown;
