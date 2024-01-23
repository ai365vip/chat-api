"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerTextGraphic = void 0;

const text_1 = require("../graphic/text"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerTextGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("text", text_1.createText);
}

exports.registerTextGraphic = registerTextGraphic;
//# sourceMappingURL=register-text.js.map
