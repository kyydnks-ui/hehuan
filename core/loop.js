import { G_CONFIG } from '../config/config.js';
import { G_TEXT } from '../data/textManager.js';
import { NPC_LOGS } from '../data/narrative.js';
import { gameState } from './state.js'; // 同在 core 目录下，直接引用 ./
import { UI } from '../ui/ui.js';
import { saveGame } from '../systems/SaveSystem.js';
import { checkOpportunity } from '../systems/NpcSystem.js';

// 增加修为（通用方法）
export function addPower(val) {
    let max = G_CONFIG.REALMS[gameState.player.realmIdx].max;
    gameState.player.power += val;
    // 未满级且溢出时，限制为最大值
    if (gameState.player.realmIdx < G_CONFIG.REALMS.length - 1) {
        if (gameState.player.power > max) gameState.player.power = max;
    }
}

// 主循环
export function loop() {
    // 自动保存检查
    if (Date.now() % G_CONFIG.AUTOSAVE_MS < G_CONFIG.CONSTS.AUTOSAVE_BUFFER_MS) {
        saveGame();
    }

    if (gameState.harem.length === 0) return;

    let basePPS = 0;
    let jealousyCount = 0; 

    // 计算产出
    gameState.harem.forEach(npc => {
        let pps = npc.pps;
        if (npc.traits && npc.traits.includes("纯阳")) {
            pps *= G_CONFIG.TRAIT_EFFECTS["纯阳"].ppsMult;
        }
        if (npc.traits && npc.traits.includes("善妒")) {
            jealousyCount++;
        }
        basePPS += pps;
    });
    
    // 计算 Debuff
    let penalty = G_CONFIG.TRAIT_EFFECTS["善妒"].globalDebuff;
    let jealousyDebuff = 1.0 - (jealousyCount * penalty);
    if (jealousyDebuff < G_CONFIG.NUMERICS.JEALOUSY_MIN_MULT) jealousyDebuff = G_CONFIG.NUMERICS.JEALOUSY_MIN_MULT;

    let finalPPS = basePPS * gameState.player.globalMult * jealousyDebuff;
    gameState.player.totalPPS = finalPPS;

    let gain = finalPPS / G_CONFIG.FPS;
    addPower(gain);

    // 寿元流逝与死亡判定
    for (let i = gameState.harem.length - 1; i >= 0; i--) {
        let npc = gameState.harem[i];
        
        // 自然流逝
        npc.curLife -= (1 / G_CONFIG.FPS);
        // ★新增：机缘检测
        checkOpportunity(npc);
// ★★★ 新增：日记触发逻辑 ★★★
        if (npc.persona && NPC_LOGS[npc.persona]) {
             // 1. 寿命低于 50% 且未记录 HALF
            if (!npc.logFlags.half && npc.curLife < npc.maxLife * 0.5) {
                let logs = NPC_LOGS[npc.persona].HALF;
                let txt = logs[Math.floor(Math.random() * logs.length)];
                npc.lifeLog.push(txt);
                npc.logFlags.half = true;
            }
            // 2. 寿命低于 10% 且未记录 END
            if (!npc.logFlags.end && npc.curLife < npc.maxLife * 0.1) {
                let logs = NPC_LOGS[npc.persona].END;
                let txt = logs[Math.floor(Math.random() * logs.length)];
                npc.lifeLog.push(txt);
                npc.logFlags.end = true;
            }
        }
        // 检查死亡
        if (npc.curLife <= 0) {
            UI.log(G_TEXT.MSG.logDeath(npc.name), "fail");
            gameState.harem.splice(i, 1);
        }
    }
}