"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerRect3dGraphic = void 0;

const rect3d_1 = require("../graphic/rect3d"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerRect3dGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("rect3d", rect3d_1.createRect3d);
}

exports.registerRect3dGraphic = registerRect3dGraphic;
//# sourceMappingURL=register-rect3d.js.map
