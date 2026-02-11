import { G_CONFIG } from '../config/config.js';
import { G_TEXT } from '../data/textManager.js';
import { gameState } from '../core/state.js';
import { UI } from '../ui/ui.js';
import { saveGame } from './SaveSystem.js';
import { addPower } from '../core/loop.js';

// 抓捕 NPC
export function captureNPC() {
    if (!gameState.currentNPC) return { success: false, msg: G_TEXT.MSG.NO_PERSON };
    
    let npc = gameState.currentNPC;
    let p = gameState.player; 
    
    // 计算成功率
    let successChance = G_CONFIG.INTERACT.CAPTURE_BASE_CHANCE + (p.charm / 10) * G_CONFIG.NUMERICS.CAPTURE_CHARM_SCALE;
    let rarityMap = G_CONFIG.RARITY_ORDER;
    let rIndex = rarityMap.indexOf(npc.rarity);
    let rarityPenalty = (rIndex - 1) * G_CONFIG.NUMERICS.CAPTURE_RARITY_PENALTY;
    if (rarityPenalty > 0) successChance -= rarityPenalty;

    let charmLv = p.skills["CHARM"] || 0;
    let charmBonus = (G_CONFIG.SKILLS["CHARM"].effects[charmLv - 1] || {}).val || 0;
    if (npc.traits && npc.traits.includes("天媚")) successChance += G_CONFIG.NUMERICS.TRAIT_BONUS_CAPTURE;
    successChance += charmBonus;

    let roll = Math.random(); 
    gameState.currentNPC = null;

    // 判定逻辑
    if (roll > successChance + G_CONFIG.INTERACT.CAPTURE_CRITICAL_FAIL_ADD) {
        let loss = npc.pps * G_CONFIG.INTERACT.FAIL_LOSS_SECONDS;
        p.power = Math.max(0, p.power - loss); 
        let logText = G_TEXT.getLog("FAIL_LOSS", npc.name);
        UI.log(logText, "fail");
        return { success: false, msg: G_TEXT.MSG.CAPTURE_FAIL_DAMAGE };
    }
    else if (roll > successChance) {
        let logText = G_TEXT.getLog("FAIL_DRAW", npc.name);
        UI.log(logText, "normal");
        return { success: false, msg: G_TEXT.MSG.CAPTURE_FAIL_IGNORE };
    }
    else if (roll < successChance * G_CONFIG.INTERACT.CAPTURE_ONE_NIGHT_MULT) {
        // 一夜情 (无捕获)
        let harvLv = p.skills["HARVEST"] || 0;
        let mult = (G_CONFIG.SKILLS["HARVEST"].effects[harvLv - 1] || {}).val || 1.0;
        let gain = npc.pps * G_CONFIG.INTERACT.ONE_NIGHT_GAIN_SECONDS * mult;
        addPower(gain);
        let logText = G_TEXT.getLog("ONE_NIGHT", npc.name);
        UI.log(logText + "<br>" + G_TEXT.MSG.logOneNight(gain), "success");
        return { success: true, msg: G_TEXT.MSG.CAPTURE_ONE_NIGHT };
    }
    else {
        // 捕获成功
        if (gameState.harem.length >= gameState.haremSlots) {
            return { success: false, msg: G_TEXT.MSG.CAPTURE_FULL };
        }
        gameState.harem.push(npc);
        gameState.stats.totalCapture++; 
        saveGame(); 

        let logText = G_TEXT.getSkillLog("CHARM", charmLv, npc.name);
        UI.log(logText + "<br>" + G_TEXT.MSG.logCapture, "success");
        return { success: true, msg: G_TEXT.MSG.captureSuccess(npc.name) };
    }
}

