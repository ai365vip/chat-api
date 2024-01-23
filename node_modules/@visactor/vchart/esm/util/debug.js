import { Logger, isFunction } from "@visactor/vutils";

export const log = (msg, ...args) => config.silent ? null : Logger.getInstance().info(msg, ...args);

export const warn = (msg, detail) => (isFunction(config.warnHandler) && config.warnHandler.call(null, msg, detail), 
detail ? Logger.getInstance().warn(`[VChart warn]: ${msg}`, detail) : Logger.getInstance().warn(`[VChart warn]: ${msg}`));

export const error = (msg, detail, err) => {
    if (!config.silent) {
        if (!isFunction(config.errorHandler)) throw new Error(msg);
        config.errorHandler.call(null, msg, detail);
    }
};

export const config = {
    silent: !1,
    warnHandler: !1,
    errorHandler: !1
};
//# sourceMappingURL=debug.js.map
