import { application } from "../application";

export class DefaultGraphicAllocate {
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

export class DefaultRectAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application.graphicService.creator.rect(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(rect) {
        if (!this.pools.length) return application.graphicService.creator.rect(rect.attribute);
        const g = this.pools.pop();
        return g.initAttributes(rect.attribute), g;
    }
}

export const defaultRectAllocate = new DefaultRectAllocate;

export class DefaultArcAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application.graphicService.creator.arc(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(arc) {
        if (!this.pools.length) return application.graphicService.creator.arc(arc.attribute);
        const g = this.pools.pop();
        return g.initAttributes(arc.attribute), g;
    }
}

export const defaultArcAllocate = new DefaultArcAllocate;

export class DefaultAreaAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application.graphicService.creator.area(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(area) {
        if (!this.pools.length) return application.graphicService.creator.area(area.attribute);
        const g = this.pools.pop();
        return g.initAttributes(area.attribute), g;
    }
}

export const defaultAreaAllocate = new DefaultAreaAllocate;

export class DefaultCircleAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application.graphicService.creator.circle(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(area) {
        if (!this.pools.length) return application.graphicService.creator.circle(area.attribute);
        const g = this.pools.pop();
        return g.initAttributes(area.attribute), g;
    }
}

export const defaultCircleAllocate = new DefaultCircleAllocate;

export class DefaultLineAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application.graphicService.creator.line(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(line) {
        if (!this.pools.length) return application.graphicService.creator.line(line.attribute);
        const g = this.pools.pop();
        return g.initAttributes(line.attribute), g;
    }
}

export const defaultLineAllocate = new DefaultLineAllocate;

export class DefaultPathAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application.graphicService.creator.path(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(path) {
        if (!this.pools.length) return application.graphicService.creator.path(path.attribute);
        const g = this.pools.pop();
        return g.initAttributes(path.attribute), g;
    }
}

export const defaultPathAllocate = new DefaultPathAllocate;

export class DefaultSymbolAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application.graphicService.creator.symbol(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(symbol) {
        if (!this.pools.length) return application.graphicService.creator.symbol(symbol.attribute);
        const g = this.pools.pop();
        return g.initAttributes(symbol.attribute), g;
    }
}

export const defaultSymbolAllocate = new DefaultSymbolAllocate;

export class DefaultTextAllocate extends DefaultGraphicAllocate {
    allocate(attribute) {
        if (!this.pools.length) return application.graphicService.creator.text(attribute);
        const g = this.pools.pop();
        return g.initAttributes(attribute), g;
    }
    allocateByObj(text) {
        if (!this.pools.length) return application.graphicService.creator.text(text.attribute);
        const g = this.pools.pop();
        return g.initAttributes(text.attribute), g;
    }
}

export const defaultTextAllocate = new DefaultTextAllocate;

export class DefaultGraphicMemoryManager {
    constructor() {
        this.map = {
            text: defaultTextAllocate,
            symbol: defaultSymbolAllocate
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

export const defaultGraphicMemoryManager = new DefaultGraphicMemoryManager;
//# sourceMappingURL=graphic-allocate.js.map