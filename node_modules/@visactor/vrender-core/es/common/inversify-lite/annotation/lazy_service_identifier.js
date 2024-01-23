export class LazyServiceIdentifer {
    constructor(cb) {
        this._cb = cb;
    }
    unwrap() {
        return this._cb();
    }
}
//# sourceMappingURL=lazy_service_identifier.js.map
