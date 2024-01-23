"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getMarkTypeOfLarge = exports.removeGraphicItem = exports.createGlyphGraphicItem = exports.createGraphicItem = exports.isMarkType = void 0;

const enums_1 = require("../enums"), constants_1 = require("../constants"), factory_1 = require("../../core/factory"), vutils_1 = require("@visactor/vutils"), isMarkType = type => !!enums_1.GrammarMarkType[type];

function createGraphicItem(mark, markType, attrs = {}) {
    var _a;
    const graphicItem = factory_1.Factory.getGraphicType(markType) ? factory_1.Factory.createGraphic(markType, attrs) : factory_1.Factory.createGraphicComponent(markType, attrs, {
        skipDefault: null === (_a = null == mark ? void 0 : mark.spec) || void 0 === _a ? void 0 : _a.skipTheme
    });
    if (!graphicItem) {
        vutils_1.Logger.getInstance().error(`create ${markType} graphic failed!`);
    }
    return graphicItem;
}

function createGlyphGraphicItem(mark, glyphMeta, attrs = {}) {
    if (!factory_1.Factory.getGraphicType(enums_1.GrammarMarkType.glyph)) return;
    const graphicItem = factory_1.Factory.createGraphic(enums_1.GrammarMarkType.glyph, attrs), glyphMarks = glyphMeta.getMarks(), subGraphics = Object.keys(glyphMarks).map((name => {
        if (factory_1.Factory.getGraphicType(glyphMarks[name])) {
            const graphic = factory_1.Factory.createGraphic(glyphMarks[name]);
            if (graphic) return graphic.name = name, graphic;
        }
    }));
    return graphicItem.setSubGraphic(subGraphics), graphicItem;
}

exports.isMarkType = isMarkType, exports.createGraphicItem = createGraphicItem, 
exports.createGlyphGraphicItem = createGlyphGraphicItem;

const removeGraphicItem = graphicItem => {
    graphicItem && (graphicItem[constants_1.BridgeElementKey] = null, graphicItem.release(), 
    graphicItem.parent && graphicItem.parent.removeChild(graphicItem));
};

exports.removeGraphicItem = removeGraphicItem;

const getMarkTypeOfLarge = markType => markType === enums_1.GrammarMarkType.rect ? enums_1.GrammarMarkType.largeRects : markType === enums_1.GrammarMarkType.symbol ? enums_1.GrammarMarkType.largeSymbols : markType;

exports.getMarkTypeOfLarge = getMarkTypeOfLarge;
//# sourceMappingURL=graphic.js.map
