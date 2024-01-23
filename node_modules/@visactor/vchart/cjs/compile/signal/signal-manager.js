"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.SignalManager = void 0;

const compilable_signal_1 = require("./compilable-signal"), compilable_base_1 = require("../compilable-base");

class SignalManager extends compilable_base_1.CompilableBase {
    constructor() {
        super(...arguments), this._signalMap = {};
    }
    getSignalMap() {
        return this._signalMap;
    }
    getSignal(name) {
        return this._signalMap[name];
    }
    updateSignal(name, value, updateFunc) {
        this._signalMap[name] ? this._signalMap[name].updateSignal(value, updateFunc) : (this._signalMap[name] = new compilable_signal_1.CompilableSignal(this._option, name, value, updateFunc), 
        this._signalMap[name].compile());
    }
    compile() {
        Object.values(this._signalMap).forEach((signal => {
            signal.compile();
        }));
    }
    release() {
        super.release(), Object.values(this._signalMap).forEach((signal => {
            signal.release();
        })), this._signalMap = {};
    }
}

exports.SignalManager = SignalManager;
//# sourceMappingURL=signal-manager.js.map
