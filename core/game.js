// logic.js - 聚合入口
import { saveGame, resetGame, exportSave, importSave } from '../systems/SaveSystem.js';
import { loop, addPower } from './loop.js';
import { generateNPC } from '../systems/NpcSystem.js';
import { upgradeSkill, breakthrough } from '../systems/CultivationSystem.js';
import { captureNPC, interact, deliverBaby, interactChild, recruitChild, nurtureNPC, discard } from '../systems/ActionSystem.js';

export const GameLogic = {
    saveGame, resetGame, exportSave, importSave,
    loop, addPower,
    generateNPC,
    upgradeSkill, breakthrough,
    captureNPC, interact, deliverBaby, interactChild, recruitChild, nurtureNPC, discard
};