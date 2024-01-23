import { graphicCreator } from "@visactor/vrender-core";

export const REACT_TO_CANOPUS_EVENTS = {
    onPointerDown: "pointerdown",
    onPointerUp: "pointerup",
    onPointerUpOutside: "pointerupoutside",
    onPointerTap: "pointertap",
    onPointerOver: "pointerover",
    onPointerMove: "pointermove",
    onPointerEnter: "pointerenter",
    onPointerLeave: "pointerleave",
    onPointerOut: "pointerout",
    onMouseDown: "mousedown",
    onMouseUp: "mouseup",
    onMouseUpOutside: "mouseupoutside",
    onMouseMove: "mousemove",
    onMouseOver: "mouseover",
    onMouseOut: "mouseout",
    onMouseEnter: "mouseenter",
    onMouseLeave: "mouseleave",
    onPinch: "pinch",
    onPinchStart: "pinchstart",
    onPinchEnd: "pinchend",
    onPan: "pan",
    onPanStart: "panstart",
    onPanEnd: "panend",
    onDrag: "drag",
    onDragStart: "dragstart",
    onDragEnter: "dragenter",
    onDragLeave: "dragleave",
    onDragOver: "dragover",
    onDragEnd: "dragend",
    onRightDown: "rightdown",
    onRightUp: "rightup",
    onRightUpOutside: "rightupoutside",
    onTouchStart: "touchstart",
    onTouchEnd: "touchend",
    onTouchEndOutside: "touchendoutside",
    onTouchMove: "touchmove",
    onTouchCancel: "touchcancel",
    onPress: "press",
    onPressUp: "pressup",
    onPressEnd: "pressend",
    onSwipe: "swipe",
    onDrop: "drop",
    onWeel: "wheel",
    onClick: "click",
    onDblClick: "dblclick"
};

export const REACT_TO_CANOPUS_EVENTS_LIST = Object.keys(REACT_TO_CANOPUS_EVENTS);

export function VArc(params) {
    return graphicCreator.arc(params ? params.attribute : {});
}

export function VArc3d(params) {
    return graphicCreator.arc3d(params ? params.attribute : {});
}

export function VArea(params) {
    return graphicCreator.area(params ? params.attribute : {});
}

export function VCircle(params) {
    return graphicCreator.circle(params ? params.attribute : {});
}

export function VGroup(params) {
    return graphicCreator.group(params ? params.attribute : {});
}

export function VGlyph(params) {
    return graphicCreator.glyph(params ? params.attribute : {});
}

export function VImage(params) {
    return graphicCreator.image(params ? params.attribute : {});
}

export function VLine(params) {
    return graphicCreator.line(params ? params.attribute : {});
}

export function VPath(params) {
    return graphicCreator.path(params ? params.attribute : {});
}

export function VPolygon(params) {
    return graphicCreator.polygon(params ? params.attribute : {});
}

export function VPyramid3d(params) {
    return graphicCreator.pyramid3d(params ? params.attribute : {});
}

export function VRect(params) {
    return graphicCreator.rect(params ? params.attribute : {});
}

export function VRect3d(params) {
    return graphicCreator.rect3d(params ? params.attribute : {});
}

export function VSymbol(params) {
    return graphicCreator.symbol(params ? params.attribute : {});
}

export function VText(params) {
    return graphicCreator.text(params ? params.attribute : {});
}

export function VRichText(params) {
    return graphicCreator.richtext(params ? params.attribute : {});
}

VRichText.Text = function(params) {
    return Object.assign({
        type: "rich/text"
    }, params);
}, VRichText.Image = function(params) {
    return Object.assign({
        type: "rich/image"
    }, params);
};
//# sourceMappingURL=graphicType.js.map