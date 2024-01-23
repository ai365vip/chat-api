import { merge } from "@visactor/vutils";

import { CrosshairBase } from "./base";

import { loadRectCrosshairComponent } from "./register";

loadRectCrosshairComponent();

export class RectCrosshair extends CrosshairBase {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : merge({}, RectCrosshair.defaultAttributes, attributes));
    }
    renderCrosshair(container) {
        const {start: start, end: end, rectStyle: rectStyle} = this.attribute;
        return container.createOrUpdateChild("crosshair-rect", Object.assign({
            x: start.x,
            y: start.y,
            width: end.x - start.x,
            height: end.y - start.y
        }, rectStyle), "rect");
    }
    setLocation(region) {
        const {start: start, end: end} = region;
        this.setAttributes({
            start: start,
            end: end
        });
    }
}

RectCrosshair.defaultAttributes = {
    rectStyle: {
        fill: "#b2bacf",
        opacity: .2
    }
};
//# sourceMappingURL=rect.js.map