"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.error = void 0;

const vutils_1 = require("@visactor/vutils"), error = message => {
    vutils_1.Logger.getInstance().error(message);
};

exports.error = error;
//# sourceMappingURL=error.js.map