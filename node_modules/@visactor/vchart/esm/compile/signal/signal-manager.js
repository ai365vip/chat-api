import { CompilableSignal } from "./compilable-signal";

import { CompilableBase } from "../compilable-base";

export class SignalManager extends CompilableBase {
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
        this._signalMap[name] ? this._signalMap[name].updateSignal(value, updateFunc) : (this._signalMap[name] = new CompilableSignal(this._option, name, value, updateFunc), 
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
//# sourceMappingURL=signal-manager.js.map
