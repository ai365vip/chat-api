"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.LargeRects = void 0;

const vrender_core_1 = require("@visactor/vrender-core");

class LargeRects extends vrender_core_1.Group {
    constructor(attributes) {
        super(attributes), this.attribute = attributes, this.onSetStage((() => {
            this.render();
        }));
    }
    render() {
        var _a;
        const pathNode = this.createOrUpdateChild("large-path", {}, "path"), points = this.attribute.points, path2d = null !== (_a = pathNode.attribute.path) && void 0 !== _a ? _a : new vrender_core_1.CustomPath2D;
        let x, y, width, height;
        path2d.clear();
        for (let i = 0, len = points.length; i < len; i += 4) x = points[i], y = points[i + 1], 
        width = points[i + 2], height = points[i + 3], path2d.rect(x, y, width, height);
        const pathAttrs = Object.assign({}, this.attribute, {
            path: path2d,
            points: null
        });
        this.attribute = {}, pathNode.setAttributes(pathAttrs);
    }
}

exports.LargeRects = LargeRects;
//# sourceMappingURL=large-rects.js.map
