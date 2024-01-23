"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerPolygonGraphic = void 0;

const polygon_1 = require("../graphic/polygon"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerPolygonGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("polygon", polygon_1.createPolygon);
}

exports.registerPolygonGraphic = registerPolygonGraphic;
//# sourceMappingURL=register-polygon.js.map
