"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.config = exports.error = exports.warn = exports.log = void 0;

const vutils_1 = require("@visactor/vutils"), log = (msg, ...args) => exports.config.silent ? null : vutils_1.Logger.getInstance().info(msg, ...args);

exports.log = log;

const warn = (msg, detail) => ((0, vutils_1.isFunction)(exports.config.warnHandler) && exports.config.warnHandler.call(null, msg, detail), 
detail ? vutils_1.Logger.getInstance().warn(`[VChart warn]: ${msg}`, detail) : vutils_1.Logger.getInstance().warn(`[VChart warn]: ${msg}`));

exports.warn = warn;

const error = (msg, detail, err) => {
    if (!exports.config.silent) {
        if (!(0, vutils_1.isFunction)(exports.config.errorHandler)) throw new Error(msg);
        exports.config.errorHandler.call(null, msg, detail);
    }
};

exports.error = error, exports.config = {
    silent: !1,
    warnHandler: !1,
    errorHandler: !1
};
//# sourceMappingURL=debug.js.map
