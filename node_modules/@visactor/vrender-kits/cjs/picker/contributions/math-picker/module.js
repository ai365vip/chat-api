"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const vrender_core_1 = require("@visactor/vrender-core"), constants_1 = require("../constants"), m = new vrender_core_1.ContainerModule((bind => {
    m.__vloaded || (m.__vloaded = !0, (0, vrender_core_1.bindContributionProvider)(bind, constants_1.MathPickerContribution));
}));

m.__vloaded = !1, exports.default = m;
//# sourceMappingURL=module.js.map
