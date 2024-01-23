"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getRichTextBounds = exports.getTextBounds = void 0;

const graphic_creator_1 = require("./graphic-creator");

let text, richText;

function getTextBounds(params) {
    return text || (text = graphic_creator_1.graphicCreator.CreateGraphic("text", {})), 
    text.initAttributes(params), text.AABBBounds;
}

function getRichTextBounds(params) {
    return richText || (richText = graphic_creator_1.graphicCreator.CreateGraphic("richtext", {})), 
    richText.setAttributes(params), richText.AABBBounds;
}

exports.getTextBounds = getTextBounds, exports.getRichTextBounds = getRichTextBounds;
//# sourceMappingURL=bounds.js.map
