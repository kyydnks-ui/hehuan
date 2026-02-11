import { CommonUI } from './common.js';
import { ModalUI } from './components/modal.js';
import { PlayerPanel } from './panels/player.js';
import { NpcPanel } from './panels/npc.js';
import { HaremPanel } from './panels/harem.js';
import { ChildPanel } from './panels/child.js';
import { SkillPanel } from './panels/skills.js';
import { formatNum } from '../data/textManager.js';

export const UI = {
    // 暴露通用接口
    log: CommonUI.log,
    clearLog: CommonUI.clearLog,
    notify: CommonUI.notify,
    updateElement: CommonUI.updateElement,
    
    // 暴露弹窗接口 (供 main.js 或 HTML onclick 调用)
    showCard: ModalUI.showCard,
    
    // 暴露格式化函数 (供 main.js 使用)
    formatNum: formatNum,

    // 主循环调用
    update: function() {
        PlayerPanel.update();
        NpcPanel.update();
        HaremPanel.update();
        ChildPanel.update();
        SkillPanel.update();
    }
};