// 双修
export function interact(npcId) {
    let npc = gameState.harem.find(n => n.id === npcId);
    if (!npc) return;

    let now = Date.now();
    let cooldown = G_CONFIG.INTERACT.COOLDOWN;
    if (npc.traits && npc.traits.includes("多汁")) {
        cooldown *= G_CONFIG.TRAIT_EFFECTS["多汁"].cooldownMult;
    }

    if (now - npc.lastInteract < cooldown * 1000) {
        return { success: false, msg: G_TEXT.MSG.COOL_DOWN };
    }
    
    if (npc.isPregnant) {
         return { success: false, msg: G_TEXT.MSG.PREGNANT_LOCK };
    }

    npc.lastInteract = now;
    npc.interactCount = (npc.interactCount || 0) + 1;
    gameState.stats.totalInteract++; 
    saveGame();

    // 收益计算
    let techLv = gameState.player.skills["TECHNIQUE"] || 0;
    let skillMult = (G_CONFIG.SKILLS["TECHNIQUE"].effects[techLv - 1] || {}).val || 1.0;
    let traitMult = 1.0;
    if (npc.traits && npc.traits.includes("名器")) {
        traitMult = G_CONFIG.TRAIT_EFFECTS["名器"].interactMult;
    }

    let gain = npc.pps * G_CONFIG.INTERACT.INTERACT_GAIN_SECONDS * traitMult * skillMult;
    addPower(gain);
    
    // 双修折寿
    npc.curLife -= G_CONFIG.LIFESPAN.INTERACT_COST;
    if (npc.curLife < 0) npc.curLife = 0; 

    // 怀孕判定
    let logText = G_TEXT.getSkillLog("TECHNIQUE", techLv, npc.name);
    let pregChance = G_CONFIG.INTERACT.PREGNANCY_CHANCE;
    if (npc.traits && npc.traits.includes("贞烈")) pregChance *= G_CONFIG.TRAIT_EFFECTS["贞烈"].pregChanceMult;
    if (npc.traits && npc.traits.includes("多汁")) pregChance *= G_CONFIG.TRAIT_EFFECTS["多汁"].pregChanceMult;

    if (Math.random() < pregChance) {
        npc.isPregnant = true;
        npc.dueTime = now + (G_CONFIG.INTERACT.PREGNANCY_TIME * 1000);
        logText += `<br>` + G_TEXT.getLog("PREGNANT", npc.name);
    }
    
    let bonusInfo = (traitMult > 1) ? G_TEXT.MSG.bonusMingqi : "";
    if(skillMult > 1) bonusInfo += G_TEXT.MSG.bonusSkill(skillMult);
    UI.log(logText + "<br>" + G_TEXT.MSG.logInteract(gain, bonusInfo), "interact");
    return { success: true };
}

// 接生
export function deliverBaby(npcId) {
    let npc = gameState.harem.find(n => n.id === npcId);
    if (!npc || !npc.isPregnant) return;
    let now = Date.now();
    if (now < npc.dueTime) return { success: false, msg: G_TEXT.MSG.NOT_YET };

    npc.isPregnant = false;
    npc.birthCount = (npc.birthCount || 0) + 1;
    npc.dueTime = 0;
    
    // 子女稀有度遗传逻辑
    let childRarity = npc.rarity;
    if (npc.traits && npc.traits.includes("贞烈")) {
         let rarityMap = G_CONFIG.RARITY_ORDER;
         let idx = rarityMap.indexOf(childRarity);
         if(idx < rarityMap.length - 1) childRarity = rarityMap[idx+1];
    }

    let childName = G_TEXT.MSG.childSurname + G_TEXT.getOnlyName();
    let growSeconds = G_CONFIG.CHILD.GROW_SECONDS;
    
    let child = {
        id: Date.now(),
        name: childName,
        fatherName: npc.name,
        fatherId: npc.id, 
        rarity: childRarity,
        rarityColor: (G_CONFIG.RARITY[childRarity] || {}).color || "#fff",
        powerBase: npc.pps * 2,
        matureTime: Date.now() + (growSeconds * 1000),
        isUnlocked: false
    };

    gameState.children.push(child);
    gameState.stats.totalBirth++;
    saveGame();
    
    // 全局加成
    let bonus = G_CONFIG.CHILD.BASE_BONUS * (G_CONFIG.CHILD.TALENT_MULT[childRarity] || 1);
    if (npc.traits && npc.traits.includes("贞烈")) bonus *= G_CONFIG.TRAIT_EFFECTS["贞烈"].childBonusMult;
    gameState.player.globalMult += bonus;

    let logText = G_TEXT.getLog("BIRTH", npc.name);
    UI.log(logText + "<br>" + G_TEXT.MSG.logBirth(childName, growSeconds), "success");

    return { success: true }; 
}

