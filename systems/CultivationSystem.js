import { G_CONFIG } from '../config/config.js'; 
import { G_TEXT } from '../data/textManager.js'; 
import { gameState } from '../core/state.js';
import { saveGame } from './SaveSystem.js';

// 升级技能
export function upgradeSkill(skillKey) {
    let p = gameState.player;
    let skillCfg = G_CONFIG.SKILLS[skillKey];
    let currentLv = p.skills[skillKey] || 0;

    if (currentLv >= skillCfg.maxLevel) return { success: false, msg: G_TEXT.MSG.SKILL_MAX };

    let cost = skillCfg.costs[currentLv]; 

    // 统计数据检查
    let currentStat = 0;
    let statName = "";

    if (skillCfg.type === "stat_interact") {
        currentStat = gameState.stats.totalInteract || 0;
        statName = G_TEXT.MSG.STAT_NAMES.interact; 
    } 
    else if (skillCfg.type === "stat_capture") {
        currentStat = gameState.stats.totalCapture || 0;
        statName = G_TEXT.MSG.STAT_NAMES.capture; 
    }
    else if (skillCfg.type === "stat_discard") {
        currentStat = gameState.stats.totalDiscard || 0;
        statName = G_TEXT.MSG.STAT_NAMES.discard; 
    }
    else {
        // 修为升级 (降级兼容)
        if (p.power < cost) return { success: false, msg: G_TEXT.MSG.skillNoPower(cost) };
        p.power -= cost;
        p.skills[skillKey] = currentLv + 1;
        saveGame();
        return { success: true, msg: G_TEXT.MSG.skillSuccess(skillCfg.name, currentLv + 1) };
    }

    if (currentStat < cost) {
        return { success: false, msg: G_TEXT.MSG.skillNoStat(statName, currentStat, cost) };
    }
    
    p.skills[skillKey] = currentLv + 1;
    saveGame();
    return { success: true, msg: G_TEXT.MSG.skillSuccess(skillCfg.name, currentLv + 1) };
}

// 境界突破
export function breakthrough() {
    let p = gameState.player;
    let realm = G_CONFIG.REALMS[p.realmIdx];
    
    if (p.power < realm.max) return { success: false, msg: G_TEXT.MSG.NO_POWER };
    
    p.power = 0; 
    p.realmIdx++;
    gameState.haremSlots += G_CONFIG.BREAKTHROUGH_ADD_SLOTS;
    saveGame(); 
    
    return { success: true, msg: G_TEXT.MSG.breakthroughSuccess(G_CONFIG.REALMS[p.realmIdx].name) };
}