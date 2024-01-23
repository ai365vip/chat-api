"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerAreaGraphic = void 0;

const area_1 = require("../graphic/area"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerAreaGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("area", area_1.createArea);
}

exports.registerAreaGraphic = registerAreaGraphic;
//# sourceMappingURL=register-area.js.map
