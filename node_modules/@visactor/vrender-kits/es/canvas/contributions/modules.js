import { browserCanvasModule } from "./browser/modules";

import { feishuCanvasModule } from "./feishu/modules";

import { lynxCanvasModule } from "./lynx/modules";

import { nodeCanvasModule } from "./node/modules";

import { taroCanvasModule } from "./taro/modules";

import { ttCanvasModule } from "./tt/modules";

import { wxCanvasModule } from "./wx/modules";

export function loadAllCavnvas(container) {
    container.load(browserCanvasModule), container.load(feishuCanvasModule), container.load(lynxCanvasModule), 
    container.load(nodeCanvasModule), container.load(taroCanvasModule), container.load(ttCanvasModule), 
    container.load(wxCanvasModule);
}

export function loadBrowserCanvas(container) {
    container.load(browserCanvasModule);
}

export function loadFeishuCanvas(container) {
    container.load(feishuCanvasModule);
}

export function loadLynxCanvas(container) {
    container.load(lynxCanvasModule);
}

export function loadNodeCanvas(container) {
    container.load(nodeCanvasModule);
}

export function loadTaroCanvas(container) {
    container.load(taroCanvasModule);
}

export function loadTTCanvas(container) {
    container.load(ttCanvasModule);
}

export function loadWxCanvas(container) {
    container.load(wxCanvasModule);
}
//# sourceMappingURL=modules.js.map