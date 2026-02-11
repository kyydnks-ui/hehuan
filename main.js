import { G_CONFIG } from './config/config.js';
import { G_TEXT, formatNum } from './data/textManager.js';
import { gameState } from './core/state.js';
import { GameLogic } from './core/game.js';
import { UI } from './ui/ui.js';
window.onload = function() {
    console.log(G_TEXT.GUI.STARTUP_LOG);
window.UI = UI;
    // 挂载全局函数
    window.doInteract = function(id) {
        let res = GameLogic.interact(id);
        if (res && res.msg) UI.notify(res.msg);
        UI.update();
    };

    window.doDeliver = function(id) {
        let res = GameLogic.deliverBaby(id);
        if (res && res.msg) UI.notify(res.msg);
        UI.update();
    };

    window.doChildInteract = function(id) {
        GameLogic.interactChild(id);
        UI.update();
    };
window.doRecruitChild = function(id) {
        if(confirm(G_TEXT.GUI.RECRUIT_CONFIRM)) {
            let res = GameLogic.recruitChild(id);
            if (res && res.msg) UI.notify(res.msg);
            UI.update();
        }
    };
    window.doDiscard = function(id) {
        if (confirm(G_TEXT.GUI.DISCARD_CONFIRM)) {
            GameLogic.discard(id);
            UI.update();
        }
    };
    window.doNurture = function(id) {
        GameLogic.nurtureNPC(id);
        UI.update();
    };
    window.doUpgrade = function(key) {
        let res = GameLogic.upgradeSkill(key);
        if (res.msg) UI.notify(res.msg);
        UI.update();
    };

    // 绑定按钮
    // 1. 手动保存
    document.getElementById("btn-save").onclick = function() {
        GameLogic.saveGame();
        UI.notify(G_TEXT.GUI.SAVE_SUCCESS);
    };

    // 2. 导出存档
    document.getElementById("btn-export").onclick = function() {
        let str = GameLogic.exportSave();
        if (str) {
            // 尝试写入剪贴板
            navigator.clipboard.writeText(str).then(() => {
                UI.notify(G_TEXT.GUI.EXPORT_SUCCESS);
            }).catch(() => {
                // 如果浏览器不支持自动复制，则弹窗显示
                prompt(G_TEXT.GUI.EXPORT_PROMPT, str);
            });
        } else {
            UI.notify(G_TEXT.GUI.EXPORT_FAIL);
        }
    };

    // 3. 导入按钮（切换显示输入框）
    document.getElementById("btn-import").onclick = function() {
        let area = document.getElementById("import-area");
        area.style.display = (area.style.display === "none") ? "block" : "none";
    };

    // 4. 确认导入
    document.getElementById("btn-confirm-import").onclick = function() {
        let val = document.getElementById("import-data").value;
        let res = GameLogic.importSave(val);
        if (res.success) {
            alert(res.msg);
            location.reload(); // 刷新网页以加载新存档
        } else {
            UI.notify(G_TEXT.GUI.IMPORT_PREFIX_FAIL + res.msg);
        }
    };

    // 5. 删档重开 (替换原来的逻辑)
    document.getElementById("btn-reset").onclick = function() {
       if (confirm(G_TEXT.GUI.RESET_CONFIRM)) {
            GameLogic.resetGame();
        }
    };
    document.getElementById("btn-explore").onclick = function() {
        gameState.currentNPC = GameLogic.generateNPC();
        UI.update();
    };

    document.getElementById("btn-capture").onclick = function() {
        let res = GameLogic.captureNPC();
        if (res.msg) UI.notify(res.msg);
        UI.update();
    };

    document.getElementById("btn-ignore").onclick = function() {
        if (!gameState.currentNPC) return;
        let gain = gameState.currentNPC.pps * G_CONFIG.INTERACT.CAIBU_SECONDS;
        // 简单采补逻辑
        if(!gain) gain = 10; 
        GameLogic.addPower(gain);
        gameState.currentNPC = null; 
        UI.notify(G_TEXT.GUI.ignoreGain(formatNum(gain)));
        UI.update();
    };

    document.getElementById("breakthrough-btn").onclick = function() {
        let res = GameLogic.breakthrough();
        UI.notify(res.msg);
        UI.update();
    };

    // 启动循环
    setInterval(() => {
        GameLogic.loop();
        UI.update();
    }, 1000 / G_CONFIG.FPS);

    UI.update();
};