// 禁忌互动 (子嗣)
export function interactChild(childId) {
    let child = gameState.children.find(c => c.id === childId);
    if (!child) return;
    if (Date.now() < child.matureTime) {
       UI.notify(G_TEXT.MSG.childLocked(child.name));
        return;
    }

   let chance = G_CONFIG.CHILD.INTERACT_CHANCE;
    if (Math.random() > chance) {
        UI.log(G_TEXT.MSG.childReject(child.name), "fail");
        return;
    }

   let gain = gameState.player.totalPPS * G_CONFIG.CHILD.INTERACT_GAIN_SECONDS;
    addPower(gain);
    
    let logText = G_TEXT.getLog("TABOO", child.name);
   UI.log(logText + "<br>" + G_TEXT.MSG.logTaboo(gain), "interact");

    if (child.fatherId) {
        let father = gameState.harem.find(n => n.id === child.fatherId);
        if (father) {
            let fatherLog = G_TEXT.getLog("FATHER_REACTION", child.name, father.name);
            setTimeout(() => {
                UI.log(`<span style="border-left: 2px solid #03a9f4; padding-left: 5px;">${fatherLog}</span>`, "normal");
            }, G_CONFIG.CONSTS.FATHER_REACTION_DELAY);
        }
    }
}

// 温养 (反向采补)
export function nurtureNPC(npcId) {
    let npc = gameState.harem.find(n => n.id === npcId);
    if (!npc) return;

    if (typeof npc.nurtureCount === 'undefined') npc.nurtureCount = 0;

    let realmCfg = G_CONFIG.REALMS.find(r => r.name === npc.realm);
    let maxPower = realmCfg ? realmCfg.max : 1000;
    let cost = maxPower * G_CONFIG.NURTURE.COST_RATIO;

    if (gameState.player.power < cost) {
        UI.notify(G_TEXT.MSG.nurtureFailCost);
        return;
    }

    let base = G_CONFIG.NURTURE.BASE_GAIN_SEC;
    let rarityMult = G_CONFIG.NURTURE.RARITY_MULT[npc.rarity] || 1.0;
    
    let decayFactor = Math.pow(1 - G_CONFIG.NURTURE.DECAY_RATE, npc.nurtureCount);
    if (decayFactor < G_CONFIG.NURTURE.MIN_EFFICIENCY) decayFactor = G_CONFIG.NURTURE.MIN_EFFICIENCY;

    let finalGain = base * rarityMult * decayFactor;

    gameState.player.power -= cost;
    npc.curLife += finalGain;
    if (npc.curLife > npc.maxLife * 3) npc.curLife = npc.maxLife * 3;
    
    npc.nurtureCount++;
    saveGame();

    let logText = G_TEXT.getLog("NURTURE_LOGS", npc.name);
    UI.log(logText + "<br>" + `<span style="color:#4caf50">${G_TEXT.MSG.nurtureSuccess(npc.name, finalGain, cost)}</span>`, "success");
    return { success: true };
}

