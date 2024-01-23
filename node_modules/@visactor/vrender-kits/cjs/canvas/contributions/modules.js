"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.loadWxCanvas = exports.loadTTCanvas = exports.loadTaroCanvas = exports.loadNodeCanvas = exports.loadLynxCanvas = exports.loadFeishuCanvas = exports.loadBrowserCanvas = exports.loadAllCavnvas = void 0;

const modules_1 = require("./browser/modules"), modules_2 = require("./feishu/modules"), modules_3 = require("./lynx/modules"), modules_4 = require("./node/modules"), modules_5 = require("./taro/modules"), modules_6 = require("./tt/modules"), modules_7 = require("./wx/modules");

function loadAllCavnvas(container) {
    container.load(modules_1.browserCanvasModule), container.load(modules_2.feishuCanvasModule), 
    container.load(modules_3.lynxCanvasModule), container.load(modules_4.nodeCanvasModule), 
    container.load(modules_5.taroCanvasModule), container.load(modules_6.ttCanvasModule), 
    container.load(modules_7.wxCanvasModule);
}

function loadBrowserCanvas(container) {
    container.load(modules_1.browserCanvasModule);
}

function loadFeishuCanvas(container) {
    container.load(modules_2.feishuCanvasModule);
}

function loadLynxCanvas(container) {
    container.load(modules_3.lynxCanvasModule);
}

function loadNodeCanvas(container) {
    container.load(modules_4.nodeCanvasModule);
}

function loadTaroCanvas(container) {
    container.load(modules_5.taroCanvasModule);
}

function loadTTCanvas(container) {
    container.load(modules_6.ttCanvasModule);
}

function loadWxCanvas(container) {
    container.load(modules_7.wxCanvasModule);
}

exports.loadAllCavnvas = loadAllCavnvas, exports.loadBrowserCanvas = loadBrowserCanvas, 
exports.loadFeishuCanvas = loadFeishuCanvas, exports.loadLynxCanvas = loadLynxCanvas, 
exports.loadNodeCanvas = loadNodeCanvas, exports.loadTaroCanvas = loadTaroCanvas, 
exports.loadTTCanvas = loadTTCanvas, exports.loadWxCanvas = loadWxCanvas;
//# sourceMappingURL=modules.js.map