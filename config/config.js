// config.js
export const G_CONFIG = {
    FPS: 10,
    AUTOSAVE_MS: 10000, 
// ★新增：突破境界增加的后宫格子数
    BREAKTHROUGH_ADD_SLOTS: 2,

    // ★新增：稀有度排序（用于计算阶级差）
    RARITY_ORDER: ["废柴", "凡夫", "天才", "天骄", "神子"],
    // 境界设定
    REALMS: [
        { name: "凡人",     max: 100,           ppsBase: 1 },
        { name: "炼气期",   max: 10000,         ppsBase: 10 },
        { name: "筑基期",   max: 1000000,       ppsBase: 500 },
        { name: "金丹期",   max: 50000000,      ppsBase: 10000 },
        { name: "元婴期",   max: 2000000000,    ppsBase: 100000 },
        { name: "化神期",   max: 90000000000,   ppsBase: 5000000 },
        { name: "合道期",   max: 1000000000000, ppsBase: 100000000 }
    ],
    // ★新增：通用数值参数 (消除魔法数字)
    NUMERICS: {
        JEALOUSY_MIN_MULT: 0.1,      // 善妒Debuff下限 (最少保留10%产出)
        NPC_REALM_UP_CHANCE: 0.3,    // NPC比主角高一个境界的概率 (30%)
        NPC_HAS_TRAIT_CHANCE: 0.3,   // NPC 拥有初始特质的概率
        CAPTURE_CHARM_SCALE: 0.05,   // 魅力值对抓捕率的加成系数 (每10点魅力+5%)
        CAPTURE_RARITY_PENALTY: 0.1, // 稀有度阶级惩罚系数 (每高一阶-10%)
        TRAIT_BONUS_CAPTURE: 0.1     // "天媚"特质提供的抓捕率加成
    },
// ★新增：NPC生成相关的全局配置
    NPC_GENERATE: {
        PPS_FLOAT_MIN: 0.9,   // 产出波动下限 (90%)
        PPS_FLOAT_RANGE: 0.2  // 产出波动幅度 (0.2 即 +20%，总范围 0.9~1.1)
    },
    // ★新增：NPC机缘系统配置
    OPPORTUNITY: {
        // 检测频率：每隔多少秒为每个NPC检测一次 (建议 10秒，避免太频繁刷屏)
        CHECK_INTERVAL: 10, 
        
        // 触发概率：每次检测时，有多大几率触发机缘 (0.05 = 5%)
        // 意味着：每10秒有5%概率触发，平均200秒触发一次
        TRIGGER_CHANCE: 0.05,
        
        // 机缘类型权重 (相对比例，二者相加可以不等于100，程序会按比例算)
        WEIGHTS: {
            REALM_UP: 80,   // 顿悟：提升境界 (权重 80，概率较高)
            RARITY_UP: 20   // 洗髓：提升稀有度 (权重 20，概率较低，更珍贵)
        }
    },
    RARITY: {
        "废柴": { weight: 0.30, mult: 0.5, color: "#9e9e9e" },
        "凡夫": { weight: 0.40, mult: 1.0, color: "#ffffff" },
        "天才": { weight: 0.20, mult: 2.5, color: "#03a9f4" },
        "天骄": { weight: 0.09, mult: 10.0, color: "#9c27b0" },
        "神子": { weight: 0.01, mult: 50.0, color: "#ffeb3b" }
    },
    CONSTS: {
        SAVE_KEY: "love_xiuxian_save_v2", // 存档键名
        AUTOSAVE_BUFFER_MS: 100,          // 自动保存的时间误差缓冲
        FATHER_REACTION_DELAY: 1000,      // 父子感应延迟(毫秒)
        DEFAULT_RARITY: "凡夫"            // 默认稀有度
    },
    INTERACT: {
        INITIAL_SLOTS: 5,
        COOLDOWN: 5,      
        // ★新增：单次双修获得的收益（相当于挂机多少秒）
        INTERACT_GAIN_SECONDS: 60,

        PREGNANCY_CHANCE: 0.3,  
        PREGNANCY_TIME: 10,     
        
        CAPTURE_BASE_CHANCE: 0.4,       
        CAPTURE_CRITICAL_FAIL_ADD: 0.3, 
        CAPTURE_ONE_NIGHT_MULT: 0.3,    
        
        ONE_NIGHT_GAIN_SECONDS: 300,    
        DISCARD_GAIN_SECONDS: 600,      
        FAIL_LOSS_SECONDS: 300          
    },

    CHILD: {
        GROW_SECONDS: 30,       
        BASE_BONUS: 0.01,       
        // ★新增：禁忌互动成功率
        INTERACT_CHANCE: 0.3,
        // ★新增：禁忌互动收益（相当于挂机多少秒）
        INTERACT_GAIN_SECONDS: 300,
        TALENT_MULT: { "废柴": 1, "凡夫": 2, "天才": 5, "天骄": 10, "神子": 50 },
        RECRUIT: {
            INIT_REALM_IDX: 1,    // 初始境界索引 (1 = 炼气期)
            PPS_BASE_MULT: 1.1,   // 基础产出倍率 (1.1 = 110%)
            PPS_FLOAT_RANGE: 0.2  // 产出波动范围 (0.2 = +20%)
        }
    },
// ★新增：寿元系统配置 (单位：秒)
    LIFESPAN: {
        // 境界基础寿命 (参考你的设定：3m, 6m, 10m...)
        BASE: {
            "凡人": 180,     // 3分钟
            "炼气期": 360,   // 6分钟
            "筑基期": 600,   // 10分钟
            "金丹期": 1200,  // 20分钟
            "元婴期": 3600,  // 1小时
            "化神期": 10800, // 3小时
            "合道期": 86400  // 24小时 (几乎永生)
        },
        INTERACT_COST: 10,   // 每次双修消耗多少秒寿命 (体现“燃烧”设定)
        PREGNANT_COST: 30,    // 每次生子消耗多少秒寿命 (元气大伤)
        WARNING_THRESHOLD: 60, // 寿命低于多少秒时显示红色预警
        DEFAULT_MAX: 100     // 默认最大寿命（兜底用）
    },
    NURTURE: {
        // 消耗系数：每次温养消耗 NPC所在境界上限 * 此系数 的修为
        // (例如：炼气期NPC上限10000，系数0.05，则消耗500修为)
        COST_RATIO: 0.05, 
        
        // 基础收益：每次温养增加的基础寿命 (秒)
        BASE_GAIN_SEC: 600, 
        
        // 边际效应：每次温养后，效果衰减的比例 (0.1 = 效果降低10%)
        DECAY_RATE: 0.1,
        
        // 最低效率：衰减到多少为止 (0.1 = 最低还有10%的效果)
        MIN_EFFICIENCY: 0.1,

        // 稀有度转化率 (天骄吸收好，废柴浪费多)
        RARITY_MULT: {
            "废柴": 0.5,
            "凡夫": 1.0,
            "天才": 1.2,
            "天骄": 1.5,
            "神子": 2.0
        }
    },
    TRAIT_EFFECTS: {
        "名器": { desc: "双修收益翻倍", interactMult: 2.0 }, 
        "纯阳": { desc: "产出+50%", ppsMult: 1.5 },   
        "善妒": { desc: "全局产出-10%", globalDebuff: 0.1 }, 
        "贞烈": { desc: "难孕但子强", pregChanceMult: 0.1, childBonusMult: 5.0 }, 
        "多汁": { desc: "易孕冷却半", pregChanceMult: 2.0, cooldownMult: 0.5 }, 
        "天媚": { desc: "抓捕判定加成", charmBonus: 10 },
        "旺妻": { desc: "暂未实装", breakProb: 0.2 } 
    },

    // ★★★ 修复点：补全了 desc 描述字段 ★★★
    SKILLS: {
        "CHARM": {
            name: "天魔舞", desc: "提升抓捕成功率，解锁调教文本",
            maxLevel: 5, 
            type: "stat_capture", 
            costs: [1, 5, 15, 50, 200], 
            effects: [
                { val: 0.05, desc: "抓捕成功率 +5%" }, 
                { val: 0.10, desc: "抓捕成功率 +10%" }, 
                { val: 0.15, desc: "抓捕成功率 +15%，解锁【心奴】文本" }, 
                { val: 0.25, desc: "抓捕成功率 +25%" }, 
                { val: 0.40, desc: "抓捕成功率 +40%，解锁【完全调教】文本" }
            ]
        },
        "TECHNIQUE": {
            name: "阴阳合欢功", desc: "提升双修收益，解锁极乐文本",
            maxLevel: 5, 
            type: "stat_interact", 
            costs: [10, 50, 150, 500, 2000],
            effects: [
                { val: 1.2, desc: "双修收益 +20%" }, 
                { val: 1.5, desc: "双修收益 +50%" }, 
                { val: 2.0, desc: "双修收益 +100%，解锁【潮喷】文本" }, 
                { val: 3.0, desc: "双修收益 +200%" }, 
                { val: 6.0, desc: "双修收益 +500%，解锁【子宫榨精】文本" }
            ]
        },
        "HARVEST": {
            name: "噬魂夺元手", desc: "提升采补销毁收益，解锁猎奇文本",
            maxLevel: 5, 
            type: "stat_discard",
            costs: [1, 5, 15, 50, 200],
            effects: [
                { val: 1.2, desc: "采补/销毁收益 +20%" }, 
                { val: 1.5, desc: "采补/销毁收益 +50%" }, 
                { val: 2.0, desc: "采补/销毁收益 +100%，解锁【人干】文本" }, 
                { val: 3.0, desc: "采补/销毁收益 +200%" }, 
                { val: 6.0, desc: "采补/销毁收益 +500%，解锁【吞噬神魂】文本" }
            ]
        }
    }
};