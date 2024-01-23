export class ComposedEvent {
    constructor(eventDispatcher, mode) {
        var _a, _b;
        this._eventMap = new Map, this._eventDispatcher = eventDispatcher, this._mode = mode, 
        this._chart = null === (_b = (_a = this._eventDispatcher.globalInstance).getChart) || void 0 === _b ? void 0 : _b.call(_a);
    }
    _registerEvent(eType, handler) {
        return this._eventMap.set(eType, handler), this._eventDispatcher.register(eType, handler), 
        this._eventDispatcher;
    }
    _unregisterEvent(eType, handler) {
        return this._eventDispatcher.register(eType, handler), this._eventDispatcher;
    }
}
//# sourceMappingURL=base.js.map
