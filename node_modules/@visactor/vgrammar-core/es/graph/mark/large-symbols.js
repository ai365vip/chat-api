import { isNumber, max } from "@visactor/vutils";

import { CustomPath2D, Group, DefaultSymbolAttribute } from "@visactor/vrender-core";

export class LargeSymbols extends Group {
    constructor(attributes) {
        super(attributes), this.attribute = attributes, this.onSetStage((() => {
            this.render();
        }));
    }
    render() {
        var _a, _b;
        const pathNode = this.createOrUpdateChild("large-path", {}, "path"), points = this.attribute.points, size = null !== (_a = this.attribute.size) && void 0 !== _a ? _a : DefaultSymbolAttribute.size, path2d = null !== (_b = pathNode.attribute.path) && void 0 !== _b ? _b : new CustomPath2D;
        let x, y;
        path2d.clear();
        const maxSize = isNumber(size) ? size : max(size[0], size[1]);
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
//# sourceMappingURL=large-symbols.js.map
