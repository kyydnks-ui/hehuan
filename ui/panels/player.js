import { G_CONFIG } from '../../config/config.js';
import { gameState } from '../../core/state.js';
import { formatNum, G_TEXT } from '../../data/textManager.js';

export const PlayerPanel = {
    update: function() {
        const p = gameState.player;
        const realmCfg = G_CONFIG.REALMS[p.realmIdx];
        const T = G_TEXT.GUI;

        // 静态标签在HTML中，这里只更新数值
        document.getElementById("p-realm").innerText = realmCfg.name;
        document.getElementById("p-power").innerText = formatNum(p.power);
        document.getElementById("p-max-power").innerText = formatNum(realmCfg.max);
        document.getElementById("p-pps").innerText = formatNum(p.totalPPS);
        document.getElementById("p-slots").innerText = `${gameState.harem.length} / ${gameState.haremSlots}`;
        
        let multPct = Math.round((p.globalMult - 1) * 100);
        // "弟子: 0 (加成 +0%)"
        document.getElementById("p-child-bonus").innerText = `${T.LABELS.child_bonus}: ${p.childCount || gameState.children.length} (${T.LABELS.bonus_suffix} +${multPct}%)`;

        let pct = Math.min(100, (p.power / realmCfg.max) * 100);
        document.getElementById("power-bar-fill").style.width = pct + "%";

        const btn = document.getElementById("breakthrough-btn");
        if (p.power >= realmCfg.max && p.realmIdx < G_CONFIG.REALMS.length - 1) {
            btn.style.display = "block";
            let nextRealm = G_CONFIG.REALMS[p.realmIdx+1].name;
            // "✨ 冲击 金丹期 ✨"
            btn.innerText = T.BUTTONS.breakthrough_fmt ? T.BUTTONS.breakthrough_fmt(nextRealm) : `✨ ${nextRealm} ✨`;
        } else {
            btn.style.display = "none";
        }
    }
};