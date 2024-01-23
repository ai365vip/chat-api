class GraphicCreator {
    constructor() {
        this.store = new Map;
    }
    RegisterGraphicCreator(name, cb) {
        this.store.set(name, cb), this[name] = cb;
    }
    CreateGraphic(name, params) {
        const cb = this.store.get(name);
        return cb ? cb(params) : null;
    }
}

export const graphicCreator = new GraphicCreator;
//# sourceMappingURL=graphic-creator.js.map
