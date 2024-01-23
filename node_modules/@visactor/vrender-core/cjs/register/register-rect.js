"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerRectGraphic = void 0;

const rect_1 = require("../graphic/rect"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerRectGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("rect", rect_1.createRect);
}

exports.registerRectGraphic = registerRectGraphic;
//# sourceMappingURL=register-rect.js.map
