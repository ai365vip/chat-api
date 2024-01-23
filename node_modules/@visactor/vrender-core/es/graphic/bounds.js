import { graphicCreator } from "./graphic-creator";

let text, richText;

export function getTextBounds(params) {
    return text || (text = graphicCreator.CreateGraphic("text", {})), text.initAttributes(params), 
    text.AABBBounds;
}

export function getRichTextBounds(params) {
    return richText || (richText = graphicCreator.CreateGraphic("richtext", {})), richText.setAttributes(params), 
    richText.AABBBounds;
}
//# sourceMappingURL=bounds.js.map
