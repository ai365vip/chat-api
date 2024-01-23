"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerImageGraphic = void 0;

const image_1 = require("../graphic/image"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerImageGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("image", image_1.createImage);
}

exports.registerImageGraphic = registerImageGraphic;
//# sourceMappingURL=register-image.js.map
