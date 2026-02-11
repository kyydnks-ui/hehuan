import { gameState } from '../../core/state.js';
import { G_TEXT } from '../../data/textManager.js';

export const ChildPanel = {
    update: function() {
        const childList = document.getElementById("child-list");
        if (!childList) return;

        let existingChildren = Array.from(childList.children);
        let activeChildIds = new Set();
        let now = Date.now();
        const T = G_TEXT.GUI;

        gameState.children.forEach(c => {
            let cId = `child-${c.id}`;
            activeChildIds.add(cId);
            let btnHtml = "";
            let statusHtml = "";
            let timeLeft = Math.ceil((c.matureTime - now) / 1000);

            if (timeLeft > 0) {
                // "👶 抚养中 30s"
                btnHtml = `<button disabled style="background:#444; color:#888; border:1px solid #555; padding:2px 8px; font-size:11px;">${T.BUTTONS.waiting_preg || "抚养"} ${timeLeft}${T.LABELS.unit_sec || "s"}</button>`;
                // "(幼年)"
                statusHtml = `<span style="color:#aaa; font-size:10px;">${T.LABELS.child}</span>`;
            } else {
                c.isAdult = true; 
                // ★修改：成年后显示两个按钮
                // 1. 唤醒禁忌 (仅一次性收益)
                // 2. 收入后宫 (转化)
                btnHtml = `
                    <button onclick="window.doChildInteract(${c.id})" style="background:transparent; border:1px solid #03a9f4; color:#03a9f4; padding:2px 5px; font-size:11px; cursor:pointer; margin-right:5px;">${T.BUTTONS.wake_taboo}</button>
                    <button onclick="window.doRecruitChild(${c.id})" style="background:#e91e63; border:none; color:white; padding:2px 8px; font-size:11px; cursor:pointer;">${T.BUTTONS.recruit}</button>
                `;
            }
            // "父: xxx"
            let innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:${c.rarityColor}">${c.name} ${statusHtml}</span>
                    <span style="color:#aaa">${T.LABELS.father}: ${c.fatherName}</span>
                </div>
                <div style="text-align:right; margin-top:5px;">
                    ${btnHtml}
                </div>
            `;

            let div = document.getElementById(cId);
            if (!div) {
                div = document.createElement("div");
                div.id = cId;
                div.style = "background: #0d2b38; padding: 8px; margin-bottom: 5px; border-left: 3px solid #03a9f4; font-size: 12px;";
                div.innerHTML = innerHTML;
                childList.appendChild(div);
            } else {
                if (div.innerHTML !== innerHTML) div.innerHTML = innerHTML;
            }
        });

        existingChildren.forEach(div => {
            if (!activeChildIds.has(div.id)) childList.removeChild(div);
        });
    }
};