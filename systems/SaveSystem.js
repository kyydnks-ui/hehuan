import { G_TEXT } from '../data/textManager.js';
import { gameState } from '../core/state.js';
import { G_CONFIG } from '../config/config.js';
export function saveGame() {
    try {
        localStorage.setItem(G_CONFIG.CONSTS.SAVE_KEY, JSON.stringify(gameState));
        console.log(G_TEXT.GUI.SAVE_AUTO);
    } catch(e) {
        console.error(G_TEXT.GUI.SAVE_ERR, e);
    }
}

export function resetGame() {
    localStorage.removeItem(G_CONFIG.CONSTS.SAVE_KEY);
    location.reload();
}

export function exportSave() {
    saveGame(); // 先存一下最新的
    try {
        let json = JSON.stringify(gameState);
        let b64 = btoa(encodeURIComponent(json)); // Base64 编码
        return b64;
    } catch (e) {
        console.error(G_TEXT.GUI.EXPORT_FAIL, e);
        return null;
    }
}

export function importSave(str) {
    if (!str) return { success: false, msg: G_TEXT.GUI.IMPORT_EMPTY }; 
    try {
        let json = decodeURIComponent(atob(str)); 
        let data = JSON.parse(json);
        
        if (!data.player || !data.harem) {
            return { success: false, msg: G_TEXT.GUI.IMPORT_FORMAT_ERR }; 
        }

        localStorage.setItem(G_CONFIG.CONSTS.SAVE_KEY, json);
        return { success: true, msg: G_TEXT.GUI.IMPORT_SUCCESS }; 
    } catch (e) {
        console.error(e);
        return { success: false, msg: G_TEXT.GUI.IMPORT_CORRUPT }; 
    }
}