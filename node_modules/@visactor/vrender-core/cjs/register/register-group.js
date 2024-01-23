"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerGroupGraphic = void 0;

const group_1 = require("../graphic/group"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerGroupGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("group", group_1.createGroup);
}

exports.registerGroupGraphic = registerGroupGraphic;
//# sourceMappingURL=register-group.js.map
