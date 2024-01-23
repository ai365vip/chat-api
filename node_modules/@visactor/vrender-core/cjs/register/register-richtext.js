"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerRichtextGraphic = void 0;

const richtext_1 = require("../graphic/richtext"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerRichtextGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("richtext", richtext_1.createRichText);
}

exports.registerRichtextGraphic = registerRichtextGraphic;
//# sourceMappingURL=register-richtext.js.map
