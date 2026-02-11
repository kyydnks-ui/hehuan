import { formatNum } from '../utils/utils.js';
import { NAMES_DB } from './names.js';
import { TRAITS, APPEARANCE, BODY_LIB } from './assets.js';
import { SKILL_R18, R18, NPC_LOGS } from './narrative.js';
export { formatNum };
export const G_TEXT = {
    MSG: {
        // 1. 基础提示
        NO_PERSON: "面前没人！",
        NO_POWER: "修为不足！",
        COOL_DOWN: "贤者时间中...",
        PREGNANT_LOCK: "以此状态不宜双修...",
        NOT_YET: "时辰未到",
        
        // 2. 抓捕相关
        CAPTURE_FAIL_DAMAGE: "遭到了反噬！",
        CAPTURE_FAIL_IGNORE: "对方对你不感兴趣。",
        CAPTURE_ONE_NIGHT: "一夜风流，但他离开了。",
        CAPTURE_FULL: "俘获成功但后宫已满！只能放他走了...",
        // 动态：成功抓捕
        captureSuccess: function(name) { return `成功俘获 [${name}]！`; },
        // 统计项名称 (用于技能升级条件显示)
        STAT_NAMES: {
            interact: "双修次数",
            capture: "抓捕次数",
            discard: "销毁/采补次数"
        },
        // 3. 突破相关
        // 动态：突破成功
        breakthroughSuccess: function(realm) { return `突破成功！晋升为 [${realm}]！`; },

        // 4. 技能相关
        SKILL_MAX: "已修炼至化境！",
        // 动态：缺钱
        skillNoPower: function(cost) { return `修为不足！需要 ${formatNum(cost)}`; },
        // 动态：缺统计次数
        skillNoStat: function(name, cur, target) { return `历练不足！当前${name}: ${cur}/${target}`; },
        // 动态：升级成功
        skillSuccess: function(name, lv) { return `修炼成功！[${name}] 提升至 ${lv} 层！`; },
        // --- ★新增：日志显示文案 (Log) ---
        // 1. 抓捕日志
        logOneNight: function(gain) { return `💕 <span style="color:#ff80ab">露水情缘，修为 +${formatNum(gain)}</span>`; },
        logCapture: "🕸️ <span style='color:#e91e63'>俘获成功！入住后宫。</span>",
        logFailLoss: "FAIL_LOSS", // 对应 text.js 里的 key
        logFailDraw: "FAIL_DRAW",
        
        // 2. 双修日志
        logInteract: function(gain, bonusStr) { return `✨ 修为 +${formatNum(gain)}${bonusStr}`; },
        bonusMingqi: " <span style='color:#ff0055'>(名器加成!)</span>",
        bonusSkill: function(mult) { return ` (功法x${mult})`; },

        // 3. 生子/子嗣日志
        childSurname: "云", // 子嗣的固定姓氏
        logBirth: function(name, sec) { return `➔ 获得子嗣 [${name}] (需抚养 ${sec} 秒)`; },
        childLocked: function(name) { return `👶 ${name} 尚在襁褓中，不可胡来！`; },
        childReject: function(name) { return `<span style="color:#888">${name} 满脸通红地推开了你：“母亲，这...这于理不合！” (互动失败)</span>`; },
        // 温养相关提示
        nurtureSuccess: function(name, gainSec, cost) { return `💗 温养成功！消耗 ${formatNum(cost)} 修为，[${name}] 寿元 +${Math.floor(gainSec)}秒`; }, nurtureFailCost: "修为不足，无法进行温养！",
        logTaboo: function(gain) { return `⚡ <span style="color:#ffeb3b">禁忌快感！修为暴涨 +${formatNum(gain)}</span>`; },

        // 4. 销毁日志
        logDiscard: function(gain) { return `💀 销毁炉鼎，获得残余修为 +${formatNum(gain)}`; },
        // ★新增：原本硬编码在逻辑里的日志
        logDeath: function(name) { 
            return `<span style="color:#999">⚰️ [${name}] 寿元耗尽，坐化归墟了... (修为消散)</span>`; 
        },
        logFatherReactionWrapper: function(text) { 
            return `<span style="border-left: 2px solid #03a9f4; padding-left: 5px;">${text}</span>`; 
        },
        // ★新增：机缘日志
        logRealmUp: function(name, oldRealm, newRealm) {
            const reasons = ["观云海翻腾，忽有所悟", "在后山枯坐三日，心境突破", "研读古籍，触类旁通", "受云雾衡点拨，灵台清明"];
            let r = reasons[Math.floor(Math.random() * reasons.length)];
            return `🚀 <span style="color:#03a9f4">【顿悟】${name} ${r}，境界从 [${oldRealm}] 突破至 [${newRealm}]！(产出大增)</span>`;
        },
        logRarityUp: function(name, oldRarity, newRarity) {
            const reasons = ["误食了一株九转洗髓草", "觉醒了体内的上古血脉", "经历生死劫难，脱胎换骨", "得云雾衡赐下一滴精血"];
            let r = reasons[Math.floor(Math.random() * reasons.length)];
            return `🌟 <span style="color:#ffeb3b">【洗髓】${name} ${r}，根骨提升！从 [${oldRarity}] 晋升为 [${newRarity}]！</span>`;
        },
    // ★新增：子嗣收入后宫的禁忌日志
        logRecruitChild: function(childName, fatherName) {
            const logs = [
                `你挑起 [${childName}] 的下巴，看着那张与 [${fatherName}] 极度相似却更加青涩的脸庞，指尖划过他的喉结：“从今天起，你也来侍奉为师吧...”`,
                `[${childName}] 颤抖着跪在你脚边，褪去了弟子的衣冠，换上了与他父亲当年一样的轻纱，成为了后宫的新宠。`,
                `“若是为了父亲，孩儿...愿意。” [${childName}] 含泪闭上眼，任由你将专属炉鼎的印记打入他的体内。`,
                `这一夜，你没有去找 [${fatherName}]，而是留宿在了刚成年的 [${childName}] 房中。初经人事的少年，有着比他父亲更紧致的滋味。`
            ];
            return `💔 <span style="color:#e91e63">【堕落】${logs[Math.floor(Math.random() * logs.length)]}</span>`;
        },
        
        // ★新增：父亲目睹儿子入宫的反应 (NTR感拉满)
        logFatherDespair: function(fatherName, childName) {
            const logs = [
                `[${fatherName}] 听着隔壁传来的初夜啼哭声，指甲深深嵌入掌心，鲜血淋漓：“这就是我们父子的宿命吗...”`,
                `看到满身吻痕回来的 [${childName}]，[${fatherName}] 崩溃地摔碎了手中的玉佩，那是他原本想送给儿子成年礼的护身符。`,
                `[${fatherName}] 跪在你的寝宫门外整整一夜，听着儿子的求饶声变成娇喘，眼里的光彻底熄灭了。`,
                `“如果你敢伤他...” [${fatherName}] 红着眼冲过来，却在看到 [${childName}] 依偎在你怀里时，绝望地瘫软在地。`
            ];
            return `<span style="border-left: 2px solid #9c27b0; padding-left: 5px; color:#aaa; font-style:italic;">${logs[Math.floor(Math.random() * logs.length)]}</span>`;
        }
    },
    GUI: {
        STARTUP_LOG: "合欢宗爽游 Pro版 启动！",
        DISCARD_CONFIRM: "⚠️ 警告：确定要彻底榨干并销毁这个炉鼎吗？\n\n此操作不可逆，该角色将永久消失！",
       // ★新增：子嗣转化确认弹窗
        RECRUIT_CONFIRM: "⚠️ 确定要将此子嗣收入后宫吗？\n\n（这将触发背德剧情，且无法撤销）",
        SAVE_SUCCESS: "💾 游戏已手动保存！",
        EXPORT_SUCCESS: "✅ 存档已复制到剪贴板！",
        EXPORT_PROMPT: "请复制下方存档代码：",
        EXPORT_FAIL: "❌ 导出失败",
        IMPORT_PREFIX_FAIL: "❌ ",
        RESET_CONFIRM: "💀 警告：确定要删除所有进度从头开始吗？\n此操作无法撤销！",
        // 逻辑层日志/提示
        SAVE_AUTO: "自动保存成功",
        SAVE_ERR: "保存失败",
        IMPORT_EMPTY: "存档内容为空！",
        IMPORT_FORMAT_ERR: "存档格式错误！",
        IMPORT_SUCCESS: "导入成功！即将刷新...",
        IMPORT_CORRUPT: "存档损坏或格式不对！",
        // 动态文本
        ignoreGain: function(val) { return `采补获得 ${val} 修为`; },
        importSuccess: "导入成功！即将刷新...", // 这一句原本在logic里，这里备用
        CARD_TITLE: "炉鼎档案",
        // --- ★ 新增 UI 文本配置 ★ ---
        LABELS: {
            realm: "境界",
            power: "修为",
            pps: "产出",
            life: "寿元",
            slots: "后宫容量",
            child_bonus: "弟子", // 例: 弟子: 5
            bonus_suffix: "加成", // 例: (加成 +10%)
            pregnant: "【有喜】",
            delivery: "【临盆】",
            adult: "(成年)",
            child: "(幼年)",
            father: "父",
            auto_pps: "自动收益",
            unit_sec: "s",  // 秒的单位
            unit_times: "次", 
            unit_people: "人"
        },
        
        BUTTONS: {
            interact: "💕 双修",
            capture: "🕸️ 抓入后宫",
            discard: "×",
            nurture: "💖 温养",
            deliver: "👶 接生",
            waiting_preg: "孕育中",
            waiting_cd: "贤者",
            wake_taboo: "💔 唤醒禁忌",
            recruit: "💔 收入后宫",
            upgrade: "🔼 领悟",
            locked: "🔒",
            max: "MAX",
            breakthrough_fmt: function(realm) { return `✨ 冲击 ${realm} ✨`; }
        },

        SKILLS: {
            req_interact: "需双修",
            req_capture: "需抓捕",
            req_discard: "需销毁",
            cost: "消耗",
            current: "当前",
            next: "下级",
            not_learned: "尚未修习",
            max_level: "已臻化境"
        },
        
        NPC: {
            info_fmt: function(realm, pps) { return `境界: ${realm} | 产出: ${pps}/秒`; }
        },

        CARD_STATS: {
            interact: "双修次数",
            birth: "诞下子嗣",
            nurture: "受温养数",
            life: "剩余寿元",
            power: "当前修为"
        },
    },
    // 2. 引用外部数据
    NAMES_DB,
    TRAITS,
    APPEARANCE,
    BODY_LIB,
    SKILL_R18,
    R18,
    NPC_LOGS,
    // 🛠️ 核心工具函数：放在最前防止找不到
    r: function(arr) { 
        if (!arr || arr.length === 0) return "";
        return arr[Math.floor(Math.random() * arr.length)]; 
    },

    // 1. 只获取名（不含姓）-> 供子嗣使用
    getOnlyName: function() {
        const db = this.NAMES_DB;
        let rand = Math.random();
        
        if (rand < 0.4) {
            // 模式1: 单名 (40%)
            return this.r(db.male_single);
        } else if (rand < 0.8) {
            // 模式2: 双字名 (40%)
            return this.r(db.male_prefix) + this.r(db.male_suffix);
        } else {
            // 模式3: 宿命感名字 (20%)
            return this.r(db.male_fate);
        }
    },

    // 2. 获取完整名字（姓+名）-> 供 NPC 使用
    getName: function() {
        // 先检查是否有数据，防止报错
        if (!this.NAMES_DB || !this.NAMES_DB.surnames) return "无名氏";
        const surname = this.r(this.NAMES_DB.surnames);
        return surname + this.getOnlyName(); // 姓 + 名
    },

    // 获取身体描述
    getBodyDesc: function() {
        const A = this.APPEARANCE;
        const C = this.BODY_LIB.CHEST;
        const G = this.BODY_LIB.GENITAL;
        
        const faceDesc = `${this.r(A.FACE)}，${this.r(A.EYES)}。${this.r(A.BODY)}，${this.r(A.VIBE)}。`;
        const chestDesc = `胸膛${this.r(C.type)}，肌肤${this.r(C.skin)}，两点${this.r(C.nipple)}。`;
        const assetDesc = `胯下那话儿${this.r(G.size)}，${this.r(G.hardness)}，${this.r(G.shaft)}。龟头${this.r(G.glans)}，${this.r(G.scrotum)}。`;
        
        return `
            <span style="color:#a8e6cf">【容貌】</span>${faceDesc}<br>
            <span style="color:#eecfa1">【胸躯】</span>${chestDesc}<br>
            <span style="color:#ff80ab">【私处】</span>${assetDesc}
        `;
    },

    getSkillLog: function(skillType, level, npcName) {
        let lib = this.SKILL_R18[skillType];
        let list = lib.LV1;
        if (level >= 5) list = lib.LV5;
        else if (level >= 3) list = lib.LV3;
        
        let str = this.r(list);
        str = str.replace(/{name}/g, `<span style="color:#e91e63; font-weight:bold;">${npcName}</span>`);
        return str;
    },

    getLog: function(type, name, father="") {
        let list = this.R18[type] || ["..."];
        let str = this.r(list);
        str = str.replace(/{name}/g, `<span style="color:#e91e63; font-weight:bold;">${name}</span>`);
        if(father) str = str.replace(/{father}/g, `<span style="color:#03a9f4;">${father}</span>`);
        return str;
    }
};
