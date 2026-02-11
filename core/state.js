// state.js
// 默认初始状态
export const defaultState = {
    player: {
        name: "云雾衡", 
        power: 0,
        realmIdx: 0,
        totalPPS: 0,
        globalMult: 1.0,
        skills: { "CHARM": 0, "TECHNIQUE": 0, "HARVEST": 0 }
    },
    // ★★★ 修改：补全统计数据 ★★★
    stats: {
        totalInteract: 0, // 双修次数
        totalCapture: 0,  // 抓捕次数
        totalBirth: 0,    // 生子次数
        totalDiscard: 0   // 销毁/采补次数 (新增)
    },
    harem: [],
    children: [],
    haremSlots: 5,
    currentNPC: null,
    startTime: Date.now()
};

let savedData = null;
try {
    let str = localStorage.getItem("love_xiuxian_save_v2");
    if (str) savedData = JSON.parse(str);
} catch (e) {
    console.error("读取存档失败", e);
}

export const gameState = savedData || defaultState;

// 存档兼容性检查
if (!gameState.stats) gameState.stats = { totalInteract: 0, totalCapture: 0, totalBirth: 0, totalDiscard: 0 };
if (gameState.stats.totalDiscard === undefined) gameState.stats.totalDiscard = 0; // 补丁
if (!gameState.children) gameState.children = [];