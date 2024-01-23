"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.LargeSymbols = void 0;

const vutils_1 = require("@visactor/vutils"), vrender_core_1 = require("@visactor/vrender-core");

class LargeSymbols extends vrender_core_1.Group {
    constructor(attributes) {
        super(attributes), this.attribute = attributes, this.onSetStage((() => {
            this.render();
        }));
    }
    render() {
        var _a, _b;
        const pathNode = this.createOrUpdateChild("large-path", {}, "path"), points = this.attribute.points, size = null !== (_a = this.attribute.size) && void 0 !== _a ? _a : vrender_core_1.DefaultSymbolAttribute.size, path2d = null !== (_b = pathNode.attribute.path) && void 0 !== _b ? _b : new vrender_core_1.CustomPath2D;
        let x, y;
        path2d.clear();
        const maxSize = (0, vutils_1.isNumber)(size) ? size : (0, vutils_1.max)(size[0], size[1]);
        for (let i = 0, len = points.length; i < len; i += 4) x = points[i], y = points[i + 1], 
        path2d.arc(x, y, maxSize / 2, 0, 2 * Math.PI), path2d.closePath();
        const pathAttrs = Object.assign({}, this.attribute, {
            path: path2d,
            points: null,
            size: null
        });
        this.attribute = {}, pathNode.setAttributes(pathAttrs);
    }
}

exports.LargeSymbols = LargeSymbols;
//# sourceMappingURL=large-symbols.js.map
