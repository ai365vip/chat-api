import { GrammarMarkType } from "../enums";

import { BridgeElementKey } from "../constants";

import { Factory } from "../../core/factory";

import { Logger } from "@visactor/vutils";

export const isMarkType = type => !!GrammarMarkType[type];

export function createGraphicItem(mark, markType, attrs = {}) {
    var _a;
    const graphicItem = Factory.getGraphicType(markType) ? Factory.createGraphic(markType, attrs) : Factory.createGraphicComponent(markType, attrs, {
        skipDefault: null === (_a = null == mark ? void 0 : mark.spec) || void 0 === _a ? void 0 : _a.skipTheme
    });
    if (!graphicItem) {
        Logger.getInstance().error(`create ${markType} graphic failed!`);
    }
    return graphicItem;
}

export function createGlyphGraphicItem(mark, glyphMeta, attrs = {}) {
    if (!Factory.getGraphicType(GrammarMarkType.glyph)) return;
    const graphicItem = Factory.createGraphic(GrammarMarkType.glyph, attrs), glyphMarks = glyphMeta.getMarks(), subGraphics = Object.keys(glyphMarks).map((name => {
        if (Factory.getGraphicType(glyphMarks[name])) {
            const graphic = Factory.createGraphic(glyphMarks[name]);
            if (graphic) return graphic.name = name, graphic;
        }
    }));
    return graphicItem.setSubGraphic(subGraphics), graphicItem;
}

export const removeGraphicItem = graphicItem => {
    graphicItem && (graphicItem[BridgeElementKey] = null, graphicItem.release(), graphicItem.parent && graphicItem.parent.removeChild(graphicItem));
};

export const getMarkTypeOfLarge = markType => markType === GrammarMarkType.rect ? GrammarMarkType.largeRects : markType === GrammarMarkType.symbol ? GrammarMarkType.largeSymbols : markType;
//# sourceMappingURL=graphic.js.map
