import { merge } from "@visactor/vutils";

import { AbstractComponent } from "../core/base";

import { loadLinkPathComponent } from "./register";

export const getHorizontalPath = (options, ratio) => {
    let x0 = options.x0, x1 = options.x1;
    const thickness = "number" == typeof ratio ? options.thickness * ratio : options.thickness;
    let y00 = options.y0 - options.thickness / 2, y10 = options.y1 - options.thickness / 2;
    "center" === options.align ? (y00 = options.y0 - thickness / 2, y10 = options.y1 - thickness / 2) : "end" === options.align && (y00 = options.y0 + options.thickness / 2 - thickness, 
    y10 = options.y1 + options.thickness / 2 - thickness);
    let midX = (x0 + x1) / 2, y01 = y00 + thickness, y11 = y10 + thickness;
    options.round && (x0 = Math.round(x0), x1 = Math.round(x1), y00 = Math.round(y00), 
    y10 = Math.round(y10), y01 = Math.round(y01), y11 = Math.round(y11), midX = Math.round(midX));
    const hasLength = Math.abs(x1 - x0) > 1e-6, endArrowPath = options.endArrow && hasLength ? `L${x1},${y10 - thickness / 2}L${x1 + thickness},${(y10 + y11) / 2}L${x1},${y11 + thickness / 2}` : "", startArrowPath = options.startArrow && hasLength ? `L${x0},${y01 + thickness / 2}L${x0 - thickness},${(y00 + y01) / 2}L${x0},${y00 - thickness / 2}` : "";
    return !1 === options.isSmooth ? `M${x0},${y00}L${x1},${y10}${endArrowPath}L${x1},${y11}L${x0},${y01}${startArrowPath}Z` : `M${x0},${y00}\n  C${midX},${y00},${midX},${y10},${x1},${y10}\n  ${endArrowPath}\n  L${x1},${y11}\n  C${midX},${y11},${midX},${y01},${x0},${y01}\n  ${startArrowPath}\n  Z`;
};

export const getVerticalPath = (options, ratio) => {
    let y0 = options.y0, y1 = options.y1, x00 = options.x0 - options.thickness / 2, x10 = options.x1 - options.thickness / 2;
    const thickness = "number" == typeof ratio ? options.thickness * ratio : options.thickness;
    "center" === options.align ? (x00 = options.x0 - thickness / 2, x10 = options.x1 - thickness / 2) : "end" === options.align && (x00 = options.x0 + options.thickness / 2 - thickness, 
    x10 = options.x1 + options.thickness / 2 - thickness);
    let midY = (y0 + y1) / 2, x01 = x00 + thickness, x11 = x10 + thickness;
    options.round && (y0 = Math.round(y0), y1 = Math.round(y1), x00 = Math.round(x00), 
    x10 = Math.round(x10), x01 = Math.round(x01), x11 = Math.round(x11), midY = Math.round(midY));
    const hasLength = Math.abs(y1 - y0) > 1e-6, endArrowPath = options.endArrow && hasLength ? `L${x10 - thickness / 2},${y1}L${(x10 + x11) / 2},${y1 + thickness}L${x11 + thickness / 2},${y1}` : "", startArrowPath = options.startArrow && hasLength ? `L${x01 + thickness / 2},${y0}L${(x01 + x00) / 2},${y0 - thickness}L${x00 - thickness / 2},${y0}` : "";
    return !1 === options.isSmooth ? `M${x00},${y0}L${x10},${y1}${endArrowPath}L${x11},${y1}L${x01},${y0}${startArrowPath}Z` : `M${x00},${y0}\n  C${x00},${midY},${x10},${midY},${x10},${y1}\n  ${endArrowPath}\n  L${x11},${y1}\n  C${x11},${midY},${x01},${midY},${x01},${y0}\n  ${startArrowPath}\n  Z`;
};

loadLinkPathComponent();

export class LinkPath extends AbstractComponent {
    constructor(attributes, options) {
        super((null == options ? void 0 : options.skipDefault) ? attributes : merge({}, LinkPath.defaultAttributes, attributes));
    }
    render() {
        const {direction: direction = "horizontal"} = this.attribute, parsePath = "vertical" === direction ? getVerticalPath : getHorizontalPath, isRatioShow = "number" == typeof this.attribute.ratio && this.attribute.ratio >= 0 && this.attribute.ratio <= 1, groupAttrKeys = [ "direction", "x0", "x1", "y0", "y1", "thickness", "round", "ratio", "align", "isSmooth", "backgroudStyle" ], commonStyle = {};
        if (Object.keys(this.attribute).forEach((key => {
            groupAttrKeys.includes(key) || (commonStyle[key] = this.attribute[key]);
        })), isRatioShow) {
            const background = this.createOrUpdateChild("sankey-link-background", Object.assign({}, commonStyle, this.attribute.backgroudStyle, {
                path: parsePath(this.attribute, 1),
                visible: !0,
                pickable: !1,
                zIndex: -1
            }), "path");
            this._backPath = background;
        } else this._backPath && this._backPath.setAttribute("visible", !1);
        const front = this.createOrUpdateChild("sankey-link-front", Object.assign({}, commonStyle, {
            path: parsePath(this.attribute, isRatioShow ? this.attribute.ratio : 1),
            pickable: !1
        }), "path");
        this._frontPath = front;
    }
}

LinkPath.defaultAttributes = {
    direction: "horizontal",
    align: "start"
};
//# sourceMappingURL=link-path.js.map
