import { G_CONFIG } from '../../config/config.js';
import { G_TEXT, formatNum } from '../../data/textManager.js';
import { gameState } from '../../core/state.js';

export const HaremPanel = {
    update: function() {
        const listDiv = document.getElementById("harem-list");
        let now = Date.now();
        let activeIds = new Set();
        
        // 简写引用，方便后续调用
        const T = G_TEXT.GUI; 
        const L = T.LABELS || {}; // 防止 textManager 还没改好时报错
        const B = T.BUTTONS || {};

        gameState.harem.forEach(n => {
            activeIds.add(`card-${n.id}`);
            
            // 1. 计算当前各种状态秒数
            let cdLeft = 0;
            if (!n.isPregnant) {
                let baseCD = G_CONFIG.INTERACT.COOLDOWN;
                if(n.traits && n.traits.includes("多汁")) {baseCD *= G_CONFIG.TRAIT_EFFECTS["多汁"].cooldownMult;}
                cdLeft = Math.ceil((baseCD * 1000 - (now - n.lastInteract)) / 1000);
            }
            let lifeSec = Math.floor(n.curLife || 0);
            let pregSec = n.isPregnant ? Math.ceil((n.dueTime - now) / 1000) : 0;
            
            // 2. 【核心】功能状态特征 (不包含秒数!)
            let functionalState = `${n.isPregnant}-${now >= n.dueTime}-${cdLeft > 0}-${n.pps}`;
            
            let cardId = `card-${n.id}`;
            let card = document.getElementById(cardId);
            
            // --- A: 如果卡片不存在，或者“功能状态”变了，才重写 HTML ---
            if (!card || card.getAttribute("data-func-state") !== functionalState) {
                if (!card) {
                    card = document.createElement("div");
                    card.id = cardId;
                    card.className = "harem-card";
                    listDiv.appendChild(card);
                }
                
                // 使用 textManager 中的配置，如果没有配置则回退到默认中文
                let txtDelivery = L.delivery || "【临盆】";
                let txtPregnant = L.pregnant || "【有喜】";
                
                let statusHtml = n.isPregnant ? (now >= n.dueTime ? `<span style="color:#ff9800">${txtDelivery}</span>` : `<span style="color:#e91e63">${txtPregnant}</span>`) : "";
                let traitSmallHtml = "";
                if (n.traits) {
                    n.traits.forEach(t => {
                        let cfg = G_TEXT.TRAITS[t];
                        if (cfg) traitSmallHtml += `<span title="${G_CONFIG.TRAIT_EFFECTS[t].desc}" style="cursor:help; color:${cfg.color}; border:1px solid ${cfg.color}; font-size:10px; padding:0 2px; margin-right:3px;">${t}</span>`;
                    });
                }

                // 按钮和标签文本 (带默认值回退)
                let txtLife = L.life || "寿元";
                let txtDiscard = B.discard || "×";
                let txtNurture = B.nurture || "💖 温养";

                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                       <div class="harem-name" onclick="UI.showCard(${n.id})" style="color:${n.rarityColor}; cursor:pointer; text-decoration:underline;">${n.name} ${traitSmallHtml} ${statusHtml}</div>
                        <div onclick="event.stopPropagation(); window.doDiscard(${n.id})" style="cursor:pointer; color:#666; font-size:16px; font-weight:bold; padding:0 5px;"  title="榨干销毁">${txtDiscard}</div>
                    </div>
                    <div style="display:flex; justify-content:space-between; color:#4caf50; font-size:12px;">
                         <span>+${formatNum(n.pps)}/s</span>
                         <span style="color:#aaa">[${n.rarity}] ${n.realm}</span>
                    </div>
                    <div style="font-size:11px; color:#aaa; margin-top:2px;">
                        ⏳ ${txtLife}: <span class="life-timer" style="color:${lifeSec < G_CONFIG.LIFESPAN.WARNING_THRESHOLD ? '#f44336' : '#ddd'}">${lifeSec}s</span> / ${n.maxLife || G_CONFIG.LIFESPAN.DEFAULT_MAX}s
                    </div>
                    <div class="btn-group" style="margin-top:8px; text-align:right;">
                        <span class="main-action-btn"></span>
                        <button type="button" onclick="window.doNurture(${n.id})" style="background:transparent; border:1px solid #e91e63; color:#e91e63; font-size:12px; padding:4px 8px; margin-left:5px; cursor:pointer;">${txtNurture}</button>
                    </div>
                `;
                
                // 根据状态初始化主按钮的内容
                let btnArea = card.querySelector(".main-action-btn");
                let txtDeliverBtn = B.deliver || "👶 接生";
                let txtWaitingPreg = B.waiting_preg || "孕育中";
                let txtWaitingCD = B.waiting_cd || "贤者";
                let txtInteract = B.interact || "💕 双修";

                if (n.isPregnant) {
                    if (now >= n.dueTime) {
                        btnArea.innerHTML = `<button type="button" onclick="window.doDeliver(${n.id})" style="background:#ff9800; font-size:12px; padding:5px; cursor:pointer;">${txtDeliverBtn}</button>`;
                    } else {
                        btnArea.innerHTML = `<button type="button" disabled class="time-btn" style="background:#777; font-size:12px; padding:5px;">${txtWaitingPreg} <span></span>s</button>`;
                    }
                } else {
                    if (cdLeft > 0) {
                        btnArea.innerHTML = `<button type="button" disabled class="time-btn" style="background:#555; font-size:12px; padding:5px;">${txtWaitingCD} <span></span>s</button>`;
                    } else {
                        btnArea.innerHTML = `<button type="button" onclick="window.doInteract(${n.id})" style="background:#e91e63; font-size:12px; padding:5px; cursor:pointer;">${txtInteract}</button>`;
                    }
                }
                card.setAttribute("data-func-state", functionalState);
            }

            // --- B: 每一帧更新数字 ---
            const lifeEl = card.querySelector(".life-timer");
            if (lifeEl) lifeEl.innerText = `${lifeSec}s`;

            const timeBtnSpan = card.querySelector(".time-btn span");
            if (timeBtnSpan) {
                timeBtnSpan.innerText = n.isPregnant ? pregSec : cdLeft;
            }
        });

        // 移除已不存在的卡片
        let existingCards = Array.from(listDiv.children);
        existingCards.forEach(div => {
            if (!activeIds.has(div.id)) listDiv.removeChild(div);
        });
    }
};