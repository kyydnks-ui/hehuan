import { G_CONFIG } from '../../config/config.js';
import { gameState } from '../../core/state.js';
import { formatNum, G_TEXT } from '../../data/textManager.js';

export const SkillPanel = {
    update: function() {
        const skillDiv = document.getElementById("skill-list");
        if (!skillDiv) return;

        let html = "";
        const skills = G_CONFIG.SKILLS;
        const pSkills = gameState.player.skills;
        const T = G_TEXT.GUI.SKILLS;
        const BTN = G_TEXT.GUI.BUTTONS;
        const L = G_TEXT.GUI.LABELS;

        for (let key in skills) {
            let cfg = skills[key];
            let lv = pSkills[key] || 0;
            let isMax = lv >= cfg.maxLevel;
            
            let costInfo = "";
            let btnColor = "#f44336";
            let canUpgrade = false;

            if (!isMax) {
                let cost = cfg.costs[lv];
                let current = 0;
                
                if (cfg.type === "stat_interact") {
                    current = gameState.stats.totalInteract || 0;
                    // "需双修: 10/20 次"
                    costInfo = `${T.req_interact}: ${current}/${cost} ${L.unit_times || ""}`;
                } else if (cfg.type === "stat_capture") {
                    current = gameState.stats.totalCapture || 0;
                    // "需抓捕: 5/10 人"
                    costInfo = `${T.req_capture}: ${current}/${cost} ${L.unit_people || ""}`;
                } else if (cfg.type === "stat_discard") {
                    current = gameState.stats.totalDiscard || 0;
                    // "需销毁: 5/10 人"
                    costInfo = `${T.req_discard}: ${current}/${cost} ${L.unit_people || ""}`;
                } else {
                    current = gameState.player.power;
                    // "消耗: 100 修为"
                    costInfo = `${T.cost}: ${formatNum(cost)} ${L.power}`;
                }

                if (current >= cost) {
                    btnColor = "#4caf50";
                    canUpgrade = true;
                }
            }

            let effectDesc = (lv > 0) ? (cfg.effects[lv-1].desc) : (T.not_learned || "尚未修习");
            let nextDesc = (!isMax) ? (cfg.effects[lv].desc) : (T.max_level || "已臻化境");

            // "领悟" / "MAX" / "当前" / "下级"
            let btnText = isMax ? BTN.max : (canUpgrade ? BTN.upgrade : BTN.locked);

            html += `
            <div style="background:rgba(0,0,0,0.3); padding:8px; margin-bottom:5px; border:1px solid #555; font-size:12px;">
                <div style="display:flex; justify-content:space-between; font-weight:bold; color:#ffeb3b;">
                    <span>${cfg.name} (Lv.${lv})</span>
                    ${!isMax ? `<button onclick="window.doUpgrade('${key}')" style="padding:2px 5px; font-size:11px; background:${btnColor}; border:none; color:white;">${btnText} ${costInfo}</button>` : `<span style="color:#aaa">${btnText}</span>`}
                </div>
                <div style="color:#aaa; margin:3px 0; font-style:italic;">${cfg.desc}</div>
                <div style="color:#e91e63;">${T.current}: ${effectDesc}</div>
                ${!isMax ? `<div style="color:#888;">${T.next}: ${nextDesc}</div>` : ""}
            </div>
            `;
        }
        if (skillDiv.innerHTML !== html) skillDiv.innerHTML = html;
    }
};