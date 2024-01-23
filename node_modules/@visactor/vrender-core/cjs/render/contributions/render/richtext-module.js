"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.richtextModule = void 0;

const inversify_1 = require("../../../common/inversify"), richtext_render_1 = require("./richtext-render"), symbol_1 = require("./symbol");

let loadRichtextModule = !1;

exports.richtextModule = new inversify_1.ContainerModule((bind => {
    loadRichtextModule || (loadRichtextModule = !0, bind(symbol_1.RichTextRender).to(richtext_render_1.DefaultCanvasRichTextRender).inSingletonScope(), 
    bind(symbol_1.GraphicRender).toService(symbol_1.RichTextRender));
}));
//# sourceMappingURL=richtext-module.js.map
