import { merge } from "@visactor/vutils";

import { CrosshairBase } from "./base";

import { loadLineCrosshairComponent } from "./register";

loadLineCrosshairComponent();

export class LineCrosshair extends CrosshairBase {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : merge({}, LineCrosshair.defaultAttributes, attributes));
    }
    renderCrosshair(container) {
        const {start: start, end: end, lineStyle: lineStyle} = this.attribute;
        return container.createOrUpdateChild("crosshair-line", Object.assign({
            points: [ start, end ]
        }, lineStyle), "line");
    }
    setLocation(region) {
        const {start: start, end: end} = region;
        this.setAttributes({
            start: start,
            end: end
        });
    }
}

LineCrosshair.defaultAttributes = {
    lineStyle: {
        stroke: "#b2bacf",
        lineWidth: 1,
        lineDash: [ 2 ]
    }
};
//# sourceMappingURL=line.js.map