"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.SyncHook = void 0;

const Hook_1 = require("./Hook");

class SyncHook extends Hook_1.Hook {
    call(...args) {
        this.taps.map((t => t.fn)).forEach((cb => cb(...args)));
    }
}

exports.SyncHook = SyncHook;
//# sourceMappingURL=SyncHook.js.map
