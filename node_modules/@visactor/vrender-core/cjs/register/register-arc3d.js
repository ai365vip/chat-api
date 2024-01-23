"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerArc3dGraphic = void 0;

const arc3d_1 = require("../graphic/arc3d"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerArc3dGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("arc3d", arc3d_1.createArc3d);
}

exports.registerArc3dGraphic = registerArc3dGraphic;
//# sourceMappingURL=register-arc3d.js.map
