import { BaseRenderContributionTime } from "../../../../common/enums";

import { DefaultBaseTextureRenderContribution } from "./base-texture-contribution-render";

import { getAttributeFromDefaultAttrList } from "../../../../common/utils";

export class DefaultAreaTextureRenderContribution extends DefaultBaseTextureRenderContribution {
    constructor() {
        super(...arguments), this.time = BaseRenderContributionTime.afterFillStroke;
    }
    drawShape(graphic, context, x, y, doFill, doStroke, fVisible, sVisible, graphicAttribute, drawContext, fillCb, strokeCb, options) {
        var _a, _b, _c, _d;
        this.textureMap || this.initTextureMap(context, graphic.stage);
        const {attribute: attribute = graphic.attribute} = options || {}, {texture: texture = (null !== (_a = graphic.attribute.texture) && void 0 !== _a ? _a : getAttributeFromDefaultAttrList(graphicAttribute, "texture")), textureColor: textureColor = (null !== (_b = graphic.attribute.textureColor) && void 0 !== _b ? _b : getAttributeFromDefaultAttrList(graphicAttribute, "textureColor")), textureSize: textureSize = (null !== (_c = graphic.attribute.textureSize) && void 0 !== _c ? _c : getAttributeFromDefaultAttrList(graphicAttribute, "textureSize")), texturePadding: texturePadding = (null !== (_d = graphic.attribute.texturePadding) && void 0 !== _d ? _d : getAttributeFromDefaultAttrList(graphicAttribute, "texturePadding"))} = attribute;
        texture && this.drawTexture(texture, graphic, context, x, y, graphicAttribute, textureColor, textureSize, texturePadding);
    }
}
//# sourceMappingURL=area-texture-contribution-render.js.map
