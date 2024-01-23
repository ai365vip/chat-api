"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerArcGraphic = void 0;

const arc_1 = require("../graphic/arc"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerArcGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("arc", arc_1.createArc);
}

exports.registerArcGraphic = registerArcGraphic;
//# sourceMappingURL=register-arc.js.map
