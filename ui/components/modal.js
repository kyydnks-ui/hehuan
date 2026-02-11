// ui/components/modal.js
import { G_TEXT } from '../../data/textManager.js';
import { gameState } from '../../core/state.js';

export const ModalUI = {
    showCard: function(id) {
        const npc = gameState.harem.find(n => n.id === id);
        if (!npc) return;

        // --- ★ 修改开始：不再随机抽取 thought，而是生成生平履历列表 ---
        let logsHtml = "";
        if (npc.lifeLog && npc.lifeLog.length > 0) {
            logsHtml = npc.lifeLog.map((log, index) => {
                // 根据索引简单判断阶段标签
                let label = "";
                if (index === 0) label = "【初见】";
                else if (index === npc.lifeLog.length - 1 && npc.curLife < npc.maxLife * 0.2) label = "【弥留】"; 
                else label = "【陪伴】";
                
                return `<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px dashed #555; color:#bbb;">
                            <span style="color:#e91e63; font-size:11px;">${label}</span><br>
                            ${log}
                        </div>`;
            }).join("");
        } else {
            // 兼容旧存档：如果没有日记，显示默认文本
            logsHtml = "<div style='color:#666;'>（此人不论过往，只争朝夕...）</div>";
        }
        // --- ★ 修改结束 ---

        let overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.onclick = () => overlay.remove(); 

        const STATS = G_TEXT.GUI.CARD_STATS;
        const L = G_TEXT.GUI.LABELS;

        // ★ 新增：性格标签（显示在名字旁边）
        let personaLabel = npc.persona ? `<span style="background:#333; color:#aaa; padding:2px 5px; border-radius:4px; font-size:12px; margin-left:5px;">${npc.persona}</span>` : "";

        overlay.innerHTML = `
            <div class="char-card" onclick="event.stopPropagation()">
                <div class="char-card-close" onclick="this.parentElement.parentElement.remove()">×</div>
                
                <h2 style="color:${npc.rarityColor}; text-align:center; margin-top:0;">
                    [${npc.rarity}] ${npc.name} ${personaLabel}
                </h2>
                
                <div class="char-card-section">
                    <p><b>${STATS.power}:</b> ${npc.realm}</p>
                    <p><b>${STATS.life}:</b> ${Math.floor(npc.curLife)} / ${npc.maxLife}${L.unit_sec}</p>
                </div>

                <div class="char-card-section" style="font-size:13px; color:#ddd;">
                    ${npc.bodyDesc}
                </div>

                <div class="char-card-section" style="display:flex; justify-content:space-around; font-size:12px;">
                    <div style="text-align:center;">${STATS.interact}<br><span class="highlight">${npc.interactCount || 0}</span></div>
                    <div style="text-align:center;">${STATS.birth}<br><span class="highlight">${npc.birthCount || 0}</span></div>
                    <div style="text-align:center;">${STATS.nurture}<br><span class="highlight">${npc.nurtureCount || 0}</span></div>
                </div>

                <div class="char-thought" style="max-height: 150px; overflow-y: auto; font-style: normal; font-size: 13px; line-height: 1.6;">
                    ${logsHtml}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
};