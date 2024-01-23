"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerLineGraphic = void 0;

const line_1 = require("../graphic/line"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerLineGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("line", line_1.createLine);
}

exports.registerLineGraphic = registerLineGraphic;
//# sourceMappingURL=register-line.js.map
