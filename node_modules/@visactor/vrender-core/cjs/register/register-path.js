"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerPathGraphic = void 0;

const path_1 = require("../graphic/path"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerPathGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("path", path_1.createPath);
}

exports.registerPathGraphic = registerPathGraphic;
//# sourceMappingURL=register-path.js.map