// 销毁/采补
export function discard(npcId) {
    let index = gameState.harem.findIndex(n => n.id === npcId);
    if (index === -1) return;
    
    let npc = gameState.harem[index];
    let harvLv = gameState.player.skills["HARVEST"] || 0;
    let skillMult = (G_CONFIG.SKILLS["HARVEST"].effects[harvLv - 1] || {}).val || 1.0;
    let gain = npc.pps * G_CONFIG.INTERACT.DISCARD_GAIN_SECONDS * skillMult; 
    addPower(gain);
    
    gameState.harem.splice(index, 1);
    gameState.stats.totalDiscard++; 
    saveGame();
    
    let logText = G_TEXT.getSkillLog("HARVEST", harvLv, npc.name);
    UI.log(logText + "<br>" + G_TEXT.MSG.logDiscard(gain), "fail");
    return {success:true};
}
// ★新增：将成年子嗣收入后宫
export function recruitChild(childId) {
    // 1. 检查后宫空位
    if (gameState.harem.length >= gameState.haremSlots) {
        return { success: false, msg: G_TEXT.MSG.CAPTURE_FULL };
    }

    // 2. 找到子嗣
    let childIdx = gameState.children.findIndex(c => c.id === childId);
    if (childIdx === -1) return;
    let child = gameState.children[childIdx];

    // 3. 找到父亲 (用于触发日志)
    let father = gameState.harem.find(n => n.id === child.fatherId);
    let fatherName = father ? father.name : child.fatherName;

    // 4. 生成 NPC 数据 (继承子嗣的稀有度，但赋予新的属性)
    // 4.1 随机获得 1 个特质
    let traitKeys = Object.keys(G_CONFIG.TRAIT_EFFECTS);
    let randomTrait = traitKeys[Math.floor(Math.random() * traitKeys.length)];
    
    // 4.2 初始境界 (子嗣天赋好，起步就是炼气期，即索引1)
    let realmIdx = G_CONFIG.CHILD.RECRUIT.INIT_REALM_IDX;
    let realmCfg = G_CONFIG.REALMS[realmIdx];
    
    // 4.3 计算初始产出 (PPS)
    let rarityCfg = G_CONFIG.RARITY[child.rarity];
    let baseMult = G_CONFIG.CHILD.RECRUIT.PPS_BASE_MULT;
let floatRange = G_CONFIG.CHILD.RECRUIT.PPS_FLOAT_RANGE;
let pps = Math.ceil(realmCfg.ppsBase * rarityCfg.mult * (baseMult + Math.random() * floatRange));

    // 4.4 随机性格
    let pKeys = Object.keys(G_TEXT.NPC_LOGS);
    let persona = pKeys[Math.floor(Math.random() * pKeys.length)];

    let newNPC = {
        id: Date.now() + Math.random(), // 生成新ID
        name: child.name,
        realm: realmCfg.name,
        rarity: child.rarity,
        rarityColor: rarityCfg.color,
        pps: pps,
        power: 0,
        traits: [randomTrait],
        bodyDesc: G_TEXT.getBodyDesc(), // 生成成年身体描述
        lastInteract: 0,
        isPregnant: false,
        dueTime: 0,
        maxLife: G_CONFIG.LIFESPAN.BASE[realmCfg.name] || 360,
        curLife: G_CONFIG.LIFESPAN.BASE[realmCfg.name] || 360,
        interactCount: 0,
        birthCount: 0,
        nurtureCount: 0,
        persona: persona,
        lifeLog: [],
        logFlags: { half: false, end: false }
    };

    // 5. 执行操作：移出子嗣列表，加入后宫列表
    gameState.harem.push(newNPC);
    gameState.children.splice(childIdx, 1);
    
    // 6. 保存与日志
    saveGame();

    let logText = G_TEXT.MSG.logRecruitChild(child.name, fatherName);
    if (father) {
        logText += "<br>" + G_TEXT.MSG.logFatherDespair(fatherName, child.name);
    }
    
    UI.log(logText, "interact"); // 使用粉色日志类型
    return { success: true };
}