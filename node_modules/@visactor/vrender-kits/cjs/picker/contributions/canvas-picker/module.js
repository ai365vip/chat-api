"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), group_picker_1 = require("./group-picker"), m = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    m.__vloaded || (m.__vloaded = !0, bind(constants_1.CanvasGroupPicker).to(group_picker_1.DefaultCanvasGroupPicker).inSingletonScope(), 
    bind(constants_1.CanvasPickerContribution).toService(constants_1.CanvasGroupPicker), 
    (0, vrender_core_1.bindContributionProvider)(bind, constants_1.CanvasPickerContribution));
}));

m.__vloaded = !1, exports.default = m;
//# sourceMappingURL=module.js.map
