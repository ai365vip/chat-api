"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DefaultAreaTextureRenderContribution = void 0;

const enums_1 = require("../../../../common/enums"), base_texture_contribution_render_1 = require("./base-texture-contribution-render"), utils_1 = require("../../../../common/utils");

class DefaultAreaTextureRenderContribution extends base_texture_contribution_render_1.DefaultBaseTextureRenderContribution {
    constructor() {
        super(...arguments), this.time = enums_1.BaseRenderContributionTime.afterFillStroke;
    }
    drawShape(graphic, context, x, y, doFill, doStroke, fVisible, sVisible, graphicAttribute, drawContext, fillCb, strokeCb, options) {
        var _a, _b, _c, _d;
        this.textureMap || this.initTextureMap(context, graphic.stage);
        const {attribute: attribute = graphic.attribute} = options || {}, {texture: texture = (null !== (_a = graphic.attribute.texture) && void 0 !== _a ? _a : (0, 
        utils_1.getAttributeFromDefaultAttrList)(graphicAttribute, "texture")), textureColor: textureColor = (null !== (_b = graphic.attribute.textureColor) && void 0 !== _b ? _b : (0, 
        utils_1.getAttributeFromDefaultAttrList)(graphicAttribute, "textureColor")), textureSize: textureSize = (null !== (_c = graphic.attribute.textureSize) && void 0 !== _c ? _c : (0, 
        utils_1.getAttributeFromDefaultAttrList)(graphicAttribute, "textureSize")), texturePadding: texturePadding = (null !== (_d = graphic.attribute.texturePadding) && void 0 !== _d ? _d : (0, 
        utils_1.getAttributeFromDefaultAttrList)(graphicAttribute, "texturePadding"))} = attribute;
        texture && this.drawTexture(texture, graphic, context, x, y, graphicAttribute, textureColor, textureSize, texturePadding);
    }
}

exports.DefaultAreaTextureRenderContribution = DefaultAreaTextureRenderContribution;
//# sourceMappingURL=area-texture-contribution-render.js.map
