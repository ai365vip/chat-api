"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.RichTextIcon = void 0;

const vutils_1 = require("@visactor/vutils"), image_1 = require("../image"), config_1 = require("../config"), utils_1 = require("../../common/utils");

class RichTextIcon extends image_1.Image {
    constructor(params) {
        if (super(params), this._x = 0, this._y = 0, this._hovered = !1, this._marginArray = [ 0, 0, 0, 0 ], 
        "always" === params.backgroundShowMode && (this._hovered = !0), params.margin) {
            const marginArray = (0, utils_1.parsePadding)(params.margin);
            this._marginArray = "number" == typeof marginArray ? [ marginArray, marginArray, marginArray, marginArray ] : marginArray;
        }
        this.onBeforeAttributeUpdate = (val, attributes, key) => {
            if ((0, vutils_1.isArray)(key) && -1 !== key.indexOf("margin") || "margin" === key) if (attributes.margin) {
                const marginArray = (0, utils_1.parsePadding)(attributes.margin);
                this._marginArray = "number" == typeof marginArray ? [ marginArray, marginArray, marginArray, marginArray ] : marginArray;
            } else this._marginArray = [ 0, 0, 0, 0 ];
        };
    }
    get width() {
        var _a;
        return (null !== (_a = this.attribute.width) && void 0 !== _a ? _a : 0) + this._marginArray[1] + this._marginArray[3];
    }
    get height() {
        var _a;
        return (null !== (_a = this.attribute.height) && void 0 !== _a ? _a : 0) + this._marginArray[0] + this._marginArray[2];
    }
    tryUpdateAABBBounds() {
        if (!this.shouldUpdateAABBBounds()) return this._AABBBounds;
        this.doUpdateAABBBounds();
        const {width: width = config_1.DefaultImageAttribute.width, height: height = config_1.DefaultImageAttribute.height} = this.attribute, {backgroundWidth: backgroundWidth = width, backgroundHeight: backgroundHeight = height} = this.attribute, expandX = (backgroundWidth - width) / 2, expandY = (backgroundHeight - height) / 2;
        return this._AABBBounds.expand([ 0, 2 * expandX, 2 * expandY, 0 ]), this._AABBBounds;
    }
    setHoverState(hovered) {
        "hover" === this.attribute.backgroundShowMode && this._hovered !== hovered && (this._hovered = hovered);
    }
}

exports.RichTextIcon = RichTextIcon;
//# sourceMappingURL=icon.js.map
