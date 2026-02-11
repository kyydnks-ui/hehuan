import { G_CONFIG } from '../../config/config.js';
import { G_TEXT, formatNum } from '../../data/textManager.js';
import { gameState } from '../../core/state.js';
import { CommonUI } from '../common.js'; // 用于 updateElement 如果需要，或者直接操作 DOM

export const NpcPanel = {
    update: function() {
        const npcDiv = document.getElementById("npc-display");
        const npc = gameState.currentNPC;
        
        if (npc) {
            npcDiv.style.display = "flex";
            let traitHtml = "";
            if (npc.traits && npc.traits.length > 0) {
                npc.traits.forEach(t => {
                    let cfg = G_TEXT.TRAITS[t];
                    // ★ 悬停显示解释
                    let desc = G_CONFIG.TRAIT_EFFECTS[t].desc;
                    if (cfg) traitHtml += `<span title="${desc}" style="cursor:help; background:${cfg.color}; color:white; padding:2px 5px; border-radius:3px; margin-right:5px; font-size:12px;">${t}</span>`;
                });
            }

            let infoHtml = `
                <div style="font-size:18px; margin-bottom:5px;">
                    <span style="color:${npc.rarityColor}">[${npc.rarity}] ${npc.name}</span>
                    ${traitHtml}
                </div>
            `;
            let nameEl = document.getElementById("npc-name");
            if(nameEl.innerHTML !== infoHtml) nameEl.innerHTML = infoHtml;
            
            let descHtml = `<div style="text-align:left; font-size:13px; line-height:1.5; color:#ddd; background:rgba(0,0,0,0.2); padding:8px; border-radius:5px;">${npc.bodyDesc}</div>`;
            let descEl = document.getElementById("npc-desc");
            if(descEl.innerHTML !== descHtml) descEl.innerHTML = descHtml;
            
           // "境界: xx | 产出: xx/秒"
            let infoText = G_TEXT.GUI.NPC.info_fmt(npc.realm, formatNum(npc.pps));
            document.getElementById("npc-info").innerText = infoText;
            document.getElementById("btn-capture").disabled = (gameState.harem.length >= gameState.haremSlots);
        } else {
            npcDiv.style.display = "none";
        }
    }
};