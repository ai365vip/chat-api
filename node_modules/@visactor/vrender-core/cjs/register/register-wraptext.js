"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerWrapTextGraphic = void 0;

const wrap_text_1 = require("../graphic/wrap-text"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerWrapTextGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("wrapText", wrap_text_1.createWrapText);
}

exports.registerWrapTextGraphic = registerWrapTextGraphic;
//# sourceMappingURL=register-wraptext.js.map
