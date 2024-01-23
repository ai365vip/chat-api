"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.defaultGraphicMemoryManager = exports.DefaultGraphicMemoryManager = exports.defaultTextAllocate = exports.DefaultTextAllocate = exports.defaultSymbolAllocate = exports.DefaultSymbolAllocate = exports.defaultPathAllocate = exports.DefaultPathAllocate = exports.defaultLineAllocate = exports.DefaultLineAllocate = exports.defaultCircleAllocate = exports.DefaultCircleAllocate = exports.defaultAreaAllocate = exports.DefaultAreaAllocate = exports.defaultArcAllocate = exports.DefaultArcAllocate = exports.defaultRectAllocate = exports.DefaultRectAllocate = exports.DefaultGraphicAllocate = void 0;

const application_1 = require("../application");

class DefaultGraphicAllocate {
    constructor() {
        this.pools = [];
    }
    free(d) {
        this.pools.push(d);
    }
    get length() {
        return this.pools.length;
    }
    release(...params) {
        this.pools = [];
    }
}

exports.DefaultGraphicAllocate = DefaultGraphicAllocate;

class DefaultRectAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application_1.application.graphicService.creator.rect(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(rect) {
        if (!this.pools.length) return application_1.application.graphicService.creator.rect(rect.attribute);
        const g = this.pools.pop();
        return g.initAttributes(rect.attribute), g;
    }
}

exports.DefaultRectAllocate = DefaultRectAllocate, exports.defaultRectAllocate = new DefaultRectAllocate;

class DefaultArcAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application_1.application.graphicService.creator.arc(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(arc) {
        if (!this.pools.length) return application_1.application.graphicService.creator.arc(arc.attribute);
        const g = this.pools.pop();
        return g.initAttributes(arc.attribute), g;
    }
}

exports.DefaultArcAllocate = DefaultArcAllocate, exports.defaultArcAllocate = new DefaultArcAllocate;

class DefaultAreaAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application_1.application.graphicService.creator.area(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(area) {
        if (!this.pools.length) return application_1.application.graphicService.creator.area(area.attribute);
        const g = this.pools.pop();
        return g.initAttributes(area.attribute), g;
    }
}

exports.DefaultAreaAllocate = DefaultAreaAllocate, exports.defaultAreaAllocate = new DefaultAreaAllocate;

class DefaultCircleAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application_1.application.graphicService.creator.circle(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(area) {
        if (!this.pools.length) return application_1.application.graphicService.creator.circle(area.attribute);
        const g = this.pools.pop();
        return g.initAttributes(area.attribute), g;
    }
}

exports.DefaultCircleAllocate = DefaultCircleAllocate, exports.defaultCircleAllocate = new DefaultCircleAllocate;

class DefaultLineAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application_1.application.graphicService.creator.line(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(line) {
        if (!this.pools.length) return application_1.application.graphicService.creator.line(line.attribute);
        const g = this.pools.pop();
        return g.initAttributes(line.attribute), g;
    }
}

exports.DefaultLineAllocate = DefaultLineAllocate, exports.defaultLineAllocate = new DefaultLineAllocate;

class DefaultPathAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application_1.application.graphicService.creator.path(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(path) {
        if (!this.pools.length) return application_1.application.graphicService.creator.path(path.attribute);
        const g = this.pools.pop();
        return g.initAttributes(path.attribute), g;
    }
}

exports.DefaultPathAllocate = DefaultPathAllocate, exports.defaultPathAllocate = new DefaultPathAllocate;

class DefaultSymbolAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application_1.application.graphicService.creator.symbol(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(symbol) {
        if (!this.pools.length) return application_1.application.graphicService.creator.symbol(symbol.attribute);
        const g = this.pools.pop();
        return g.initAttributes(symbol.attribute), g;
    }
}

exports.DefaultSymbolAllocate = DefaultSymbolAllocate, exports.defaultSymbolAllocate = new DefaultSymbolAllocate;

class DefaultTextAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application_1.application.graphicService.creator.text(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(text) {
        if (!this.pools.length) return application_1.application.graphicService.creator.text(text.attribute);
        const g = this.pools.pop();
        return g.initAttributes(text.attribute), g;
    }
}

exports.DefaultTextAllocate = DefaultTextAllocate, exports.defaultTextAllocate = new DefaultTextAllocate;

class DefaultGraphicMemoryManager {
    constructor() {
        this.map = {
            text: exports.defaultTextAllocate,
            symbol: exports.defaultSymbolAllocate
        };
    }
    gc(g) {
        g.isContainer ? g.forEachChildren((i => this.gc(i))) : this.gcItem(g);
    }
    gcItem(g) {
        const allocate = this.map[g.type];
        allocate && allocate.free(g);
    }
}

exports.DefaultGraphicMemoryManager = DefaultGraphicMemoryManager, exports.defaultGraphicMemoryManager = new DefaultGraphicMemoryManager;
//# sourceMappingURL=graphic-allocate.js.map