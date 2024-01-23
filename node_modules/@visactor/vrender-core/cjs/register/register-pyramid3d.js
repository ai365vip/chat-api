"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerPyramid3dGraphic = void 0;

const pyramid3d_1 = require("../graphic/pyramid3d"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerPyramid3dGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("pyramid3d", pyramid3d_1.createPyramid3d);
}

exports.registerPyramid3dGraphic = registerPyramid3dGraphic;
//# sourceMappingURL=register-pyramid3d.js.map
