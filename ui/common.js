import { formatNum } from '../data/textManager.js';

export const CommonUI = {
    // 📜 写日志
    log: function(html, type="normal") {
        let box = document.getElementById("game-logs");
        if (!box) return;
        
        let colorMap = {
            "normal": "#555",
            "success": "#4caf50",  // 绿
            "fail": "#f44336",     // 红
            "interact": "#e91e63"  // 粉
        };
        let borderColor = colorMap[type] || "#555";

        let div = document.createElement("div");
        div.style = `margin-top: 5px; border-left: 3px solid ${borderColor}; padding-left: 8px; padding-bottom: 2px; line-height: 1.4; background: rgba(0,0,0,0.1);`;
        div.innerHTML = `<span style="color:#777; font-size:10px;">[${new Date().toLocaleTimeString()}]</span> ${html}`;
        
        box.appendChild(div);
        document.getElementById("log-panel").scrollTop = document.getElementById("log-panel").scrollHeight;
        if (box.children.length > 50) box.removeChild(box.firstChild);
    },
    
    // 清空日志
    clearLog: function() {
        let box = document.getElementById("game-logs");
        if(box) box.innerHTML = "";
    },

    // 顶部提示
    notify: function(msg) {
        let div = document.createElement("div");
        div.style = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.8); color:white; padding:10px 20px; border-radius:5px; z-index:999; border:1px solid #d63384;";
        div.innerHTML = msg;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2000);
    },

    // 辅助工具：更新 DOM 内容（防闪烁）
    updateElement: function(id, html) {
        let el = document.getElementById(id);
        if (el && el.innerHTML !== html) el.innerHTML = html;
        return el;
    }
};