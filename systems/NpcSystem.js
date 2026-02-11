import { G_CONFIG } from '../config/config.js';
import { G_TEXT } from '../data/textManager.js';
import { gameState } from '../core/state.js';
import { NPC_LOGS } from '../data/narrative.js';
import { UI } from '../ui/ui.js';
export function generateNPC() {
    let rand = Math.random();
    
    // 1. 决定稀有度
    let rarityKey = G_CONFIG.CONSTS.DEFAULT_RARITY;
    let cumulative = 0;
    for (let key in G_CONFIG.RARITY) {
        cumulative += G_CONFIG.RARITY[key].weight;
        if (rand < cumulative) { rarityKey = key; break; }
    }
    let rarityCfg = G_CONFIG.RARITY[rarityKey];

    // 2. 决定境界
    let pRealmIdx = gameState.player.realmIdx;
    let npcRealmIdx = Math.max(0, Math.min(G_CONFIG.REALMS.length - 1, pRealmIdx + (Math.random() < G_CONFIG.NUMERICS.NPC_REALM_UP_CHANCE ? 1 : 0)));
    let realmCfg = G_CONFIG.REALMS[npcRealmIdx];

    // 3. 计算PPS (产出)
    let floatMin = G_CONFIG.NPC_GENERATE.PPS_FLOAT_MIN;
    let floatRange = G_CONFIG.NPC_GENERATE.PPS_FLOAT_RANGE;
    let pps = Math.ceil(realmCfg.ppsBase * rarityCfg.mult * (floatMin + Math.random() * floatRange));

    // 4. 生成特质
    let traits = [];
    let traitKeys = Object.keys(G_CONFIG.TRAIT_EFFECTS);
    let traitCount = (Math.random() < G_CONFIG.NUMERICS.NPC_HAS_TRAIT_CHANCE) ? 1 : 0;
    if (rarityKey === "天骄") traitCount = Math.max(1, traitCount);
    if (rarityKey === "神子") traitCount = 2;

    for(let i=0; i<traitCount; i++) {
        let t = traitKeys[Math.floor(Math.random() * traitKeys.length)];
        if(!traits.includes(t)) traits.push(t);
    }

    // 5. 生成描述与名字
    let bodyDesc = G_TEXT.getBodyDesc();
    let name = G_TEXT.getName(); 
// ★★★ 新增：随机性格与初始日记 ★★★
    let personaKeys = Object.keys(NPC_LOGS);
    let persona = personaKeys[Math.floor(Math.random() * personaKeys.length)]; // 随机性格
    
    // 随机抽取一条 START 阶段的文案
    let startLog = NPC_LOGS[persona].START[Math.floor(Math.random() * NPC_LOGS[persona].START.length)];
    // 替换文案中的 {name} 占位符 (如果有)
    startLog = startLog.replace(/{name}/g, name);
    return {
        id: Date.now() + Math.random(),
        name: name,
        realm: realmCfg.name,
        rarity: rarityKey,
        rarityColor: rarityCfg.color,
        pps: pps,
        power: Math.floor(realmCfg.max * 0.5),
        traits: traits,
        bodyDesc: bodyDesc,
        lastInteract: 0,
        isPregnant: false,
        dueTime: 0,
        maxLife: G_CONFIG.LIFESPAN.BASE[realmCfg.name] || 180,
        curLife: G_CONFIG.LIFESPAN.BASE[realmCfg.name] || 180,
        interactCount: 0,
        birthCount: 0,
        nurtureCount: 0,
        // ★ 新字段
        persona: persona, 
        lifeLog: [ startLog ], // 初始日志
        logFlags: { half: false, end: false } // 标记位：防止重复写入
    };
}
// ★新增：机缘检测函数 (由 loop 循环调用)
export function checkOpportunity(npc) {
    // 使用游戏内时间或实际时间戳均可，这里用实际时间戳(秒)
    let now = Date.now() / 1000; 
    
    // 1. 初始化检查时间 (如果是旧存档NPC，没有这个字段，默认为当前时间)
    if (!npc.lastCheck) npc.lastCheck = now;

    // 2. 检查冷却 (未到时间直接返回)
    if (now - npc.lastCheck < G_CONFIG.OPPORTUNITY.CHECK_INTERVAL) return;
    
    npc.lastCheck = now; // 更新检查时间

    // 3. 判定是否触发 (没随到就返回)
    if (Math.random() > G_CONFIG.OPPORTUNITY.TRIGGER_CHANCE) return;

    // 4. 判定触发类型
    let weights = G_CONFIG.OPPORTUNITY.WEIGHTS;
    let totalW = weights.REALM_UP + weights.RARITY_UP;
    let roll = Math.random() * totalW;
    
    let isRealmUp = roll < weights.REALM_UP;
    
    if (isRealmUp) {
        // --- 顿悟：升境界 ---
        let realms = G_CONFIG.REALMS;
        let curIdx = realms.findIndex(r => r.name === npc.realm);
        
        // 已经是最高境界，无法提升
        if (curIdx >= realms.length - 1) return; 
        
        let newRealm = realms[curIdx + 1];
        let oldRealmName = npc.realm;
        
        // 更新境界
        npc.realm = newRealm.name;
        // 顺便按比例恢复/提升生命值上限
        let lifeRatio = npc.curLife / npc.maxLife;
        npc.maxLife = G_CONFIG.LIFESPAN.BASE[newRealm.name];
        npc.curLife = npc.maxLife * lifeRatio;
        
        // 重算 PPS
        recalcPPS(npc);
        
        // 输出日志
        UI.log(G_TEXT.MSG.logRealmUp(npc.name, oldRealmName, newRealm.name), "success");
        
    } else {
        // --- 洗髓：升稀有度 ---
        let rarities = G_CONFIG.RARITY_ORDER; // ["废柴", "凡夫", ...]
        let curIdx = rarities.indexOf(npc.rarity);
        
        // 已经是最高稀有度，无法提升
        if (curIdx >= rarities.length - 1) return;
        
        let newRarityKey = rarities[curIdx + 1];
        let oldRarity = npc.rarity;
        let rarityCfg = G_CONFIG.RARITY[newRarityKey];
        
        // 更新稀有度
        npc.rarity = newRarityKey;
        npc.rarityColor = rarityCfg.color;
        
        // 重算 PPS
        recalcPPS(npc);
        
        // 输出日志
        UI.log(G_TEXT.MSG.logRarityUp(npc.name, oldRarity, newRarityKey), "success");
    }
}

// 内部辅助函数：重算 PPS
function recalcPPS(npc) {
    let realmCfg = G_CONFIG.REALMS.find(r => r.name === npc.realm);
    let rarityCfg = G_CONFIG.RARITY[npc.rarity];
    
    // 保持与生成时一致的随机波动逻辑
    let floatMin = G_CONFIG.NPC_GENERATE.PPS_FLOAT_MIN;
    let floatRange = G_CONFIG.NPC_GENERATE.PPS_FLOAT_RANGE;
    
    npc.pps = Math.ceil(realmCfg.ppsBase * rarityCfg.mult * (floatMin + Math.random() * floatRange));
}