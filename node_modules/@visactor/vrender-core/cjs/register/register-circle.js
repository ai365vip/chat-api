"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerCircleGraphic = void 0;

const circle_1 = require("../graphic/circle"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerCircleGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("circle", circle_1.createCircle);
}

exports.registerCircleGraphic = registerCircleGraphic;
//# sourceMappingURL=register-circle.js.map
