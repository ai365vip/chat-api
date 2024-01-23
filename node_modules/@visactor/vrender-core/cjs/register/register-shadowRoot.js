"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerShadowRootGraphic = void 0;

const shadow_root_1 = require("../graphic/shadow-root"), graphic_creator_1 = require("../graphic/graphic-creator");

function registerShadowRootGraphic() {
    graphic_creator_1.graphicCreator.RegisterGraphicCreator("shadowRoot", shadow_root_1.createShadowRoot);
}

exports.registerShadowRootGraphic = registerShadowRootGraphic;
//# sourceMappingURL=register-shadowRoot.js.map
